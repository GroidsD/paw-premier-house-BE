import { v4 as uuidv4 } from "uuid";
import db from "../models/index.js";
import AIServices from "../services/AIServices.js";

const { ChatSession, ChatMessage } = db;

const parseJsonField = (value, fallback = null) => {
    if (value === null || value === undefined) return fallback;

    if (typeof value === "object") return value;

    if (typeof value === "string") {
        try {
            return JSON.parse(value);
        } catch {
            return fallback;
        }
    }

    return fallback;
};
const normalizeNextAction = (frontendAction, aiNextAction) => {
    if (frontendAction?.type === "ADD_TO_CART") {
        return {
            type: "add_to_cart",
            payload: frontendAction.payload,
        };
    }

    return aiNextAction || null;
};

const mapMessageForFrontend = (messageRecord) => {
    const m =
        typeof messageRecord.get === "function"
            ? messageRecord.get({ plain: true })
            : messageRecord;

    const analysis = parseJsonField(m.analysis_json, null);
    const retrieval = parseJsonField(m.retrieval_json, null);
    const nextAction = parseJsonField(m.next_action_json, null);
    const metadata = parseJsonField(m.metadata_json, {});

    return {
        id: m.chat_message_id,
        chat_message_id: m.chat_message_id,

        role: m.sender === "assistant" ? "assistant" : "user",
        sender: m.sender,

        content: m.message || "",
        text: m.message || "",

        intent: m.intent || analysis?.intent || null,

        analysis,
        retrieval,
        nextAction,
        metadata,

        createdAt: m.created_at,
        created_at: m.created_at,

        // Optional: giúp frontend fallback nếu muốn
        cards: Array.isArray(retrieval?.items) ? retrieval.items : [],
        suggestions: [],
    };
};

const buildGuestCurrentUser = ({ guestId, clientContext = {} }) => {
    return {
        userId: null,
        guestId,
        sessionId: null,

        currentProductId:
            clientContext.currentProductId ||
            clientContext.lastProductId ||
            null,
        lastProductId: clientContext.lastProductId || null,
        currentProductName:
            clientContext.currentProductName ||
            clientContext.lastProductName ||
            null,
        lastProductName: clientContext.lastProductName || null,

        selectedVariantId: clientContext.selectedVariantId || null,
        currentVariantId: clientContext.currentVariantId || null,
        lastVariantId: clientContext.lastVariantId || null,

        currentServiceId:
            clientContext.currentServiceId ||
            clientContext.lastServiceId ||
            null,
        lastServiceId: clientContext.lastServiceId || null,
        currentServiceName:
            clientContext.currentServiceName ||
            clientContext.lastServiceName ||
            null,
        lastServiceName: clientContext.lastServiceName || null,

        lastShownProductIds: clientContext.lastShownProductIds || [],
        lastShownServiceIds: clientContext.lastShownServiceIds || [],

        lastPetType: clientContext.lastPetType || null,
        lastProductCategory: clientContext.lastProductCategory || null,
        lastProductForm: clientContext.lastProductForm || null,
        lastRecommendationGoal: clientContext.lastRecommendationGoal || null,
        lastIntent: clientContext.lastIntent || null,
    };
};

const getLimitedHistory = (history = []) => {
    if (!Array.isArray(history)) return [];

    return history
        .slice(-8)
        .filter((m) => m?.role && m?.content)
        .map((m) => ({
            role: m.role === "assistant" ? "assistant" : "user",
            content: String(m.content || ""),
        }));
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

            // Lấy 30 tin mới nhất.
            // Nếu created_at trùng nhau, dùng chat_message_id để giữ đúng thứ tự.
            order: [
                ["created_at", "DESC"],
                ["chat_message_id", "DESC"],
            ],

            limit: 30,
            attributes: [
                "chat_message_id",
                "sender",
                "message",
                "intent",
                "analysis_json",
                "retrieval_json",
                "next_action_json",
                "metadata_json",
                "created_at",
            ],
        });

        // Đảo lại để frontend nhận theo thứ tự cũ -> mới
        const messages = messagesDesc.reverse().map(mapMessageForFrontend);

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
        const { message, sessionId, guestId, history, clientContext } =
            req.body;

        console.log("[DEBUG] clientContext:", clientContext);
        console.log("[DEBUG] message:", message);

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Message is required",
            });
        }

        finalGuestId = userId ? null : guestId || `guest_${uuidv4()}`;

        if (!userId) {
            const currentUser = buildGuestCurrentUser({
                guestId: finalGuestId,
                clientContext,
            });

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
                guest: true,
                sessionId: null,
                guestId: finalGuestId,
            });

            const heartbeat = setInterval(() => {
                sendEvent("ping", { t: Date.now() });
            }, 15000);

            const pythonStream = await AIServices.callPythonChatStream({
                message,
                currentUser,
                history: getLimitedHistory(history),
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

                    if (eventName === "done") {
                        sendEvent("done", {
                            ...data,
                            guest: true,
                            sessionId: null,
                            guestId: finalGuestId,
                            createdAt: new Date().toISOString(),
                        });

                        if (data.nextAction?.type === "add_to_cart") {
                            sendEvent("action", {
                                type: "ADD_TO_CART",
                                payload: {
                                    product_id:
                                        data.nextAction.product_id ||
                                        data.nextAction.payload?.product_id,
                                    productVariant_id:
                                        data.nextAction.variant_id ||
                                        data.nextAction.payload?.variant_id ||
                                        data.nextAction.payload
                                            ?.productVariant_id ||
                                        null,
                                    quantity:
                                        data.nextAction.quantity ||
                                        data.nextAction.payload?.quantity ||
                                        1,
                                },
                            });
                        }
                    } else {
                        sendEvent(eventName, data);
                    }
                }
            });

            pythonStream.on("end", () => {
                clearInterval(heartbeat);
                res.end();
            });

            pythonStream.on("error", (error) => {
                console.error(
                    "[CHAT STREAM GUEST] Python stream error:",
                    error,
                );
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

            return;
        }

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
            order: [
                ["created_at", "DESC"],
                ["chat_message_id", "DESC"],
            ],
            limit: 8,
        });

        const dbHistory = recentMessages.reverse().map((m) => ({
            role: m.sender === "assistant" ? "assistant" : "user",
            content: m.message,
        }));

        await ChatMessage.create({
            chat_session_id: chatSession.chat_session_id,
            sender: "user",
            message,
        });

        const isVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễđ]/i.test(message);

        const normalizedClientContext = {
            ...clientContext,
            language: isVietnamese ? "vi" : clientContext?.language || "en",
            preferredLanguage: isVietnamese
                ? "vi"
                : clientContext?.preferredLanguage || "en",
        };

        const currentUser = {
            userId,
            guestId: finalGuestId,
            sessionId: chatSession.chat_session_id,

            language: isVietnamese ? "vi" : clientContext?.language || "en",
            preferredLanguage: isVietnamese
                ? "vi"
                : clientContext?.preferredLanguage || "en",

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
            history: dbHistory,
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
                        createdAt: new Date().toISOString(),
                    });
                    if (data.nextAction?.type === "add_to_cart") {
                        sendEvent("action", {
                            type: "ADD_TO_CART",
                            payload: {
                                product_id:
                                    data.nextAction.product_id ||
                                    data.nextAction.payload?.product_id,

                                productVariant_id:
                                    data.nextAction.variant_id ||
                                    data.nextAction.payload?.variant_id ||
                                    data.nextAction.payload
                                        ?.productVariant_id ||
                                    null,

                                quantity:
                                    data.nextAction.quantity ||
                                    data.nextAction.payload?.quantity ||
                                    1,
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
    getCurrentChatMessages,
    chatWithBotStream,
};
