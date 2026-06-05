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
                description: `Basic grooming and hygiene care`,
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 2,
                feature_name: "Nail Clipping",
                serviceCategories_id: 1,
                icon: "pets",
                description: `Safe and careful nail clipping`,
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 3,
                feature_name: "Massage",
                serviceCategories_id: 1,
                icon: "spa",
                description: `Relaxing body massage for pets`,
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 4,
                feature_name: "Aromatherapy",
                serviceCategories_id: 1,
                icon: "local_florist",
                description: `Gentle aromatherapy treatment`,
                created_at: now,
                updated_at: now,
            },

            // HOTEL FEATURES
            {
                feature_id: 5,
                feature_name: "Air Conditioning",
                serviceCategories_id: 2,
                icon: "ac_unit",
                description: `Comfortable air-conditioned room for pets`,
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 6,
                feature_name: "Pet Bed",
                serviceCategories_id: 2,
                icon: "bed",
                description: `Soft and cozy pet bed included`,
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 7,
                feature_name: "24/7 Care",
                serviceCategories_id: 2,
                icon: "shield",
                description: `Staff available for monitoring and support all day`,
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 8,
                feature_name: "Camera Monitoring",
                serviceCategories_id: 2,
                icon: "camera",
                description: `Live camera monitoring for pet owners`,
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
                description: `Gentle bath service with pet-safe shampoo and drying.`,
                price: 120000,
                duration: 60,
            },
            {
                service_id: 2,
                serviceCategories_id: 1,
                name: "Full Grooming Package",
                description: `Bath, drying, trimming, brushing, and basic grooming care.`,
                price: 250000,
                duration: 90,
            },
            {
                service_id: 3,
                serviceCategories_id: 1,
                name: "Nail Clipping Service",
                description: `Quick and safe nail clipping for pets.`,
                price: 80000,
                duration: 30,
            },
            {
                service_id: 4,
                serviceCategories_id: 1,
                name: "Pet Massage Therapy",
                description: `Relaxing massage treatment to reduce stress and improve comfort.`,
                price: 180000,
                duration: 45,
            },
            {
                service_id: 5,
                serviceCategories_id: 1,
                name: "Aromatherapy Spa",
                description: `A calming spa session with gentle aromatherapy treatment.`,
                price: 220000,
                duration: 60,
            },
            {
                service_id: 6,
                serviceCategories_id: 1,
                name: "Fur Brushing & Detangling",
                description: `Professional coat brushing and detangling treatment.`,
                price: 140000,
                duration: 45,
            },
            {
                service_id: 7,
                serviceCategories_id: 1,
                name: "De-shedding Treatment",
                description: `Special treatment to remove loose fur and reduce shedding.`,
                price: 210000,
                duration: 60,
            },
            {
                service_id: 8,
                serviceCategories_id: 1,
                name: "Paw Care Treatment",
                description: `Paw cleaning, moisturizing, and basic care treatment.`,
                price: 100000,
                duration: 30,
            },
            {
                service_id: 9,
                serviceCategories_id: 1,
                name: "Ear Cleaning & Hygiene",
                description: `Gentle ear cleaning service for better hygiene.`,
                price: 90000,
                duration: 30,
            },
            {
                service_id: 10,
                serviceCategories_id: 1,
                name: "Premium Spa Package",
                description: `Complete premium spa package including bath, massage, and grooming.`,
                price: 320000,
                duration: 120,
            },
        ].map((item) => ({
            ...item,
            slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
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
                description: `Designed for pets staying away from home, this room provides a safe, clean, and comfortable environment where your companion can relax with confidence.

**What's Included**
- Climate-controlled accommodation
- Cozy sleeping area
- Daily wellness monitoring
- Scheduled feeding support
- 24/7 staff supervision

Perfect for short-term stays while ensuring your pet feels secure, comfortable, and well cared for throughout their visit.`,
                price: 250000,
                duration: 1440,
            },
            {
                service_id: 12,
                serviceCategories_id: 2,
                name: "Deluxe Pet Hotel Room",
                description: `Designed for pets who enjoy extra comfort during their stay, the Deluxe Pet Hotel Room offers a spacious climate-controlled environment, premium bedding, and enhanced daily care.

**What's Included**
- Air Conditioning
- Premium Pet Bed
- 24/7 Professional Supervision
- Live Camera Monitoring
- Personalized Wellness Checks

Pet owners can stay connected through live camera monitoring while our experienced caregivers provide attentive support throughout the stay.

Perfect for pets that benefit from additional space, comfort, and peace of mind during overnight or extended stays.`,
                price: 320000,
                duration: 1440,
            },
            {
                service_id: 13,
                serviceCategories_id: 2,
                name: "VIP Pet Suite",
                description: `Our most luxurious accommodation option, designed to provide exceptional comfort and personalized attention for your pet.

**Premium Amenities**
- Spacious Private Suite
- Premium Bedding
- Climate-Controlled Comfort
- 24/7 Supervision
- Live Camera Monitoring

Ideal for pets accustomed to premium care and owners seeking complete peace of mind during extended stays.`,
                price: 450000,
                duration: 1440,
            },
            {
                service_id: 14,
                serviceCategories_id: 2,
                name: "Overnight Boarding Care",
                description: `A safe and reliable overnight accommodation service for pets requiring short-term care.

**Included Services**
- Overnight Supervision
- Comfortable Sleeping Arrangements
- Feeding Assistance
- Evening Wellness Checks
- Secure Boarding Environment

Whether you're traveling, working late, or away for the night, your pet will receive attentive care until pickup.`,
                price: 280000,
                duration: 1440,
            },
            {
                service_id: 15,
                serviceCategories_id: 2,
                name: "Weekend Pet Stay",
                description: `A complete weekend boarding package designed for pets whose owners are away for several days.

**Package Features**
- Weekend Accommodation
- Scheduled Feeding
- Wellness Monitoring
- 24/7 Supervision
- Camera Monitoring Access

Our caregivers ensure your pet remains comfortable, active, and stress-free throughout the weekend.`,
                price: 600000,
                duration: 2880,
            },
            {
                service_id: 16,
                serviceCategories_id: 2,
                name: "Luxury Cat Hotel Room",
                description: `Specially designed for feline guests, this quiet accommodation provides a calm environment away from noisy activity areas.

**Cat-Friendly Features**
- Air-Conditioned Comfort
- Soft Bedding
- Private Resting Spaces
- Low-Stress Environment
- Daily Care and Monitoring

Perfect for cats who prefer privacy, relaxation, and a peaceful boarding experience.`,
                price: 300000,
                duration: 1440,
            },
            {
                service_id: 17,
                serviceCategories_id: 2,
                name: "Luxury Dog Boarding",
                description: `Premium boarding tailored specifically for dogs requiring extra attention and comfort.

**Included Amenities**
- Comfortable Sleeping Area
- Personalized Daily Care
- Wellness Monitoring
- Camera Monitoring Access
- 24/7 Supervision

An excellent choice for dogs that thrive with regular interaction and attentive support.`,
                price: 350000,
                duration: 1440,
            },
            {
                service_id: 18,
                serviceCategories_id: 2,
                name: "Family Multi-Pet Room",
                description: `A spacious shared accommodation designed for pets from the same household.

**Room Benefits**
- Shared Family Environment
- Climate-Controlled Comfort
- Comfortable Bedding
- Reduced Separation Anxiety
- Professional Supervision

Allows familiar companions to stay together while receiving attentive care from our team.`,
                price: 500000,
                duration: 1440,
            },
            {
                service_id: 19,
                serviceCategories_id: 2,
                name: "Daycare Hotel Package",
                description: `A convenient daytime care solution for busy pet owners who need professional supervision during working hours.

**Daycare Includes**
- Comfortable Rest Area
- Feeding Support
- Wellness Monitoring
- Staff Supervision
- Structured Daily Routine

Pets enjoy a safe and engaging environment before returning home in the evening.`,
                price: 220000,
                duration: 720,
            },
            {
                service_id: 20,
                serviceCategories_id: 2,
                name: "Premium Recovery Stay",
                description: `A specialized accommodation option for pets recovering from medical procedures, grooming treatments, or stressful experiences.

**Recovery Support**
- Quiet Recovery Environment
- Continuous Supervision
- Climate-Controlled Comfort
- Wellness Monitoring
- Additional Caregiver Attention

Designed to promote relaxation, comfort, and a smooth recovery process.`,
                price: 400000,
                duration: 1440,
            },
        ].map((item) => ({
            ...item,
            slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
            isActive: true,
            isDeleted: false,
            created_at: now,
            updated_at: now,
        }));

        await queryInterface.bulkInsert("services", [
            ...spaServices,
            ...hotelServices,
        ]);

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
            2: "https://sunrisevetclinic.com/wp-content/uploads/2022/11/pexels-gustavo-fring-6816860-2-980x653.jpg",
            3: "https://www.shutterstock.com/image-photo/dog-owner-trims-nails-his-600nw-2600058499.jpg",
            4: "https://www.dailypaws.com/thmb/MsONe8nUyx1volscR42reu6dNr4=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/dog-spa-massage-1007122602-2000-dff86987e931458dbb141ed9032f0802.jpg",
            5: "https://www.dtailsgrooming.net/wp-content/uploads/2017/11/Capture.jpg",
            6: "https://wooof.co.uk/cdn/shop/files/PupwellGentledetanglingbrush1_1022x1022.webp?v=1742480678",
            7: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=1200&q=80",
            8: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80",
            9: "https://thedogsocial.com.au/wp-content/uploads/2024/10/Dog-Ear-Cleaning-2.webp",
            10: "https://www.romanapetspa.com/cdn/shop/articles/Sundays_are_for_self_care__PC__louie_e_sophie_marikamoves.jpg?v=1695699623",

            11: "https://cdn.shopify.com/s/files/1/0550/5853/0481/files/petsthing-how-to-choose-pet-hotel-3.jpg?v=1688974478",
            12: "https://www.plutopethotel.com/wp-content/uploads/2024/10/D-Deluxe-1.jpg",
            13: "https://images.squarespace-cdn.com/content/v1/5f78e619aa3c2d3994d4b01e/1602790511391-X20HUJMWWMP4WYFUP87U/Wags-VIP-Suite.jpg",
            14: "https://s3-media0.fl.yelpcdn.com/bphoto/7nyW4NyuNgK0B0qdvnC9Ng/348s.jpg",
            15: "https://www.shutterstock.com/image-photo/adorable-australian-shepherd-dog-suitcase-600nw-2470981159.jpg",
            16: "https://i.pinimg.com/736x/25/da/55/25da559168aefa6ceb86ca7e34a27605.jpg",
            17: "https://cdn.prod.website-files.com/649de3491bf2958e3b582611/65130c16f2e8d62e8ff5ca2d_Villas2-1920.webp",
            18: "https://www.playfulpupsretreat.com/wp-content/uploads/2024/06/a-bunch-of-dogs-on-a-bed-600x400-crop.jpg",
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
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "10",
                    "11",
                    "12",
                    "13",
                    "14",
                    "15",
                    "16",
                    "17",
                    "18",
                    "19",
                    "20",
                ],
            },
        });

        await queryInterface.bulkDelete("service_features", {
            service_id: {
                [Sequelize.Op.in]: [
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                    18, 19, 20,
                ],
            },
        });

        await queryInterface.bulkDelete("services", {
            service_id: {
                [Sequelize.Op.in]: [
                    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
                    18, 19, 20,
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
