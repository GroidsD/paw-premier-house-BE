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

        // 2. Insert Features (bilingual fields for Feature model)
        await queryInterface.bulkInsert("features", [
            {
                feature_id: 1,
                feature_name_vi: "Chăm sóc lông cơ bản",
                feature_name_en: "Basic Grooming",
                serviceCategories_id: 1,
                icon: "content_cut",
                description_vi: "Chăm sóc lông và vệ sinh cơ bản cho thú cưng",
                description_en: "Basic grooming and hygiene care",
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 2,
                feature_name_vi: "Cắt móng",
                feature_name_en: "Nail Clipping",
                serviceCategories_id: 1,
                icon: "pets",
                description_vi: "Cắt móng an toàn và cẩn thận cho thú cưng",
                description_en: "Safe and careful nail clipping",
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 3,
                feature_name_vi: "Mát-xa",
                feature_name_en: "Massage",
                serviceCategories_id: 1,
                icon: "spa",
                description_vi: "Mát-xa thư giãn toàn thân cho thú cưng",
                description_en: "Relaxing body massage for pets",
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 4,
                feature_name_vi: "Liệu pháp hương thơm",
                feature_name_en: "Aromatherapy",
                serviceCategories_id: 1,
                icon: "local_florist",
                description_vi:
                    "Liệu pháp hương thơm dịu nhẹ giúp thú cưng thư giãn",
                description_en: "Gentle aromatherapy treatment",
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 5,
                feature_name_vi: "Máy lạnh",
                feature_name_en: "Air Conditioning",
                serviceCategories_id: 2,
                icon: "ac_unit",
                description_vi: "Phòng máy lạnh thoải mái dành cho thú cưng",
                description_en: "Comfortable air-conditioned room for pets",
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 6,
                feature_name_vi: "Giường thú cưng",
                feature_name_en: "Pet Bed",
                serviceCategories_id: 2,
                icon: "bed",
                description_vi:
                    "Bao gồm giường mềm mại và ấm cúng cho thú cưng",
                description_en: "Soft and cozy pet bed included",
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 7,
                feature_name_vi: "Chăm sóc 24/7",
                feature_name_en: "24/7 Care",
                serviceCategories_id: 2,
                icon: "shield",
                description_vi:
                    "Nhân viên luôn có mặt để theo dõi và hỗ trợ cả ngày",
                description_en:
                    "Staff available for monitoring and support all day",
                created_at: now,
                updated_at: now,
            },
            {
                feature_id: 8,
                feature_name_vi: "Giám sát camera",
                feature_name_en: "Camera Monitoring",
                serviceCategories_id: 2,
                icon: "camera",
                description_vi:
                    "Giám sát camera trực tiếp dành cho chủ thú cưng",
                description_en: "Live camera monitoring for pet owners",
                created_at: now,
                updated_at: now,
            },
        ]);

        // 3. Insert Services (bilingual fields for Service model)
        await queryInterface.bulkInsert("services", [
            {
                service_id: 1,
                serviceCategories_id: 1,
                name_vi: "Tắm cơ bản cho thú cưng",
                name_en: "Basic Pet Bath",
                description_vi:
                    "Dịch vụ tắm nhẹ nhàng bằng sữa tắm an toàn cho thú cưng, kèm sấy khô.",
                description_en:
                    "Gentle bath service with pet-safe shampoo and drying.",
                price: 120000,
                duration: 60,
                slug: "basic-pet-bath",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 2,
                serviceCategories_id: 1,
                name_vi: "Gói chăm sóc lông toàn diện",
                name_en: "Full Grooming Package",
                description_vi:
                    "Bao gồm tắm, sấy khô, cắt tỉa, chải lông và chăm sóc vệ sinh cơ bản.",
                description_en:
                    "Bath, drying, trimming, brushing, and basic grooming care.",
                price: 250000,
                duration: 90,
                slug: "full-grooming-package",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 3,
                serviceCategories_id: 1,
                name_vi: "Dịch vụ cắt móng",
                name_en: "Nail Clipping Service",
                description_vi:
                    "Dịch vụ cắt móng nhanh chóng và an toàn cho thú cưng.",
                description_en: "Quick and safe nail clipping for pets.",
                price: 80000,
                duration: 30,
                slug: "nail-clipping-service",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 4,
                serviceCategories_id: 1,
                name_vi: "Liệu pháp mát-xa cho thú cưng",
                name_en: "Pet Massage Therapy",
                description_vi:
                    "Liệu trình mát-xa thư giãn giúp giảm căng thẳng và tăng sự thoải mái cho thú cưng.",
                description_en:
                    "Relaxing massage treatment to reduce stress and improve comfort.",
                price: 180000,
                duration: 45,
                slug: "pet-massage-therapy",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 5,
                serviceCategories_id: 1,
                name_vi: "Spa hương liệu",
                name_en: "Aromatherapy Spa",
                description_vi:
                    "Buổi spa thư giãn kết hợp liệu pháp hương liệu dịu nhẹ.",
                description_en:
                    "A calming spa session with gentle aromatherapy treatment.",
                price: 220000,
                duration: 60,
                slug: "aromatherapy-spa",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 6,
                serviceCategories_id: 1,
                name_vi: "Chải lông và gỡ rối",
                name_en: "Fur Brushing & Detangling",
                description_vi:
                    "Dịch vụ chải lông chuyên nghiệp và gỡ rối lông cho thú cưng.",
                description_en:
                    "Professional coat brushing and detangling treatment.",
                price: 140000,
                duration: 45,
                slug: "fur-brushing-detangling",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 7,
                serviceCategories_id: 1,
                name_vi: "Liệu trình giảm rụng lông",
                name_en: "De-shedding Treatment",
                description_vi:
                    "Liệu trình đặc biệt giúp loại bỏ lông rụng và giảm tình trạng rụng lông.",
                description_en:
                    "Special treatment to remove loose fur and reduce shedding.",
                price: 210000,
                duration: 60,
                slug: "de-shedding-treatment",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 8,
                serviceCategories_id: 1,
                name_vi: "Liệu trình chăm sóc bàn chân",
                name_en: "Paw Care Treatment",
                description_vi:
                    "Chăm sóc bàn chân gồm làm sạch, dưỡng ẩm và chăm sóc cơ bản.",
                description_en:
                    "Paw cleaning, moisturizing, and basic care treatment.",
                price: 100000,
                duration: 30,
                slug: "paw-care-treatment",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 9,
                serviceCategories_id: 1,
                name_vi: "Vệ sinh tai",
                name_en: "Ear Cleaning & Hygiene",
                description_vi:
                    "Dịch vụ vệ sinh tai nhẹ nhàng giúp cải thiện vệ sinh cho thú cưng.",
                description_en:
                    "Gentle ear cleaning service for better hygiene.",
                price: 90000,
                duration: 30,
                slug: "ear-cleaning-hygiene",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 10,
                serviceCategories_id: 1,
                name_vi: "Gói spa cao cấp",
                name_en: "Premium Spa Package",
                description_vi:
                    "Gói spa cao cấp toàn diện bao gồm tắm, mát-xa và chăm sóc lông.",
                description_en:
                    "Complete premium spa package including bath, massage, and grooming.",
                price: 320000,
                duration: 120,
                slug: "premium-spa-package",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 11,
                serviceCategories_id: 2,
                name_vi: "Phòng khách sạn thú cưng tiêu chuẩn",
                name_en: "Standard Pet Hotel Room",
                description_vi: `Được thiết kế cho thú cưng cần ở xa nhà, phòng này mang đến môi trường an toàn, sạch sẽ và thoải mái để thú cưng có thể thư giãn yên tâm.

**Bao gồm**
- Phòng ở có kiểm soát nhiệt độ
- Khu vực ngủ ấm áp
- Theo dõi sức khỏe hằng ngày
- Hỗ trợ cho ăn theo lịch
- Nhân viên giám sát 24/7

Phù hợp cho các kỳ lưu trú ngắn hạn, đồng thời đảm bảo thú cưng luôn cảm thấy an toàn, thoải mái và được chăm sóc tốt trong suốt thời gian sử dụng dịch vụ.`,
                description_en: `Designed for pets staying away from home, this room provides a safe, clean, and comfortable environment where your companion can relax with confidence.

**What's Included**
- Climate-controlled accommodation
- Cozy sleeping area
- Daily wellness monitoring
- Scheduled feeding support
- 24/7 staff supervision

Perfect for short-term stays while ensuring your pet feels secure, comfortable, and well cared for throughout their visit.`,
                price: 250000,
                duration: 1440,
                slug: "standard-pet-hotel-room",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 12,
                serviceCategories_id: 2,
                name_vi: "Phòng khách sạn thú cưng Deluxe",
                name_en: "Deluxe Pet Hotel Room",
                description_vi: `Được thiết kế cho thú cưng cần thêm sự thoải mái trong thời gian lưu trú, phòng Deluxe mang đến không gian rộng rãi có kiểm soát nhiệt độ, giường cao cấp và dịch vụ chăm sóc hằng ngày nâng cao.

**Bao gồm**
- Máy lạnh
- Giường thú cưng cao cấp
- Giám sát chuyên nghiệp 24/7
- Theo dõi camera trực tiếp
- Kiểm tra sức khỏe cá nhân hóa

Chủ nuôi có thể theo dõi thú cưng qua camera trực tiếp, trong khi đội ngũ chăm sóc giàu kinh nghiệm luôn hỗ trợ chu đáo trong suốt thời gian lưu trú.

Phù hợp cho thú cưng cần thêm không gian, sự thoải mái và cảm giác an tâm khi ở qua đêm hoặc lưu trú dài ngày.`,
                description_en: `Designed for pets who enjoy extra comfort during their stay, the Deluxe Pet Hotel Room offers a spacious climate-controlled environment, premium bedding, and enhanced daily care.

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
                slug: "deluxe-pet-hotel-room",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 13,
                serviceCategories_id: 2,
                name_vi: "Phòng VIP cho thú cưng",
                name_en: "VIP Pet Suite",
                description_vi: `Lựa chọn lưu trú sang trọng nhất, được thiết kế để mang lại sự thoải mái vượt trội và chăm sóc cá nhân hóa cho thú cưng.

**Tiện nghi cao cấp**
- Phòng riêng rộng rãi
- Giường ngủ cao cấp
- Không gian có kiểm soát nhiệt độ
- Giám sát 24/7
- Theo dõi camera trực tiếp

Lý tưởng cho thú cưng quen với dịch vụ chăm sóc cao cấp và chủ nuôi cần sự yên tâm tuyệt đối trong các kỳ lưu trú dài ngày.`,
                description_en: `Our most luxurious accommodation option, designed to provide exceptional comfort and personalized attention for your pet.

**Premium Amenities**
- Spacious Private Suite
- Premium Bedding
- Climate-Controlled Comfort
- 24/7 Supervision
- Live Camera Monitoring

Ideal for pets accustomed to premium care and owners seeking complete peace of mind during extended stays.`,
                price: 450000,
                duration: 1440,
                slug: "vip-pet-suite",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 14,
                serviceCategories_id: 2,
                name_vi: "Dịch vụ lưu trú qua đêm",
                name_en: "Overnight Boarding Care",
                description_vi: `Dịch vụ lưu trú qua đêm an toàn và đáng tin cậy cho thú cưng cần được chăm sóc ngắn hạn.

**Dịch vụ bao gồm**
- Giám sát qua đêm
- Chỗ ngủ thoải mái
- Hỗ trợ cho ăn
- Kiểm tra sức khỏe buổi tối
- Môi trường lưu trú an toàn

Dù bạn đi du lịch, làm việc muộn hoặc vắng nhà qua đêm, thú cưng vẫn sẽ được chăm sóc chu đáo cho đến khi được đón về.`,
                description_en: `A safe and reliable overnight accommodation service for pets requiring short-term care.

**Included Services**
- Overnight Supervision
- Comfortable Sleeping Arrangements
- Feeding Assistance
- Evening Wellness Checks
- Secure Boarding Environment

Whether you're traveling, working late, or away for the night, your pet will receive attentive care until pickup.`,
                price: 280000,
                duration: 1440,
                slug: "overnight-boarding-care",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 15,
                serviceCategories_id: 2,
                name_vi: "Gói lưu trú cuối tuần",
                name_en: "Weekend Pet Stay",
                description_vi: `Gói lưu trú cuối tuần trọn gói dành cho thú cưng khi chủ nuôi vắng nhà trong vài ngày.

**Đặc điểm gói dịch vụ**
- Lưu trú cuối tuần
- Cho ăn theo lịch
- Theo dõi sức khỏe
- Giám sát 24/7
- Truy cập theo dõi camera

Đội ngũ chăm sóc sẽ đảm bảo thú cưng luôn thoải mái, năng động và ít căng thẳng trong suốt cuối tuần.`,
                description_en: `A complete weekend boarding package designed for pets whose owners are away for several days.

**Package Features**
- Weekend Accommodation
- Scheduled Feeding
- Wellness Monitoring
- 24/7 Supervision
- Camera Monitoring Access

Our caregivers ensure your pet remains comfortable, active, and stress-free throughout the weekend.`,
                price: 600000,
                duration: 2880,
                slug: "weekend-pet-stay",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 16,
                serviceCategories_id: 2,
                name_vi: "Phòng khách sạn cao cấp cho mèo",
                name_en: "Luxury Cat Hotel Room",
                description_vi: `Được thiết kế riêng cho mèo, không gian yên tĩnh này mang lại môi trường nhẹ nhàng, tách khỏi các khu vực nhiều hoạt động và tiếng ồn.

**Đặc điểm thân thiện với mèo**
- Không gian có máy lạnh
- Giường mềm mại
- Khu vực nghỉ ngơi riêng tư
- Môi trường ít căng thẳng
- Chăm sóc và theo dõi hằng ngày

Phù hợp cho mèo thích sự riêng tư, thư giãn và trải nghiệm lưu trú yên bình.`,
                description_en: `Specially designed for feline guests, this quiet accommodation provides a calm environment away from noisy activity areas.

**Cat-Friendly Features**
- Air-Conditioned Comfort
- Soft Bedding
- Private Resting Spaces
- Low-Stress Environment
- Daily Care and Monitoring

Perfect for cats who prefer privacy, relaxation, and a peaceful boarding experience.`,
                price: 300000,
                duration: 1440,
                slug: "luxury-cat-hotel-room",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 17,
                serviceCategories_id: 2,
                name_vi: "Lưu trú cao cấp cho chó",
                name_en: "Luxury Dog Boarding",
                description_vi: `Dịch vụ lưu trú cao cấp dành riêng cho chó cần được quan tâm và chăm sóc thoải mái hơn.

**Tiện ích bao gồm**
- Khu vực ngủ thoải mái
- Chăm sóc cá nhân hóa hằng ngày
- Theo dõi sức khỏe
- Truy cập theo dõi camera
- Giám sát 24/7

Là lựa chọn phù hợp cho những chú chó cần tương tác thường xuyên và được hỗ trợ chu đáo.`,
                description_en: `Premium boarding tailored specifically for dogs requiring extra attention and comfort.

**Included Amenities**
- Comfortable Sleeping Area
- Personalized Daily Care
- Wellness Monitoring
- Camera Monitoring Access
- 24/7 Supervision

An excellent choice for dogs that thrive with regular interaction and attentive support.`,
                price: 350000,
                duration: 1440,
                slug: "luxury-dog-boarding",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 18,
                serviceCategories_id: 2,
                name_vi: "Phòng gia đình cho nhiều thú cưng",
                name_en: "Family Multi-Pet Room",
                description_vi: `Không gian lưu trú chung rộng rãi dành cho các thú cưng sống cùng một gia đình.

**Lợi ích của phòng**
- Môi trường gia đình quen thuộc
- Không gian có kiểm soát nhiệt độ
- Giường ngủ thoải mái
- Giảm lo lắng do xa cách
- Giám sát chuyên nghiệp

Giúp các thú cưng quen thuộc được ở cùng nhau trong khi vẫn nhận được sự chăm sóc chu đáo từ đội ngũ của chúng tôi.`,
                description_en: `A spacious shared accommodation designed for pets from the same household.

**Room Benefits**
- Shared Family Environment
- Climate-Controlled Comfort
- Comfortable Bedding
- Reduced Separation Anxiety
- Professional Supervision

Allows familiar companions to stay together while receiving attentive care from our team.`,
                price: 500000,
                duration: 1440,
                slug: "family-multi-pet-room",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 19,
                serviceCategories_id: 2,
                name_vi: "Gói chăm sóc ban ngày",
                name_en: "Daycare Hotel Package",
                description_vi: `Giải pháp chăm sóc ban ngày tiện lợi cho chủ nuôi bận rộn cần dịch vụ giám sát chuyên nghiệp trong giờ làm việc.

**Gói ban ngày bao gồm**
- Khu vực nghỉ ngơi thoải mái
- Hỗ trợ cho ăn
- Theo dõi sức khỏe
- Nhân viên giám sát
- Lịch sinh hoạt có cấu trúc

Thú cưng được ở trong môi trường an toàn, thú vị trước khi trở về nhà vào buổi tối.`,
                description_en: `A convenient daytime care solution for busy pet owners who need professional supervision during working hours.

**Daycare Includes**
- Comfortable Rest Area
- Feeding Support
- Wellness Monitoring
- Staff Supervision
- Structured Daily Routine

Pets enjoy a safe and engaging environment before returning home in the evening.`,
                price: 220000,
                duration: 720,
                slug: "daycare-hotel-package",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
            {
                service_id: 20,
                serviceCategories_id: 2,
                name_vi: "Gói lưu trú phục hồi cao cấp",
                name_en: "Premium Recovery Stay",
                description_vi: `Dịch vụ lưu trú chuyên biệt dành cho thú cưng đang phục hồi sau thủ thuật y tế, liệu trình grooming hoặc các trải nghiệm gây căng thẳng.

**Hỗ trợ phục hồi**
- Môi trường phục hồi yên tĩnh
- Giám sát liên tục
- Không gian có kiểm soát nhiệt độ
- Theo dõi sức khỏe
- Tăng cường sự quan tâm từ nhân viên chăm sóc

Được thiết kế để hỗ trợ thư giãn, tạo sự thoải mái và giúp quá trình phục hồi diễn ra nhẹ nhàng hơn.`,
                description_en: `A specialized accommodation option for pets recovering from medical procedures, grooming treatments, or stressful experiences.

**Recovery Support**
- Quiet Recovery Environment
- Continuous Supervision
- Climate-Controlled Comfort
- Wellness Monitoring
- Additional Caregiver Attention

Designed to promote relaxation, comfort, and a smooth recovery process.`,
                price: 400000,
                duration: 1440,
                slug: "premium-recovery-stay",
                isActive: true,
                isDeleted: false,
                created_at: now,
                updated_at: now,
            },
        ]);

        // 4. Insert Service Features
        await queryInterface.bulkInsert("service_features", [
            {
                service_id: 1,
                feature_id: 1,
                created_at: now,
            },
            {
                service_id: 1,
                feature_id: 2,
                created_at: now,
            },
            {
                service_id: 2,
                feature_id: 1,
                created_at: now,
            },
            {
                service_id: 2,
                feature_id: 2,
                created_at: now,
            },
            {
                service_id: 3,
                feature_id: 2,
                created_at: now,
            },
            {
                service_id: 4,
                feature_id: 3,
                created_at: now,
            },
            {
                service_id: 5,
                feature_id: 3,
                created_at: now,
            },
            {
                service_id: 5,
                feature_id: 4,
                created_at: now,
            },
            {
                service_id: 6,
                feature_id: 1,
                created_at: now,
            },
            {
                service_id: 7,
                feature_id: 1,
                created_at: now,
            },
            {
                service_id: 8,
                feature_id: 2,
                created_at: now,
            },
            {
                service_id: 9,
                feature_id: 1,
                created_at: now,
            },
            {
                service_id: 10,
                feature_id: 1,
                created_at: now,
            },
            {
                service_id: 10,
                feature_id: 2,
                created_at: now,
            },
            {
                service_id: 10,
                feature_id: 3,
                created_at: now,
            },
            {
                service_id: 10,
                feature_id: 4,
                created_at: now,
            },
            {
                service_id: 11,
                feature_id: 5,
                created_at: now,
            },
            {
                service_id: 11,
                feature_id: 6,
                created_at: now,
            },
            {
                service_id: 11,
                feature_id: 7,
                created_at: now,
            },
            {
                service_id: 12,
                feature_id: 5,
                created_at: now,
            },
            {
                service_id: 12,
                feature_id: 6,
                created_at: now,
            },
            {
                service_id: 12,
                feature_id: 7,
                created_at: now,
            },
            {
                service_id: 12,
                feature_id: 8,
                created_at: now,
            },
            {
                service_id: 13,
                feature_id: 5,
                created_at: now,
            },
            {
                service_id: 13,
                feature_id: 6,
                created_at: now,
            },
            {
                service_id: 13,
                feature_id: 7,
                created_at: now,
            },
            {
                service_id: 13,
                feature_id: 8,
                created_at: now,
            },
            {
                service_id: 14,
                feature_id: 6,
                created_at: now,
            },
            {
                service_id: 14,
                feature_id: 7,
                created_at: now,
            },
            {
                service_id: 15,
                feature_id: 5,
                created_at: now,
            },
            {
                service_id: 15,
                feature_id: 7,
                created_at: now,
            },
            {
                service_id: 15,
                feature_id: 8,
                created_at: now,
            },
            {
                service_id: 16,
                feature_id: 5,
                created_at: now,
            },
            {
                service_id: 16,
                feature_id: 6,
                created_at: now,
            },
            {
                service_id: 17,
                feature_id: 6,
                created_at: now,
            },
            {
                service_id: 17,
                feature_id: 7,
                created_at: now,
            },
            {
                service_id: 17,
                feature_id: 8,
                created_at: now,
            },
            {
                service_id: 18,
                feature_id: 5,
                created_at: now,
            },
            {
                service_id: 18,
                feature_id: 6,
                created_at: now,
            },
            {
                service_id: 18,
                feature_id: 7,
                created_at: now,
            },
            {
                service_id: 19,
                feature_id: 6,
                created_at: now,
            },
            {
                service_id: 19,
                feature_id: 7,
                created_at: now,
            },
            {
                service_id: 20,
                feature_id: 5,
                created_at: now,
            },
            {
                service_id: 20,
                feature_id: 7,
                created_at: now,
            },
            {
                service_id: 20,
                feature_id: 8,
                created_at: now,
            },
        ]);

        // 5. Insert Service Media
        await queryInterface.bulkInsert("media", [
            {
                entity_type: "service",
                entity_id: "1",
                url: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1200&q=80",
                is_main: true,
                alt_text: "Service image 1",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "2",
                url: "https://sunrisevetclinic.com/wp-content/uploads/2022/11/pexels-gustavo-fring-6816860-2-980x653.jpg",
                is_main: true,
                alt_text: "Service image 2",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "3",
                url: "https://www.shutterstock.com/image-photo/dog-owner-trims-nails-his-600nw-2600058499.jpg",
                is_main: true,
                alt_text: "Service image 3",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "4",
                url: "https://www.dailypaws.com/thmb/MsONe8nUyx1volscR42reu6dNr4=/750x0/filters:no_upscale():max_bytes(150000):strip_icc():format(webp)/dog-spa-massage-1007122602-2000-dff86987e931458dbb141ed9032f0802.jpg",
                is_main: true,
                alt_text: "Service image 4",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "5",
                url: "https://www.dtailsgrooming.net/wp-content/uploads/2017/11/Capture.jpg",
                is_main: true,
                alt_text: "Service image 5",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "6",
                url: "https://wooof.co.uk/cdn/shop/files/PupwellGentledetanglingbrush1_1022x1022.webp?v=1742480678",
                is_main: true,
                alt_text: "Service image 6",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "7",
                url: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?auto=format&fit=crop&w=1200&q=80",
                is_main: true,
                alt_text: "Service image 7",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "8",
                url: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=1200&q=80",
                is_main: true,
                alt_text: "Service image 8",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "9",
                url: "https://thedogsocial.com.au/wp-content/uploads/2024/10/Dog-Ear-Cleaning-2.webp",
                is_main: true,
                alt_text: "Service image 9",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "10",
                url: "https://www.romanapetspa.com/cdn/shop/articles/Sundays_are_for_self_care__PC__louie_e_sophie_marikamoves.jpg?v=1695699623",
                is_main: true,
                alt_text: "Service image 10",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "11",
                url: "https://cdn.shopify.com/s/files/1/0550/5853/0481/files/petsthing-how-to-choose-pet-hotel-3.jpg?v=1688974478",
                is_main: true,
                alt_text: "Service image 11",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "12",
                url: "https://www.plutopethotel.com/wp-content/uploads/2024/10/D-Deluxe-1.jpg",
                is_main: true,
                alt_text: "Service image 12",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "13",
                url: "https://images.squarespace-cdn.com/content/v1/5f78e619aa3c2d3994d4b01e/1602790511391-X20HUJMWWMP4WYFUP87U/Wags-VIP-Suite.jpg",
                is_main: true,
                alt_text: "Service image 13",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "14",
                url: "https://s3-media0.fl.yelpcdn.com/bphoto/7nyW4NyuNgK0B0qdvnC9Ng/348s.jpg",
                is_main: true,
                alt_text: "Service image 14",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "15",
                url: "https://www.shutterstock.com/image-photo/adorable-australian-shepherd-dog-suitcase-600nw-2470981159.jpg",
                is_main: true,
                alt_text: "Service image 15",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "16",
                url: "https://i.pinimg.com/736x/25/da/55/25da559168aefa6ceb86ca7e34a27605.jpg",
                is_main: true,
                alt_text: "Service image 16",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "17",
                url: "https://cdn.prod.website-files.com/649de3491bf2958e3b582611/65130c16f2e8d62e8ff5ca2d_Villas2-1920.webp",
                is_main: true,
                alt_text: "Service image 17",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "18",
                url: "https://www.playfulpupsretreat.com/wp-content/uploads/2024/06/a-bunch-of-dogs-on-a-bed-600x400-crop.jpg",
                is_main: true,
                alt_text: "Service image 18",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "19",
                url: "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80",
                is_main: true,
                alt_text: "Service image 19",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "service",
                entity_id: "20",
                url: "https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=1200&q=80",
                is_main: true,
                alt_text: "Service image 20",
                created_at: now,
                updated_at: now,
            },
        ]);
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
