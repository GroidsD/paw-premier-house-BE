import { Service, ServiceCategory, Media } from "../../../models";
import normalizeText from "../../../utils/normalizeText";

const includesTerm = (haystack = "", term = "") => {
    const normalizedHaystack = normalizeText(haystack);
    const normalizedTerm = normalizeText(term);

    if (!normalizedTerm) return false;

    return (
        normalizedHaystack.includes(normalizedTerm) ||
        normalizedTerm.includes(normalizedHaystack)
    );
};

const scoreService = (service, analysis = {}) => {
    let score = 0;
    const name = service.name_vi || service.name_en || "";
    const description = service.description_vi || service.description_en || "";
    const haystack = [name, description, service.category].join(" ");

    for (const hint of analysis.categoryHints || []) {
        if (includesTerm(service.category, hint)) {
            score += 18;
        }
    }

    for (const term of analysis.searchTerms || []) {
        if (includesTerm(haystack, term)) {
            score += includesTerm(name, term) ? 14 : 8;
        }
    }

    return score;
};

const findRelevantServices = async ({ message, analysis }) => {
    const services = await Service.findAll({
        where: {
            isActive: true,
            isDeleted: false,
        },
        include: [
            {
                model: ServiceCategory,
                as: "category",
                attributes: ["serviceCategories_id", "type"],
            },
            {
                model: Media,
                as: "media",
                attributes: ["media_id", "url", "is_main", "alt_text"],
                required: false,
            },
        ],
        limit: 5,
        order: [["updated_at", "DESC"]],
    });

    const matchedCategories = Array.from(
        new Set(
            services
                .map((service) => service.category?.type || null)
                .filter((type) =>
                    (analysis?.categoryHints || []).some((hint) =>
                        includesTerm(type, hint),
                    ),
                ),
        ),
    );

    const items = services
        .map((service) => ({
            service_id: service.service_id,
            name: service.name_vi || service.name_en,
            description: service.description_vi || service.description_en,
            category: service.category?.type || null,
            price: Number(service.price || 0),
            duration: Number(service.duration || 0),
            _score: scoreService(
                {
                    name_vi: service.name_vi,
                    name_en: service.name_en,
                    description_vi: service.description_vi,
                    description_en: service.description_en,
                    category: service.category?.type || null,
                },
                analysis,
            ),
        }))
        .sort((a, b) => b._score - a._score)
        .slice(0, 5);

    return {
        type: "services",
        items,
        user_question: message,
        analysis,
        matched_categories: matchedCategories,
        applied_filters: ["active_services_only", "post_ranked_search"],
        confidence: items[0]?._score
            ? Number(Math.min(1, items[0]._score / 40).toFixed(2))
            : 0,
    };
};

module.exports = {
    findRelevantServices,
};
