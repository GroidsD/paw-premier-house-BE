import { Service, ServiceCategory, Media } from "../models";

const findRelevantServices = async ({ message }) => {
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

    return {
        type: "services",
        items: services.map((service) => ({
            service_id: service.service_id,
            name: service.name,
            description: service.description,
            category: service.category?.type || null,
            price: Number(service.price || 0),
            duration: Number(service.duration || 0),
        })),
        user_question: message,
    };
};

module.exports = {
    findRelevantServices,
};
