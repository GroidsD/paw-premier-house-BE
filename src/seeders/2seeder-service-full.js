"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        // 1. Insert Service Categories
        await queryInterface.bulkInsert("serviceCategories", [
            {
                serviceCategories_id: 1,
                type: "spa",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                serviceCategories_id: 2,
                type: "hotel",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
        ]);

        // 2. Insert Features
        await queryInterface.bulkInsert("features", [
            // SPA FEATURES
            {
                feature_id: 1,
                feature_name: "Basic Grooming",
                serviceCategories_id: 1,
                icon: "content_cut",
                description: "Basic grooming and hygiene care",
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 2,
                feature_name: "Nail Clipping",
                serviceCategories_id: 1,
                icon: "pets",
                description: "Safe and careful nail clipping",
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 3,
                feature_name: "Massage",
                serviceCategories_id: 1,
                icon: "spa",
                description: "Relaxing body massage for pets",
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 4,
                feature_name: "Aromatherapy",
                serviceCategories_id: 1,
                icon: "local_florist",
                description: "Gentle aromatherapy treatment",
                created_at: now,
                updated_at: now,
            },

            // HOTEL FEATURES
            {
                feature_id: 5,
                feature_name: "Air Conditioning",
                serviceCategories_id: 2,
                icon: "ac_unit",
                description: "Comfortable air-conditioned room for pets",
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 6,
                feature_name: "Pet Bed",
                serviceCategories_id: 2,
                icon: "bed",
                description: "Soft and cozy pet bed included",
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 7,
                feature_name: "24/7 Care",
                serviceCategories_id: 2,
                icon: "shield",
                description: "Staff available for monitoring and support all day",
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 8,
                feature_name: "Camera Monitoring",
                serviceCategories_id: 2,
                icon: "camera",
                description: "Live camera monitoring for pet owners",
                created_at: now,
                updated_at: now,
            },
        ]);

        // 3. Insert Services
        const spaServices = [
            {
                service_id: 1,
                serviceCategories_id: 1,
                name: "Basic Pet Bath",
                description: "Gentle bath service with pet-safe shampoo and drying.",
                price: 120000,
                duration: 60,
            },
            {
                service_id: 2,
                serviceCategories_id: 1,
                name: "Full Grooming Package",
                description: "Bath, drying, trimming, brushing, and basic grooming care.",
                price: 250000,
                duration: 90,
            },
            {
                service_id: 3,
                serviceCategories_id: 1,
                name: "Nail Clipping Service",
                description: "Quick and safe nail clipping for pets.",
                price: 80000,
                duration: 30,
            },
            {
                service_id: 4,
                serviceCategories_id: 1,
                name: "Pet Massage Therapy",
                description: "Relaxing massage treatment to reduce stress and improve comfort.",
                price: 180000,
                duration: 45,
            },
            {
                service_id: 5,
                serviceCategories_id: 1,
                name: "Aromatherapy Spa",
                description: "A calming spa session with gentle aromatherapy treatment.",
                price: 220000,
                duration: 60,
            },
            {
                service_id: 6,
                serviceCategories_id: 1,
                name: "Fur Brushing & Detangling",
                description: "Professional coat brushing and detangling treatment.",
                price: 140000,
                duration: 45,
            },
            {
                service_id: 7,
                serviceCategories_id: 1,
                name: "De-shedding Treatment",
                description: "Special treatment to remove loose fur and reduce shedding.",
                price: 210000,
                duration: 60,
            },
            {
                service_id: 8,
                serviceCategories_id: 1,
                name: "Paw Care Treatment",
                description: "Paw cleaning, moisturizing, and basic care treatment.",
                price: 100000,
                duration: 30,
            },
            {
                service_id: 9,
                serviceCategories_id: 1,
                name: "Ear Cleaning & Hygiene",
                description: "Gentle ear cleaning service for better hygiene.",
                price: 90000,
                duration: 30,
            },
            {
                service_id: 10,
                serviceCategories_id: 1,
                name: "Premium Spa Package",
                description: "Complete premium spa package including bath, massage, and grooming.",
                price: 320000,
                duration: 120,
            },
        ].map((item) => ({
            ...item,
            isActive: true,
            isDeleted: false,
            created_at: now,
            updated_at: now,
        }));

        const hotelServices = [
            {
                service_id: 11,
                serviceCategories_id: 2,
                name: "Standard Pet Hotel Room",
                description: "A clean and comfortable standard room for short-term pet stays.",
                price: 250000,
                duration: 1440,
            },
            {
                service_id: 12,
                serviceCategories_id: 2,
                name: "Deluxe Pet Hotel Room",
                description: "A spacious deluxe room with enhanced comfort for pets.",
                price: 320000,
                duration: 1440,
            },
            {
                service_id: 13,
                serviceCategories_id: 2,
                name: "VIP Pet Suite",
                description: "Premium suite with extra space, soft bedding, and dedicated care.",
                price: 450000,
                duration: 1440,
            },
            {
                service_id: 14,
                serviceCategories_id: 2,
                name: "Overnight Boarding Care",
                description: "Safe overnight boarding service for pets with monitoring.",
                price: 280000,
                duration: 1440,
            },
            {
                service_id: 15,
                serviceCategories_id: 2,
                name: "Weekend Pet Stay",
                description: "Weekend hotel package for pets with full-day supervision.",
                price: 600000,
                duration: 2880,
            },
            {
                service_id: 16,
                serviceCategories_id: 2,
                name: "Luxury Cat Hotel Room",
                description: "A quiet and cozy hotel room specially designed for cats.",
                price: 300000,
                duration: 1440,
            },
            {
                service_id: 17,
                serviceCategories_id: 2,
                name: "Luxury Dog Boarding",
                description: "Comfortable dog boarding with premium bedding and care.",
                price: 350000,
                duration: 1440,
            },
            {
                service_id: 18,
                serviceCategories_id: 2,
                name: "Family Multi-Pet Room",
                description: "Shared room for pets from the same household staying together.",
                price: 500000,
                duration: 1440,
            },
            {
                service_id: 19,
                serviceCategories_id: 2,
                name: "Daycare Hotel Package",
                description: "Daily care package with rest area, feeding, and supervision.",
                price: 220000,
                duration: 720,
            },
            {
                service_id: 20,
                serviceCategories_id: 2,
                name: "Premium Recovery Stay",
                description: "Quiet recovery stay for pets needing extra attention and comfort.",
                price: 400000,
                duration: 1440,
            },
        ].map((item) => ({
            ...item,
            isActive: true,
            isDeleted: false,
            created_at: now,
            updated_at: now,
        }));

        await queryInterface.bulkInsert("services", [...spaServices, ...hotelServices]);

        // 4. Insert Service Features
        const serviceFeatures = [
            // SPA SERVICES
            { service_id: 1, feature_id: 1, created_at: now },
            { service_id: 1, feature_id: 2, created_at: now },

            { service_id: 2, feature_id: 1, created_at: now },
            { service_id: 2, feature_id: 2, created_at: now },

            { service_id: 3, feature_id: 2, created_at: now },

            { service_id: 4, feature_id: 3, created_at: now },

            { service_id: 5, feature_id: 3, created_at: now },
            { service_id: 5, feature_id: 4, created_at: now },

            { service_id: 6, feature_id: 1, created_at: now },

            { service_id: 7, feature_id: 1, created_at: now },

            { service_id: 8, feature_id: 2, created_at: now },

            { service_id: 9, feature_id: 1, created_at: now },

            { service_id: 10, feature_id: 1, created_at: now },
            { service_id: 10, feature_id: 2, created_at: now },
            { service_id: 10, feature_id: 3, created_at: now },
            { service_id: 10, feature_id: 4, created_at: now },

            // HOTEL SERVICES
            { service_id: 11, feature_id: 5, created_at: now },
            { service_id: 11, feature_id: 6, created_at: now },
            { service_id: 11, feature_id: 7, created_at: now },

            { service_id: 12, feature_id: 5, created_at: now },
            { service_id: 12, feature_id: 6, created_at: now },
            { service_id: 12, feature_id: 7, created_at: now },
            { service_id: 12, feature_id: 8, created_at: now },

            { service_id: 13, feature_id: 5, created_at: now },
            { service_id: 13, feature_id: 6, created_at: now },
            { service_id: 13, feature_id: 7, created_at: now },
            { service_id: 13, feature_id: 8, created_at: now },

            { service_id: 14, feature_id: 6, created_at: now },
            { service_id: 14, feature_id: 7, created_at: now },

            { service_id: 15, feature_id: 5, created_at: now },
            { service_id: 15, feature_id: 7, created_at: now },
            { service_id: 15, feature_id: 8, created_at: now },

            { service_id: 16, feature_id: 5, created_at: now },
            { service_id: 16, feature_id: 6, created_at: now },

            { service_id: 17, feature_id: 6, created_at: now },
            { service_id: 17, feature_id: 7, created_at: now },
            { service_id: 17, feature_id: 8, created_at: now },

            { service_id: 18, feature_id: 5, created_at: now },
            { service_id: 18, feature_id: 6, created_at: now },
            { service_id: 18, feature_id: 7, created_at: now },

            { service_id: 19, feature_id: 6, created_at: now },
            { service_id: 19, feature_id: 7, created_at: now },

            { service_id: 20, feature_id: 5, created_at: now },
            { service_id: 20, feature_id: 7, created_at: now },
            { service_id: 20, feature_id: 8, created_at: now },
        ];

        await queryInterface.bulkInsert("service_features", serviceFeatures);

        // 5. Insert Media
        const mediaUrls = {
            1: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80",
            2: "https://images.unsplash.com/photo-1516934024742-b461fba47600?auto=format&fit=crop&w=1200&q=80",
            3: "https://images.unsplash.com/photo-1516222338250-863216ce01ea?auto=format&fit=crop&w=1200&q=80",
            4: "https://images.unsplash.com/photo-1558788353-f76d92427f16?auto=format&fit=crop&w=1200&q=80",
            5: "https://images.unsplash.com/photo-1548681528-6a5c45b66b42?auto=format&fit=crop&w=1200&q=80",
            6: "https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?auto=format&fit=crop&w=1200&q=80",
            7: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=1200&q=80",
            8: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80",
            9: "https://images.unsplash.com/photo-1518991791750-749c37297d6b?auto=format&fit=crop&w=1200&q=80",
            10: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",

            11: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80",
            12: "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
            13: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=80",
            14: "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80",
            15: "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?auto=format&fit=crop&w=1200&q=80",
            16: "https://images.unsplash.com/photo-1519052537078-e6302a4968d4?auto=format&fit=crop&w=1200&q=80",
            17: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1200&q=80",
            18: "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=1200&q=80",
            19: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80",
            20: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=1200&q=80",
        };

        const media = Object.keys(mediaUrls).map((serviceId) => ({
            entity_type: "service",
            entity_id: String(serviceId),
            url: mediaUrls[serviceId],
            is_main: true,
            alt_text: `Service image ${serviceId}`,
            created_at: now,
            updated_at: now,
        }));

        await queryInterface.bulkInsert("media", media);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("media", {
            entity_type: "service",
            entity_id: {
                [Sequelize.Op.in]: [
                    "1", "2", "3", "4", "5",
                    "6", "7", "8", "9", "10",
                    "11", "12", "13", "14", "15",
                    "16", "17", "18", "19", "20",
                ],
            },
        });

        await queryInterface.bulkDelete("service_features", {
            service_id: {
                [Sequelize.Op.in]: [
                    1, 2, 3, 4, 5,
                    6, 7, 8, 9, 10,
                    11, 12, 13, 14, 15,
                    16, 17, 18, 19, 20,
                ],
            },
        });

        await queryInterface.bulkDelete("services", {
            service_id: {
                [Sequelize.Op.in]: [
                    1, 2, 3, 4, 5,
                    6, 7, 8, 9, 10,
                    11, 12, 13, 14, 15,
                    16, 17, 18, 19, 20,
                ],
            },
        });

        await queryInterface.bulkDelete("features", {
            feature_id: {
                [Sequelize.Op.in]: [1, 2, 3, 4, 5, 6, 7, 8],
            },
        });

        await queryInterface.bulkDelete("serviceCategories", {
            serviceCategories_id: {
                [Sequelize.Op.in]: [1, 2],
            },
        });
    },
};