const productRepo = require("../../repositories/productChatRepository");
const serviceRepo = require("../../repositories/serviceChatRepository");
const bookingRepo = require("../../repositories/bookingChatRepository");
const recommendationRepo = require("../../repositories/recommendationChatRepository");

const buildContext = async ({ intent, message, currentUser }) => {
    switch (intent) {
        case "product_search":
            return await productRepo.findRelevantProducts({
                message,
                currentUser,
            });

        case "service_search":
            return await serviceRepo.findRelevantServices({
                message,
                currentUser,
            });

        case "booking_lookup":
            return await bookingRepo.findUserBookings({ currentUser, message });

        case "recommendation_lookup":
            return await recommendationRepo.findUserRecommendations({
                currentUser,
            });

        default:
            return {
                faq: [],
                note: "No structured data matched. Respond generally.",
            };
    }
};

module.exports = buildContext;
