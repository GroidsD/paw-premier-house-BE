"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        const now = new Date();

        // 1. Insert Product Categories
        await queryInterface.bulkInsert("productCategories", [
            {
                productCategories_id: 1,
                type_vi: "Thức Ăn Chó",
                type_en: "Dog Food",
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                productCategories_id: 2,
                type_vi: "Thức Ăn Mèo",
                type_en: "Cat Food",
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                productCategories_id: 3,
                type_vi: "Phụ Kiện Thú Cưng",
                type_en: "Pet Accessories",
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                productCategories_id: 4,
                type_vi: "Đồ Chơi Thú Cưng",
                type_en: "Pet Toys",
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                productCategories_id: 5,
                type_vi: "Vệ Sinh & Chăm Sóc",
                type_en: "Hygiene & Care",
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
        ]);

        // 2. Insert Products (bilingual fields for Product model)
        await queryInterface.bulkInsert("products", [
            {
                product_id: 1,
                productCategories_id: 1,
                name_vi: "Hạt khô bò cao cấp",
                name_en: "Premium Beef Kibble",
                summary_vi:
                    "Hạt khô bò cao cấp là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Premium Beef Kibble offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `HẠT KHÔ BÒ CAO CẤP - THỨC ĂN CHO CHÓ CAO CẤP

Mang đến cho chó nguồn dinh dưỡng xứng đáng với Hạt khô bò cao cấp. Được thiết kế riêng cho chó, sản phẩm dạng hạt khô này có thịt bò nuôi trang trại thật, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Thịt bò nuôi trang trại thật (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho chó trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của chó.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của chó. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `PREMIUM BEEF KIBBLE - PREMIUM DOG FOOD

Give your dog the nutrition they deserve with Premium Beef Kibble. Specifically tailored for dogs, this dry kibble features real farm-raised beef to deliver a taste your dog will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Real Farm-Raised Beef (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult dogs. Please ensure this matches your dog's life stage.

FEEDING INSTRUCTIONS

Feed according to your dog's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "premium-beef-kibble",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 2,
                productCategories_id: 1,
                name_vi: "Công thức dinh dưỡng phát triển cho chó con",
                name_en: "Puppy Growth Formula",
                summary_vi:
                    "Công thức dinh dưỡng phát triển cho chó con là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Puppy Growth Formula offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `CÔNG THỨC DINH DƯỠNG PHÁT TRIỂN CHO CHÓ CON - THỨC ĂN CHO CHÓ CAO CẤP

Mang đến cho chó nguồn dinh dưỡng xứng đáng với Công thức dinh dưỡng phát triển cho chó con. Được thiết kế riêng cho chó, sản phẩm dạng hạt khô này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Bổ sung DHA hỗ trợ phát triển não bộ và thị lực khỏe mạnh.
• Hàm lượng protein cao giúp hỗ trợ phát triển cơ bắp.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Dầu cá (nguồn cung cấp DHA)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho chó con đang phát triển. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của chó.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của chó. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `PUPPY GROWTH FORMULA - PREMIUM DOG FOOD

Give your dog the nutrition they deserve with Puppy Growth Formula. Specifically tailored for dogs, this dry kibble features premium protein sources to deliver a taste your dog will crave while supporting their overall health and vitality.

KEY BENEFITS

• Enriched with DHA for healthy brain and vision development.
• High protein content to support growing muscles.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Fish oil (source of DHA)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for growing puppies. Please ensure this matches your dog's life stage.

FEEDING INSTRUCTIONS

Feed according to your dog's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "puppy-growth-formula",
                has_variants: false,
                original_price: 148000,
                discount: 10,
                discount_type: "percent",
                price: 133200,
                quantity: 5,
                reserved_quantity: 1,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 3,
                productCategories_id: 1,
                name_vi: "Pate gà cho chó trưởng thành",
                name_en: "Adult Dog Chicken Pate",
                summary_vi:
                    "Pate gà cho chó trưởng thành là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Adult Dog Chicken Pate offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `PATE GÀ CHO CHÓ TRƯỞNG THÀNH - THỨC ĂN CHO CHÓ CAO CẤP

Mang đến cho chó nguồn dinh dưỡng xứng đáng với Pate gà cho chó trưởng thành. Được thiết kế riêng cho chó, sản phẩm dạng thức ăn ướt này có thịt gà thả vườn thật, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Hàm lượng nước cao giúp hỗ trợ cấp nước hằng ngày.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Thịt gà thả vườn thật (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho chó trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của chó.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của chó. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Phần chưa dùng hết cần được bảo quản lạnh và sử dụng trong vòng 3 ngày. Lon/gói chưa mở nên được để ở nơi khô ráo, thoáng mát.`,
                description_en: `ADULT DOG CHICKEN PATE - PREMIUM DOG FOOD

Give your dog the nutrition they deserve with Adult Dog Chicken Pate. Specifically tailored for dogs, this wet food features real cage-free chicken to deliver a taste your dog will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• High moisture content to help support daily hydration.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Real Cage-Free Chicken (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult dogs. Please ensure this matches your dog's life stage.

FEEDING INSTRUCTIONS

Feed according to your dog's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Refrigerate unused portion and serve within 3 days. Unopened cans/pouches should be stored in a cool, dry place.`,
                thumbnail_url: null,
                slug: "adult-dog-chicken-pate",
                has_variants: false,
                original_price: 148000,
                discount: 10,
                discount_type: "percent",
                price: 133200,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 4,
                productCategories_id: 1,
                name_vi: "Công thức dinh dưỡng cho chó lớn tuổi",
                name_en: "Senior Dog Formula",
                summary_vi:
                    "Công thức dinh dưỡng cho chó lớn tuổi là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Senior Dog Formula offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `CÔNG THỨC DINH DƯỠNG CHO CHÓ LỚN TUỔI - THỨC ĂN CHO CHÓ CAO CẤP

Mang đến cho chó nguồn dinh dưỡng xứng đáng với Công thức dinh dưỡng cho chó lớn tuổi. Được thiết kế riêng cho chó, sản phẩm dạng hạt khô này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Chứa Glucosamine và Chondroitin hỗ trợ khớp và khả năng vận động.
• Công thức dễ tiêu hóa, phù hợp với chó lớn tuổi.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Bổ sung Glucosamine
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho chó lớn tuổi. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của chó.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của chó. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `SENIOR DOG FORMULA - PREMIUM DOG FOOD

Give your dog the nutrition they deserve with Senior Dog Formula. Specifically tailored for dogs, this dry kibble features premium protein sources to deliver a taste your dog will crave while supporting their overall health and vitality.

KEY BENEFITS

• Contains Glucosamine and Chondroitin for joint and mobility support.
• Easy-to-digest formula tailored for older dogs.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Glucosamine supplement
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for senior dogs. Please ensure this matches your dog's life stage.

FEEDING INSTRUCTIONS

Feed according to your dog's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "senior-dog-formula",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 5,
                productCategories_id: 1,
                name_vi: "Hỗn hợp cá hồi không ngũ cốc",
                name_en: "Grain-Free Salmon Mix",
                summary_vi:
                    "Hỗn hợp cá hồi không ngũ cốc là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Grain-Free Salmon Mix offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `HỖN HỢP CÁ HỒI KHÔNG NGŨ CỐC - THỨC ĂN CHO CHÓ CAO CẤP

Mang đến cho chó nguồn dinh dưỡng xứng đáng với Hỗn hợp cá hồi không ngũ cốc. Được thiết kế riêng cho chó, sản phẩm dạng hạt khô này có cá hồi đánh bắt tự nhiên, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Cá hồi đánh bắt tự nhiên (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho chó trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của chó.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của chó. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `GRAIN-FREE SALMON MIX - PREMIUM DOG FOOD

Give your dog the nutrition they deserve with Grain-Free Salmon Mix. Specifically tailored for dogs, this dry kibble features wild-caught salmon to deliver a taste your dog will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Wild-Caught Salmon (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult dogs. Please ensure this matches your dog's life stage.

FEEDING INSTRUCTIONS

Feed according to your dog's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "grain-free-salmon-mix",
                has_variants: false,
                original_price: 117000,
                discount: 10,
                discount_type: "percent",
                price: 105300,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 6,
                productCategories_id: 1,
                name_vi: "Thức ăn hỗ trợ tiêu hóa cho chó",
                name_en: "Digestive Health Dog Food",
                summary_vi:
                    "Thức ăn hỗ trợ tiêu hóa cho chó là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Digestive Health Dog Food offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `THỨC ĂN HỖ TRỢ TIÊU HÓA CHO CHÓ - THỨC ĂN CHO CHÓ CAO CẤP

Mang đến cho chó nguồn dinh dưỡng xứng đáng với Thức ăn hỗ trợ tiêu hóa cho chó. Được thiết kế riêng cho chó, sản phẩm dạng hạt khô này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho chó trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của chó.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của chó. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `DIGESTIVE HEALTH DOG FOOD - PREMIUM DOG FOOD

Give your dog the nutrition they deserve with Digestive Health Dog Food. Specifically tailored for dogs, this dry kibble features premium protein sources to deliver a taste your dog will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult dogs. Please ensure this matches your dog's life stage.

FEEDING INSTRUCTIONS

Feed according to your dog's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "digestive-health-dog-food",
                has_variants: false,
                original_price: 121000,
                discount: 10,
                discount_type: "percent",
                price: 108900,
                quantity: 100,
                reserved_quantity: 5,
                isActive: false,
                isDelete: true,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 7,
                productCategories_id: 1,
                name_vi: "Thức ăn kiểm soát cân nặng cho chó",
                name_en: "Weight Management Dog Food",
                summary_vi:
                    "Thức ăn kiểm soát cân nặng cho chó là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Weight Management Dog Food offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `THỨC ĂN KIỂM SOÁT CÂN NẶNG CHO CHÓ - THỨC ĂN CHO CHÓ CAO CẤP

Mang đến cho chó nguồn dinh dưỡng xứng đáng với Thức ăn kiểm soát cân nặng cho chó. Được thiết kế riêng cho chó, sản phẩm dạng hạt khô này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Công thức có L-Carnitine giúp hỗ trợ đốt mỡ và duy trì cân nặng khỏe mạnh.
• Hàm lượng chất xơ cao giúp chó cảm thấy no lâu hơn.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho chó trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của chó.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của chó. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `WEIGHT MANAGEMENT DOG FOOD - PREMIUM DOG FOOD

Give your dog the nutrition they deserve with Weight Management Dog Food. Specifically tailored for dogs, this dry kibble features premium protein sources to deliver a taste your dog will crave while supporting their overall health and vitality.

KEY BENEFITS

• Formulated with L-Carnitine to help burn fat and maintain a healthy weight.
• High fiber content to keep your dog feeling full longer.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult dogs. Please ensure this matches your dog's life stage.

FEEDING INSTRUCTIONS

Feed according to your dog's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "weight-management-dog-food",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 8,
                productCategories_id: 1,
                name_vi: "Hạt khô chăm sóc da và lông",
                name_en: "Skin & Coat Care Kibble",
                summary_vi:
                    "Hạt khô chăm sóc da và lông là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Skin & Coat Care Kibble offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `HẠT KHÔ CHĂM SÓC DA VÀ LÔNG - THỨC ĂN CHO CHÓ CAO CẤP

Mang đến cho chó nguồn dinh dưỡng xứng đáng với Hạt khô chăm sóc da và lông. Được thiết kế riêng cho chó, sản phẩm dạng hạt khô này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Giàu axit béo Omega-3 và Omega-6 giúp lông bóng mượt và da khỏe mạnh.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho chó trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của chó.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của chó. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `SKIN & COAT CARE KIBBLE - PREMIUM DOG FOOD

Give your dog the nutrition they deserve with Skin & Coat Care Kibble. Specifically tailored for dogs, this dry kibble features premium protein sources to deliver a taste your dog will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• Rich in Omega-3 and Omega-6 fatty acids for a glowing coat and healthy skin.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult dogs. Please ensure this matches your dog's life stage.

FEEDING INSTRUCTIONS

Feed according to your dog's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "skin-coat-care-kibble",
                has_variants: false,
                original_price: 118000,
                discount: 10,
                discount_type: "percent",
                price: 106200,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 9,
                productCategories_id: 1,
                name_vi: "Thức ăn cho chó giống lớn",
                name_en: "Large Breed Dog Food",
                summary_vi:
                    "Thức ăn cho chó giống lớn là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Large Breed Dog Food offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `THỨC ĂN CHO CHÓ GIỐNG LỚN - THỨC ĂN CHO CHÓ CAO CẤP

Mang đến cho chó nguồn dinh dưỡng xứng đáng với Thức ăn cho chó giống lớn. Được thiết kế riêng cho chó, sản phẩm dạng hạt khô này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho chó trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của chó.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của chó. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `LARGE BREED DOG FOOD - PREMIUM DOG FOOD

Give your dog the nutrition they deserve with Large Breed Dog Food. Specifically tailored for dogs, this dry kibble features premium protein sources to deliver a taste your dog will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult dogs. Please ensure this matches your dog's life stage.

FEEDING INSTRUCTIONS

Feed according to your dog's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "large-breed-dog-food",
                has_variants: false,
                original_price: 117000,
                discount: 10,
                discount_type: "percent",
                price: 105300,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 10,
                productCategories_id: 1,
                name_vi: "Thức ăn cho chó giống nhỏ",
                name_en: "Small Breed Dog Food",
                summary_vi:
                    "Thức ăn cho chó giống nhỏ là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Small Breed Dog Food offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `THỨC ĂN CHO CHÓ GIỐNG NHỎ - THỨC ĂN CHO CHÓ CAO CẤP

Mang đến cho chó nguồn dinh dưỡng xứng đáng với Thức ăn cho chó giống nhỏ. Được thiết kế riêng cho chó, sản phẩm dạng hạt khô này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho chó trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của chó.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của chó. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `SMALL BREED DOG FOOD - PREMIUM DOG FOOD

Give your dog the nutrition they deserve with Small Breed Dog Food. Specifically tailored for dogs, this dry kibble features premium protein sources to deliver a taste your dog will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult dogs. Please ensure this matches your dog's life stage.

FEEDING INSTRUCTIONS

Feed according to your dog's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "small-breed-dog-food",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 11,
                productCategories_id: 1,
                name_vi: "Thức ăn ướt đóng hộp cho chó",
                name_en: "Wet Dog Food Canned",
                summary_vi:
                    "Thức ăn ướt đóng hộp cho chó là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Wet Dog Food Canned offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `THỨC ĂN ƯỚT ĐÓNG HỘP CHO CHÓ - THỨC ĂN CHO CHÓ CAO CẤP

Mang đến cho chó nguồn dinh dưỡng xứng đáng với Thức ăn ướt đóng hộp cho chó. Được thiết kế riêng cho chó, sản phẩm dạng thức ăn ướt này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Hàm lượng nước cao giúp hỗ trợ cấp nước hằng ngày.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho chó trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của chó.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của chó. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Phần chưa dùng hết cần được bảo quản lạnh và sử dụng trong vòng 3 ngày. Lon/gói chưa mở nên được để ở nơi khô ráo, thoáng mát.`,
                description_en: `WET DOG FOOD CANNED - PREMIUM DOG FOOD

Give your dog the nutrition they deserve with Wet Dog Food Canned. Specifically tailored for dogs, this wet food features premium protein sources to deliver a taste your dog will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• High moisture content to help support daily hydration.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult dogs. Please ensure this matches your dog's life stage.

FEEDING INSTRUCTIONS

Feed according to your dog's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Refrigerate unused portion and serve within 3 days. Unopened cans/pouches should be stored in a cool, dry place.`,
                thumbnail_url: null,
                slug: "wet-dog-food-canned",
                has_variants: false,
                original_price: 149000,
                discount: 10,
                discount_type: "percent",
                price: 134100,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 12,
                productCategories_id: 1,
                name_vi: "Đồ ăn thưởng hữu cơ cho chó",
                name_en: "Organic Dog Treats",
                summary_vi:
                    "Đồ ăn thưởng hữu cơ cho chó là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Organic Dog Treats offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `ĐỒ ĂN THƯỞNG HỮU CƠ CHO CHÓ - ĐỒ ĂN THƯỞNG CHO CHÓ CAO CẤP

Mang đến cho chó nguồn dinh dưỡng xứng đáng với Đồ ăn thưởng hữu cơ cho chó. Được thiết kế riêng cho chó, sản phẩm dạng món ăn thưởng này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho chó trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của chó.

HƯỚNG DẪN CHO ĂN

Dùng như đồ ăn thưởng hoặc phần thưởng. Sản phẩm chỉ dùng để bổ sung hoặc cho ăn không thường xuyên. Luôn quan sát chó khi cho ăn thưởng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `ORGANIC DOG TREATS - PREMIUM DOG TREAT

Give your dog the nutrition they deserve with Organic Dog Treats. Specifically tailored for dogs, this snack features premium protein sources to deliver a taste your dog will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult dogs. Please ensure this matches your dog's life stage.

FEEDING INSTRUCTIONS

Feed as a treat or reward. This product is intended for intermittent or supplemental feeding only. Always monitor your dog while treating.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "organic-dog-treats",
                has_variants: false,
                original_price: 116000,
                discount: 10,
                discount_type: "percent",
                price: 104400,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 13,
                productCategories_id: 1,
                name_vi: "Xương nhai chăm sóc răng miệng cho chó",
                name_en: "Dental Care Dog Chews",
                summary_vi:
                    "Xương nhai chăm sóc răng miệng cho chó là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Dental Care Dog Chews offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `XƯƠNG NHAI CHĂM SÓC RĂNG MIỆNG CHO CHÓ - ĐỒ ĂN THƯỞNG CHO CHÓ CAO CẤP

Mang đến cho chó nguồn dinh dưỡng xứng đáng với Xương nhai chăm sóc răng miệng cho chó. Được thiết kế riêng cho chó, sản phẩm dạng món ăn thưởng này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Kết cấu giòn giúp giảm mảng bám và cao răng trong quá trình nhai.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho chó trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của chó.

HƯỚNG DẪN CHO ĂN

Dùng như đồ ăn thưởng hoặc phần thưởng. Sản phẩm chỉ dùng để bổ sung hoặc cho ăn không thường xuyên. Luôn quan sát chó khi cho ăn thưởng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `DENTAL CARE DOG CHEWS - PREMIUM DOG TREAT

Give your dog the nutrition they deserve with Dental Care Dog Chews. Specifically tailored for dogs, this snack features premium protein sources to deliver a taste your dog will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• Crunchy texture helps reduce plaque and tartar buildup during chewing.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult dogs. Please ensure this matches your dog's life stage.

FEEDING INSTRUCTIONS

Feed as a treat or reward. This product is intended for intermittent or supplemental feeding only. Always monitor your dog while treating.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "dental-care-dog-chews",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 14,
                productCategories_id: 1,
                name_vi: "Đồ ăn thưởng huấn luyện",
                name_en: "Training Treats",
                summary_vi:
                    "Đồ ăn thưởng huấn luyện là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Training Treats offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `ĐỒ ĂN THƯỞNG HUẤN LUYỆN - ĐỒ ĂN THƯỞNG CHO CHÓ CAO CẤP

Mang đến cho chó nguồn dinh dưỡng xứng đáng với Đồ ăn thưởng huấn luyện. Được thiết kế riêng cho chó, sản phẩm dạng món ăn thưởng này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho chó trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của chó.

HƯỚNG DẪN CHO ĂN

Dùng như đồ ăn thưởng hoặc phần thưởng. Sản phẩm chỉ dùng để bổ sung hoặc cho ăn không thường xuyên. Luôn quan sát chó khi cho ăn thưởng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `TRAINING TREATS - PREMIUM DOG TREAT

Give your dog the nutrition they deserve with Training Treats. Specifically tailored for dogs, this snack features premium protein sources to deliver a taste your dog will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult dogs. Please ensure this matches your dog's life stage.

FEEDING INSTRUCTIONS

Feed as a treat or reward. This product is intended for intermittent or supplemental feeding only. Always monitor your dog while treating.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "training-treats",
                has_variants: false,
                original_price: 101000,
                discount: 10,
                discount_type: "percent",
                price: 90900,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 15,
                productCategories_id: 2,
                name_vi: "Sữa thay thế cho mèo con",
                name_en: "Kitten Milk Replacer",
                summary_vi:
                    "Sữa thay thế cho mèo con là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Kitten Milk Replacer offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `SỮA THAY THẾ CHO MÈO CON - THỨC ĂN CHO MÈO CAO CẤP

Mang đến cho mèo nguồn dinh dưỡng xứng đáng với Sữa thay thế cho mèo con. Được thiết kế riêng cho mèo, sản phẩm dạng hạt khô này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Bổ sung DHA hỗ trợ phát triển não bộ và thị lực khỏe mạnh.
• Hàm lượng protein cao giúp hỗ trợ phát triển cơ bắp.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Dầu cá (nguồn cung cấp DHA)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho mèo con đang phát triển. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của mèo.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của mèo. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `KITTEN MILK REPLACER - PREMIUM CAT FOOD

Give your cat the nutrition they deserve with Kitten Milk Replacer. Specifically tailored for cats, this dry kibble features premium protein sources to deliver a taste your cat will crave while supporting their overall health and vitality.

KEY BENEFITS

• Enriched with DHA for healthy brain and vision development.
• High protein content to support growing muscles.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Fish oil (source of DHA)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for growing kittens. Please ensure this matches your cat's life stage.

FEEDING INSTRUCTIONS

Feed according to your cat's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "kitten-milk-replacer",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 16,
                productCategories_id: 2,
                name_vi: "Hỗn hợp cá ngừ cho mèo trưởng thành",
                name_en: "Adult Cat Tuna Mix",
                summary_vi:
                    "Hỗn hợp cá ngừ cho mèo trưởng thành là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Adult Cat Tuna Mix offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `HỖN HỢP CÁ NGỪ CHO MÈO TRƯỞNG THÀNH - THỨC ĂN CHO MÈO CAO CẤP

Mang đến cho mèo nguồn dinh dưỡng xứng đáng với Hỗn hợp cá ngừ cho mèo trưởng thành. Được thiết kế riêng cho mèo, sản phẩm dạng hạt khô này có cá ngừ đại dương, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Cá ngừ đại dương (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho mèo trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của mèo.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của mèo. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `ADULT CAT TUNA MIX - PREMIUM CAT FOOD

Give your cat the nutrition they deserve with Adult Cat Tuna Mix. Specifically tailored for cats, this dry kibble features ocean tuna to deliver a taste your cat will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Ocean Tuna (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult cats. Please ensure this matches your cat's life stage.

FEEDING INSTRUCTIONS

Feed according to your cat's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "adult-cat-tuna-mix",
                has_variants: false,
                original_price: 108000,
                discount: 10,
                discount_type: "percent",
                price: 97200,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 17,
                productCategories_id: 2,
                name_vi: "Pate cá hồi cho mèo",
                name_en: "Salmon Delight Cat Pate",
                summary_vi:
                    "Pate cá hồi cho mèo là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Salmon Delight Cat Pate offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `PATE CÁ HỒI CHO MÈO - THỨC ĂN CHO MÈO CAO CẤP

Mang đến cho mèo nguồn dinh dưỡng xứng đáng với Pate cá hồi cho mèo. Được thiết kế riêng cho mèo, sản phẩm dạng thức ăn ướt này có cá hồi đánh bắt tự nhiên, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Hàm lượng nước cao giúp hỗ trợ cấp nước hằng ngày.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Cá hồi đánh bắt tự nhiên (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho mèo trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của mèo.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của mèo. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Phần chưa dùng hết cần được bảo quản lạnh và sử dụng trong vòng 3 ngày. Lon/gói chưa mở nên được để ở nơi khô ráo, thoáng mát.`,
                description_en: `SALMON DELIGHT CAT PATE - PREMIUM CAT FOOD

Give your cat the nutrition they deserve with Salmon Delight Cat Pate. Specifically tailored for cats, this wet food features wild-caught salmon to deliver a taste your cat will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• High moisture content to help support daily hydration.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Wild-Caught Salmon (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult cats. Please ensure this matches your cat's life stage.

FEEDING INSTRUCTIONS

Feed according to your cat's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Refrigerate unused portion and serve within 3 days. Unopened cans/pouches should be stored in a cool, dry place.`,
                thumbnail_url: null,
                slug: "salmon-delight-cat-pate",
                has_variants: false,
                original_price: 122000,
                discount: 10,
                discount_type: "percent",
                price: 109800,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 18,
                productCategories_id: 2,
                name_vi: "Hạt khô kiểm soát búi lông",
                name_en: "Hairball Control Kibble",
                summary_vi:
                    "Hạt khô kiểm soát búi lông là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Hairball Control Kibble offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `HẠT KHÔ KIỂM SOÁT BÚI LÔNG - THỨC ĂN CHO MÈO CAO CẤP

Mang đến cho mèo nguồn dinh dưỡng xứng đáng với Hạt khô kiểm soát búi lông. Được thiết kế riêng cho mèo, sản phẩm dạng hạt khô này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Giàu axit béo Omega-3 và Omega-6 giúp lông bóng mượt và da khỏe mạnh.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho mèo trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của mèo.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của mèo. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `HAIRBALL CONTROL KIBBLE - PREMIUM CAT FOOD

Give your cat the nutrition they deserve with Hairball Control Kibble. Specifically tailored for cats, this dry kibble features premium protein sources to deliver a taste your cat will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• Rich in Omega-3 and Omega-6 fatty acids for a glowing coat and healthy skin.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult cats. Please ensure this matches your cat's life stage.

FEEDING INSTRUCTIONS

Feed according to your cat's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "hairball-control-kibble",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 19,
                productCategories_id: 2,
                name_vi: "Thức ăn hỗ trợ tiết niệu cho mèo",
                name_en: "Urinary Health Cat Food",
                summary_vi:
                    "Thức ăn hỗ trợ tiết niệu cho mèo là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Urinary Health Cat Food offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `THỨC ĂN HỖ TRỢ TIẾT NIỆU CHO MÈO - THỨC ĂN CHO MÈO CAO CẤP

Mang đến cho mèo nguồn dinh dưỡng xứng đáng với Thức ăn hỗ trợ tiết niệu cho mèo. Được thiết kế riêng cho mèo, sản phẩm dạng hạt khô này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho mèo trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của mèo.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của mèo. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `URINARY HEALTH CAT FOOD - PREMIUM CAT FOOD

Give your cat the nutrition they deserve with Urinary Health Cat Food. Specifically tailored for cats, this dry kibble features premium protein sources to deliver a taste your cat will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult cats. Please ensure this matches your cat's life stage.

FEEDING INSTRUCTIONS

Feed according to your cat's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "urinary-health-cat-food",
                has_variants: false,
                original_price: 137000,
                discount: 10,
                discount_type: "percent",
                price: 123300,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 20,
                productCategories_id: 2,
                name_vi: "Công thức dinh dưỡng cho mèo nuôi trong nhà",
                name_en: "Indoor Cat Formula",
                summary_vi:
                    "Công thức dinh dưỡng cho mèo nuôi trong nhà là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Indoor Cat Formula offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `CÔNG THỨC DINH DƯỠNG CHO MÈO NUÔI TRONG NHÀ - THỨC ĂN CHO MÈO CAO CẤP

Mang đến cho mèo nguồn dinh dưỡng xứng đáng với Công thức dinh dưỡng cho mèo nuôi trong nhà. Được thiết kế riêng cho mèo, sản phẩm dạng hạt khô này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho mèo trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của mèo.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của mèo. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `INDOOR CAT FORMULA - PREMIUM CAT FOOD

Give your cat the nutrition they deserve with Indoor Cat Formula. Specifically tailored for cats, this dry kibble features premium protein sources to deliver a taste your cat will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult cats. Please ensure this matches your cat's life stage.

FEEDING INSTRUCTIONS

Feed according to your cat's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "indoor-cat-formula",
                has_variants: false,
                original_price: 128000,
                discount: 10,
                discount_type: "percent",
                price: 115200,
                quantity: 100,
                reserved_quantity: 5,
                isActive: false,
                isDelete: true,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 21,
                productCategories_id: 2,
                name_vi: "Thức ăn không ngũ cốc cho mèo",
                name_en: "Grain-Free Cat Food",
                summary_vi:
                    "Thức ăn không ngũ cốc cho mèo là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Grain-Free Cat Food offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `THỨC ĂN KHÔNG NGŨ CỐC CHO MÈO - THỨC ĂN CHO MÈO CAO CẤP

Mang đến cho mèo nguồn dinh dưỡng xứng đáng với Thức ăn không ngũ cốc cho mèo. Được thiết kế riêng cho mèo, sản phẩm dạng hạt khô này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho mèo trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của mèo.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của mèo. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `GRAIN-FREE CAT FOOD - PREMIUM CAT FOOD

Give your cat the nutrition they deserve with Grain-Free Cat Food. Specifically tailored for cats, this dry kibble features premium protein sources to deliver a taste your cat will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult cats. Please ensure this matches your cat's life stage.

FEEDING INSTRUCTIONS

Feed according to your cat's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "grain-free-cat-food",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 22,
                productCategories_id: 2,
                name_vi: "Thức ăn ướt cho mèo lớn tuổi",
                name_en: "Senior Cat Wet Food",
                summary_vi:
                    "Thức ăn ướt cho mèo lớn tuổi là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Senior Cat Wet Food offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `THỨC ĂN ƯỚT CHO MÈO LỚN TUỔI - THỨC ĂN CHO MÈO CAO CẤP

Mang đến cho mèo nguồn dinh dưỡng xứng đáng với Thức ăn ướt cho mèo lớn tuổi. Được thiết kế riêng cho mèo, sản phẩm dạng thức ăn ướt này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Chứa Glucosamine và Chondroitin hỗ trợ khớp và khả năng vận động.
• Công thức dễ tiêu hóa, phù hợp với mèo lớn tuổi.
• Hàm lượng nước cao giúp hỗ trợ cấp nước hằng ngày.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Bổ sung Glucosamine
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho mèo lớn tuổi. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của mèo.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của mèo. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Phần chưa dùng hết cần được bảo quản lạnh và sử dụng trong vòng 3 ngày. Lon/gói chưa mở nên được để ở nơi khô ráo, thoáng mát.`,
                description_en: `SENIOR CAT WET FOOD - PREMIUM CAT FOOD

Give your cat the nutrition they deserve with Senior Cat Wet Food. Specifically tailored for cats, this wet food features premium protein sources to deliver a taste your cat will crave while supporting their overall health and vitality.

KEY BENEFITS

• Contains Glucosamine and Chondroitin for joint and mobility support.
• Easy-to-digest formula tailored for older cats.
• High moisture content to help support daily hydration.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Glucosamine supplement
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for senior cats. Please ensure this matches your cat's life stage.

FEEDING INSTRUCTIONS

Feed according to your cat's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Refrigerate unused portion and serve within 3 days. Unopened cans/pouches should be stored in a cool, dry place.`,
                thumbnail_url: null,
                slug: "senior-cat-wet-food",
                has_variants: false,
                original_price: 117000,
                discount: 10,
                discount_type: "percent",
                price: 105300,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 23,
                productCategories_id: 2,
                name_vi: "Đồ ăn thưởng vị bạc hà mèo",
                name_en: "Catnip Flavored Treats",
                summary_vi:
                    "Đồ ăn thưởng vị bạc hà mèo là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Catnip Flavored Treats offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `ĐỒ ĂN THƯỞNG VỊ BẠC HÀ MÈO - ĐỒ ĂN THƯỞNG CHO MÈO CAO CẤP

Mang đến cho mèo nguồn dinh dưỡng xứng đáng với Đồ ăn thưởng vị bạc hà mèo. Được thiết kế riêng cho mèo, sản phẩm dạng món ăn thưởng này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho mèo trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của mèo.

HƯỚNG DẪN CHO ĂN

Dùng như đồ ăn thưởng hoặc phần thưởng. Sản phẩm chỉ dùng để bổ sung hoặc cho ăn không thường xuyên. Luôn quan sát mèo khi cho ăn thưởng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `CATNIP FLAVORED TREATS - PREMIUM CAT TREAT

Give your cat the nutrition they deserve with Catnip Flavored Treats. Specifically tailored for cats, this snack features premium protein sources to deliver a taste your cat will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult cats. Please ensure this matches your cat's life stage.

FEEDING INSTRUCTIONS

Feed as a treat or reward. This product is intended for intermittent or supplemental feeding only. Always monitor your cat while treating.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "catnip-flavored-treats",
                has_variants: false,
                original_price: 149000,
                discount: 10,
                discount_type: "percent",
                price: 134100,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 24,
                productCategories_id: 2,
                name_vi: "Đồ ăn thưởng gà sấy thăng hoa",
                name_en: "Freeze-Dried Chicken Treats",
                summary_vi:
                    "Đồ ăn thưởng gà sấy thăng hoa là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Freeze-Dried Chicken Treats offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `ĐỒ ĂN THƯỞNG GÀ SẤY THĂNG HOA - ĐỒ ĂN THƯỞNG CHO MÈO CAO CẤP

Mang đến cho mèo nguồn dinh dưỡng xứng đáng với Đồ ăn thưởng gà sấy thăng hoa. Được thiết kế riêng cho mèo, sản phẩm dạng món ăn thưởng này có thịt gà thả vườn thật, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Thịt gà thả vườn thật (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho mèo trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của mèo.

HƯỚNG DẪN CHO ĂN

Dùng như đồ ăn thưởng hoặc phần thưởng. Sản phẩm chỉ dùng để bổ sung hoặc cho ăn không thường xuyên. Luôn quan sát mèo khi cho ăn thưởng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `FREEZE-DRIED CHICKEN TREATS - PREMIUM CAT TREAT

Give your cat the nutrition they deserve with Freeze-Dried Chicken Treats. Specifically tailored for cats, this snack features real cage-free chicken to deliver a taste your cat will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Real Cage-Free Chicken (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult cats. Please ensure this matches your cat's life stage.

FEEDING INSTRUCTIONS

Feed as a treat or reward. This product is intended for intermittent or supplemental feeding only. Always monitor your cat while treating.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "freeze-dried-chicken-treats",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 25,
                productCategories_id: 2,
                name_vi: "Hỗn hợp hải sản cao cấp cho mèo",
                name_en: "Gourmet Seafood Medley",
                summary_vi:
                    "Hỗn hợp hải sản cao cấp cho mèo là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Gourmet Seafood Medley offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `HỖN HỢP HẢI SẢN CAO CẤP CHO MÈO - THỨC ĂN CHO MÈO CAO CẤP

Mang đến cho mèo nguồn dinh dưỡng xứng đáng với Hỗn hợp hải sản cao cấp cho mèo. Được thiết kế riêng cho mèo, sản phẩm dạng thức ăn ướt này có hải sản đại dương hỗn hợp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Hàm lượng nước cao giúp hỗ trợ cấp nước hằng ngày.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Hải sản đại dương hỗn hợp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho mèo trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của mèo.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của mèo. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Phần chưa dùng hết cần được bảo quản lạnh và sử dụng trong vòng 3 ngày. Lon/gói chưa mở nên được để ở nơi khô ráo, thoáng mát.`,
                description_en: `GOURMET SEAFOOD MEDLEY - PREMIUM CAT FOOD

Give your cat the nutrition they deserve with Gourmet Seafood Medley. Specifically tailored for cats, this wet food features mixed ocean seafood to deliver a taste your cat will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• High moisture content to help support daily hydration.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Mixed Ocean Seafood (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult cats. Please ensure this matches your cat's life stage.

FEEDING INSTRUCTIONS

Feed according to your cat's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Refrigerate unused portion and serve within 3 days. Unopened cans/pouches should be stored in a cool, dry place.`,
                thumbnail_url: null,
                slug: "gourmet-seafood-medley",
                has_variants: false,
                original_price: 105000,
                discount: 10,
                discount_type: "percent",
                price: 94500,
                quantity: 100,
                reserved_quantity: 5,
                isActive: false,
                isDelete: true,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 26,
                productCategories_id: 2,
                name_vi: "Snack chăm sóc răng miệng cho mèo",
                name_en: "Dental Cat Snacks",
                summary_vi:
                    "Snack chăm sóc răng miệng cho mèo là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Dental Cat Snacks offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `SNACK CHĂM SÓC RĂNG MIỆNG CHO MÈO - ĐỒ ĂN THƯỞNG CHO MÈO CAO CẤP

Mang đến cho mèo nguồn dinh dưỡng xứng đáng với Snack chăm sóc răng miệng cho mèo. Được thiết kế riêng cho mèo, sản phẩm dạng món ăn thưởng này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Kết cấu giòn giúp giảm mảng bám và cao răng trong quá trình nhai.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho mèo trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của mèo.

HƯỚNG DẪN CHO ĂN

Dùng như đồ ăn thưởng hoặc phần thưởng. Sản phẩm chỉ dùng để bổ sung hoặc cho ăn không thường xuyên. Luôn quan sát mèo khi cho ăn thưởng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `DENTAL CAT SNACKS - PREMIUM CAT TREAT

Give your cat the nutrition they deserve with Dental Cat Snacks. Specifically tailored for cats, this snack features premium protein sources to deliver a taste your cat will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• Crunchy texture helps reduce plaque and tartar buildup during chewing.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult cats. Please ensure this matches your cat's life stage.

FEEDING INSTRUCTIONS

Feed as a treat or reward. This product is intended for intermittent or supplemental feeding only. Always monitor your cat while treating.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "dental-cat-snacks",
                has_variants: false,
                original_price: 141000,
                discount: 10,
                discount_type: "percent",
                price: 126900,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 27,
                productCategories_id: 2,
                name_vi: "Thức ăn kiểm soát cân nặng cho mèo",
                name_en: "Weight Control Cat Food",
                summary_vi:
                    "Thức ăn kiểm soát cân nặng cho mèo là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Weight Control Cat Food offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `THỨC ĂN KIỂM SOÁT CÂN NẶNG CHO MÈO - THỨC ĂN CHO MÈO CAO CẤP

Mang đến cho mèo nguồn dinh dưỡng xứng đáng với Thức ăn kiểm soát cân nặng cho mèo. Được thiết kế riêng cho mèo, sản phẩm dạng hạt khô này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Công thức có L-Carnitine giúp hỗ trợ đốt mỡ và duy trì cân nặng khỏe mạnh.
• Hàm lượng chất xơ cao giúp mèo cảm thấy no lâu hơn.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho mèo trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của mèo.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của mèo. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `WEIGHT CONTROL CAT FOOD - PREMIUM CAT FOOD

Give your cat the nutrition they deserve with Weight Control Cat Food. Specifically tailored for cats, this dry kibble features premium protein sources to deliver a taste your cat will crave while supporting their overall health and vitality.

KEY BENEFITS

• Formulated with L-Carnitine to help burn fat and maintain a healthy weight.
• High fiber content to keep your cat feeling full longer.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult cats. Please ensure this matches your cat's life stage.

FEEDING INSTRUCTIONS

Feed according to your cat's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "weight-control-cat-food",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 28,
                productCategories_id: 2,
                name_vi: "Công thức cho mèo có dạ dày nhạy cảm",
                name_en: "Sensitive Stomach Formula",
                summary_vi:
                    "Công thức cho mèo có dạ dày nhạy cảm là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Sensitive Stomach Formula offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `CÔNG THỨC CHO MÈO CÓ DẠ DÀY NHẠY CẢM - THỨC ĂN CHO MÈO CAO CẤP

Mang đến cho mèo nguồn dinh dưỡng xứng đáng với Công thức cho mèo có dạ dày nhạy cảm. Được thiết kế riêng cho mèo, sản phẩm dạng hạt khô này có nguồn protein cao cấp, tạo hương vị hấp dẫn đồng thời hỗ trợ sức khỏe tổng thể và sự năng động của thú cưng.

LỢI ÍCH CHÍNH

• Cung cấp tỷ lệ cân bằng giữa protein, chất béo và carbohydrate.
• Hỗ trợ hệ miễn dịch khỏe mạnh nhờ các chất chống oxy hóa thiết yếu.
• Không chứa hương liệu, màu nhân tạo hoặc chất bảo quản nhân tạo.

THÀNH PHẦN CHÍNH

• Nguồn protein cao cấp (thành phần đầu tiên)
• Ngũ cốc và rau củ lành mạnh (hoặc lựa chọn không ngũ cốc nếu được ghi rõ)
• Vitamin thiết yếu (Vitamin E, Vitamin A, B12)
• Taurine (thiết yếu cho mèo, có lợi cho chó)

PHÙ HỢP VỚI

Được thiết kế riêng cho mèo trưởng thành. Vui lòng đảm bảo sản phẩm phù hợp với giai đoạn phát triển của mèo.

HƯỚNG DẪN CHO ĂN

Cho ăn theo cân nặng và mức độ vận động của mèo. Nếu chuyển từ thương hiệu khác, hãy chuyển đổi dần trong 7 ngày. Luôn chuẩn bị nước sạch cho thú cưng.

BẢO QUẢN

Bảo quản ở nơi khô ráo, thoáng mát. Đóng kín bao bì để giữ độ tươi ngon tối đa.`,
                description_en: `SENSITIVE STOMACH FORMULA - PREMIUM CAT FOOD

Give your cat the nutrition they deserve with Sensitive Stomach Formula. Specifically tailored for cats, this dry kibble features premium protein sources to deliver a taste your cat will crave while supporting their overall health and vitality.

KEY BENEFITS

• Provides a balanced ratio of proteins, fats, and carbohydrates.
• Supports a healthy immune system with essential antioxidants.
• No artificial flavors, colors, or preservatives.

MAIN INGREDIENTS

• Premium protein sources (First Ingredient)
• Wholesome grains and vegetables (or grain-free alternatives if specified)
• Essential Vitamins (Vitamin E, Vitamin A, B12)
• Taurine (essential for cats, beneficial for dogs)

SUITABLE FOR

Specifically formulated for adult cats. Please ensure this matches your cat's life stage.

FEEDING INSTRUCTIONS

Feed according to your cat's weight and activity level. Transition gradually over 7 days if switching from a different brand. Always provide access to fresh water.

STORAGE

Store in a cool, dry place. Seal tightly to maintain maximum freshness.`,
                thumbnail_url: null,
                slug: "sensitive-stomach-formula",
                has_variants: false,
                original_price: 114000,
                discount: 10,
                discount_type: "percent",
                price: 102600,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 29,
                productCategories_id: 3,
                name_vi: "Vòng cổ da cao cấp",
                name_en: "Premium Leather Collar",
                summary_vi:
                    "Vòng cổ da cao cấp là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Premium Leather Collar offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `VÒNG CỔ DA CAO CẤP - PHỤ KIỆN THÚ CƯNG CAO CẤP

Nâng cấp cuộc sống hằng ngày của thú cưng với Vòng cổ da cao cấp. Sản phẩm được thiết kế cân bằng giữa công năng và thẩm mỹ, bền bỉ khi sử dụng lâu dài và giúp các hoạt động thường ngày trở nên dễ dàng, thú vị hơn cho cả bạn và thú cưng.

ĐẶC ĐIỂM NỔI BẬT

• Có thể điều chỉnh để đảm bảo sự thoải mái và an toàn tối đa.
• Phụ kiện kim loại bền chắc, chịu được lực kéo và sử dụng hằng ngày.

PHÙ HỢP VỚI

Phù hợp cho chó và mèo. Vui lòng tham khảo bảng kích thước nếu có để chọn size vừa vặn nhất.

BẢO DƯỠNG & CHĂM SÓC

Lau sạch bằng khăn ẩm. Không ngâm các bộ phận điện tử trong nước nếu sản phẩm có linh kiện điện tử.`,
                description_en: `PREMIUM LEATHER COLLAR - PREMIUM PET ACCESSORY

Upgrade your pet's lifestyle with the Premium Leather Collar. Designed with both functionality and aesthetics in mind, this accessory is built to last and make daily routines easier and more enjoyable for both you and your pet.

KEY FEATURES

• Adjustable fit to ensure maximum comfort and security.
• Durable hardware that withstands pulling and daily wear.

SUITABLE FOR

Cats and Dogs (Please refer to size charts where applicable to select the perfect fit).

MAINTENANCE & CARE

Wipe clean with a damp cloth. Do not submerge electronic parts in water if applicable.`,
                thumbnail_url: null,
                slug: "premium-leather-collar",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 30,
                productCategories_id: 3,
                name_vi: "Dây dắt phản quang",
                name_en: "Reflective Leash",
                summary_vi:
                    "Dây dắt phản quang là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Reflective Leash offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `DÂY DẮT PHẢN QUANG - PHỤ KIỆN THÚ CƯNG CAO CẤP

Nâng cấp cuộc sống hằng ngày của thú cưng với Dây dắt phản quang. Sản phẩm được thiết kế cân bằng giữa công năng và thẩm mỹ, bền bỉ khi sử dụng lâu dài và giúp các hoạt động thường ngày trở nên dễ dàng, thú vị hơn cho cả bạn và thú cưng.

ĐẶC ĐIỂM NỔI BẬT

• Thiết kế công thái học, thân thiện với thú cưng.
• Được làm từ chất liệu cao cấp và bền lâu.

PHÙ HỢP VỚI

Phù hợp cho chó và mèo. Vui lòng tham khảo bảng kích thước nếu có để chọn size vừa vặn nhất.

BẢO DƯỠNG & CHĂM SÓC

Lau sạch bằng khăn ẩm. Không ngâm các bộ phận điện tử trong nước nếu sản phẩm có linh kiện điện tử.`,
                description_en: `REFLECTIVE LEASH - PREMIUM PET ACCESSORY

Upgrade your pet's lifestyle with the Reflective Leash. Designed with both functionality and aesthetics in mind, this accessory is built to last and make daily routines easier and more enjoyable for both you and your pet.

KEY FEATURES

• Ergonomic and pet-friendly design.
• Made from premium, long-lasting materials.

SUITABLE FOR

Cats and Dogs (Please refer to size charts where applicable to select the perfect fit).

MAINTENANCE & CARE

Wipe clean with a damp cloth. Do not submerge electronic parts in water if applicable.`,
                thumbnail_url: null,
                slug: "reflective-leash",
                has_variants: false,
                original_price: 147000,
                discount: 10,
                discount_type: "percent",
                price: 132300,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 31,
                productCategories_id: 3,
                name_vi: "Áo khoác mùa đông cho thú cưng",
                name_en: "Winter Pet Jacket",
                summary_vi:
                    "Áo khoác mùa đông cho thú cưng là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Winter Pet Jacket offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `ÁO KHOÁC MÙA ĐÔNG CHO THÚ CƯNG - PHỤ KIỆN THÚ CƯNG CAO CẤP

Nâng cấp cuộc sống hằng ngày của thú cưng với Áo khoác mùa đông cho thú cưng. Sản phẩm được thiết kế cân bằng giữa công năng và thẩm mỹ, bền bỉ khi sử dụng lâu dài và giúp các hoạt động thường ngày trở nên dễ dàng, thú vị hơn cho cả bạn và thú cưng.

ĐẶC ĐIỂM NỔI BẬT

• Lớp ngoài chống thời tiết giúp bảo vệ thú cưng trước các yếu tố môi trường.
• Lớp lót mềm giúp hạn chế cọ xát gây khó chịu.

PHÙ HỢP VỚI

Phù hợp cho chó và mèo. Vui lòng tham khảo bảng kích thước nếu có để chọn size vừa vặn nhất.

BẢO DƯỠNG & CHĂM SÓC

Có thể giặt máy ở chế độ nhẹ. Nên phơi khô tự nhiên để giữ phom dáng sản phẩm.`,
                description_en: `WINTER PET JACKET - PREMIUM PET ACCESSORY

Upgrade your pet's lifestyle with the Winter Pet Jacket. Designed with both functionality and aesthetics in mind, this accessory is built to last and make daily routines easier and more enjoyable for both you and your pet.

KEY FEATURES

• Weather-resistant outer layer to protect against the elements.
• Soft inner lining to prevent chafing.

SUITABLE FOR

Cats and Dogs (Please refer to size charts where applicable to select the perfect fit).

MAINTENANCE & CARE

Machine washable on gentle cycle. Air dry recommended to maintain shape.`,
                thumbnail_url: null,
                slug: "winter-pet-jacket",
                has_variants: false,
                original_price: 122000,
                discount: 10,
                discount_type: "percent",
                price: 109800,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 32,
                productCategories_id: 3,
                name_vi: "Bát inox chống trượt",
                name_en: "Non-Slip Stainless Bowl",
                summary_vi:
                    "Bát inox chống trượt là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Non-Slip Stainless Bowl offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `BÁT INOX CHỐNG TRƯỢT - PHỤ KIỆN THÚ CƯNG CAO CẤP

Nâng cấp cuộc sống hằng ngày của thú cưng với Bát inox chống trượt. Sản phẩm được thiết kế cân bằng giữa công năng và thẩm mỹ, bền bỉ khi sử dụng lâu dài và giúp các hoạt động thường ngày trở nên dễ dàng, thú vị hơn cho cả bạn và thú cưng.

ĐẶC ĐIỂM NỔI BẬT

• Chất liệu đạt chuẩn thực phẩm, an toàn cho việc ăn uống hằng ngày.
• Thiết kế dễ vệ sinh và đảm bảo sạch sẽ.

PHÙ HỢP VỚI

Phù hợp cho chó và mèo. Vui lòng tham khảo bảng kích thước nếu có để chọn size vừa vặn nhất.

BẢO DƯỠNG & CHĂM SÓC

Có thể rửa bằng máy rửa chén, nên đặt ở khay trên. Vệ sinh thường xuyên để hạn chế vi khuẩn phát triển.`,
                description_en: `NON-SLIP STAINLESS BOWL - PREMIUM PET ACCESSORY

Upgrade your pet's lifestyle with the Non-Slip Stainless Bowl. Designed with both functionality and aesthetics in mind, this accessory is built to last and make daily routines easier and more enjoyable for both you and your pet.

KEY FEATURES

• Food-grade materials, completely safe for daily feeding.
• Easy to clean and hygienic design.

SUITABLE FOR

Cats and Dogs (Please refer to size charts where applicable to select the perfect fit).

MAINTENANCE & CARE

Dishwasher safe (top rack recommended). Wash regularly to prevent bacterial growth.`,
                thumbnail_url: null,
                slug: "non-slip-stainless-bowl",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 33,
                productCategories_id: 3,
                name_vi: "Đai yếm điều chỉnh được",
                name_en: "Adjustable Harness",
                summary_vi:
                    "Đai yếm điều chỉnh được là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Adjustable Harness offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `ĐAI YẾM ĐIỀU CHỈNH ĐƯỢC - PHỤ KIỆN THÚ CƯNG CAO CẤP

Nâng cấp cuộc sống hằng ngày của thú cưng với Đai yếm điều chỉnh được. Sản phẩm được thiết kế cân bằng giữa công năng và thẩm mỹ, bền bỉ khi sử dụng lâu dài và giúp các hoạt động thường ngày trở nên dễ dàng, thú vị hơn cho cả bạn và thú cưng.

ĐẶC ĐIỂM NỔI BẬT

• Thiết kế công thái học, thân thiện với thú cưng.
• Được làm từ chất liệu cao cấp và bền lâu.

PHÙ HỢP VỚI

Phù hợp cho chó và mèo. Vui lòng tham khảo bảng kích thước nếu có để chọn size vừa vặn nhất.

BẢO DƯỠNG & CHĂM SÓC

Lau sạch bằng khăn ẩm. Không ngâm các bộ phận điện tử trong nước nếu sản phẩm có linh kiện điện tử.`,
                description_en: `ADJUSTABLE HARNESS - PREMIUM PET ACCESSORY

Upgrade your pet's lifestyle with the Adjustable Harness. Designed with both functionality and aesthetics in mind, this accessory is built to last and make daily routines easier and more enjoyable for both you and your pet.

KEY FEATURES

• Ergonomic and pet-friendly design.
• Made from premium, long-lasting materials.

SUITABLE FOR

Cats and Dogs (Please refer to size charts where applicable to select the perfect fit).

MAINTENANCE & CARE

Wipe clean with a damp cloth. Do not submerge electronic parts in water if applicable.`,
                thumbnail_url: null,
                slug: "adjustable-harness",
                has_variants: false,
                original_price: 124000,
                discount: 10,
                discount_type: "percent",
                price: 111600,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 34,
                productCategories_id: 3,
                name_vi: "Túi vận chuyển thú cưng",
                name_en: "Pet Carrier Bag",
                summary_vi:
                    "Túi vận chuyển thú cưng là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Pet Carrier Bag offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `TÚI VẬN CHUYỂN THÚ CƯNG - PHỤ KIỆN THÚ CƯNG CAO CẤP

Nâng cấp cuộc sống hằng ngày của thú cưng với Túi vận chuyển thú cưng. Sản phẩm được thiết kế cân bằng giữa công năng và thẩm mỹ, bền bỉ khi sử dụng lâu dài và giúp các hoạt động thường ngày trở nên dễ dàng, thú vị hơn cho cả bạn và thú cưng.

ĐẶC ĐIỂM NỔI BẬT

• Kết cấu nhẹ nhưng chắc chắn, hỗ trợ vận chuyển an toàn.
• Thông thoáng tốt và giúp thú cưng dễ quan sát xung quanh.

PHÙ HỢP VỚI

Phù hợp cho chó và mèo. Vui lòng tham khảo bảng kích thước nếu có để chọn size vừa vặn nhất.

BẢO DƯỠNG & CHĂM SÓC

Lau sạch bằng khăn ẩm. Không ngâm các bộ phận điện tử trong nước nếu sản phẩm có linh kiện điện tử.`,
                description_en: `PET CARRIER BAG - PREMIUM PET ACCESSORY

Upgrade your pet's lifestyle with the Pet Carrier Bag. Designed with both functionality and aesthetics in mind, this accessory is built to last and make daily routines easier and more enjoyable for both you and your pet.

KEY FEATURES

• Lightweight yet sturdy construction for safe transport.
• Ample ventilation and visibility for your pet.

SUITABLE FOR

Cats and Dogs (Please refer to size charts where applicable to select the perfect fit).

MAINTENANCE & CARE

Wipe clean with a damp cloth. Do not submerge electronic parts in water if applicable.`,
                thumbnail_url: null,
                slug: "pet-carrier-bag",
                has_variants: false,
                original_price: 116000,
                discount: 10,
                discount_type: "percent",
                price: 104400,
                quantity: 100,
                reserved_quantity: 5,
                isActive: false,
                isDelete: true,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 35,
                productCategories_id: 3,
                name_vi: "Giường thú cưng êm ái",
                name_en: "Cozy Pet Bed",
                summary_vi:
                    "Giường thú cưng êm ái là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Cozy Pet Bed offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `GIƯỜNG THÚ CƯNG ÊM ÁI - PHỤ KIỆN THÚ CƯNG CAO CẤP

Nâng cấp cuộc sống hằng ngày của thú cưng với Giường thú cưng êm ái. Sản phẩm được thiết kế cân bằng giữa công năng và thẩm mỹ, bền bỉ khi sử dụng lâu dài và giúp các hoạt động thường ngày trở nên dễ dàng, thú vị hơn cho cả bạn và thú cưng.

ĐẶC ĐIỂM NỔI BẬT

• Chất liệu bông mềm mại giúp thú cưng ngủ sâu và thoải mái.
• Phần đế nâng đỡ giúp giảm áp lực lên khớp.

PHÙ HỢP VỚI

Phù hợp cho chó và mèo. Vui lòng tham khảo bảng kích thước nếu có để chọn size vừa vặn nhất.

BẢO DƯỠNG & CHĂM SÓC

Có thể giặt máy ở chế độ nhẹ. Nên phơi khô tự nhiên để giữ phom dáng sản phẩm.`,
                description_en: `COZY PET BED - PREMIUM PET ACCESSORY

Upgrade your pet's lifestyle with the Cozy Pet Bed. Designed with both functionality and aesthetics in mind, this accessory is built to last and make daily routines easier and more enjoyable for both you and your pet.

KEY FEATURES

• Ultra-soft plush material for deep, restful sleep.
• Supportive base to relieve pressure on joints.

SUITABLE FOR

Cats and Dogs (Please refer to size charts where applicable to select the perfect fit).

MAINTENANCE & CARE

Machine washable on gentle cycle. Air dry recommended to maintain shape.`,
                thumbnail_url: null,
                slug: "cozy-pet-bed",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 36,
                productCategories_id: 3,
                name_vi: "Tấm phủ ghế ô tô chống nước",
                name_en: "Waterproof Car Seat Cover",
                summary_vi:
                    "Tấm phủ ghế ô tô chống nước là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Waterproof Car Seat Cover offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `TẤM PHỦ GHẾ Ô TÔ CHỐNG NƯỚC - PHỤ KIỆN THÚ CƯNG CAO CẤP

Nâng cấp cuộc sống hằng ngày của thú cưng với Tấm phủ ghế ô tô chống nước. Sản phẩm được thiết kế cân bằng giữa công năng và thẩm mỹ, bền bỉ khi sử dụng lâu dài và giúp các hoạt động thường ngày trở nên dễ dàng, thú vị hơn cho cả bạn và thú cưng.

ĐẶC ĐIỂM NỔI BẬT

• Kết cấu nhẹ nhưng chắc chắn, hỗ trợ vận chuyển an toàn.
• Thông thoáng tốt và giúp thú cưng dễ quan sát xung quanh.

PHÙ HỢP VỚI

Phù hợp cho chó và mèo. Vui lòng tham khảo bảng kích thước nếu có để chọn size vừa vặn nhất.

BẢO DƯỠNG & CHĂM SÓC

Lau sạch bằng khăn ẩm. Không ngâm các bộ phận điện tử trong nước nếu sản phẩm có linh kiện điện tử.`,
                description_en: `WATERPROOF CAR SEAT COVER - PREMIUM PET ACCESSORY

Upgrade your pet's lifestyle with the Waterproof Car Seat Cover. Designed with both functionality and aesthetics in mind, this accessory is built to last and make daily routines easier and more enjoyable for both you and your pet.

KEY FEATURES

• Lightweight yet sturdy construction for safe transport.
• Ample ventilation and visibility for your pet.

SUITABLE FOR

Cats and Dogs (Please refer to size charts where applicable to select the perfect fit).

MAINTENANCE & CARE

Wipe clean with a damp cloth. Do not submerge electronic parts in water if applicable.`,
                thumbnail_url: null,
                slug: "waterproof-car-seat-cover",
                has_variants: false,
                original_price: 140000,
                discount: 10,
                discount_type: "percent",
                price: 126000,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 37,
                productCategories_id: 3,
                name_vi: "Vòng cổ LED cho chó",
                name_en: "LED Dog Collar",
                summary_vi:
                    "Vòng cổ LED cho chó là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium LED Dog Collar offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `VÒNG CỔ LED CHO CHÓ - PHỤ KIỆN THÚ CƯNG CAO CẤP

Nâng cấp cuộc sống hằng ngày của thú cưng với Vòng cổ LED cho chó. Sản phẩm được thiết kế cân bằng giữa công năng và thẩm mỹ, bền bỉ khi sử dụng lâu dài và giúp các hoạt động thường ngày trở nên dễ dàng, thú vị hơn cho cả bạn và thú cưng.

ĐẶC ĐIỂM NỔI BẬT

• Có thể điều chỉnh để đảm bảo sự thoải mái và an toàn tối đa.
• Phụ kiện kim loại bền chắc, chịu được lực kéo và sử dụng hằng ngày.
• Tính năng tăng khả năng nhận diện giúp đi dạo ban đêm an toàn hơn.

PHÙ HỢP VỚI

Phù hợp cho chó và mèo. Vui lòng tham khảo bảng kích thước nếu có để chọn size vừa vặn nhất.

BẢO DƯỠNG & CHĂM SÓC

Lau sạch bằng khăn ẩm. Không ngâm các bộ phận điện tử trong nước nếu sản phẩm có linh kiện điện tử.`,
                description_en: `LED DOG COLLAR - PREMIUM PET ACCESSORY

Upgrade your pet's lifestyle with the LED Dog Collar. Designed with both functionality and aesthetics in mind, this accessory is built to last and make daily routines easier and more enjoyable for both you and your pet.

KEY FEATURES

• Adjustable fit to ensure maximum comfort and security.
• Durable hardware that withstands pulling and daily wear.
• High visibility features for safe night-time walks.

SUITABLE FOR

Cats and Dogs (Please refer to size charts where applicable to select the perfect fit).

MAINTENANCE & CARE

Wipe clean with a damp cloth. Do not submerge electronic parts in water if applicable.`,
                thumbnail_url: null,
                slug: "led-dog-collar",
                has_variants: false,
                original_price: 141000,
                discount: 10,
                discount_type: "percent",
                price: 126900,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 38,
                productCategories_id: 3,
                name_vi: "Kệ nằm cửa sổ cho mèo",
                name_en: "Cat Window Perch",
                summary_vi:
                    "Kệ nằm cửa sổ cho mèo là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Cat Window Perch offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `KỆ NẰM CỬA SỔ CHO MÈO - PHỤ KIỆN THÚ CƯNG CAO CẤP

Nâng cấp cuộc sống hằng ngày của thú cưng với Kệ nằm cửa sổ cho mèo. Sản phẩm được thiết kế cân bằng giữa công năng và thẩm mỹ, bền bỉ khi sử dụng lâu dài và giúp các hoạt động thường ngày trở nên dễ dàng, thú vị hơn cho cả bạn và thú cưng.

ĐẶC ĐIỂM NỔI BẬT

• Chất liệu bông mềm mại giúp thú cưng ngủ sâu và thoải mái.
• Phần đế nâng đỡ giúp giảm áp lực lên khớp.

PHÙ HỢP VỚI

Phù hợp cho chó và mèo. Vui lòng tham khảo bảng kích thước nếu có để chọn size vừa vặn nhất.

BẢO DƯỠNG & CHĂM SÓC

Có thể giặt máy ở chế độ nhẹ. Nên phơi khô tự nhiên để giữ phom dáng sản phẩm.`,
                description_en: `CAT WINDOW PERCH - PREMIUM PET ACCESSORY

Upgrade your pet's lifestyle with the Cat Window Perch. Designed with both functionality and aesthetics in mind, this accessory is built to last and make daily routines easier and more enjoyable for both you and your pet.

KEY FEATURES

• Ultra-soft plush material for deep, restful sleep.
• Supportive base to relieve pressure on joints.

SUITABLE FOR

Cats and Dogs (Please refer to size charts where applicable to select the perfect fit).

MAINTENANCE & CARE

Machine washable on gentle cycle. Air dry recommended to maintain shape.`,
                thumbnail_url: null,
                slug: "cat-window-perch",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 39,
                productCategories_id: 3,
                name_vi: "Máy cho thú cưng ăn tự động",
                name_en: "Automatic Pet Feeder",
                summary_vi:
                    "Máy cho thú cưng ăn tự động là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Automatic Pet Feeder offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `MÁY CHO THÚ CƯNG ĂN TỰ ĐỘNG - PHỤ KIỆN THÚ CƯNG CAO CẤP

Nâng cấp cuộc sống hằng ngày của thú cưng với Máy cho thú cưng ăn tự động. Sản phẩm được thiết kế cân bằng giữa công năng và thẩm mỹ, bền bỉ khi sử dụng lâu dài và giúp các hoạt động thường ngày trở nên dễ dàng, thú vị hơn cho cả bạn và thú cưng.

ĐẶC ĐIỂM NỔI BẬT

• Chất liệu đạt chuẩn thực phẩm, an toàn cho việc ăn uống hằng ngày.
• Thiết kế dễ vệ sinh và đảm bảo sạch sẽ.

PHÙ HỢP VỚI

Phù hợp cho chó và mèo. Vui lòng tham khảo bảng kích thước nếu có để chọn size vừa vặn nhất.

BẢO DƯỠNG & CHĂM SÓC

Có thể rửa bằng máy rửa chén, nên đặt ở khay trên. Vệ sinh thường xuyên để hạn chế vi khuẩn phát triển.`,
                description_en: `AUTOMATIC PET FEEDER - PREMIUM PET ACCESSORY

Upgrade your pet's lifestyle with the Automatic Pet Feeder. Designed with both functionality and aesthetics in mind, this accessory is built to last and make daily routines easier and more enjoyable for both you and your pet.

KEY FEATURES

• Food-grade materials, completely safe for daily feeding.
• Easy to clean and hygienic design.

SUITABLE FOR

Cats and Dogs (Please refer to size charts where applicable to select the perfect fit).

MAINTENANCE & CARE

Dishwasher safe (top rack recommended). Wash regularly to prevent bacterial growth.`,
                thumbnail_url: null,
                slug: "automatic-pet-feeder",
                has_variants: false,
                original_price: 144000,
                discount: 10,
                discount_type: "percent",
                price: 129600,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 40,
                productCategories_id: 3,
                name_vi: "Đài phun nước cho thú cưng",
                name_en: "Pet Water Fountain",
                summary_vi:
                    "Đài phun nước cho thú cưng là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Pet Water Fountain offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `ĐÀI PHUN NƯỚC CHO THÚ CƯNG - PHỤ KIỆN THÚ CƯNG CAO CẤP

Nâng cấp cuộc sống hằng ngày của thú cưng với Đài phun nước cho thú cưng. Sản phẩm được thiết kế cân bằng giữa công năng và thẩm mỹ, bền bỉ khi sử dụng lâu dài và giúp các hoạt động thường ngày trở nên dễ dàng, thú vị hơn cho cả bạn và thú cưng.

ĐẶC ĐIỂM NỔI BẬT

• Chất liệu đạt chuẩn thực phẩm, an toàn cho việc ăn uống hằng ngày.
• Thiết kế dễ vệ sinh và đảm bảo sạch sẽ.

PHÙ HỢP VỚI

Phù hợp cho chó và mèo. Vui lòng tham khảo bảng kích thước nếu có để chọn size vừa vặn nhất.

BẢO DƯỠNG & CHĂM SÓC

Có thể rửa bằng máy rửa chén, nên đặt ở khay trên. Vệ sinh thường xuyên để hạn chế vi khuẩn phát triển.`,
                description_en: `PET WATER FOUNTAIN - PREMIUM PET ACCESSORY

Upgrade your pet's lifestyle with the Pet Water Fountain. Designed with both functionality and aesthetics in mind, this accessory is built to last and make daily routines easier and more enjoyable for both you and your pet.

KEY FEATURES

• Food-grade materials, completely safe for daily feeding.
• Easy to clean and hygienic design.

SUITABLE FOR

Cats and Dogs (Please refer to size charts where applicable to select the perfect fit).

MAINTENANCE & CARE

Dishwasher safe (top rack recommended). Wash regularly to prevent bacterial growth.`,
                thumbnail_url: null,
                slug: "pet-water-fountain",
                has_variants: false,
                original_price: 131000,
                discount: 10,
                discount_type: "percent",
                price: 117900,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 41,
                productCategories_id: 3,
                name_vi: "Bình nước du lịch cho thú cưng",
                name_en: "Travel Water Bottle",
                summary_vi:
                    "Bình nước du lịch cho thú cưng là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Travel Water Bottle offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `BÌNH NƯỚC DU LỊCH CHO THÚ CƯNG - PHỤ KIỆN THÚ CƯNG CAO CẤP

Nâng cấp cuộc sống hằng ngày của thú cưng với Bình nước du lịch cho thú cưng. Sản phẩm được thiết kế cân bằng giữa công năng và thẩm mỹ, bền bỉ khi sử dụng lâu dài và giúp các hoạt động thường ngày trở nên dễ dàng, thú vị hơn cho cả bạn và thú cưng.

ĐẶC ĐIỂM NỔI BẬT

• Chất liệu đạt chuẩn thực phẩm, an toàn cho việc ăn uống hằng ngày.
• Thiết kế dễ vệ sinh và đảm bảo sạch sẽ.

PHÙ HỢP VỚI

Phù hợp cho chó và mèo. Vui lòng tham khảo bảng kích thước nếu có để chọn size vừa vặn nhất.

BẢO DƯỠNG & CHĂM SÓC

Có thể rửa bằng máy rửa chén, nên đặt ở khay trên. Vệ sinh thường xuyên để hạn chế vi khuẩn phát triển.`,
                description_en: `TRAVEL WATER BOTTLE - PREMIUM PET ACCESSORY

Upgrade your pet's lifestyle with the Travel Water Bottle. Designed with both functionality and aesthetics in mind, this accessory is built to last and make daily routines easier and more enjoyable for both you and your pet.

KEY FEATURES

• Food-grade materials, completely safe for daily feeding.
• Easy to clean and hygienic design.

SUITABLE FOR

Cats and Dogs (Please refer to size charts where applicable to select the perfect fit).

MAINTENANCE & CARE

Dishwasher safe (top rack recommended). Wash regularly to prevent bacterial growth.`,
                thumbnail_url: null,
                slug: "travel-water-bottle",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 42,
                productCategories_id: 3,
                name_vi: "Xe đẩy thú cưng",
                name_en: "Pet Stroller",
                summary_vi:
                    "Xe đẩy thú cưng là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Pet Stroller offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `XE ĐẨY THÚ CƯNG - PHỤ KIỆN THÚ CƯNG CAO CẤP

Nâng cấp cuộc sống hằng ngày của thú cưng với Xe đẩy thú cưng. Sản phẩm được thiết kế cân bằng giữa công năng và thẩm mỹ, bền bỉ khi sử dụng lâu dài và giúp các hoạt động thường ngày trở nên dễ dàng, thú vị hơn cho cả bạn và thú cưng.

ĐẶC ĐIỂM NỔI BẬT

• Kết cấu nhẹ nhưng chắc chắn, hỗ trợ vận chuyển an toàn.
• Thông thoáng tốt và giúp thú cưng dễ quan sát xung quanh.

PHÙ HỢP VỚI

Phù hợp cho chó và mèo. Vui lòng tham khảo bảng kích thước nếu có để chọn size vừa vặn nhất.

BẢO DƯỠNG & CHĂM SÓC

Lau sạch bằng khăn ẩm. Không ngâm các bộ phận điện tử trong nước nếu sản phẩm có linh kiện điện tử.`,
                description_en: `PET STROLLER - PREMIUM PET ACCESSORY

Upgrade your pet's lifestyle with the Pet Stroller. Designed with both functionality and aesthetics in mind, this accessory is built to last and make daily routines easier and more enjoyable for both you and your pet.

KEY FEATURES

• Lightweight yet sturdy construction for safe transport.
• Ample ventilation and visibility for your pet.

SUITABLE FOR

Cats and Dogs (Please refer to size charts where applicable to select the perfect fit).

MAINTENANCE & CARE

Wipe clean with a damp cloth. Do not submerge electronic parts in water if applicable.`,
                thumbnail_url: null,
                slug: "pet-stroller",
                has_variants: false,
                original_price: 141000,
                discount: 10,
                discount_type: "percent",
                price: 126900,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 43,
                productCategories_id: 4,
                name_vi: "Bóng cao su nảy",
                name_en: "Bouncy Rubber Ball",
                summary_vi:
                    "Bóng cao su nảy là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Bouncy Rubber Ball offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `BÓNG CAO SU NẢY - ĐỒ CHƠI THÚ CƯNG HẤP DẪN

Giúp thú cưng tránh nhàm chán với Bóng cao su nảy! Đồ chơi rất cần thiết cho sức khỏe tinh thần và thể chất của thú cưng. Sản phẩm này được thiết kế để khơi gợi bản năng chơi tự nhiên và mang lại nhiều giờ giải trí.

LỢI ÍCH CHÍNH

• Phù hợp cho các trò chơi tương tác như nhặt bóng hoặc kéo co.
• Giúp tăng sự gắn kết giữa bạn và thú cưng.

PHÙ HỢP VỚI

Phù hợp cho nhiều giống chó. Hãy chọn kích thước phù hợp để tránh nguy cơ nuốt phải.

HƯỚNG DẪN AN TOÀN

Không có đồ chơi nào là không thể hỏng. Luôn giám sát thú cưng khi chơi. Kiểm tra đồ chơi thường xuyên và bỏ đi nếu có bộ phận bị lỏng hoặc hư hỏng.`,
                description_en: `BOUNCY RUBBER BALL - ENGAGING PET TOY

Keep boredom at bay with the Bouncy Rubber Ball! Toys are essential for a pet's mental and physical well-being. This toy is designed to trigger natural play instincts and provide hours of entertainment.

KEY BENEFITS

• Great for interactive fetch or tug-of-war games.
• Builds a stronger bond between you and your pet.

SUITABLE FOR

Dogs of various breeds (choose appropriate size to prevent swallowing hazards).

SAFETY INSTRUCTIONS

No toy is indestructible. Always supervise your pet during play. Inspect the toy regularly and discard if pieces become loose or damaged.`,
                thumbnail_url: null,
                slug: "bouncy-rubber-ball",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 44,
                productCategories_id: 4,
                name_vi: "Đồ chơi chuột bông",
                name_en: "Plush Mouse Toy",
                summary_vi:
                    "Đồ chơi chuột bông là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Plush Mouse Toy offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `ĐỒ CHƠI CHUỘT BÔNG - ĐỒ CHƠI THÚ CƯNG HẤP DẪN

Giúp thú cưng tránh nhàm chán với Đồ chơi chuột bông! Đồ chơi rất cần thiết cho sức khỏe tinh thần và thể chất của thú cưng. Sản phẩm này được thiết kế để khơi gợi bản năng chơi tự nhiên và mang lại nhiều giờ giải trí.

LỢI ÍCH CHÍNH

• Khuyến khích hành vi rình bắt, vồ mồi và vận động lành mạnh.
• Thiết kế nhẹ giúp mèo dễ vờn và hất đồ chơi.

PHÙ HỢP VỚI

Phù hợp cho mèo và mèo con ở mọi độ tuổi.

HƯỚNG DẪN AN TOÀN

Không có đồ chơi nào là không thể hỏng. Luôn giám sát thú cưng khi chơi. Kiểm tra đồ chơi thường xuyên và bỏ đi nếu có bộ phận bị lỏng hoặc hư hỏng.`,
                description_en: `PLUSH MOUSE TOY - ENGAGING PET TOY

Keep boredom at bay with the Plush Mouse Toy! Toys are essential for a pet's mental and physical well-being. This toy is designed to trigger natural play instincts and provide hours of entertainment.

KEY BENEFITS

• Encourages stalking, pouncing, and healthy exercise.
• Lightweight design makes it easy for cats to bat and toss.

SUITABLE FOR

Cats and kittens of all ages.

SAFETY INSTRUCTIONS

No toy is indestructible. Always supervise your pet during play. Inspect the toy regularly and discard if pieces become loose or damaged.`,
                thumbnail_url: null,
                slug: "plush-mouse-toy",
                has_variants: false,
                original_price: 147000,
                discount: 10,
                discount_type: "percent",
                price: 132300,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 45,
                productCategories_id: 4,
                name_vi: "Đồ chơi dây thừng kéo co",
                name_en: "Rope Tug Toy",
                summary_vi:
                    "Đồ chơi dây thừng kéo co là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Rope Tug Toy offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `ĐỒ CHƠI DÂY THỪNG KÉO CO - ĐỒ CHƠI THÚ CƯNG HẤP DẪN

Giúp thú cưng tránh nhàm chán với Đồ chơi dây thừng kéo co! Đồ chơi rất cần thiết cho sức khỏe tinh thần và thể chất của thú cưng. Sản phẩm này được thiết kế để khơi gợi bản năng chơi tự nhiên và mang lại nhiều giờ giải trí.

LỢI ÍCH CHÍNH

• Phù hợp cho các trò chơi tương tác như nhặt bóng hoặc kéo co.
• Giúp tăng sự gắn kết giữa bạn và thú cưng.

PHÙ HỢP VỚI

Phù hợp cho nhiều giống chó. Hãy chọn kích thước phù hợp để tránh nguy cơ nuốt phải.

HƯỚNG DẪN AN TOÀN

Không có đồ chơi nào là không thể hỏng. Luôn giám sát thú cưng khi chơi. Kiểm tra đồ chơi thường xuyên và bỏ đi nếu có bộ phận bị lỏng hoặc hư hỏng.`,
                description_en: `ROPE TUG TOY - ENGAGING PET TOY

Keep boredom at bay with the Rope Tug Toy! Toys are essential for a pet's mental and physical well-being. This toy is designed to trigger natural play instincts and provide hours of entertainment.

KEY BENEFITS

• Great for interactive fetch or tug-of-war games.
• Builds a stronger bond between you and your pet.

SUITABLE FOR

Dogs of various breeds (choose appropriate size to prevent swallowing hazards).

SAFETY INSTRUCTIONS

No toy is indestructible. Always supervise your pet during play. Inspect the toy regularly and discard if pieces become loose or damaged.`,
                thumbnail_url: null,
                slug: "rope-tug-toy",
                has_variants: false,
                original_price: 112000,
                discount: 10,
                discount_type: "percent",
                price: 100800,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 46,
                productCategories_id: 4,
                name_vi: "Cần câu lông vũ",
                name_en: "Feather Wand",
                summary_vi:
                    "Cần câu lông vũ là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Feather Wand offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `CẦN CÂU LÔNG VŨ - ĐỒ CHƠI THÚ CƯNG HẤP DẪN

Giúp thú cưng tránh nhàm chán với Cần câu lông vũ! Đồ chơi rất cần thiết cho sức khỏe tinh thần và thể chất của thú cưng. Sản phẩm này được thiết kế để khơi gợi bản năng chơi tự nhiên và mang lại nhiều giờ giải trí.

LỢI ÍCH CHÍNH

• Khuyến khích hành vi rình bắt, vồ mồi và vận động lành mạnh.
• Thiết kế nhẹ giúp mèo dễ vờn và hất đồ chơi.

PHÙ HỢP VỚI

Phù hợp cho mèo và mèo con ở mọi độ tuổi.

HƯỚNG DẪN AN TOÀN

Không có đồ chơi nào là không thể hỏng. Luôn giám sát thú cưng khi chơi. Kiểm tra đồ chơi thường xuyên và bỏ đi nếu có bộ phận bị lỏng hoặc hư hỏng.`,
                description_en: `FEATHER WAND - ENGAGING PET TOY

Keep boredom at bay with the Feather Wand! Toys are essential for a pet's mental and physical well-being. This toy is designed to trigger natural play instincts and provide hours of entertainment.

KEY BENEFITS

• Encourages stalking, pouncing, and healthy exercise.
• Lightweight design makes it easy for cats to bat and toss.

SUITABLE FOR

Cats and kittens of all ages.

SAFETY INSTRUCTIONS

No toy is indestructible. Always supervise your pet during play. Inspect the toy regularly and discard if pieces become loose or damaged.`,
                thumbnail_url: null,
                slug: "feather-wand",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 47,
                productCategories_id: 4,
                name_vi: "Đồ chơi trí tuệ tương tác",
                name_en: "Interactive Puzzle Toy",
                summary_vi:
                    "Đồ chơi trí tuệ tương tác là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Interactive Puzzle Toy offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `ĐỒ CHƠI TRÍ TUỆ TƯƠNG TÁC - ĐỒ CHƠI THÚ CƯNG HẤP DẪN

Giúp thú cưng tránh nhàm chán với Đồ chơi trí tuệ tương tác! Đồ chơi rất cần thiết cho sức khỏe tinh thần và thể chất của thú cưng. Sản phẩm này được thiết kế để khơi gợi bản năng chơi tự nhiên và mang lại nhiều giờ giải trí.

LỢI ÍCH CHÍNH

• Kích thích khả năng tư duy và kỹ năng giải quyết vấn đề.
• Giúp làm chậm tốc độ ăn nếu dùng kèm đồ ăn thưởng.
• Giúp giảm lo lắng bằng cách giữ thú cưng luôn được kích thích tinh thần.

PHÙ HỢP VỚI

Phù hợp cho nhiều giống chó. Hãy chọn kích thước phù hợp để tránh nguy cơ nuốt phải.

HƯỚNG DẪN AN TOÀN

Không có đồ chơi nào là không thể hỏng. Luôn giám sát thú cưng khi chơi. Kiểm tra đồ chơi thường xuyên và bỏ đi nếu có bộ phận bị lỏng hoặc hư hỏng.`,
                description_en: `INTERACTIVE PUZZLE TOY - ENGAGING PET TOY

Keep boredom at bay with the Interactive Puzzle Toy! Toys are essential for a pet's mental and physical well-being. This toy is designed to trigger natural play instincts and provide hours of entertainment.

KEY BENEFITS

• Stimulates cognitive function and problem-solving skills.
• Slows down fast eaters (if used with treats).
• Prevents anxiety by keeping your pet mentally occupied.

SUITABLE FOR

Dogs of various breeds (choose appropriate size to prevent swallowing hazards).

SAFETY INSTRUCTIONS

No toy is indestructible. Always supervise your pet during play. Inspect the toy regularly and discard if pieces become loose or damaged.`,
                thumbnail_url: null,
                slug: "interactive-puzzle-toy",
                has_variants: false,
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 48,
                productCategories_id: 4,
                name_vi: "Đồ chơi xương phát tiếng kêu",
                name_en: "Squeaky Bone Toy",
                summary_vi:
                    "Đồ chơi xương phát tiếng kêu là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Squeaky Bone Toy offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `ĐỒ CHƠI XƯƠNG PHÁT TIẾNG KÊU - ĐỒ CHƠI THÚ CƯNG HẤP DẪN

Giúp thú cưng tránh nhàm chán với Đồ chơi xương phát tiếng kêu! Đồ chơi rất cần thiết cho sức khỏe tinh thần và thể chất của thú cưng. Sản phẩm này được thiết kế để khơi gợi bản năng chơi tự nhiên và mang lại nhiều giờ giải trí.

LỢI ÍCH CHÍNH

• Đáp ứng nhu cầu nhai tự nhiên, giúp bảo vệ đồ nội thất.
• Chất liệu bền chịu được lực nhai mạnh.
• Bề mặt có kết cấu giúp mát-xa nướu và làm sạch răng.

PHÙ HỢP VỚI

Phù hợp cho nhiều giống chó. Hãy chọn kích thước phù hợp để tránh nguy cơ nuốt phải.

HƯỚNG DẪN AN TOÀN

Không có đồ chơi nào là không thể hỏng. Luôn giám sát thú cưng khi chơi. Kiểm tra đồ chơi thường xuyên và bỏ đi nếu có bộ phận bị lỏng hoặc hư hỏng.`,
                description_en: `SQUEAKY BONE TOY - ENGAGING PET TOY

Keep boredom at bay with the Squeaky Bone Toy! Toys are essential for a pet's mental and physical well-being. This toy is designed to trigger natural play instincts and provide hours of entertainment.

KEY BENEFITS

• Satisfies the natural urge to chew, protecting your furniture.
• Durable material withstands aggressive chewing.
• Textures help massage gums and clean teeth.

SUITABLE FOR

Dogs of various breeds (choose appropriate size to prevent swallowing hazards).

SAFETY INSTRUCTIONS

No toy is indestructible. Always supervise your pet during play. Inspect the toy regularly and discard if pieces become loose or damaged.`,
                thumbnail_url: null,
                slug: "squeaky-bone-toy",
                has_variants: false,
                original_price: 146000,
                discount: 10,
                discount_type: "percent",
                price: 131400,
                quantity: 100,
                reserved_quantity: 5,
                isActive: false,
                isDelete: true,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 49,
                productCategories_id: 4,
                name_vi: "Đồ chơi ôm đá có bạc hà mèo",
                name_en: "Catnip Kicker Toy",
                summary_vi:
                    "Đồ chơi ôm đá có bạc hà mèo là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Catnip Kicker Toy offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `ĐỒ CHƠI ÔM ĐÁ CÓ BẠC HÀ MÈO - ĐỒ CHƠI THÚ CƯNG HẤP DẪN

Giúp thú cưng tránh nhàm chán với Đồ chơi ôm đá có bạc hà mèo! Đồ chơi rất cần thiết cho sức khỏe tinh thần và thể chất của thú cưng. Sản phẩm này được thiết kế để khơi gợi bản năng chơi tự nhiên và mang lại nhiều giờ giải trí.

LỢI ÍCH CHÍNH

• Khuyến khích hành vi rình bắt, vồ mồi và vận động lành mạnh.
• Thiết kế nhẹ giúp mèo dễ vờn và hất đồ chơi.
• Có bạc hà mèo cao cấp giúp tăng sức hấp dẫn với mèo.

PHÙ HỢP VỚI

Phù hợp cho mèo và mèo con ở mọi độ tuổi.

HƯỚNG DẪN AN TOÀN

Không có đồ chơi nào là không thể hỏng. Luôn giám sát thú cưng khi chơi. Kiểm tra đồ chơi thường xuyên và bỏ đi nếu có bộ phận bị lỏng hoặc hư hỏng.`,
                description_en: `CATNIP KICKER TOY - ENGAGING PET TOY

Keep boredom at bay with the Catnip Kicker Toy! Toys are essential for a pet's mental and physical well-being. This toy is designed to trigger natural play instincts and provide hours of entertainment.

KEY BENEFITS

• Encourages stalking, pouncing, and healthy exercise.
• Lightweight design makes it easy for cats to bat and toss.
• Infused with premium catnip for irresistible attraction.

SUITABLE FOR

Cats and kittens of all ages.

SAFETY INSTRUCTIONS

No toy is indestructible. Always supervise your pet during play. Inspect the toy regularly and discard if pieces become loose or damaged.`,
                thumbnail_url: null,
                slug: "catnip-kicker-toy",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 50,
                productCategories_id: 4,
                name_vi: "Đồ chơi đèn laser",
                name_en: "Laser Pointer Toy",
                summary_vi:
                    "Đồ chơi đèn laser là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Laser Pointer Toy offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `ĐỒ CHƠI ĐÈN LASER - ĐỒ CHƠI THÚ CƯNG HẤP DẪN

Giúp thú cưng tránh nhàm chán với Đồ chơi đèn laser! Đồ chơi rất cần thiết cho sức khỏe tinh thần và thể chất của thú cưng. Sản phẩm này được thiết kế để khơi gợi bản năng chơi tự nhiên và mang lại nhiều giờ giải trí.

LỢI ÍCH CHÍNH

• Khuyến khích hành vi rình bắt, vồ mồi và vận động lành mạnh.
• Thiết kế nhẹ giúp mèo dễ vờn và hất đồ chơi.

PHÙ HỢP VỚI

Phù hợp cho mèo và mèo con ở mọi độ tuổi.

HƯỚNG DẪN AN TOÀN

Không có đồ chơi nào là không thể hỏng. Luôn giám sát thú cưng khi chơi. Kiểm tra đồ chơi thường xuyên và bỏ đi nếu có bộ phận bị lỏng hoặc hư hỏng.`,
                description_en: `LASER POINTER TOY - ENGAGING PET TOY

Keep boredom at bay with the Laser Pointer Toy! Toys are essential for a pet's mental and physical well-being. This toy is designed to trigger natural play instincts and provide hours of entertainment.

KEY BENEFITS

• Encourages stalking, pouncing, and healthy exercise.
• Lightweight design makes it easy for cats to bat and toss.

SUITABLE FOR

Cats and kittens of all ages.

SAFETY INSTRUCTIONS

No toy is indestructible. Always supervise your pet during play. Inspect the toy regularly and discard if pieces become loose or damaged.`,
                thumbnail_url: null,
                slug: "laser-pointer-toy",
                has_variants: false,
                original_price: 139000,
                discount: 10,
                discount_type: "percent",
                price: 125100,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 51,
                productCategories_id: 4,
                name_vi: "Vòng nhai cho thú cưng",
                name_en: "Chew Ring",
                summary_vi:
                    "Vòng nhai cho thú cưng là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Chew Ring offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `VÒNG NHAI CHO THÚ CƯNG - ĐỒ CHƠI THÚ CƯNG HẤP DẪN

Giúp thú cưng tránh nhàm chán với Vòng nhai cho thú cưng! Đồ chơi rất cần thiết cho sức khỏe tinh thần và thể chất của thú cưng. Sản phẩm này được thiết kế để khơi gợi bản năng chơi tự nhiên và mang lại nhiều giờ giải trí.

LỢI ÍCH CHÍNH

• Đáp ứng nhu cầu nhai tự nhiên, giúp bảo vệ đồ nội thất.
• Chất liệu bền chịu được lực nhai mạnh.
• Bề mặt có kết cấu giúp mát-xa nướu và làm sạch răng.

PHÙ HỢP VỚI

Phù hợp cho nhiều giống chó. Hãy chọn kích thước phù hợp để tránh nguy cơ nuốt phải.

HƯỚNG DẪN AN TOÀN

Không có đồ chơi nào là không thể hỏng. Luôn giám sát thú cưng khi chơi. Kiểm tra đồ chơi thường xuyên và bỏ đi nếu có bộ phận bị lỏng hoặc hư hỏng.`,
                description_en: `CHEW RING - ENGAGING PET TOY

Keep boredom at bay with the Chew Ring! Toys are essential for a pet's mental and physical well-being. This toy is designed to trigger natural play instincts and provide hours of entertainment.

KEY BENEFITS

• Satisfies the natural urge to chew, protecting your furniture.
• Durable material withstands aggressive chewing.
• Textures help massage gums and clean teeth.

SUITABLE FOR

Dogs of various breeds (choose appropriate size to prevent swallowing hazards).

SAFETY INSTRUCTIONS

No toy is indestructible. Always supervise your pet during play. Inspect the toy regularly and discard if pieces become loose or damaged.`,
                thumbnail_url: null,
                slug: "chew-ring",
                has_variants: false,
                original_price: 103000,
                discount: 10,
                discount_type: "percent",
                price: 92700,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 52,
                productCategories_id: 4,
                name_vi: "Đồ chơi nhả đồ ăn thưởng",
                name_en: "Treat Dispensing Toy",
                summary_vi:
                    "Đồ chơi nhả đồ ăn thưởng là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Treat Dispensing Toy offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `ĐỒ CHƠI NHẢ ĐỒ ĂN THƯỞNG - ĐỒ CHƠI THÚ CƯNG HẤP DẪN

Giúp thú cưng tránh nhàm chán với Đồ chơi nhả đồ ăn thưởng! Đồ chơi rất cần thiết cho sức khỏe tinh thần và thể chất của thú cưng. Sản phẩm này được thiết kế để khơi gợi bản năng chơi tự nhiên và mang lại nhiều giờ giải trí.

LỢI ÍCH CHÍNH

• Kích thích khả năng tư duy và kỹ năng giải quyết vấn đề.
• Giúp làm chậm tốc độ ăn nếu dùng kèm đồ ăn thưởng.
• Giúp giảm lo lắng bằng cách giữ thú cưng luôn được kích thích tinh thần.

PHÙ HỢP VỚI

Phù hợp cho nhiều giống chó. Hãy chọn kích thước phù hợp để tránh nguy cơ nuốt phải.

HƯỚNG DẪN AN TOÀN

Không có đồ chơi nào là không thể hỏng. Luôn giám sát thú cưng khi chơi. Kiểm tra đồ chơi thường xuyên và bỏ đi nếu có bộ phận bị lỏng hoặc hư hỏng.`,
                description_en: `TREAT DISPENSING TOY - ENGAGING PET TOY

Keep boredom at bay with the Treat Dispensing Toy! Toys are essential for a pet's mental and physical well-being. This toy is designed to trigger natural play instincts and provide hours of entertainment.

KEY BENEFITS

• Stimulates cognitive function and problem-solving skills.
• Slows down fast eaters (if used with treats).
• Prevents anxiety by keeping your pet mentally occupied.

SUITABLE FOR

Dogs of various breeds (choose appropriate size to prevent swallowing hazards).

SAFETY INSTRUCTIONS

No toy is indestructible. Always supervise your pet during play. Inspect the toy regularly and discard if pieces become loose or damaged.`,
                thumbnail_url: null,
                slug: "treat-dispensing-toy",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 53,
                productCategories_id: 4,
                name_vi: "Đường hầm vải sột soạt",
                name_en: "Crinkle Tunnel",
                summary_vi:
                    "Đường hầm vải sột soạt là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Crinkle Tunnel offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `ĐƯỜNG HẦM VẢI SỘT SOẠT - ĐỒ CHƠI THÚ CƯNG HẤP DẪN

Giúp thú cưng tránh nhàm chán với Đường hầm vải sột soạt! Đồ chơi rất cần thiết cho sức khỏe tinh thần và thể chất của thú cưng. Sản phẩm này được thiết kế để khơi gợi bản năng chơi tự nhiên và mang lại nhiều giờ giải trí.

LỢI ÍCH CHÍNH

• Phù hợp cho các trò chơi tương tác như nhặt bóng hoặc kéo co.
• Giúp tăng sự gắn kết giữa bạn và thú cưng.

PHÙ HỢP VỚI

Phù hợp cho nhiều giống chó. Hãy chọn kích thước phù hợp để tránh nguy cơ nuốt phải.

HƯỚNG DẪN AN TOÀN

Không có đồ chơi nào là không thể hỏng. Luôn giám sát thú cưng khi chơi. Kiểm tra đồ chơi thường xuyên và bỏ đi nếu có bộ phận bị lỏng hoặc hư hỏng.`,
                description_en: `CRINKLE TUNNEL - ENGAGING PET TOY

Keep boredom at bay with the Crinkle Tunnel! Toys are essential for a pet's mental and physical well-being. This toy is designed to trigger natural play instincts and provide hours of entertainment.

KEY BENEFITS

• Great for interactive fetch or tug-of-war games.
• Builds a stronger bond between you and your pet.

SUITABLE FOR

Dogs of various breeds (choose appropriate size to prevent swallowing hazards).

SAFETY INSTRUCTIONS

No toy is indestructible. Always supervise your pet during play. Inspect the toy regularly and discard if pieces become loose or damaged.`,
                thumbnail_url: null,
                slug: "crinkle-tunnel",
                has_variants: false,
                original_price: 132000,
                discount: 10,
                discount_type: "percent",
                price: 118800,
                quantity: 100,
                reserved_quantity: 5,
                isActive: false,
                isDelete: true,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 54,
                productCategories_id: 4,
                name_vi: "Đồ chơi laser tự động",
                name_en: "Automatic Laser Toy",
                summary_vi:
                    "Đồ chơi laser tự động là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Automatic Laser Toy offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `ĐỒ CHƠI LASER TỰ ĐỘNG - ĐỒ CHƠI THÚ CƯNG HẤP DẪN

Giúp thú cưng tránh nhàm chán với Đồ chơi laser tự động! Đồ chơi rất cần thiết cho sức khỏe tinh thần và thể chất của thú cưng. Sản phẩm này được thiết kế để khơi gợi bản năng chơi tự nhiên và mang lại nhiều giờ giải trí.

LỢI ÍCH CHÍNH

• Khuyến khích hành vi rình bắt, vồ mồi và vận động lành mạnh.
• Thiết kế nhẹ giúp mèo dễ vờn và hất đồ chơi.

PHÙ HỢP VỚI

Phù hợp cho mèo và mèo con ở mọi độ tuổi.

HƯỚNG DẪN AN TOÀN

Không có đồ chơi nào là không thể hỏng. Luôn giám sát thú cưng khi chơi. Kiểm tra đồ chơi thường xuyên và bỏ đi nếu có bộ phận bị lỏng hoặc hư hỏng.`,
                description_en: `AUTOMATIC LASER TOY - ENGAGING PET TOY

Keep boredom at bay with the Automatic Laser Toy! Toys are essential for a pet's mental and physical well-being. This toy is designed to trigger natural play instincts and provide hours of entertainment.

KEY BENEFITS

• Encourages stalking, pouncing, and healthy exercise.
• Lightweight design makes it easy for cats to bat and toss.

SUITABLE FOR

Cats and kittens of all ages.

SAFETY INSTRUCTIONS

No toy is indestructible. Always supervise your pet during play. Inspect the toy regularly and discard if pieces become loose or damaged.`,
                thumbnail_url: null,
                slug: "automatic-laser-toy",
                has_variants: false,
                original_price: 144000,
                discount: 10,
                discount_type: "percent",
                price: 129600,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 55,
                productCategories_id: 4,
                name_vi: "Bộ dụng cụ huấn luyện nhanh nhẹn",
                name_en: "Agility Training Kit",
                summary_vi:
                    "Bộ dụng cụ huấn luyện nhanh nhẹn là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Agility Training Kit offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `BỘ DỤNG CỤ HUẤN LUYỆN NHANH NHẸN - ĐỒ CHƠI THÚ CƯNG HẤP DẪN

Giúp thú cưng tránh nhàm chán với Bộ dụng cụ huấn luyện nhanh nhẹn! Đồ chơi rất cần thiết cho sức khỏe tinh thần và thể chất của thú cưng. Sản phẩm này được thiết kế để khơi gợi bản năng chơi tự nhiên và mang lại nhiều giờ giải trí.

LỢI ÍCH CHÍNH

• Phù hợp cho các trò chơi tương tác như nhặt bóng hoặc kéo co.
• Giúp tăng sự gắn kết giữa bạn và thú cưng.

PHÙ HỢP VỚI

Phù hợp cho nhiều giống chó. Hãy chọn kích thước phù hợp để tránh nguy cơ nuốt phải.

HƯỚNG DẪN AN TOÀN

Không có đồ chơi nào là không thể hỏng. Luôn giám sát thú cưng khi chơi. Kiểm tra đồ chơi thường xuyên và bỏ đi nếu có bộ phận bị lỏng hoặc hư hỏng.`,
                description_en: `AGILITY TRAINING KIT - ENGAGING PET TOY

Keep boredom at bay with the Agility Training Kit! Toys are essential for a pet's mental and physical well-being. This toy is designed to trigger natural play instincts and provide hours of entertainment.

KEY BENEFITS

• Great for interactive fetch or tug-of-war games.
• Builds a stronger bond between you and your pet.

SUITABLE FOR

Dogs of various breeds (choose appropriate size to prevent swallowing hazards).

SAFETY INSTRUCTIONS

No toy is indestructible. Always supervise your pet during play. Inspect the toy regularly and discard if pieces become loose or damaged.`,
                thumbnail_url: null,
                slug: "agility-training-kit",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 56,
                productCategories_id: 4,
                name_vi: "Đồ chơi nổi dưới nước",
                name_en: "Floating Water Toy",
                summary_vi:
                    "Đồ chơi nổi dưới nước là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Floating Water Toy offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `ĐỒ CHƠI NỔI DƯỚI NƯỚC - ĐỒ CHƠI THÚ CƯNG HẤP DẪN

Giúp thú cưng tránh nhàm chán với Đồ chơi nổi dưới nước! Đồ chơi rất cần thiết cho sức khỏe tinh thần và thể chất của thú cưng. Sản phẩm này được thiết kế để khơi gợi bản năng chơi tự nhiên và mang lại nhiều giờ giải trí.

LỢI ÍCH CHÍNH

• Phù hợp cho các trò chơi tương tác như nhặt bóng hoặc kéo co.
• Giúp tăng sự gắn kết giữa bạn và thú cưng.

PHÙ HỢP VỚI

Phù hợp cho nhiều giống chó. Hãy chọn kích thước phù hợp để tránh nguy cơ nuốt phải.

HƯỚNG DẪN AN TOÀN

Không có đồ chơi nào là không thể hỏng. Luôn giám sát thú cưng khi chơi. Kiểm tra đồ chơi thường xuyên và bỏ đi nếu có bộ phận bị lỏng hoặc hư hỏng.`,
                description_en: `FLOATING WATER TOY - ENGAGING PET TOY

Keep boredom at bay with the Floating Water Toy! Toys are essential for a pet's mental and physical well-being. This toy is designed to trigger natural play instincts and provide hours of entertainment.

KEY BENEFITS

• Great for interactive fetch or tug-of-war games.
• Builds a stronger bond between you and your pet.

SUITABLE FOR

Dogs of various breeds (choose appropriate size to prevent swallowing hazards).

SAFETY INSTRUCTIONS

No toy is indestructible. Always supervise your pet during play. Inspect the toy regularly and discard if pieces become loose or damaged.`,
                thumbnail_url: null,
                slug: "floating-water-toy",
                has_variants: false,
                original_price: 125000,
                discount: 10,
                discount_type: "percent",
                price: 112500,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 57,
                productCategories_id: 5,
                name_vi: "Sữa tắm khử mùi cho thú cưng",
                name_en: "Deodorizing Pet Shampoo",
                summary_vi:
                    "Sữa tắm khử mùi cho thú cưng là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Deodorizing Pet Shampoo offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `SỮA TẮM KHỬ MÙI CHO THÚ CƯNG - SẢN PHẨM CHĂM SÓC THÚ CƯNG CAO CẤP

Duy trì sức khỏe và vẻ ngoài sạch đẹp của thú cưng với Sữa tắm khử mùi cho thú cưng. Chăm sóc lông và vệ sinh đúng cách rất quan trọng để thú cưng khỏe mạnh, vui vẻ và giữ nhà cửa sạch sẽ. Sản phẩm mang lại hiệu quả chăm sóc chuyên nghiệp ngay tại nhà.

LỢI ÍCH CHÍNH

• Công thức cân bằng pH, được thiết kế riêng cho làn da nhạy cảm của thú cưng.
• Trung hòa mùi hiệu quả thay vì chỉ che lấp mùi.
• Giúp bộ lông mềm mại, bóng mượt và thơm sạch.

HƯỚNG DẪN SỬ DỤNG

Làm ướt toàn bộ lông. Thoa sản phẩm và mát-xa tạo bọt, tránh vùng mắt và tai. Xả sạch hoàn toàn bằng nước.`,
                description_en: `DEODORIZING PET SHAMPOO - PREMIUM PET CARE

Maintain your pet's health and appearance with Deodorizing Pet Shampoo. Proper grooming and hygiene are vital for a happy pet and a clean home. This product offers professional-grade results from the comfort of your house.

KEY BENEFITS

• pH-balanced formula specifically designed for pets' sensitive skin.
• Effectively neutralizes odors instead of just masking them.
• Leaves the coat soft, shiny, and smelling fresh.

USAGE INSTRUCTIONS

Wet coat thoroughly. Apply product and massage into a lather, avoiding eyes and ears. Rinse completely.`,
                thumbnail_url: null,
                slug: "deodorizing-pet-shampoo",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 58,
                productCategories_id: 5,
                name_vi: "Khăn lau vệ sinh cho thú cưng",
                name_en: "Pet Cleaning Wipes",
                summary_vi:
                    "Khăn lau vệ sinh cho thú cưng là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Pet Cleaning Wipes offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `KHĂN LAU VỆ SINH CHO THÚ CƯNG - SẢN PHẨM CHĂM SÓC THÚ CƯNG CAO CẤP

Duy trì sức khỏe và vẻ ngoài sạch đẹp của thú cưng với Khăn lau vệ sinh cho thú cưng. Chăm sóc lông và vệ sinh đúng cách rất quan trọng để thú cưng khỏe mạnh, vui vẻ và giữ nhà cửa sạch sẽ. Sản phẩm mang lại hiệu quả chăm sóc chuyên nghiệp ngay tại nhà.

LỢI ÍCH CHÍNH

• Công thức cân bằng pH, được thiết kế riêng cho làn da nhạy cảm của thú cưng.
• Trung hòa mùi hiệu quả thay vì chỉ che lấp mùi.
• Giúp bộ lông mềm mại, bóng mượt và thơm sạch.

HƯỚNG DẪN SỬ DỤNG

Làm ướt toàn bộ lông. Thoa sản phẩm và mát-xa tạo bọt, tránh vùng mắt và tai. Xả sạch hoàn toàn bằng nước.`,
                description_en: `PET CLEANING WIPES - PREMIUM PET CARE

Maintain your pet's health and appearance with Pet Cleaning Wipes. Proper grooming and hygiene are vital for a happy pet and a clean home. This product offers professional-grade results from the comfort of your house.

KEY BENEFITS

• pH-balanced formula specifically designed for pets' sensitive skin.
• Effectively neutralizes odors instead of just masking them.
• Leaves the coat soft, shiny, and smelling fresh.

USAGE INSTRUCTIONS

Wet coat thoroughly. Apply product and massage into a lather, avoiding eyes and ears. Rinse completely.`,
                thumbnail_url: null,
                slug: "pet-cleaning-wipes",
                has_variants: false,
                original_price: 114000,
                discount: 10,
                discount_type: "percent",
                price: 102600,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 59,
                productCategories_id: 5,
                name_vi: "Lược chải hai mặt",
                name_en: "Double-Sided Brush",
                summary_vi:
                    "Lược chải hai mặt là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Double-Sided Brush offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `LƯỢC CHẢI HAI MẶT - SẢN PHẨM CHĂM SÓC THÚ CƯNG CAO CẤP

Duy trì sức khỏe và vẻ ngoài sạch đẹp của thú cưng với Lược chải hai mặt. Chăm sóc lông và vệ sinh đúng cách rất quan trọng để thú cưng khỏe mạnh, vui vẻ và giữ nhà cửa sạch sẽ. Sản phẩm mang lại hiệu quả chăm sóc chuyên nghiệp ngay tại nhà.

LỢI ÍCH CHÍNH

• Loại bỏ hiệu quả lông rụng, lông vón và rối.
• Giúp giảm lượng lông rụng trong nhà.
• Tay cầm công thái học giúp giảm mỏi tay khi chải lông.

HƯỚNG DẪN SỬ DỤNG

Chải nhẹ theo chiều lông mọc. Chú ý kỹ các vùng dễ bị rối hoặc vón lông.`,
                description_en: `DOUBLE-SIDED BRUSH - PREMIUM PET CARE

Maintain your pet's health and appearance with Double-Sided Brush. Proper grooming and hygiene are vital for a happy pet and a clean home. This product offers professional-grade results from the comfort of your house.

KEY BENEFITS

• Effectively removes loose hair, mats, and tangles.
• Reduces shedding around the house.
• Ergonomic handle prevents hand fatigue during grooming sessions.

USAGE INSTRUCTIONS

Use gentle strokes in the direction of hair growth. Pay special attention to areas prone to matting.`,
                thumbnail_url: null,
                slug: "double-sided-brush",
                has_variants: false,
                original_price: 131000,
                discount: 10,
                discount_type: "percent",
                price: 117900,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 60,
                productCategories_id: 5,
                name_vi: "Bộ cắt móng cho thú cưng",
                name_en: "Nail Clipper Set",
                summary_vi:
                    "Bộ cắt móng cho thú cưng là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Nail Clipper Set offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `BỘ CẮT MÓNG CHO THÚ CƯNG - SẢN PHẨM CHĂM SÓC THÚ CƯNG CAO CẤP

Duy trì sức khỏe và vẻ ngoài sạch đẹp của thú cưng với Bộ cắt móng cho thú cưng. Chăm sóc lông và vệ sinh đúng cách rất quan trọng để thú cưng khỏe mạnh, vui vẻ và giữ nhà cửa sạch sẽ. Sản phẩm mang lại hiệu quả chăm sóc chuyên nghiệp ngay tại nhà.

LỢI ÍCH CHÍNH

• Loại bỏ hiệu quả lông rụng, lông vón và rối.
• Giúp giảm lượng lông rụng trong nhà.
• Tay cầm công thái học giúp giảm mỏi tay khi chải lông.

HƯỚNG DẪN SỬ DỤNG

Chải nhẹ theo chiều lông mọc. Chú ý kỹ các vùng dễ bị rối hoặc vón lông.`,
                description_en: `NAIL CLIPPER SET - PREMIUM PET CARE

Maintain your pet's health and appearance with Nail Clipper Set. Proper grooming and hygiene are vital for a happy pet and a clean home. This product offers professional-grade results from the comfort of your house.

KEY BENEFITS

• Effectively removes loose hair, mats, and tangles.
• Reduces shedding around the house.
• Ergonomic handle prevents hand fatigue during grooming sessions.

USAGE INSTRUCTIONS

Use gentle strokes in the direction of hair growth. Pay special attention to areas prone to matting.`,
                thumbnail_url: null,
                slug: "nail-clipper-set",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 61,
                productCategories_id: 5,
                name_vi: "Xịt phòng ve và bọ chét",
                name_en: "Flea & Tick Spray",
                summary_vi:
                    "Xịt phòng ve và bọ chét là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Flea & Tick Spray offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `XỊT PHÒNG VE VÀ BỌ CHÉT - SẢN PHẨM CHĂM SÓC THÚ CƯNG CAO CẤP

Duy trì sức khỏe và vẻ ngoài sạch đẹp của thú cưng với Xịt phòng ve và bọ chét. Chăm sóc lông và vệ sinh đúng cách rất quan trọng để thú cưng khỏe mạnh, vui vẻ và giữ nhà cửa sạch sẽ. Sản phẩm mang lại hiệu quả chăm sóc chuyên nghiệp ngay tại nhà.

LỢI ÍCH CHÍNH

• Dịu nhẹ và an toàn khi sử dụng thường xuyên.
• Hỗ trợ phòng ngừa các vấn đề sức khỏe thường gặp liên quan đến vệ sinh.

HƯỚNG DẪN SỬ DỤNG

Sử dụng theo hướng dẫn trên bao bì. Tham khảo ý kiến bác sĩ thú y nếu phát hiện tình trạng da bất thường.`,
                description_en: `FLEA & TICK SPRAY - PREMIUM PET CARE

Maintain your pet's health and appearance with Flea & Tick Spray. Proper grooming and hygiene are vital for a happy pet and a clean home. This product offers professional-grade results from the comfort of your house.

KEY BENEFITS

• Gentle and safe for routine use.
• Helps prevent common hygiene-related health issues.

USAGE INSTRUCTIONS

Use as directed on the packaging. Consult your vet if you notice any unusual skin conditions.`,
                thumbnail_url: null,
                slug: "flea-tick-spray",
                has_variants: false,
                original_price: 109000,
                discount: 10,
                discount_type: "percent",
                price: 98100,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 62,
                productCategories_id: 5,
                name_vi: "Dung dịch vệ sinh tai dạng nhỏ giọt",
                name_en: "Ear Cleansing Drops",
                summary_vi:
                    "Dung dịch vệ sinh tai dạng nhỏ giọt là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Ear Cleansing Drops offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `DUNG DỊCH VỆ SINH TAI DẠNG NHỎ GIỌT - SẢN PHẨM CHĂM SÓC THÚ CƯNG CAO CẤP

Duy trì sức khỏe và vẻ ngoài sạch đẹp của thú cưng với Dung dịch vệ sinh tai dạng nhỏ giọt. Chăm sóc lông và vệ sinh đúng cách rất quan trọng để thú cưng khỏe mạnh, vui vẻ và giữ nhà cửa sạch sẽ. Sản phẩm mang lại hiệu quả chăm sóc chuyên nghiệp ngay tại nhà.

LỢI ÍCH CHÍNH

• Dịu nhẹ và an toàn khi sử dụng thường xuyên.
• Hỗ trợ phòng ngừa các vấn đề sức khỏe thường gặp liên quan đến vệ sinh.

HƯỚNG DẪN SỬ DỤNG

Sử dụng theo hướng dẫn trên bao bì. Tham khảo ý kiến bác sĩ thú y nếu phát hiện tình trạng da bất thường.`,
                description_en: `EAR CLEANSING DROPS - PREMIUM PET CARE

Maintain your pet's health and appearance with Ear Cleansing Drops. Proper grooming and hygiene are vital for a happy pet and a clean home. This product offers professional-grade results from the comfort of your house.

KEY BENEFITS

• Gentle and safe for routine use.
• Helps prevent common hygiene-related health issues.

USAGE INSTRUCTIONS

Use as directed on the packaging. Consult your vet if you notice any unusual skin conditions.`,
                thumbnail_url: null,
                slug: "ear-cleansing-drops",
                has_variants: false,
                original_price: 145000,
                discount: 10,
                discount_type: "percent",
                price: 130500,
                quantity: 100,
                reserved_quantity: 5,
                isActive: false,
                isDelete: true,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 63,
                productCategories_id: 5,
                name_vi: "Dung dịch làm sạch vệt ố quanh mắt",
                name_en: "Tear Stain Remover",
                summary_vi:
                    "Dung dịch làm sạch vệt ố quanh mắt là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Tear Stain Remover offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `DUNG DỊCH LÀM SẠCH VỆT Ố QUANH MẮT - SẢN PHẨM CHĂM SÓC THÚ CƯNG CAO CẤP

Duy trì sức khỏe và vẻ ngoài sạch đẹp của thú cưng với Dung dịch làm sạch vệt ố quanh mắt. Chăm sóc lông và vệ sinh đúng cách rất quan trọng để thú cưng khỏe mạnh, vui vẻ và giữ nhà cửa sạch sẽ. Sản phẩm mang lại hiệu quả chăm sóc chuyên nghiệp ngay tại nhà.

LỢI ÍCH CHÍNH

• Dịu nhẹ và an toàn khi sử dụng thường xuyên.
• Hỗ trợ phòng ngừa các vấn đề sức khỏe thường gặp liên quan đến vệ sinh.

HƯỚNG DẪN SỬ DỤNG

Sử dụng theo hướng dẫn trên bao bì. Tham khảo ý kiến bác sĩ thú y nếu phát hiện tình trạng da bất thường.`,
                description_en: `TEAR STAIN REMOVER - PREMIUM PET CARE

Maintain your pet's health and appearance with Tear Stain Remover. Proper grooming and hygiene are vital for a happy pet and a clean home. This product offers professional-grade results from the comfort of your house.

KEY BENEFITS

• Gentle and safe for routine use.
• Helps prevent common hygiene-related health issues.

USAGE INSTRUCTIONS

Use as directed on the packaging. Consult your vet if you notice any unusual skin conditions.`,
                thumbnail_url: null,
                slug: "tear-stain-remover",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 64,
                productCategories_id: 5,
                name_vi: "Bộ bàn chải răng cho thú cưng",
                name_en: "Pet Toothbrush Kit",
                summary_vi:
                    "Bộ bàn chải răng cho thú cưng là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Pet Toothbrush Kit offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `BỘ BÀN CHẢI RĂNG CHO THÚ CƯNG - SẢN PHẨM CHĂM SÓC THÚ CƯNG CAO CẤP

Duy trì sức khỏe và vẻ ngoài sạch đẹp của thú cưng với Bộ bàn chải răng cho thú cưng. Chăm sóc lông và vệ sinh đúng cách rất quan trọng để thú cưng khỏe mạnh, vui vẻ và giữ nhà cửa sạch sẽ. Sản phẩm mang lại hiệu quả chăm sóc chuyên nghiệp ngay tại nhà.

LỢI ÍCH CHÍNH

• Loại bỏ hiệu quả lông rụng, lông vón và rối.
• Giúp giảm lượng lông rụng trong nhà.
• Tay cầm công thái học giúp giảm mỏi tay khi chải lông.

HƯỚNG DẪN SỬ DỤNG

Chải nhẹ theo chiều lông mọc. Chú ý kỹ các vùng dễ bị rối hoặc vón lông.`,
                description_en: `PET TOOTHBRUSH KIT - PREMIUM PET CARE

Maintain your pet's health and appearance with Pet Toothbrush Kit. Proper grooming and hygiene are vital for a happy pet and a clean home. This product offers professional-grade results from the comfort of your house.

KEY BENEFITS

• Effectively removes loose hair, mats, and tangles.
• Reduces shedding around the house.
• Ergonomic handle prevents hand fatigue during grooming sessions.

USAGE INSTRUCTIONS

Use gentle strokes in the direction of hair growth. Pay special attention to areas prone to matting.`,
                thumbnail_url: null,
                slug: "pet-toothbrush-kit",
                has_variants: false,
                original_price: 136000,
                discount: 10,
                discount_type: "percent",
                price: 122400,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 65,
                productCategories_id: 5,
                name_vi: "Dụng cụ loại bỏ lông rụng",
                name_en: "Deshedding Tool",
                summary_vi:
                    "Dụng cụ loại bỏ lông rụng là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Deshedding Tool offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `DỤNG CỤ LOẠI BỎ LÔNG RỤNG - SẢN PHẨM CHĂM SÓC THÚ CƯNG CAO CẤP

Duy trì sức khỏe và vẻ ngoài sạch đẹp của thú cưng với Dụng cụ loại bỏ lông rụng. Chăm sóc lông và vệ sinh đúng cách rất quan trọng để thú cưng khỏe mạnh, vui vẻ và giữ nhà cửa sạch sẽ. Sản phẩm mang lại hiệu quả chăm sóc chuyên nghiệp ngay tại nhà.

LỢI ÍCH CHÍNH

• Loại bỏ hiệu quả lông rụng, lông vón và rối.
• Giúp giảm lượng lông rụng trong nhà.
• Tay cầm công thái học giúp giảm mỏi tay khi chải lông.

HƯỚNG DẪN SỬ DỤNG

Chải nhẹ theo chiều lông mọc. Chú ý kỹ các vùng dễ bị rối hoặc vón lông.`,
                description_en: `DESHEDDING TOOL - PREMIUM PET CARE

Maintain your pet's health and appearance with Deshedding Tool. Proper grooming and hygiene are vital for a happy pet and a clean home. This product offers professional-grade results from the comfort of your house.

KEY BENEFITS

• Effectively removes loose hair, mats, and tangles.
• Reduces shedding around the house.
• Ergonomic handle prevents hand fatigue during grooming sessions.

USAGE INSTRUCTIONS

Use gentle strokes in the direction of hair growth. Pay special attention to areas prone to matting.`,
                thumbnail_url: null,
                slug: "deshedding-tool",
                has_variants: false,
                original_price: 102000,
                discount: 10,
                discount_type: "percent",
                price: 91800,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 66,
                productCategories_id: 5,
                name_vi: "Cát vệ sinh mèo bentonite",
                name_en: "Bentonite Cat Litter",
                summary_vi:
                    "Cát vệ sinh mèo bentonite là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Bentonite Cat Litter offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `CÁT VỆ SINH MÈO BENTONITE - SẢN PHẨM CHĂM SÓC THÚ CƯNG CAO CẤP

Duy trì sức khỏe và vẻ ngoài sạch đẹp của thú cưng với Cát vệ sinh mèo bentonite. Chăm sóc lông và vệ sinh đúng cách rất quan trọng để thú cưng khỏe mạnh, vui vẻ và giữ nhà cửa sạch sẽ. Sản phẩm mang lại hiệu quả chăm sóc chuyên nghiệp ngay tại nhà.

LỢI ÍCH CHÍNH

• Khả năng vón cục tốt giúp dễ xúc dọn.
• Kiểm soát mùi tối đa, giúp không gian sống thơm tho hơn.
• Công thức ít bụi giúp khu vực xung quanh sạch sẽ hơn.

HƯỚNG DẪN SỬ DỤNG

Đổ sản phẩm vào khay cát với độ dày khoảng 2-3 inch. Xúc dọn hằng ngày và thay mới hoàn toàn sau mỗi 2-4 tuần.`,
                description_en: `BENTONITE CAT LITTER - PREMIUM PET CARE

Maintain your pet's health and appearance with Bentonite Cat Litter. Proper grooming and hygiene are vital for a happy pet and a clean home. This product offers professional-grade results from the comfort of your house.

KEY BENEFITS

• Superior clumping action for easy scooping.
• Maximum odor control for a fresh-smelling home.
• Low-dust formula keeps the surrounding area clean.

USAGE INSTRUCTIONS

Fill litter box with 2-3 inches of product. Scoop daily and replace completely every 2-4 weeks.`,
                thumbnail_url: null,
                slug: "bentonite-cat-litter",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 67,
                productCategories_id: 5,
                name_vi: "Bột khử mùi khay cát",
                name_en: "Litter Box Deodorizer",
                summary_vi:
                    "Bột khử mùi khay cát là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Litter Box Deodorizer offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `BỘT KHỬ MÙI KHAY CÁT - SẢN PHẨM CHĂM SÓC THÚ CƯNG CAO CẤP

Duy trì sức khỏe và vẻ ngoài sạch đẹp của thú cưng với Bột khử mùi khay cát. Chăm sóc lông và vệ sinh đúng cách rất quan trọng để thú cưng khỏe mạnh, vui vẻ và giữ nhà cửa sạch sẽ. Sản phẩm mang lại hiệu quả chăm sóc chuyên nghiệp ngay tại nhà.

LỢI ÍCH CHÍNH

• Khả năng vón cục tốt giúp dễ xúc dọn.
• Kiểm soát mùi tối đa, giúp không gian sống thơm tho hơn.
• Công thức ít bụi giúp khu vực xung quanh sạch sẽ hơn.

HƯỚNG DẪN SỬ DỤNG

Đổ sản phẩm vào khay cát với độ dày khoảng 2-3 inch. Xúc dọn hằng ngày và thay mới hoàn toàn sau mỗi 2-4 tuần.`,
                description_en: `LITTER BOX DEODORIZER - PREMIUM PET CARE

Maintain your pet's health and appearance with Litter Box Deodorizer. Proper grooming and hygiene are vital for a happy pet and a clean home. This product offers professional-grade results from the comfort of your house.

KEY BENEFITS

• Superior clumping action for easy scooping.
• Maximum odor control for a fresh-smelling home.
• Low-dust formula keeps the surrounding area clean.

USAGE INSTRUCTIONS

Fill litter box with 2-3 inches of product. Scoop daily and replace completely every 2-4 weeks.`,
                thumbnail_url: null,
                slug: "litter-box-deodorizer",
                has_variants: false,
                original_price: 107000,
                discount: 10,
                discount_type: "percent",
                price: 96300,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 68,
                productCategories_id: 5,
                name_vi: "Sáp bảo vệ đệm chân",
                name_en: "Paw Protection Wax",
                summary_vi:
                    "Sáp bảo vệ đệm chân là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Paw Protection Wax offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `SÁP BẢO VỆ ĐỆM CHÂN - SẢN PHẨM CHĂM SÓC THÚ CƯNG CAO CẤP

Duy trì sức khỏe và vẻ ngoài sạch đẹp của thú cưng với Sáp bảo vệ đệm chân. Chăm sóc lông và vệ sinh đúng cách rất quan trọng để thú cưng khỏe mạnh, vui vẻ và giữ nhà cửa sạch sẽ. Sản phẩm mang lại hiệu quả chăm sóc chuyên nghiệp ngay tại nhà.

LỢI ÍCH CHÍNH

• Dịu nhẹ và an toàn khi sử dụng thường xuyên.
• Hỗ trợ phòng ngừa các vấn đề sức khỏe thường gặp liên quan đến vệ sinh.

HƯỚNG DẪN SỬ DỤNG

Sử dụng theo hướng dẫn trên bao bì. Tham khảo ý kiến bác sĩ thú y nếu phát hiện tình trạng da bất thường.`,
                description_en: `PAW PROTECTION WAX - PREMIUM PET CARE

Maintain your pet's health and appearance with Paw Protection Wax. Proper grooming and hygiene are vital for a happy pet and a clean home. This product offers professional-grade results from the comfort of your house.

KEY BENEFITS

• Gentle and safe for routine use.
• Helps prevent common hygiene-related health issues.

USAGE INSTRUCTIONS

Use as directed on the packaging. Consult your vet if you notice any unusual skin conditions.`,
                thumbnail_url: null,
                slug: "paw-protection-wax",
                has_variants: false,
                original_price: 141000,
                discount: 10,
                discount_type: "percent",
                price: 126900,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 69,
                productCategories_id: 5,
                name_vi: "Găng tay chải lông",
                name_en: "Grooming Glove",
                summary_vi:
                    "Găng tay chải lông là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Grooming Glove offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `GĂNG TAY CHẢI LÔNG - SẢN PHẨM CHĂM SÓC THÚ CƯNG CAO CẤP

Duy trì sức khỏe và vẻ ngoài sạch đẹp của thú cưng với Găng tay chải lông. Chăm sóc lông và vệ sinh đúng cách rất quan trọng để thú cưng khỏe mạnh, vui vẻ và giữ nhà cửa sạch sẽ. Sản phẩm mang lại hiệu quả chăm sóc chuyên nghiệp ngay tại nhà.

LỢI ÍCH CHÍNH

• Loại bỏ hiệu quả lông rụng, lông vón và rối.
• Giúp giảm lượng lông rụng trong nhà.
• Tay cầm công thái học giúp giảm mỏi tay khi chải lông.

HƯỚNG DẪN SỬ DỤNG

Chải nhẹ theo chiều lông mọc. Chú ý kỹ các vùng dễ bị rối hoặc vón lông.`,
                description_en: `GROOMING GLOVE - PREMIUM PET CARE

Maintain your pet's health and appearance with Grooming Glove. Proper grooming and hygiene are vital for a happy pet and a clean home. This product offers professional-grade results from the comfort of your house.

KEY BENEFITS

• Effectively removes loose hair, mats, and tangles.
• Reduces shedding around the house.
• Ergonomic handle prevents hand fatigue during grooming sessions.

USAGE INSTRUCTIONS

Use gentle strokes in the direction of hair growth. Pay special attention to areas prone to matting.`,
                thumbnail_url: null,
                slug: "grooming-glove",
                has_variants: true,
                original_price: 0,
                discount: 0,
                discount_type: "percent",
                price: 0,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
            {
                product_id: 70,
                productCategories_id: 5,
                name_vi: "Khăn lau cho thú cưng",
                name_en: "Pet Towel",
                summary_vi:
                    "Khăn lau cho thú cưng là sản phẩm cao cấp, mang lại giá trị tốt và chất lượng đáng tin cậy cho thú cưng. Phù hợp sử dụng hằng ngày, hỗ trợ thú cưng luôn vui vẻ và khỏe mạnh.",
                summary_en:
                    "Premium Pet Towel offering excellent value and quality for your pet. Perfect for everyday use and ensuring your pet's happiness and health.",
                description_vi: `KHĂN LAU CHO THÚ CƯNG - SẢN PHẨM CHĂM SÓC THÚ CƯNG CAO CẤP

Duy trì sức khỏe và vẻ ngoài sạch đẹp của thú cưng với Khăn lau cho thú cưng. Chăm sóc lông và vệ sinh đúng cách rất quan trọng để thú cưng khỏe mạnh, vui vẻ và giữ nhà cửa sạch sẽ. Sản phẩm mang lại hiệu quả chăm sóc chuyên nghiệp ngay tại nhà.

LỢI ÍCH CHÍNH

• Dịu nhẹ và an toàn khi sử dụng thường xuyên.
• Hỗ trợ phòng ngừa các vấn đề sức khỏe thường gặp liên quan đến vệ sinh.

HƯỚNG DẪN SỬ DỤNG

Sử dụng theo hướng dẫn trên bao bì. Tham khảo ý kiến bác sĩ thú y nếu phát hiện tình trạng da bất thường.`,
                description_en: `PET TOWEL - PREMIUM PET CARE

Maintain your pet's health and appearance with Pet Towel. Proper grooming and hygiene are vital for a happy pet and a clean home. This product offers professional-grade results from the comfort of your house.

KEY BENEFITS

• Gentle and safe for routine use.
• Helps prevent common hygiene-related health issues.

USAGE INSTRUCTIONS

Use as directed on the packaging. Consult your vet if you notice any unusual skin conditions.`,
                thumbnail_url: null,
                slug: "pet-towel",
                has_variants: false,
                original_price: 105000,
                discount: 10,
                discount_type: "percent",
                price: 94500,
                quantity: 100,
                reserved_quantity: 5,
                isActive: true,
                isDelete: false,
                created_at: now,
                updated_at: now,
            },
        ]);

        // 3. Insert Product Variants
        await queryInterface.bulkInsert("productVariants", [
            {
                productVariant_id: 1,
                product_id: 1,
                sku: "SKU-1-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 0,
                reserved_quantity: 0,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 2,
                product_id: 1,
                sku: "SKU-1-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 3,
                reserved_quantity: 0,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 3,
                product_id: 1,
                sku: "SKU-1-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: false,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 4,
                product_id: 4,
                sku: "SKU-4-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 5,
                product_id: 4,
                sku: "SKU-4-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 6,
                product_id: 4,
                sku: "SKU-4-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 7,
                product_id: 7,
                sku: "SKU-7-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 8,
                product_id: 7,
                sku: "SKU-7-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 9,
                product_id: 7,
                sku: "SKU-7-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 10,
                product_id: 10,
                sku: "SKU-10-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 11,
                product_id: 10,
                sku: "SKU-10-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 12,
                product_id: 10,
                sku: "SKU-10-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 13,
                product_id: 13,
                sku: "SKU-13-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 14,
                product_id: 13,
                sku: "SKU-13-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 15,
                product_id: 13,
                sku: "SKU-13-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 16,
                product_id: 15,
                sku: "SKU-15-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 17,
                product_id: 15,
                sku: "SKU-15-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 18,
                product_id: 15,
                sku: "SKU-15-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 19,
                product_id: 18,
                sku: "SKU-18-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 20,
                product_id: 18,
                sku: "SKU-18-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 21,
                product_id: 18,
                sku: "SKU-18-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 22,
                product_id: 21,
                sku: "SKU-21-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 23,
                product_id: 21,
                sku: "SKU-21-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 24,
                product_id: 21,
                sku: "SKU-21-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 25,
                product_id: 24,
                sku: "SKU-24-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 26,
                product_id: 24,
                sku: "SKU-24-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 27,
                product_id: 24,
                sku: "SKU-24-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 28,
                product_id: 27,
                sku: "SKU-27-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 29,
                product_id: 27,
                sku: "SKU-27-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 30,
                product_id: 27,
                sku: "SKU-27-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 34,
                product_id: 32,
                sku: "SKU-32-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 35,
                product_id: 32,
                sku: "SKU-32-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 36,
                product_id: 32,
                sku: "SKU-32-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 37,
                product_id: 35,
                sku: "SKU-35-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 38,
                product_id: 35,
                sku: "SKU-35-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 39,
                product_id: 35,
                sku: "SKU-35-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 40,
                product_id: 38,
                sku: "SKU-38-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 41,
                product_id: 38,
                sku: "SKU-38-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 42,
                product_id: 38,
                sku: "SKU-38-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 43,
                product_id: 41,
                sku: "SKU-41-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 44,
                product_id: 41,
                sku: "SKU-41-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 45,
                product_id: 41,
                sku: "SKU-41-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 46,
                product_id: 43,
                sku: "SKU-43-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 47,
                product_id: 43,
                sku: "SKU-43-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 48,
                product_id: 43,
                sku: "SKU-43-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 49,
                product_id: 46,
                sku: "SKU-46-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 50,
                product_id: 46,
                sku: "SKU-46-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 51,
                product_id: 46,
                sku: "SKU-46-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 52,
                product_id: 49,
                sku: "SKU-49-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 53,
                product_id: 49,
                sku: "SKU-49-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 54,
                product_id: 49,
                sku: "SKU-49-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 55,
                product_id: 52,
                sku: "SKU-52-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 56,
                product_id: 52,
                sku: "SKU-52-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 57,
                product_id: 52,
                sku: "SKU-52-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 58,
                product_id: 55,
                sku: "SKU-55-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 59,
                product_id: 55,
                sku: "SKU-55-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 60,
                product_id: 55,
                sku: "SKU-55-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 61,
                product_id: 57,
                sku: "SKU-57-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 62,
                product_id: 57,
                sku: "SKU-57-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 63,
                product_id: 57,
                sku: "SKU-57-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 64,
                product_id: 60,
                sku: "SKU-60-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 65,
                product_id: 60,
                sku: "SKU-60-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 66,
                product_id: 60,
                sku: "SKU-60-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 67,
                product_id: 63,
                sku: "SKU-63-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 68,
                product_id: 63,
                sku: "SKU-63-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 69,
                product_id: 63,
                sku: "SKU-63-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 70,
                product_id: 66,
                sku: "SKU-66-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 71,
                product_id: 66,
                sku: "SKU-66-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 72,
                product_id: 66,
                sku: "SKU-66-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 73,
                product_id: 69,
                sku: "SKU-69-S",
                variant_label: "Size S",
                pet_weight: null,
                color: "Standard",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 74,
                product_id: 69,
                sku: "SKU-69-M",
                variant_label: "Size M",
                pet_weight: null,
                color: "Standard",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 75,
                product_id: 69,
                sku: "SKU-69-L",
                variant_label: "Size L",
                pet_weight: null,
                color: "Standard",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 80,
                product_id: 29,
                sku: "SKU-29-S-RED",
                variant_label: "Size S - Red",
                pet_weight: null,
                color: "Red",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 81,
                product_id: 29,
                sku: "SKU-29-S-BLUE",
                variant_label: "Size S - Blue",
                pet_weight: null,
                color: "Blue",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 82,
                product_id: 29,
                sku: "SKU-29-S-BLACK",
                variant_label: "Size S - Black",
                pet_weight: null,
                color: "Black",
                size: "S",
                original_price: 80000,
                discount: 10,
                discount_type: "percent",
                price: 72000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 83,
                product_id: 29,
                sku: "SKU-29-M-RED",
                variant_label: "Size M - Red",
                pet_weight: null,
                color: "Red",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 84,
                product_id: 29,
                sku: "SKU-29-M-BLUE",
                variant_label: "Size M - Blue",
                pet_weight: null,
                color: "Blue",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 85,
                product_id: 29,
                sku: "SKU-29-M-BLACK",
                variant_label: "Size M - Black",
                pet_weight: null,
                color: "Black",
                size: "M",
                original_price: 100000,
                discount: 10,
                discount_type: "percent",
                price: 90000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 86,
                product_id: 29,
                sku: "SKU-29-L-RED",
                variant_label: "Size L - Red",
                pet_weight: null,
                color: "Red",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 87,
                product_id: 29,
                sku: "SKU-29-L-BLUE",
                variant_label: "Size L - Blue",
                pet_weight: null,
                color: "Blue",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
            {
                productVariant_id: 88,
                product_id: 29,
                sku: "SKU-29-L-BLACK",
                variant_label: "Size L - Black",
                pet_weight: null,
                color: "Black",
                size: "L",
                original_price: 120000,
                discount: 10,
                discount_type: "percent",
                price: 108000,
                quantity: 50,
                reserved_quantity: 2,
                isActive: true,
                created_at: now,
                updated_at: now,
            },
        ]);

        // 4. Insert Product Media
        await queryInterface.bulkInsert("media", [
            {
                entity_type: "product",
                entity_id: "1",
                url: "https://tse2.mm.bing.net/th/id/OIP.B7FsG4CpyvBG5FNGT9zvUQHaKl?rs=1&pid=ImgDetMain&o=7&rm=3",
                is_main: true,
                alt_text: "Premium Beef Kibble",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "2",
                url: "https://iandloveandyou.com/cdn/shop/files/818336012297_-_Naked_Essentials_Puppy_Chicken_Sweet_Potato_4_lb_-_FRONT_1.png?v=1762441431&width=1050",
                is_main: true,
                alt_text: "Puppy Growth Formula",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "3",
                url: "https://petsvillelb.com/wp-content/uploads/2023/09/download-13.jpg",
                is_main: true,
                alt_text: "Adult Dog Chicken Pate",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "4",
                url: "https://tse1.mm.bing.net/th/id/OIP.d8-6tkDVxTTs9yl9qg8CvQHaLY?rs=1&pid=ImgDetMain&o=7&rm=3",
                is_main: true,
                alt_text: "Senior Dog Formula",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "5",
                url: "https://th.bing.com/th/id/OIP.FqM9JTVY1NBw0jFSI8afwQHaHa?w=185&h=185&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Grain-Free Salmon Mix",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "6",
                url: "https://th.bing.com/th/id/OIP.G3wsl4bxJleWww7-mQfK7gHaHa?w=187&h=188&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Digestive Health Dog Food",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "7",
                url: "https://cdn.shoplightspeed.com/shops/624999/files/18950253/1652x2313x2/nutrisource-nutrisource-dog-food-weight-management.jpg",
                is_main: true,
                alt_text: "Weight Management Dog Food",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "8",
                url: "https://th.bing.com/th/id/OIP.qvL50uXdhCbV40Pxr3hosgHaGc?w=220&h=191&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Skin & Coat Care Kibble",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "9",
                url: "https://th.bing.com/th/id/OIP.3kvImzE8swo5DuBlrZ4ePQHaHa?w=187&h=187&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Large Breed Dog Food",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "10",
                url: "https://th.bing.com/th/id/OIP.UYM5Ba80rCEzf0rEabW1uAHaHa?w=190&h=190&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Small Breed Dog Food",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "11",
                url: "https://th.bing.com/th/id/OIP.feOokIkodWrPQwrTFR_nwAHaHa?w=200&h=200&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Wet Dog Food Canned",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "12",
                url: "https://th.bing.com/th/id/OIP.k8-sLH8d_N5RAZFcLF4NXwHaJK?w=165&h=205&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Organic Dog Treats",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "13",
                url: "https://a.assecobs.com/_img/happet/63818079-e24f-4c3a-b6b0-b057f3d56e65/fb01-functional-dental-bone-12cm-1-pc-.jpg?w=700",
                is_main: true,
                alt_text: "Dental Care Dog Chews",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "14",
                url: "https://i5.walmartimages.com/seo/GR-16OZ-CHICKEN-JERKY_fbc1c7a5-02dc-4cfb-87d8-6722a5a6a955.e13bd932ec5a1bfc66874a8bc648987c.jpeg?odnHeight=600&odnWidth=600&odnBg=FFFFFF",
                is_main: true,
                alt_text: "Training Treats",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "15",
                url: "https://kitcat.com.sg/wp-content/uploads/2018/06/KITCAT-MILK-FOR-KITTENS-1536x1536.jpg",
                is_main: true,
                alt_text: "Kitten Milk Replacer",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "16",
                url: "https://www.whiskas.in/cdn-cgi/image/format=auto,q=90/sites/g/files/fnmzdf7971/files/2025-07/7590398-3-whiskas-nova-with-tuna-in-jelly-adult-dcr-3d-80g-fop.png",
                is_main: true,
                alt_text: "Adult Cat Tuna Mix",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "17",
                url: "https://www.bpetcare.com/wp-content/uploads/2024/04/KF-pate-deilight-cat-90g.png",
                is_main: true,
                alt_text: "Salmon Delight Cat Pate",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "18",
                url: "https://amarpet.com/_next/image?url=https%3A%2F%2Fapn081-amarpet-prod.sgp1.cdn.digitaloceanspaces.com%2F747c1bcceb6109a4ef936bc70cfe67de%2FMaxpet-Adult-Cat-Food-Chicken-1kg.png&w=640&q=75",
                is_main: true,
                alt_text: "Hairball Control Kibble",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "19",
                url: "https://th.bing.com/th/id/OIP.fhuF0mi143mVC9sJi89tnAHaHa?w=176&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Urinary Health Cat Food",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "20",
                url: "https://th.bing.com/th/id/OIP.jH7Mqxexof6SK2MKuv6qgwHaHa?w=190&h=190&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Indoor Cat Formula",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "21",
                url: "https://www.acana.com/dw/image/v2/BFDW_PRD/on/demandware.static/-/Sites-acana-na-master-catalog/en_CA/dw61aeb34d/ACA%20Premium%20Pate%20Dog%20Food/ACANA%20Premium%20Pate%20Beef%20Recipe%20Wet%20Dog%20Front%2012.8oz%20USA-1.png?sw=450",
                is_main: true,
                alt_text: "Grain-Free Cat Food",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "22",
                url: "https://th.bing.com/th/id/OIP.vQzUGF5reN-mSqC5JfvQCwHaFa?w=273&h=199&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Senior Cat Wet Food",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "23",
                url: "https://th.bing.com/th/id/OIP.XsL7HhkhJzlTvbgAYKgZKQHaHa?w=200&h=200&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Catnip Flavored Treats",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "24",
                url: "https://th.bing.com/th/id/OIP.3B1ZJkVFVq-5N59w5WGJzwHaHa?w=200&h=200&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Freeze-Dried Chicken Treats",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "25",
                url: "https://th.bing.com/th/id/OIP.X2jFiA56jcF9-93sGsG5rwHaHa?w=164&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Gourmet Seafood Medley",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "26",
                url: "https://tse2.mm.bing.net/th/id/OIP.eciSKGg2-pjMOa8kc3cGFgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
                is_main: true,
                alt_text: "Dental Cat Snacks",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "27",
                url: "https://th.bing.com/th/id/OIP.BazZqWwBGg_lYRUysaDXcAHaHa?w=194&h=194&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Weight Control Cat Food",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "28",
                url: "https://i5.walmartimages.com/asr/d83c7727-94a5-4f61-b181-39d19bd89b95_1.bbb6b55d78da325fc46ba603298e835b.jpeg",
                is_main: true,
                alt_text: "Sensitive Stomach Formula",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "29",
                url: "https://cdn.shopify.com/s/files/1/1088/7528/files/brown-luxury-cat-collar-2025.jpg?v=1758498044",
                is_main: true,
                alt_text: "Premium Leather Collar",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "30",
                url: "https://ollydog.com/cdn/shop/files/OllyDog_Rubber_Grip_Reflective_Leash_Safety_Adventure_Carabiner_7.jpg?v=1747194162&width=1000",
                is_main: true,
                alt_text: "Reflective Leash",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "31",
                url: "https://i.ebayimg.com/images/g/YAwAAOSwaBNjoeTd/s-l1600.webp",
                is_main: true,
                alt_text: "Winter Pet Jacket",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "32",
                url: "https://danhchobeyeu.com/media/cache/data/IMG_7574-450x450.png",
                is_main: true,
                alt_text: "Non-Slip Stainless Bowl",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "33",
                url: "https://th.bing.com/th/id/OIP.63ZfW_B7Wc8xJoRCegUF2wHaHa?w=203&h=203&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Adjustable Harness",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "34",
                url: "https://m.media-amazon.com/images/I/81DfOyykwzL._AC_SL1500_.jpg",
                is_main: true,
                alt_text: "Pet Carrier Bag",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "35",
                url: "https://m.media-amazon.com/images/I/91HkNdBl57L._AC_SL1500_.jpg",
                is_main: true,
                alt_text: "Cozy Pet Bed",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "36",
                url: "https://www.centinelafeed.com/on/demandware.static/-/Sites-master-centinela-product-catalog/default/dwd0179633/i/apijjhmeq__92799.jpg",
                is_main: true,
                alt_text: "Waterproof Car Seat Cover",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "37",
                url: "https://www.centinelafeed.com/on/demandware.static/-/Sites-master-centinela-product-catalog/default/dwc3ba9478/k/apirr9kvn__49447.jpg",
                is_main: true,
                alt_text: "LED Dog Collar",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "38",
                url: "https://www.jacksongalaxy.com/cdn/shop/articles/20240228-IMG_2158.jpg?v=1711993337&width=800",
                is_main: true,
                alt_text: "Cat Window Perch",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "39",
                url: "https://th.bing.com/th/id/OIP.jIh1IqXsuSFQseZ_PF8q6QHaHm?w=184&h=189&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Automatic Pet Feeder",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "40",
                url: "https://th.bing.com/th/id/OIP.A5r-ogO4lswZCTXmvsXDlQHaHg?w=188&h=190&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Pet Water Fountain",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "41",
                url: "https://ae01.alicdn.com/kf/Sdf14226de332464988a0de7e2b2ad5ae5.jpg",
                is_main: true,
                alt_text: "Travel Water Bottle",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "42",
                url: "https://i5.walmartimages.com/asr/a25d1aa3-50a3-49ce-903e-e9968380e6a9.2b79c963511dd8222ea6eac3aff80a16.jpeg?odnHeight=600&odnWidth=600&odnBg=FFFFFF",
                is_main: true,
                alt_text: "Pet Stroller",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "43",
                url: "https://i5.walmartimages.com/seo/Dog-Squeaky-Ball-Durable-Pet-Squeak-Chew-Bouncy-Rubber-Toy-Balls-for-Small-Large-Dogs-Indestructible-Exercise-Training-Playing-3-Balls_37a5f417-6b6f-4518-9c57-9d67ebde159b.432ada1d7f638ffb076c9a824ef45f12.jpeg?odnHeight=600&odnWidth=600&odnBg=FFFFFF",
                is_main: true,
                alt_text: "Bouncy Rubber Ball",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "44",
                url: "https://th.bing.com/th/id/OIP.ljs5HCUzURdr1s9ivVBD5AHaJa?w=154&h=195&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Plush Mouse Toy",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "45",
                url: "https://th.bing.com/th/id/OIP.6rFKCcGE9ktcgkJE_pvlCQHaGz?w=218&h=200&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Rope Tug Toy",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "46",
                url: "https://th.bing.com/th/id/OIP.bIYYt6IVP9jaq-UzgiiF0wHaHa?w=194&h=194&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Feather Wand",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "47",
                url: "https://th.bing.com/th/id/OIP.uirb03ARjTlzyVvL3WDADwHaHa?w=192&h=192&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Interactive Puzzle Toy",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "48",
                url: "https://th.bing.com/th/id/OIP.K7ijDtxSQa3aW0YarT47nQHaGk?w=218&h=193&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Squeaky Bone Toy",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "49",
                url: "https://th.bing.com/th/id/OIP.fu64ZA86iiRFkMi2ak2yDQHaHd?w=197&h=198&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Catnip Kicker Toy",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "50",
                url: "https://tse4.mm.bing.net/th/id/OIP.0ZPSj3BomSdDjB1KGTHhNgHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
                is_main: true,
                alt_text: "Laser Pointer Toy",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "51",
                url: "https://tse4.mm.bing.net/th/id/OIP.whN4jkdj5GGUj-XxLNo4zQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
                is_main: true,
                alt_text: "Chew Ring",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "52",
                url: "https://th.bing.com/th/id/OIP.JO8wYMLFs3O_VRXMwvghngHaHZ?w=201&h=200&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Treat Dispensing Toy",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "53",
                url: "https://th.bing.com/th/id/OIP.jXjJBqLE6qJggbYC3tlyPQHaHa?w=183&h=183&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Crinkle Tunnel",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "54",
                url: "https://th.bing.com/th/id/OIP.JInBhY715gMcmeyyyBDG3wHaHh?w=188&h=190&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Automatic Laser Toy",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "55",
                url: "https://th.bing.com/th/id/OIP.Z3FmrhZaQddQkwcykMAilgHaHb?w=196&h=197&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Agility Training Kit",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "56",
                url: "https://tse3.mm.bing.net/th/id/OIP.50rRuWNisWCj-R6Wt_-K4AHaJ2?rs=1&pid=ImgDetMain&o=7&rm=3",
                is_main: true,
                alt_text: "Floating Water Toy",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "57",
                url: "https://cdn.shopify.com/s/files/1/0466/8797/7636/products/1-16oz-Shampoo-3D-2000x2000.jpg?v=1666882883",
                is_main: true,
                alt_text: "Deodorizing Pet Shampoo",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "58",
                url: "https://pureandnaturalpet.com/cdn/shop/files/All_Wipes9.jpg?v=1737475448&width=600",
                is_main: true,
                alt_text: "Pet Cleaning Wipes",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "59",
                url: "https://s.alicdn.com/@sc04/kf/Hc645c1f37a254248a67db78bbffdee40N.png_960x960q80.jpg",
                is_main: true,
                alt_text: "Double-Sided Brush",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "60",
                url: "https://m.media-amazon.com/images/I/611g1KwPCiL._AC_.jpg",
                is_main: true,
                alt_text: "Nail Clipper Set",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "61",
                url: "https://th.bing.com/th/id/OIP.XVf5JtvLlK-XXif7GClWOQHaHa?w=192&h=192&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Flea & Tick Spray",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "62",
                url: "https://th.bing.com/th/id/OIP.rncsx79FiE4g0thKpeqdfAHaHa?w=175&h=180&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Ear Cleansing Drops",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "63",
                url: "https://th.bing.com/th/id/OIP.JSXb0dXCZ2NucRKIyiVZvQHaHa?w=184&h=184&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Tear Stain Remover",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "64",
                url: "https://th.bing.com/th/id/OIP.iwefj48TJDZa4lwTX9zPiAHaHa?w=194&h=194&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Pet Toothbrush Kit",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "65",
                url: "https://tse1.mm.bing.net/th/id/OIP.-cPCgB6QlrQeBkKA4KEb6QHaHF?rs=1&pid=ImgDetMain&o=7&rm=3",
                is_main: true,
                alt_text: "Deshedding Tool",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "66",
                url: "https://tse1.mm.bing.net/th/id/OIP.Bn8GpmfSN_oKofKU9yUSPQHaHa?rs=1&pid=ImgDetMain&o=7&rm=3",
                is_main: true,
                alt_text: "Bentonite Cat Litter",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "67",
                url: "https://i5.walmartimages.com/seo/Litter-Box-Deodorizer-Cat-Litter-Lifespan-Enhancer-10oz_322a84b8-2a7a-4dae-adeb-0fcafbf24cb8.c80d5a0050b796c3fd708cc647d7d612.png",
                is_main: true,
                alt_text: "Litter Box Deodorizer",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "68",
                url: "https://i5.walmartimages.com/asr/157f6856-5d06-4e69-8c17-439c6cf6b2c8.bae4afd136090f18c719a75a821020d3.jpeg",
                is_main: true,
                alt_text: "Paw Protection Wax",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "69",
                url: "https://m.media-amazon.com/images/I/71iSd+XJq5L._AC_.jpg",
                is_main: true,
                alt_text: "Grooming Glove",
                created_at: now,
                updated_at: now,
            },
            {
                entity_type: "product",
                entity_id: "70",
                url: "https://th.bing.com/th/id/OIP.R-5qZLsVU9NlOE4JVHELwgHaHa?w=220&h=220&c=7&r=0&o=7&dpr=1.3&pid=1.7&rm=3",
                is_main: true,
                alt_text: "Pet Towel",
                created_at: now,
                updated_at: now,
            },
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete("media", {
            entity_type: "product",
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
                    "21",
                    "22",
                    "23",
                    "24",
                    "25",
                    "26",
                    "27",
                    "28",
                    "29",
                    "30",
                    "31",
                    "32",
                    "33",
                    "34",
                    "35",
                    "36",
                    "37",
                    "38",
                    "39",
                    "40",
                    "41",
                    "42",
                    "43",
                    "44",
                    "45",
                    "46",
                    "47",
                    "48",
                    "49",
                    "50",
                    "51",
                    "52",
                    "53",
                    "54",
                    "55",
                    "56",
                    "57",
                    "58",
                    "59",
                    "60",
                    "61",
                    "62",
                    "63",
                    "64",
                    "65",
                    "66",
                    "67",
                    "68",
                    "69",
                    "70",
                ],
            },
        });
        await queryInterface.bulkDelete("productVariants", null, {});
        await queryInterface.bulkDelete("products", null, {});
        await queryInterface.bulkDelete("productCategories", null, {});
    },
};
