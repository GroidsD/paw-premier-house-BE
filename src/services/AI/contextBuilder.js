const productRepo = require("../../repositories/productChatRepository");
const serviceRepo = require("../../repositories/serviceChatRepository");
const bookingRepo = require("../../repositories/bookingChatRepository");
const recommendationRepo = require("../../repositories/recommendationChatRepository");
const orderRepo = require("../../repositories/orderChatRepository");

const attachAnalysis = (context, analysis, message, currentUser) => ({
    ...(context || {}),
    analysis: context?.analysis || analysis || null,
    user_question: context?.user_question || message,
    matched_categories: context?.matched_categories || [],
    applied_filters: context?.applied_filters || [],
    confidence: context?.confidence ?? 0,
    auth: {
        isLoggedIn: Boolean(currentUser?.user_id),
        user_id: currentUser?.user_id || null,
    },
});

const buildAuthRequiredContext = ({
    message,
    type = "auth_required",
    reply,
}) => ({
    type,
    items: [],
    reply:
        reply ||
        "Bạn cần đăng nhập để xem dữ liệu cá nhân như booking, đơn hàng hoặc gợi ý dành riêng cho mình.",
    suggestions: ["Sản phẩm cho chó", "Dịch vụ grooming"],
    user_question: message,
    confidence: 1,
});

const buildContext = async ({ intent, message, currentUser, analysis }) => {
    let context;

    switch (intent) {
        case "product_search":
            context = await productRepo.findRelevantProducts({
                message,
                currentUser,
                analysis,
            });
            break;

        case "product_recommend":
            if (!currentUser?.user_id) {
                context = await productRepo.findRelevantProducts({
                    message,
                    currentUser,
                    analysis,
                });
                context = {
                    ...context,
                    personalized: false,
                    note: "Guest mode recommendation fallback",
                };
                break;
            }

            context = await recommendationRepo.findUserRecommendations({
                currentUser,
                message,
                analysis,
            });
            break;

        case "service_search":
            context = await serviceRepo.findRelevantServices({
                message,
                currentUser,
                analysis,
            });
            break;

        case "service_booking_intent":
            context = await serviceRepo.findRelevantServices({
                message,
                currentUser,
                analysis,
            });
            context = {
                ...context,
                booking_ready: Boolean(currentUser?.user_id),
            };
            break;

        case "my_bookings":
            if (!currentUser?.user_id) {
                context = buildAuthRequiredContext({
                    message,
                    type: "auth_required",
                    reply: "Bạn cần đăng nhập để xem booking của mình nhé.",
                });
                break;
            }

            context = await bookingRepo.findUserBookings({
                currentUser,
                message,
            });
            break;

        case "my_orders":
            if (!currentUser?.user_id) {
                context = buildAuthRequiredContext({
                    message,
                    type: "auth_required",
                    reply: "Bạn cần đăng nhập để xem đơn hàng của mình nhé.",
                });
                break;
            }

            context = await orderRepo.findUserOrders({ currentUser, message });
            break;

        default:
            context = {
                type: "general",
                items: [],
                faq: [],
                note: "No structured data matched. Respond generally.",
                suggestions: [
                    "Sản phẩm cho chó",
                    "Dịch vụ grooming",
                    "Đăng nhập để xem booking",
                ],
                confidence: 0.2,
            };
            break;
    }

    return attachAnalysis(context, analysis, message, currentUser);
};

module.exports = buildContext;
