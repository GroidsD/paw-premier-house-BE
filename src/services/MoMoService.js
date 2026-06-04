const crypto = require("crypto");
const https = require("https");

class MoMoService {
    constructor() {
        this.partnerCode = process.env.MOMO_PARTNER_CODE;
        this.accessKey = process.env.MOMO_ACCESS_KEY;
        this.secretKey = process.env.MOMO_SECRET_KEY;
        this.returnUrl = process.env.MOMO_RETURN_URL;
        this.notifyUrl = process.env.MOMO_NOTIFY_URL;
        this.apiEndpoint = "https://test-payment.momo.vn/v2/gateway/api/create";
    }

    generateSignature(data) {
        // Only include required fields for signature
        const signatureData = {
            accessKey: this.accessKey,
            amount: data.amount,
            extraData: data.extraData || "",
            ipnUrl: this.notifyUrl,
            orderId: data.orderId,
            orderInfo: data.orderInfo,
            partnerCode: data.partnerCode,
            redirectUrl: this.returnUrl,
            requestId: data.requestId,
            requestType: data.requestType,
        };

        const rawSignature = Object.keys(signatureData)
            .sort()
            .map((key) => `${key}=${signatureData[key]}`)
            .join("&");

        const signature = crypto
            .createHmac("sha256", this.secretKey)
            .update(rawSignature)
            .digest("hex");
        return signature;
    }

    generateRequestId() {
        return this.partnerCode + new Date().getTime();
    }

    async createPayment(paymentData) {
        try {
            const {
                orderInfo = "Thanh toán MoMo",
                extraData = "",
                orderId: originalOrderId,
                resourceType = "order",
                returnUrl,
                notifyUrl,
            } = paymentData;

            let amount = 0;
            let resourceLabel = "order";

            if (resourceType === "booking") {
                resourceLabel = "booking";
                const BookingServiceModule = require("./BookingService");
                const BookingService = BookingServiceModule.default;
                const bookingResult =
                    await BookingService.getBookingById(originalOrderId);

                if (bookingResult.errCode !== 0 || !bookingResult.data) {
                    return {
                        errCode: 2,
                        message: "Booking not found",
                        data: null,
                    };
                }

                amount = Math.round(Number(bookingResult.data.total_price));
            } else {
                const OrderServiceModule = require("./OrderService");
                const OrderService = OrderServiceModule.default;

                const orderResult =
                    await OrderService.getOrderById(originalOrderId);

                if (orderResult.errCode !== 0 || !orderResult.order) {
                    return {
                        errCode: 2,
                        message: "Order not found",
                        data: null,
                    };
                }

                amount = Math.round(Number(orderResult.order.total_price));
            }

            const momoOrderId = this.generateRequestId();
            const requestId = momoOrderId;

            const requestData = {
                partnerCode: this.partnerCode,
                partnerName: "PAW Premier House",
                storeId: "PAWStore001",
                requestId: requestId,
                amount: amount.toString(),
                orderId: momoOrderId,
                orderInfo: orderInfo,
                redirectUrl: returnUrl || this.returnUrl,
                ipnUrl: notifyUrl || this.notifyUrl,
                lang: "vi",
                requestType: "payWithMethod",
                autoCapture: true,

                extraData:
                    extraData && extraData !== "{}"
                        ? extraData
                        : Buffer.from(
                              JSON.stringify({
                                  type: resourceType,
                                  id: originalOrderId,
                              }),
                          ).toString("base64"),

                orderGroupId: "",
            };

            requestData.signature = this.generateSignature(requestData);

            const requestBody = JSON.stringify(requestData);

            const response = await this.makeHttpRequest(
                this.apiEndpoint,
                requestBody,
            );

            return {
                errCode: 0,
                message: "Payment request created successfully",
                data: {
                    orderId: momoOrderId,
                    requestId: requestId,
                    ...JSON.parse(response),
                },
            };
        } catch (error) {
            console.error("Error creating MoMo payment:", error);
            return {
                errCode: 1,
                message: error.message || "Failed to create payment request",
                data: null,
            };
        }
    }

    makeHttpRequest(url, body) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: "test-payment.momo.vn",
                port: 443,
                path: "/v2/gateway/api/create",
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(body),
                },
            };

            const req = https.request(options, (res) => {
                let data = "";
                res.setEncoding("utf8");

                res.on("data", (chunk) => {
                    data += chunk;
                });

                res.on("end", () => {
                    if (res.statusCode === 200) {
                        resolve(data);
                    } else {
                        reject(
                            new Error(
                                `MoMo API error: ${res.statusCode} - ${data}`,
                            ),
                        );
                    }
                });
            });

            req.on("error", (error) => {
                console.error("Request error:", error);
                reject(error);
            });

            req.write(body);
            req.end();
        });
    }

    verifyCallbackSignature(queryParams) {
        const {
            partnerCode,
            orderId,
            requestId,
            amount,
            orderInfo,
            orderType,
            transId,
            resultCode,
            message,
            payType,
            responseTime,
            extraData,
            signature,
        } = queryParams;

        if (!signature) {
            return false;
        }

        const rawSignature =
            `accessKey=${this.accessKey}` +
            `&amount=${amount}` +
            `&extraData=${extraData}` +
            `&message=${message}` +
            `&orderId=${orderId}` +
            `&orderInfo=${orderInfo}` +
            `&orderType=${orderType}` +
            `&partnerCode=${partnerCode}` +
            `&payType=${payType}` +
            `&requestId=${requestId}` +
            `&responseTime=${responseTime}` +
            `&resultCode=${resultCode}` +
            `&transId=${transId}`;

        const expectedSignature = crypto
            .createHmac("sha256", this.secretKey)
            .update(rawSignature)
            .digest("hex");

        return expectedSignature === signature;
    }

    async handleCallback(queryParams) {
        try {
            const signatureValid = this.verifyCallbackSignature(queryParams);

            if (!signatureValid) {
                console.error("❌ [MoMo Callback] Invalid MoMo signature");
                return {
                    errCode: 1,
                    message: "Invalid signature",
                };
            }

            const { orderId, resultCode, message, transId, orderInfo } =
                queryParams;

            if (!orderId) {
                console.error("❌ [MoMo Callback] Missing orderId");
                return {
                    errCode: 2,
                    message: "Missing orderId",
                };
            }

            let originalOrderId = null;
            let resourceType = "order";

            try {
                const decodedExtraData = JSON.parse(
                    Buffer.from(queryParams.extraData, "base64").toString(),
                );

                originalOrderId = decodedExtraData.id;
                resourceType = decodedExtraData.type || "order";
            } catch (e) {
                console.error(
                    "❌ [MoMo Callback] Failed to decode extraData:",
                    e,
                );
            }

            if (!originalOrderId) {
                return {
                    errCode: 3,
                    message: "Cannot extract original resource ID",
                };
            }

            const paymentSuccess = resultCode === "0";

            if (paymentSuccess) {
                try {
                    if (resourceType === "booking") {
                        const BookingServiceModule = require("./BookingService");
                        const BookingService = BookingServiceModule.default;
                        const {
                            sendBookingEmail,
                        } = require("./BookingEmailService");
                        const bookingIdToUpdate = Number(originalOrderId);

                        const updateResult =
                            await BookingService.updateBookingPaymentStatus(
                                bookingIdToUpdate,
                                "paid",
                                {
                                    payment_method: "MOMO",
                                    momo_order_id: orderId,
                                    momo_trans_id: transId,
                                    momo_result_code: resultCode,
                                    momo_message: message,
                                },
                            );

                        if (updateResult.errCode !== 0) {
                            console.error(
                                "❌ [MoMoService] handleCallback -> booking updateResult",
                                updateResult,
                            );
                            return {
                                errCode: 4,
                                message:
                                    "Failed to update booking payment status",
                            };
                        }

                        try {
                            const updatedBooking = updateResult.booking;
                            await sendBookingEmail({
                                user: updatedBooking.customer,
                                booking: updatedBooking,
                                paymentUrl: null,
                            });
                        } catch (emailError) {
                            console.error(
                                "❌ [MoMo Callback] Send booking success email failed:",
                                emailError,
                            );
                        }
                    } else {
                        const OrderServiceModule = require("./OrderService");
                        const OrderService = OrderServiceModule.default;

                        const updateResult =
                            await OrderService.updateOrderPaymentStatus(
                                originalOrderId,
                                "paid",
                                {
                                    payment_method: "BANK",
                                    momo_order_id: orderId,
                                    momo_trans_id: transId,
                                    momo_result_code: resultCode,
                                    momo_message: message,
                                },
                            );

                        if (updateResult.errCode !== 0) {
                            return {
                                errCode: 4,
                                message: "Failed to update order status",
                            };
                        }

                        try {
                            const {
                                sendPaymentSuccessEmail,
                            } = require("./OrderEmailService");

                            const orderResult =
                                await OrderService.getOrderById(
                                    originalOrderId,
                                );

                            if (orderResult?.errCode === 0) {
                                await sendPaymentSuccessEmail({
                                    user: orderResult.order.customer,
                                    order: orderResult.order,
                                });
                            }
                        } catch (emailError) {
                            console.error(
                                "❌ [MoMo Callback] Send success email failed:",
                                emailError,
                            );
                        }
                    }
                } catch (updateError) {
                    return {
                        errCode: 5,
                        message: "Error updating payment status",
                    };
                }
            } else {
                try {
                    if (resourceType === "booking") {
                        const BookingServiceModule = require("./BookingService");
                        const BookingService = BookingServiceModule.default;
                        await BookingService.updateBookingPaymentStatus(
                            originalOrderId,
                            "failed",
                            {
                                payment_method: "MOMO",
                                momo_order_id: orderId,
                                momo_trans_id: transId,
                                momo_result_code: resultCode,
                                momo_message: message,
                            },
                        );
                    } else {
                        const OrderServiceModule = require("./OrderService");
                        const OrderService = OrderServiceModule.default;
                        await OrderService.updateOrderPaymentStatus(
                            originalOrderId,
                            "failed",
                            {
                                momo_order_id: orderId,
                                momo_trans_id: transId,
                                momo_result_code: resultCode,
                                momo_message: message,
                            },
                        );
                        try {
                            const {
                                sendPaymentFailedEmail,
                            } = require("./OrderEmailService");

                            const orderResult =
                                await OrderService.getOrderById(
                                    originalOrderId,
                                );

                            if (orderResult?.errCode === 0) {
                                await sendPaymentFailedEmail({
                                    user: orderResult.order.User,
                                    order: orderResult.order,
                                    reason: message,
                                });
                            }
                        } catch (emailError) {
                            console.error(
                                "❌ [MoMo Callback] Send failed email failed:",
                                emailError,
                            );
                        }
                    }
                } catch (updateError) {
                    console.error(
                        "❌ [MoMo Callback] Error updating failed status:",
                        updateError,
                    );
                }
            }

            const result = {
                errCode: 0,
                message: paymentSuccess
                    ? "Payment processed successfully"
                    : "Payment failed",
                orderId: originalOrderId,
                resourceType,
                paymentStatus: paymentSuccess ? "paid" : "failed",
            };

            return result;
        } catch (error) {
            console.error(
                "❌ [MoMo Callback] Error processing MoMo callback:",
                error,
            );
            return {
                errCode: -1,
                message: "Internal server error",
            };
        }
    }
}

module.exports = new MoMoService();
