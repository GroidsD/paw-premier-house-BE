import { UserRecommendation, Product, Service } from "../models";

const findUserRecommendations = async ({ currentUser }) => {
    const recommendations = await UserRecommendation.findAll({
        where: {
            user_id: currentUser.user_id,
        },
        order: [["score", "DESC"]],
        limit: 10,
    });

    const productIds = recommendations
        .filter((r) => r.entity_type === "products")
        .map((r) => r.entity_id);

    const serviceIds = recommendations
        .filter((r) => r.entity_type === "services")
        .map((r) => r.entity_id);

    const [products, services] = await Promise.all([
        productIds.length
            ? Product.findAll({ where: { product_id: productIds } })
            : [],
        serviceIds.length
            ? Service.findAll({ where: { service_id: serviceIds } })
            : [],
    ]);

    const productMap = new Map(products.map((p) => [p.product_id, p]));
    const serviceMap = new Map(services.map((s) => [s.service_id, s]));

    return {
        type: "recommendations",
        items: recommendations.map((rec) => {
            let entity = null;

            if (rec.entity_type === "products") {
                const product = productMap.get(rec.entity_id);
                if (product) {
                    entity = {
                        id: product.product_id,
                        name: product.name,
                        type: "product",
                        price: Number(product.price || 0),
                    };
                }
            }

            if (rec.entity_type === "services") {
                const service = serviceMap.get(rec.entity_id);
                if (service) {
                    entity = {
                        id: service.service_id,
                        name: service.name,
                        type: "service",
                        price: Number(service.price || 0),
                    };
                }
            }

            return {
                recommendation_id: rec.recommendation_id,
                entity_type: rec.entity_type,
                entity_id: rec.entity_id,
                score: Number(rec.score || 0),
                recommendation_reason: rec.recommendation_reason,
                algorithm_type: rec.algorithm_type,
                valid_until: rec.valid_until,
                entity,
            };
        }),
    };
};

module.exports = {
    findUserRecommendations,
};
