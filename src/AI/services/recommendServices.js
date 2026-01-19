import db from "../../models/index.js";
import { Op } from "sequelize";
import { semanticSearchServices } from "./semanticSearch.js";
import { getTopBookedServices } from "./statsQueries.js";

export async function recommendServices({
    userId = null,
    userText = null,
    userProfile = null,
    entities = {},
    language = "vi",
    limit = 5,
}) {
    console.log("🛁 Recommending services:", {
        userId,
        serviceInterests: userProfile?.serviceInterests,
        language,
    });

    if (userId) {
        const history = await recommendFromBookingHistory(userId, limit);
        if (history.length > 0) return history;
    }

    const filtersFromProfile = buildFiltersFromProfile(userProfile, entities);

    if (filtersFromProfile.query) {
        const profileMatches = await semanticSearchServices(
            filtersFromProfile.query,
            language,
            limit,
            filtersFromProfile.filters
        );

        if (profileMatches.length > 0) {
            console.log("✅ Returning services from profile search");
            return profileMatches;
        }
    }

    if (userText) {
        const matches = await semanticSearchServices(userText, language, limit, filtersFromProfile.filters);
        if (matches.length > 0) {
            console.log("✅ Returning services from text search");
            return matches;
        }
    }

    return getTopBookedServices(limit);
}

async function recommendFromBookingHistory(userId, limit) {
    const bookings = await db.Booking.findAll({
        where: { customer_id: userId },
        include: [
            {
                model: db.BookingItem,
                as: "bookingItems",
                include: [
                    {
                        model: db.Service,
                        as: "service",
                        include: [{ model: db.ServiceTranslate, as: "translates" }],
                    },
                ],
            },
        ],
    });

    const categories = new Set();
    const usedServiceIds = new Set();

    for (const booking of bookings) {
        for (const item of booking.bookingItems || []) {
            if (item.service) {
                usedServiceIds.add(item.service.service_id);
                if (item.service.serviceCategories_id) {
                    categories.add(item.service.serviceCategories_id);
                }
            }
        }
    }

    if (!categories.size) return [];

    const services = await db.Service.findAll({
        where: {
            serviceCategories_id: { [Op.in]: Array.from(categories) },
            service_id: { [Op.notIn]: Array.from(usedServiceIds) },
            isActive: true,
            isDeleted: false,
        },
        include: [
            {
                model: db.ServiceTranslate,
                as: "translates",
                required: false,
            },
        ],
        order: [
            ["createdAt", "DESC"],
            ["price", "ASC"],
        ],
        limit,
    });

    return services;
}

function buildFiltersFromProfile(userProfile = {}, entities = {}) {
    const filters = {};
    let query = "";

    const interest =
        entities.service_category ||
        userProfile?.serviceInterests?.[0] ||
        null;

    if (interest) {
        filters.category = interest;
        query += ` ${interest}`;
    }

    const priceRange = entities.price_range || userProfile?.priceRange;
    if (priceRange) {
        filters.price_range = priceRange;
    }

    if (userProfile?.petType) {
        query += ` ${userProfile.petType}`;
    }

    query = query.trim();

    return { filters, query };
}

