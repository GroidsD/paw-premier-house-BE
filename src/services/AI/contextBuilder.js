const productRepo = require("../../repositories/productChatRepository");
const serviceRepo = require("../../repositories/serviceChatRepository");
const bookingRepo = require("../../repositories/bookingChatRepository");
const recommendationRepo = require("../../repositories/recommendationChatRepository");

const attachAnalysis = (context, analysis, message) => ({
    ...(context || {}),
    analysis: context?.analysis || analysis || null,
    user_question: context?.user_question || message,
    matched_categories: context?.matched_categories || [],
    applied_filters: context?.applied_filters || [],
    confidence: context?.confidence ?? 0,
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

        case "service_search":
            context = await serviceRepo.findRelevantServices({
                message,
                currentUser,
                analysis,
            });
            break;

        case "booking_lookup":
            context = await bookingRepo.findUserBookings({
                currentUser,
                message,
            });
            break;

        case "recommendation_lookup":
            context = await recommendationRepo.findUserRecommendations({
                currentUser,
            });
            break;

        default:
            context = {
                faq: [],
                note: "No structured data matched. Respond generally.",
            };
            break;
    }

    return attachAnalysis(context, analysis, message);
};

module.exports = buildContext;
