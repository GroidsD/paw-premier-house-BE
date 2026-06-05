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

        const recentMessages = await ChatMessage.findAll({
            where: {
                chat_session_id: chatSession.chat_session_id,
            },
            order: [["created_at", "DESC"]],
            limit: 8,
        });

        const history = recentMessages.reverse().map((m) => ({
            role: m.sender === "assistant" ? "assistant" : "user",
            content: m.message,
        }));
        await ChatMessage.create({
            chat_session_id: chatSession.chat_session_id,
            sender: "user",
            message: message,
        });

        const currentUser = {
            userId,
            guestId: finalGuestId,
            sessionId: chatSession.chat_session_id,

            // Product context
            currentProductId: chatSession.last_product_id,
            lastProductId: chatSession.last_product_id,
            currentProductName: chatSession.last_product_name,
            lastProductName: chatSession.last_product_name,

            // Variant context - đặt đúng tên Python đang đọc
            selectedVariantId: chatSession.last_productVariant_id,
            currentVariantId: chatSession.last_productVariant_id,
            lastVariantId: chatSession.last_productVariant_id,

            // Service context
            currentServiceId: chatSession.last_service_id,
            lastServiceId: chatSession.last_service_id,
            currentServiceName: chatSession.last_service_name,
            lastServiceName: chatSession.last_service_name,

            // Last shown list
            lastShownProductIds: chatSession.last_shown_product_ids || [],
            lastShownServiceIds: chatSession.last_shown_service_ids || [],

            // Search / preference context
            lastPetType: chatSession.last_pet_type,
            lastProductCategory: chatSession.last_product_category,
            lastProductForm: chatSession.last_product_form,
            lastRecommendationGoal: chatSession.last_recommendation_goal,
            lastIntent: chatSession.last_intent,
        };

        const aiResult = await AIServices.callPythonChat({
            message,
            currentUser,
            history,
        });

        const analysis = aiResult.analysis || {};
        const retrieval = aiResult.retrieval || {};
        const retrievalItems = Array.isArray(retrieval.items)
            ? retrieval.items
            : [];

        const firstItem = retrievalItems[0] || null;

        const firstProductItem = retrievalItems.find((item) => item.product_id);
        const firstServiceItem = retrievalItems.find((item) => item.service_id);

        const shownProductIds = retrievalItems
            .filter((item) => item.product_id)
            .map((item) => item.product_id);

        const shownServiceIds = retrievalItems
            .filter((item) => item.service_id)
            .map((item) => item.service_id);

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

            await ChatMessage.create({
                chat_session_id: chatSession.chat_session_id,
                sender: "assistant",
                message: finalReply,
                intent: finalIntent,
                analysis_json: aiResult.analysis || null,
                retrieval_json: {
                    type: "orders",
                    items: plainOrders,
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
                orders: plainOrders,
                action: null,
            });
        }
        if (aiResult.nextAction?.type === "ask_variant_selection") {
            const finalReply =
                aiResult.reply ||
                aiResult.nextAction.message ||
                "Sản phẩm này có nhiều phân loại. Bạn muốn chọn phân loại nào ạ?";

            await ChatMessage.create({
                chat_session_id: chatSession.chat_session_id,
                sender: "assistant",
                message: finalReply,
                intent: finalIntent,
                analysis_json: aiResult.analysis || null,
                retrieval_json: aiResult.retrieval || null,
                next_action_json: aiResult.nextAction,
            });

            await chatSession.update({
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
                nextAction: aiResult.nextAction,
                action: null,
            });
        }
        if (
            finalIntent === "cart_add" ||
            aiResult.nextAction?.type === "add_to_cart" ||
            isContextualAddToCart
        ) {
            finalIntent = "cart_add";

            const nextAction = aiResult.nextAction || {};

            const productId =
                nextAction.product_id ||
                nextAction.payload?.product_id ||
                retrieval.product_id ||
                firstProductItem?.product_id ||
                firstItem?.product_id ||
                analysis.product_id ||
                chatSession.last_product_id;

            const productVariantId =
                nextAction.variant_id ||
                nextAction.payload?.variant_id ||
                nextAction.payload?.productVariant_id ||
                retrieval.variant_id ||
                firstProductItem?.matched_variant_id ||
                firstProductItem?.selected_variant_id ||
                firstProductItem?.default_variant_id ||
                firstProductItem?.productVariant_id ||
                firstProductItem?.product_variant_id ||
                analysis.variant_id ||
                analysis.productVariantId ||
                analysis.productVariant_id ||
                analysis.product_variant_id ||
                chatSession.last_productVariant_id ||
                null;

            const quantity = Number(
                nextAction.quantity ||
                    nextAction.payload?.quantity ||
                    retrieval.quantity ||
                    analysis.quantity ||
                    (isContextualAddToCart ? detectedQuantity : null) ||
                    1,
            );

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
                firstProductItem?.product_id ||
                analysis.product_id ||
                chatSession.last_product_id,

            last_product_name:
                firstProductItem?.name || chatSession.last_product_name,

            last_productVariant_id:
                firstProductItem?.matched_variant_id ||
                firstProductItem?.selected_variant_id ||
                firstProductItem?.default_variant_id ||
                firstProductItem?.productVariant_id ||
                firstProductItem?.product_variant_id ||
                analysis.variant_id ||
                analysis.productVariantId ||
                analysis.productVariant_id ||
                analysis.product_variant_id ||
                chatSession.last_productVariant_id,

            last_service_id:
                firstServiceItem?.service_id ||
                analysis.service_id ||
                chatSession.last_service_id,

            last_service_name:
                firstServiceItem?.name || chatSession.last_service_name,

            last_shown_product_ids: shownProductIds.length
                ? shownProductIds
                : chatSession.last_shown_product_ids,

            last_shown_service_ids: shownServiceIds.length
                ? shownServiceIds
                : chatSession.last_shown_service_ids,

            last_search_filters: {
                pet_type: analysis.pet_type || null,
                product_category: analysis.product_category || null,
                product_form: analysis.product_form || null,
                service_category: analysis.service_category || null,
                service_type: analysis.service_type || null,
                price_min: analysis.price_min || null,
                price_max: analysis.price_max || null,
                discount_mode: analysis.discount_mode || null,
                recommendation_goal: analysis.recommendation_goal || null,
            },

            last_intent: finalIntent || chatSession.last_intent,
        });

        await ChatMessage.create({
            chat_session_id: chatSession.chat_session_id,
            sender: "assistant",
            message: finalReply || "",
            intent: finalIntent,
            analysis_json: aiResult.analysis || null,
            retrieval_json: aiResult.retrieval || null,
            next_action_json: frontendAction || aiResult.nextAction || null,
            metadata_json: {
                source: "python_ai",
                action:
                    frontendAction?.type || aiResult.nextAction?.type || null,
            },
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
            metadata: {
                source: "python_ai",
                action:
                    frontendAction?.type || aiResult.nextAction?.type || null,
            },
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
let getCurrentChatMessages = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { guestId } = req.query;

        const userId = req.user?.user_id || null;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                message: "sessionId is required",
            });
        }

        const chatSession = await ChatSession.findByPk(sessionId);

        if (!chatSession) {
            return res.status(404).json({
                success: false,
                message: "Chat session not found",
            });
        }

        const isOwner = userId
            ? chatSession.user_id === userId
            : !chatSession.user_id && chatSession.guest_id === guestId;

        if (!isOwner) {
            return res.status(403).json({
                success: false,
                message: "You cannot access this chat session",
            });
        }

        const messagesDesc = await ChatMessage.findAll({
            where: {
                chat_session_id: sessionId,
            },
            order: [["created_at", "DESC"]],
            limit: 30,
            attributes: [
                "chat_message_id",
                "sender",
                "message",
                "intent",
                "retrieval_json",
                "next_action_json",
                "metadata_json",
                "created_at",
            ],
        });

        const messages = messagesDesc.reverse();

        return res.status(200).json({
            success: true,
            sessionId: chatSession.chat_session_id,
            guestId: chatSession.guest_id,
            messages,
        });
    } catch (error) {
        console.error("[CHAT] getCurrentChatMessages error:", error);

        return res.status(500).json({
            success: false,
            message: "Cannot load chat messages",
        });
    }
};

let chatWithBotStream = async (req, res) => {
    let chatSession = null;
    let finalGuestId = null;
    let userId = req.user?.user_id || null;
    let finalReply = "";
    let finalDonePayload = null;

    try {
        const { message, sessionId, guestId } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        finalGuestId = userId ? null : guestId || `guest_${uuidv4()}`;

        if (sessionId) {
            chatSession = await ChatSession.findByPk(sessionId);
        }

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

        const recentMessages = await ChatMessage.findAll({
            where: {
                chat_session_id: chatSession.chat_session_id,
            },
            order: [["created_at", "DESC"]],
            limit: 8,
        });

        const history = recentMessages.reverse().map((m) => ({
            role: m.sender === "assistant" ? "assistant" : "user",
            content: m.message,
        }));

        await ChatMessage.create({
            chat_session_id: chatSession.chat_session_id,
            sender: "user",
            message,
        });

        const currentUser = {
            userId,
            guestId: finalGuestId,
            sessionId: chatSession.chat_session_id,

            currentProductId: chatSession.last_product_id,
            lastProductId: chatSession.last_product_id,
            currentProductName: chatSession.last_product_name,
            lastProductName: chatSession.last_product_name,

            selectedVariantId: chatSession.last_productVariant_id,
            currentVariantId: chatSession.last_productVariant_id,
            lastVariantId: chatSession.last_productVariant_id,

            currentServiceId: chatSession.last_service_id,
            lastServiceId: chatSession.last_service_id,
            currentServiceName: chatSession.last_service_name,
            lastServiceName: chatSession.last_service_name,

            lastShownProductIds: chatSession.last_shown_product_ids || [],
            lastShownServiceIds: chatSession.last_shown_service_ids || [],

            lastPetType: chatSession.last_pet_type,
            lastProductCategory: chatSession.last_product_category,
            lastProductForm: chatSession.last_product_form,
            lastRecommendationGoal: chatSession.last_recommendation_goal,
            lastIntent: chatSession.last_intent,
        };

        res.writeHead(200, {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
            "X-Accel-Buffering": "no",
        });
        if (typeof res.flushHeaders === "function") {
            res.flushHeaders();
        }

        const sendEvent = (event, data) => {
            if (res.writableEnded) return;

            res.write(`event: ${event}\n`);
            res.write(`data: ${JSON.stringify(data)}\n\n`);

            if (typeof res.flush === "function") {
                res.flush();
            }
        };

        sendEvent("meta", {
            success: true,
            sessionId: chatSession.chat_session_id,
            guestId: finalGuestId,
        });
        const heartbeat = setInterval(() => {
            sendEvent("ping", { t: Date.now() });
        }, 15000);

        const pythonStream = await AIServices.callPythonChatStream({
            message,
            currentUser,
            history,
        });

        let buffer = "";

        pythonStream.on("data", (chunk) => {
            const text = chunk.toString("utf8");
            buffer += text;

            const events = buffer.split("\n\n");
            buffer = events.pop() || "";

            for (const rawEvent of events) {
                const lines = rawEvent.split("\n");
                const eventLine = lines.find((line) =>
                    line.startsWith("event:"),
                );
                const dataLines = lines.filter((line) =>
                    line.startsWith("data:"),
                );

                if (!eventLine || !dataLines.length) continue;

                const eventName = eventLine.replace("event:", "").trim();
                const dataText = dataLines
                    .map((line) => line.replace(/^data:\s?/, ""))
                    .join("\n")
                    .trim();

                let data = null;

                try {
                    data = JSON.parse(dataText);
                } catch {
                    data = { raw: dataText };
                }

                if (eventName === "token") {
                    finalReply += data.text || "";
                    sendEvent("token", data);
                } else if (eventName === "done") {
                    finalDonePayload = data;
                    sendEvent("done", {
                        ...data,
                        sessionId: chatSession.chat_session_id,
                        guestId: finalGuestId,
                    });
                    if (data.nextAction?.type === "add_to_cart") {
                        sendEvent("action", {
                            type: "ADD_TO_CART",
                            payload: {
                                product_id: data.nextAction.product_id,
                                productVariant_id: data.nextAction.variant_id,
                                quantity: data.nextAction.quantity || 1,
                            },
                        });
                    }
                } else {
                    sendEvent(eventName, data);
                }
            }
        });

        pythonStream.on("end", async () => {
            try {
                const analysis = finalDonePayload?.analysis || {};
                const retrieval = finalDonePayload?.retrieval || {};
                const retrievalItems = Array.isArray(retrieval.items)
                    ? retrieval.items
                    : [];

                const firstProductItem = retrievalItems.find(
                    (item) => item.product_id,
                );
                const firstServiceItem = retrievalItems.find(
                    (item) => item.service_id,
                );

                const shownProductIds = retrievalItems
                    .filter((item) => item.product_id)
                    .map((item) => item.product_id);

                const shownServiceIds = retrievalItems
                    .filter((item) => item.service_id)
                    .map((item) => item.service_id);

                const finalIntent =
                    finalDonePayload?.intent || analysis.intent || null;

                await chatSession.update({
                    last_pet_type:
                        analysis.pet_type || chatSession.last_pet_type,

                    last_product_category:
                        analysis.product_category ||
                        chatSession.last_product_category,

                    last_product_form:
                        analysis.product_form || chatSession.last_product_form,

                    last_recommendation_goal:
                        analysis.recommendation_goal ||
                        chatSession.last_recommendation_goal,

                    last_product_id:
                        firstProductItem?.product_id ||
                        analysis.product_id ||
                        chatSession.last_product_id,

                    last_product_name:
                        firstProductItem?.name || chatSession.last_product_name,

                    last_productVariant_id:
                        firstProductItem?.matched_variant_id ||
                        firstProductItem?.selected_variant_id ||
                        firstProductItem?.default_variant_id ||
                        firstProductItem?.productVariant_id ||
                        firstProductItem?.product_variant_id ||
                        analysis.variant_id ||
                        analysis.productVariantId ||
                        analysis.productVariant_id ||
                        analysis.product_variant_id ||
                        chatSession.last_productVariant_id,

                    last_service_id:
                        firstServiceItem?.service_id ||
                        analysis.service_id ||
                        chatSession.last_service_id,

                    last_service_name:
                        firstServiceItem?.name || chatSession.last_service_name,

                    last_shown_product_ids: shownProductIds.length
                        ? shownProductIds
                        : chatSession.last_shown_product_ids,

                    last_shown_service_ids: shownServiceIds.length
                        ? shownServiceIds
                        : chatSession.last_shown_service_ids,

                    last_search_filters: {
                        pet_type: analysis.pet_type || null,
                        product_category: analysis.product_category || null,
                        product_form: analysis.product_form || null,
                        service_category: analysis.service_category || null,
                        service_type: analysis.service_type || null,
                        price_min: analysis.price_min || null,
                        price_max: analysis.price_max || null,
                        discount_mode: analysis.discount_mode || null,
                        recommendation_goal:
                            analysis.recommendation_goal || null,
                    },

                    last_intent: finalIntent || chatSession.last_intent,
                });

                await ChatMessage.create({
                    chat_session_id: chatSession.chat_session_id,
                    sender: "assistant",
                    message: finalDonePayload?.reply || finalReply || "",
                    intent: finalIntent,
                    analysis_json: analysis || null,
                    retrieval_json: retrieval || null,
                    next_action_json: finalDonePayload?.nextAction || null,
                    metadata_json: {
                        source: "python_ai_stream",
                        action: finalDonePayload?.nextAction?.type || null,
                    },
                });
            } catch (saveError) {
                console.error("[CHAT STREAM] save error:", saveError);
            }
            clearInterval(heartbeat);
            res.end();
        });

        pythonStream.on("error", (error) => {
            console.error("[CHAT STREAM] Python stream error:", error);
            clearInterval(heartbeat);
            sendEvent("error", {
                message: "AI stream error",
            });

            res.end();
        });

        res.on("close", () => {
            clearInterval(heartbeat);
            if (!res.writableEnded) {
                try {
                    pythonStream.destroy();
                } catch {}
            }
        });
    } catch (e) {
        console.error("[CHAT STREAM CONTROLLER] Error:", e);

        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: "Chat stream server error",
                error: e.message || "Server error",
            });
        }

        res.write(`event: error\n`);
        res.write(
            `data: ${JSON.stringify({
                message: "Chat stream server error",
            })}\n\n`,
        );
        res.end();
    }
};
export default {
    chatWithBot,
    getCurrentChatMessages,
    chatWithBotStream,
};
