import { v4 as uuidv4 } from "uuid";
import db from "../models/index.js";
import AIServices from "../services/AIServices.js";

const { ChatSession, ChatMessage } = db;

let chatWithBot = async (req, res) => {
    try {
        const { message, sessionId, guestId } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        if (!ChatSession || !ChatMessage) {
            return res.status(500).json({
                success: false,
                message: "ChatSession or ChatMessage model is not loaded",
            });
        }

        const userId = req.user?.user_id || null;
        const finalGuestId = userId ? null : guestId || `guest_${uuidv4()}`;

        let chatSession = null;

        if (sessionId) {
            chatSession = await ChatSession.findByPk(sessionId);
        }

        /**
         * Bảo vệ session:
         * 1. Guest không được dùng session của user đã login
         * 2. User A không được dùng session của User B
         * 3. Nếu sai chủ sở hữu thì tạo session mới
         */
        if (chatSession) {
            const sessionUserId = chatSession.user_id || null;

            const isGuestRequest = !userId;
            const isUserRequest = !!userId;

            const guestUsingUserSession = isGuestRequest && !!sessionUserId;
            const userUsingAnotherUserSession =
                isUserRequest && sessionUserId && sessionUserId !== userId;

            if (guestUsingUserSession || userUsingAnotherUserSession) {
                chatSession = null;
            }
        }

        if (!chatSession) {
            chatSession = await ChatSession.create({
                user_id: userId,
                guest_id: finalGuestId,
            });
        }

        await ChatMessage.create({
            chat_session_id: chatSession.chat_session_id,
            sender: "user",
            message: message,
        });

        const currentUser = {
            userId: userId,
            guestId: finalGuestId,
            sessionId: chatSession.chat_session_id,

            lastProductId: chatSession.last_product_id,
            lastProductVariantId: chatSession.last_productVariant_id,

            lastPetType: chatSession.last_pet_type,
            lastProductCategory: chatSession.last_product_category,
            lastProductForm: chatSession.last_product_form,
            lastRecommendationGoal: chatSession.last_recommendation_goal,
            lastIntent: chatSession.last_intent,
        };

        const aiResult = await AIServices.callPythonChat({
            message,
            currentUser,
        });

        const analysis = aiResult.analysis || {};
        const retrieval = aiResult.retrieval || {};

        const firstItem = Array.isArray(retrieval.items)
            ? retrieval.items[0]
            : null;

        let finalIntent = aiResult.intent || analysis.intent || null;

        let frontendAction = null;

        const normalizedMessage = message
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
        const quantityMatch = normalizedMessage.match(/\b(\d+)\b/);
        const detectedQuantity = quantityMatch
            ? Number(quantityMatch[1])
            : null;

        const isAddToCartText =
            (normalizedMessage.includes("them") ||
                normalizedMessage.includes("add") ||
                normalizedMessage.includes("mua") ||
                normalizedMessage.includes("lay")) &&
            (normalizedMessage.includes("gio") ||
                normalizedMessage.includes("cart") ||
                normalizedMessage.includes("mua") ||
                normalizedMessage.includes("lay"));

        const isContextualAddToCart =
            isAddToCartText &&
            (normalizedMessage.includes("mon nay") ||
                normalizedMessage.includes("san pham nay") ||
                normalizedMessage.includes("cai nay") ||
                normalizedMessage.includes("cai dau tien") ||
                normalizedMessage.includes("sp nay") ||
                normalizedMessage.includes("no"));
        if (
            finalIntent === "my_orders" ||
            aiResult.nextAction?.type === "show_order_status" ||
            normalizedMessage.includes("don hang") ||
            normalizedMessage.includes("order")
        ) {
            finalIntent = "my_orders";

            if (!userId) {
                const finalReply =
                    "Bạn cần đăng nhập để mình kiểm tra đơn hàng của bạn nha.";

                await ChatMessage.create({
                    chat_session_id: chatSession.chat_session_id,
                    sender: "assistant",
                    message: finalReply,
                    intent: finalIntent,
                    analysis_json: aiResult.analysis || null,
                    retrieval_json: aiResult.retrieval || null,
                    next_action_json: null,
                });

                return res.status(200).json({
                    success: true,
                    sessionId: chatSession.chat_session_id,
                    guestId: finalGuestId,
                    reply: finalReply,
                    intent: finalIntent,
                    analysis: aiResult.analysis || null,
                    retrieval: aiResult.retrieval || null,
                    nextAction: null,
                    action: null,
                });
            }

            const orders = await db.Order.findAll({
                where: {
                    customer_id: userId,
                },
                include: [
                    {
                        model: db.OrderItem,
                        as: "orderItems",
                    },
                ],
                order: [["created_at", "DESC"]],
                limit: 3,
            });

            if (!orders.length) {
                const finalReply =
                    "Mình chưa thấy đơn hàng nào gần đây của bạn.";
                await ChatMessage.create({
                    chat_session_id: chatSession.chat_session_id,
                    sender: "assistant",
                    message: finalReply,
                    intent: finalIntent,
                    analysis_json: aiResult.analysis || null,
                    retrieval_json: {
                        type: "orders",
                        items: [],
                    },
                    next_action_json: {
                        type: "show_order_status",
                    },
                });

                await chatSession.update({
                    last_intent: finalIntent,
                });
                return res.status(200).json({
                    success: true,
                    sessionId: chatSession.chat_session_id,
                    guestId: finalGuestId,
                    reply: finalReply,
                    intent: finalIntent,
                    orders: [],
                    action: null,
                });
            }

            const statusText = {
                pending: "đang chờ xác nhận",
                confirmed: "đã xác nhận",
                shipping: "đang giao",
                completed: "đã hoàn tất",
                cancelled: "đã hủy",
                deleted: "đã xóa",
            };

            const plainOrders = orders.map((order) =>
                order.get({ plain: true }),
            );

            const orderLines = plainOrders.map((order) => {
                return `Đơn ${order.order_code}: ${
                    statusText[order.status] || order.status
                }, tổng ${Number(order.total_price || 0).toLocaleString("vi-VN")}đ`;
            });

            const finalReply = `Mình tìm thấy đơn gần đây của bạn:\n${orderLines.join("\n")}`;

            return res.status(200).json({
                success: true,
                sessionId: chatSession.chat_session_id,
                guestId: finalGuestId,
                reply: finalReply,
                intent: finalIntent,
                orders: plainOrders,
                action: null,
            });
        }
        if (
            finalIntent === "cart_add" ||
            aiResult.nextAction?.type === "add_to_cart" ||
            isContextualAddToCart
        ) {
            finalIntent = "cart_add";

            const productId =
                firstItem?.product_id ||
                analysis.product_id ||
                chatSession.last_product_id;

            const productVariantId =
                firstItem?.productVariant_id ||
                firstItem?.product_variant_id ||
                analysis.productVariantId ||
                analysis.productVariant_id ||
                analysis.product_variant_id ||
                chatSession.last_productVariant_id ||
                null;

            const quantity = Number(analysis.quantity || detectedQuantity || 1);

            if (!productId) {
                await ChatMessage.create({
                    chat_session_id: chatSession.chat_session_id,
                    sender: "assistant",
                    message: "Bạn muốn thêm sản phẩm nào vào giỏ hàng vậy ạ?",
                    intent: finalIntent,
                    analysis_json: aiResult.analysis || null,
                    retrieval_json: aiResult.retrieval || null,
                    next_action_json: aiResult.nextAction || null,
                });

                return res.status(200).json({
                    success: true,
                    sessionId: chatSession.chat_session_id,
                    guestId: finalGuestId,
                    reply: "Bạn muốn thêm sản phẩm nào vào giỏ hàng vậy ạ?",
                    intent: finalIntent,
                    analysis: aiResult.analysis || null,
                    retrieval: aiResult.retrieval || null,
                    nextAction: aiResult.nextAction || null,
                    action: null,
                });
            }

            frontendAction = {
                type: "ADD_TO_CART",
                payload: {
                    product_id: productId,
                    productVariant_id: productVariantId,
                    quantity: quantity,
                },
            };
        }

        const finalReply =
            frontendAction?.type === "ADD_TO_CART"
                ? "Mình đã thêm sản phẩm này vào giỏ hàng cho bạn nha."
                : aiResult.reply;

        await ChatMessage.create({
            chat_session_id: chatSession.chat_session_id,
            sender: "assistant",
            message: finalReply || "",
            intent: finalIntent,
            analysis_json: aiResult.analysis || null,
            retrieval_json: aiResult.retrieval || null,
            next_action_json: frontendAction || aiResult.nextAction || null,
        });

        await chatSession.update({
            last_pet_type: analysis.pet_type || chatSession.last_pet_type,

            last_product_category:
                analysis.product_category || chatSession.last_product_category,

            last_product_form:
                analysis.product_form || chatSession.last_product_form,

            last_recommendation_goal:
                analysis.recommendation_goal ||
                chatSession.last_recommendation_goal,

            last_product_id:
                firstItem?.product_id ||
                analysis.product_id ||
                chatSession.last_product_id,

            last_productVariant_id:
                firstItem?.productVariant_id ||
                firstItem?.product_variant_id ||
                analysis.productVariantId ||
                analysis.productVariant_id ||
                analysis.product_variant_id ||
                chatSession.last_productVariant_id,

            last_intent: finalIntent || chatSession.last_intent,
        });

        return res.status(200).json({
            success: true,
            sessionId: chatSession.chat_session_id,
            guestId: finalGuestId,
            reply: finalReply,
            intent: finalIntent,
            analysis: aiResult.analysis || null,
            retrieval: aiResult.retrieval || null,
            nextAction:
                frontendAction?.type === "ADD_TO_CART"
                    ? {
                          type: "add_to_cart",
                          payload: frontendAction.payload,
                      }
                    : aiResult.nextAction || null,
            action: frontendAction,
        });
    } catch (e) {
        console.error("[CHAT CONTROLLER] Error:", e);

        return res.status(500).json({
            success: false,
            message: "Chat server error",
            error: e.message || "Server error",
        });
    }
};

export default {
    chatWithBot,
};
