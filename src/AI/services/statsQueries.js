import db from "../../models/index.js";
import { Op } from "sequelize";

async function fetchServicesByIds(serviceIds = []) {
    if (!serviceIds.length) return [];

    const services = await db.Service.findAll({
        where: {
            service_id: { [Op.in]: serviceIds },
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
    });

    const serviceMap = new Map();
    services.forEach((service) => {
        serviceMap.set(service.service_id, service);
    });

    return serviceIds
        .map((id) => serviceMap.get(id))
        .filter(Boolean);
}

export async function getTopBookedServices(limit = 5) {
    const counts = await db.BookingItem.findAll({
        attributes: [
            "service_id",
            [db.Sequelize.fn("COUNT", db.Sequelize.col("bookingItem_id")), "bookingCount"],
        ],
        where: {
            service_id: { [Op.ne]: null },
        },
        group: ["service_id"],
        order: [[db.Sequelize.literal('"bookingCount"'), "DESC"]],
        limit,
        raw: true,
    });

    const serviceIds = counts.map((c) => c.service_id);
    const services = await fetchServicesByIds(serviceIds);

    return services.map((service) => ({
        service_id: service.service_id,
        price: parseInt(service.price) || 0,
        category: service.serviceCategories_id,
        translates: service.translates || [],
    }));
}

export async function getCheapestServices(limit = 5) {
    const services = await db.Service.findAll({
        where: { isActive: true, isDeleted: false },
        order: [["price", "ASC"]],
        limit,
        include: [
            {
                model: db.ServiceTranslate,
                as: "translates",
                required: false,
            },
        ],
    });

    return services.map((service) => ({
        service_id: service.service_id,
        price: parseInt(service.price) || 0,
        category: service.serviceCategories_id,
        translates: service.translates || [],
    }));
}

export async function getMostExpensiveServices(limit = 5) {
    const services = await db.Service.findAll({
        where: { isActive: true, isDeleted: false },
        order: [["price", "DESC"]],
        limit,
        include: [
            {
                model: db.ServiceTranslate,
                as: "translates",
                required: false,
            },
        ],
    });

    return services.map((service) => ({
        service_id: service.service_id,
        price: parseInt(service.price) || 0,
        category: service.serviceCategories_id,
        translates: service.translates || [],
    }));
}

