const normalizeText = require("../../../utils/normalizeText");

const q = (label, value = label) => ({
    type: "query",
    label,
    value,
});

const a = (label, value) => ({
    type: "action",
    label,
    value,
});

const normalize = (value = "") => normalizeText(String(value || ""));

const uniqueSuggestions = (items = []) => {
    const seen = new Set();
    return items.filter((item) => {
        const key = `${item.type}:${normalize(item.value || item.label)}`;
        if (!key || seen.has(key)) return false;
        seen.add(key);
        return true;
    });
};

const removeRedundantSuggestions = ({
    suggestions = [],
    context = {},
    language = "vi",
}) => {
    const analysis = context?.analysis || {};
    const petType = analysis?.petType || null;
    const productForm = analysis?.productForm || null;
    const discountMode = analysis?.discountMode || null;
    const userQuestion = normalize(context?.user_question || "");

    const blocked = new Set();

    if (petType === "dog") {
        blocked.add(
            normalize(language === "en" ? "Dog products" : "Sản phẩm cho chó"),
        );
        blocked.add(
            normalize(language === "en" ? "Dog food" : "Thức ăn cho chó"),
        );
    }

    if (petType === "cat") {
        blocked.add(
            normalize(language === "en" ? "Cat products" : "Sản phẩm cho mèo"),
        );
        blocked.add(
            normalize(language === "en" ? "Cat food" : "Thức ăn cho mèo"),
        );
    }

    if (productForm === "pate") {
        blocked.add(normalize(language === "en" ? "Cat pate" : "Pate cho mèo"));
        blocked.add(normalize(language === "en" ? "Dog pate" : "Pate cho chó"));
    }

    if (productForm === "kibble") {
        blocked.add(
            normalize(language === "en" ? "Cat kibble" : "Hạt cho mèo"),
        );
        blocked.add(
            normalize(language === "en" ? "Dog kibble" : "Hạt cho chó"),
        );
    }

    if (productForm === "milk") {
        blocked.add(
            normalize(language === "en" ? "Kitten milk" : "Sữa cho mèo con"),
        );
        blocked.add(
            normalize(language === "en" ? "Puppy milk" : "Sữa cho chó con"),
        );
    }

    if (productForm === "toy") {
        blocked.add(
            normalize(language === "en" ? "Cat toys" : "Đồ chơi cho mèo"),
        );
        blocked.add(
            normalize(language === "en" ? "Dog toys" : "Đồ chơi cho chó"),
        );
    }

    if (productForm === "shampoo") {
        blocked.add(
            normalize(language === "en" ? "Pet shampoo" : "Sữa tắm thú cưng"),
        );
        blocked.add(normalize(language === "en" ? "Shampoo" : "Shampoo"));
    }

    if (productForm === "wipes") {
        blocked.add(
            normalize(
                language === "en" ? "Cleaning wipes" : "Khăn lau vệ sinh",
            ),
        );
        blocked.add(
            normalize(language === "en" ? "Pet wipes" : "Pet Cleaning Wipes"),
        );
    }

    if (productForm === "litter") {
        blocked.add(
            normalize(language === "en" ? "Cat litter" : "Cát vệ sinh cho mèo"),
        );
        blocked.add(
            normalize(
                language === "en"
                    ? "Bentonite cat litter"
                    : "Bentonite Cat Litter",
            ),
        );
    }

    if (productForm === "brush") {
        blocked.add(
            normalize(language === "en" ? "Grooming brush" : "Lược chải lông"),
        );
        blocked.add(normalize(language === "en" ? "Brush" : "Brush"));
    }

    if (discountMode === "discounted") {
        blocked.add(
            normalize(
                language === "en" ? "Discounted products" : "Sản phẩm giảm giá",
            ),
        );
    }

    if (discountMode === "non_discounted") {
        blocked.add(
            normalize(
                language === "en"
                    ? "Non-discounted products"
                    : "Sản phẩm không giảm giá",
            ),
        );
    }

    return suggestions.filter((item) => {
        const normalizedValue = normalize(item.value || item.label);
        if (!normalizedValue) return false;
        if (blocked.has(normalizedValue)) return false;
        if (userQuestion && normalizedValue === userQuestion) return false;
        return true;
    });
};

const fillSuggestions = (items = [], fallback = [], max = 3) => {
    const merged = uniqueSuggestions([...items, ...fallback]);
    return merged.slice(0, max);
};

const getDictionary = (language = "vi") => {
    if (language === "en") {
        return {
            login: a("Log in", "login"),
            loginToBook: a("Log in to book", "login"),
            dogProducts: q("Dog products"),
            catProducts: q("Cat products"),
            dogFood: q("Dog food"),
            catFood: q("Cat food"),
            dogPate: q("Dog pate"),
            catPate: q("Cat pate"),
            dogKibble: q("Dog kibble"),
            catKibble: q("Cat kibble"),
            puppyMilk: q("Puppy milk"),
            kittenMilk: q("Kitten milk"),
            dogToys: q("Dog toys"),
            catToys: q("Cat toys"),
            petShampoo: q("Pet shampoo"),
            petWipes: q("Pet cleaning wipes"),
            catLitter: q("Cat litter"),
            groomingBrush: q("Grooming brush"),
            discounted: q("Discounted products"),
            fullPrice: q("Non-discounted products"),
            myOrders: q("My orders"),
            myBookings: q("My bookings"),
            grooming: q("Grooming services"),
            spa: q("Pet spa"),
            hotel: q("Pet hotel"),
            usageGuide: q("Usage guide"),
            ingredients: q("Ingredients"),
            relatedProducts: q("Related products"),
            relatedServices: q("Services"),
            petNutrition: q("Pet nutrition"),
            dogNutrition: q("Dog nutrition"),
            catNutrition: q("Cat nutrition"),
            omegaDog: q("Omega 3 for dogs"),
            omegaCat: q("Omega 3 for cats"),
            dogCare: q("Dog care"),
            catCare: q("Cat care"),
            petCare: q("Pet care"),
            recommended: q("Recommended products"),
            buyNow: q("Buy now"),
            products: q("Products"),
            services: q("Services"),
            latestBooking: q("My latest booking"),
            recentOrders: q("My recent orders"),
            buyAgain: q("Buy again"),
            rebook: q("Book again"),
            clarifyProduct: q("Tên sản phẩm cụ thể"),
            clarifyPetType: q("Cho chó hay mèo?"),
            clarifyBudget: q("Ngân sách khoảng bao nhiêu?"),
        };
    }

    return {
        login: a("Đăng nhập", "login"),
        loginToBook: a("Đăng nhập để đặt lịch", "login"),
        dogProducts: q("Sản phẩm cho chó"),
        catProducts: q("Sản phẩm cho mèo"),
        dogFood: q("Thức ăn cho chó"),
        catFood: q("Thức ăn cho mèo"),
        dogPate: q("Pate cho chó"),
        catPate: q("Pate cho mèo"),
        dogKibble: q("Hạt cho chó"),
        catKibble: q("Hạt cho mèo"),
        puppyMilk: q("Sữa cho chó con"),
        kittenMilk: q("Sữa cho mèo con"),
        dogToys: q("Đồ chơi cho chó"),
        catToys: q("Đồ chơi cho mèo"),
        petShampoo: q("Sữa tắm thú cưng"),
        petWipes: q("Khăn lau vệ sinh"),
        catLitter: q("Cát vệ sinh cho mèo"),
        groomingBrush: q("Lược chải lông"),
        discounted: q("Sản phẩm giảm giá"),
        fullPrice: q("Sản phẩm không giảm giá"),
        myOrders: q("Đơn hàng của tôi"),
        myBookings: q("Booking của tôi"),
        grooming: q("Dịch vụ grooming"),
        spa: q("Spa thú cưng"),
        hotel: q("Khách sạn thú cưng"),
        usageGuide: q("Cách sử dụng"),
        ingredients: q("Thành phần"),
        relatedProducts: q("Sản phẩm liên quan"),
        relatedServices: q("Dịch vụ"),
        petNutrition: q("Dinh dưỡng thú cưng"),
        dogNutrition: q("Dinh dưỡng cho chó"),
        catNutrition: q("Dinh dưỡng cho mèo"),
        omegaDog: q("Omega 3 cho chó"),
        omegaCat: q("Omega 3 cho mèo"),
        dogCare: q("Chăm sóc chó"),
        catCare: q("Chăm sóc mèo"),
        petCare: q("Chăm sóc thú cưng"),
        recommended: q("Gợi ý cho tôi"),
        buyNow: q("Mua ngay"),
        products: q("Xem sản phẩm"),
        services: q("Xem dịch vụ"),
        latestBooking: q("Booking gần nhất"),
        recentOrders: q("Đơn hàng gần nhất"),
        buyAgain: q("Mua lại"),
        rebook: q("Đặt lại"),
        clarifyProduct: q("Tên sản phẩm cụ thể"),
        clarifyPetType: q("Cho chó hay mèo?"),
        clarifyBudget: q("Ngân sách khoảng bao nhiêu?"),
    };
};

const getProductSuggestions = ({
    S,
    petType,
    productForm,
    discountMode,
    isLoggedIn,
}) => {
    if (productForm === "pate") {
        return petType === "cat"
            ? [S.catFood, S.catKibble, isLoggedIn ? S.myOrders : S.discounted]
            : petType === "dog"
              ? [S.dogFood, S.dogKibble, isLoggedIn ? S.myOrders : S.discounted]
              : [
                    S.products,
                    S.discounted,
                    isLoggedIn ? S.myOrders : S.recommended,
                ];
    }

    if (productForm === "kibble") {
        return petType === "cat"
            ? [S.catPate, S.discounted, isLoggedIn ? S.myOrders : S.catProducts]
            : petType === "dog"
              ? [
                    S.dogPate,
                    S.discounted,
                    isLoggedIn ? S.myOrders : S.dogProducts,
                ]
              : [
                    S.products,
                    S.discounted,
                    isLoggedIn ? S.myOrders : S.recommended,
                ];
    }

    if (productForm === "milk") {
        return petType === "cat"
            ? [S.catFood, S.catPate, isLoggedIn ? S.myOrders : S.discounted]
            : petType === "dog"
              ? [S.dogFood, S.dogPate, isLoggedIn ? S.myOrders : S.discounted]
              : [
                    S.products,
                    S.discounted,
                    isLoggedIn ? S.myOrders : S.recommended,
                ];
    }

    if (productForm === "toy") {
        return petType === "cat"
            ? [S.catFood, S.discounted, isLoggedIn ? S.myOrders : S.catProducts]
            : petType === "dog"
              ? [
                    S.dogFood,
                    S.discounted,
                    isLoggedIn ? S.myOrders : S.dogProducts,
                ]
              : [
                    S.products,
                    S.discounted,
                    isLoggedIn ? S.myOrders : S.recommended,
                ];
    }

    if (productForm === "shampoo") {
        return [
            S.petWipes,
            S.groomingBrush,
            isLoggedIn ? S.myOrders : S.grooming,
        ];
    }

    if (productForm === "wipes") {
        return [
            S.petShampoo,
            S.groomingBrush,
            isLoggedIn ? S.myOrders : S.grooming,
        ];
    }

    if (productForm === "litter") {
        return [
            S.catProducts,
            S.discounted,
            isLoggedIn ? S.myOrders : S.petCare,
        ];
    }

    if (productForm === "brush") {
        return [
            S.grooming,
            S.petShampoo,
            isLoggedIn ? S.myBookings : S.petCare,
        ];
    }

    if (discountMode === "discounted") {
        return petType === "cat"
            ? [S.catFood, S.catProducts, isLoggedIn ? S.myOrders : S.catPate]
            : petType === "dog"
              ? [S.dogFood, S.dogProducts, isLoggedIn ? S.myOrders : S.dogPate]
              : [
                    S.catProducts,
                    S.dogProducts,
                    isLoggedIn ? S.myOrders : S.recommended,
                ];
    }

    if (discountMode === "non_discounted") {
        return petType === "cat"
            ? [S.catFood, S.catProducts, isLoggedIn ? S.myOrders : S.discounted]
            : petType === "dog"
              ? [
                    S.dogFood,
                    S.dogProducts,
                    isLoggedIn ? S.myOrders : S.discounted,
                ]
              : [
                    S.products,
                    S.discounted,
                    isLoggedIn ? S.myOrders : S.recommended,
                ];
    }

    if (petType === "cat") {
        return isLoggedIn
            ? [S.catPate, S.catKibble, S.myOrders]
            : [S.catPate, S.catKibble, S.discounted];
    }

    if (petType === "dog") {
        return isLoggedIn
            ? [S.dogFood, S.discounted, S.myOrders]
            : [S.dogFood, S.discounted, S.grooming];
    }

    return isLoggedIn
        ? [S.buyNow, S.myOrders, S.recommended]
        : [S.dogProducts, S.catProducts, S.discounted];
};

const getKnowledgeSuggestions = ({ S, petType, productForm, context }) => {
    if (context?.failure_reason === "no_internal_knowledge_records") {
        return [S.relatedProducts, S.ingredients, S.usageGuide];
    }

    if (productForm === "pate") {
        return petType === "cat"
            ? [S.ingredients, S.catFood, S.relatedProducts]
            : petType === "dog"
              ? [S.ingredients, S.dogFood, S.relatedProducts]
              : [S.usageGuide, S.relatedProducts, S.relatedServices];
    }

    if (productForm === "shampoo") {
        return [S.petWipes, S.groomingBrush, S.relatedProducts];
    }

    if (productForm === "wipes") {
        return [S.petShampoo, S.groomingBrush, S.relatedProducts];
    }

    if (productForm === "litter") {
        return [S.catProducts, S.discounted, S.relatedProducts];
    }

    if (productForm === "brush") {
        return [S.grooming, S.petShampoo, S.relatedProducts];
    }

    if (petType === "cat") {
        return [S.usageGuide, S.catFood, S.relatedProducts];
    }

    if (petType === "dog") {
        return [S.usageGuide, S.dogFood, S.relatedProducts];
    }

    return [S.usageGuide, S.relatedProducts, S.relatedServices];
};

const getExternalSuggestions = ({ S, petType, context }) => {
    if (context?.failure_reason === "no_external_sources") {
        return [S.clarifyPetType, S.clarifyProduct, S.relatedProducts];
    }

    if (petType === "cat") {
        return [S.catNutrition, S.omegaCat, S.catCare];
    }

    if (petType === "dog") {
        return [S.dogNutrition, S.omegaDog, S.dogCare];
    }

    return [S.petNutrition, S.petCare, S.relatedProducts];
};

const getSuggestionsByContext = ({
    language,
    contextType,
    isLoggedIn,
    intent,
    context,
}) => {
    const analysis = context?.analysis || {};
    const petType = analysis.petType || null;
    const discountMode = analysis.discountMode || null;
    const productForm = analysis.productForm || null;
    const answerMode = context?.answer_mode || null;

    const S = getDictionary(language === "en" ? "en" : "vi");

    let suggestions = [];

    if (contextType === "auth_required") {
        suggestions = [
            S.login,
            petType === "cat" ? S.catProducts : S.dogProducts,
            S.grooming,
        ];
    } else if (contextType === "knowledge") {
        suggestions = getKnowledgeSuggestions({
            S,
            petType,
            productForm,
            context,
        });
    } else if (contextType === "external_reference") {
        suggestions = getExternalSuggestions({ S, petType, context });
    } else if (contextType === "products") {
        if ((context?.confidence ?? 0) < 0.5) {
            suggestions = [S.clarifyPetType, S.clarifyBudget, S.clarifyProduct];
        } else {
            suggestions = getProductSuggestions({
                S,
                petType,
                productForm,
                discountMode,
                isLoggedIn,
            });
        }
    } else if (contextType === "services") {
        if (intent === "service_booking_intent") {
            suggestions = isLoggedIn
                ? [S.myBookings, S.grooming, S.hotel]
                : [S.loginToBook, S.grooming, S.hotel];
        } else {
            suggestions = isLoggedIn
                ? [S.grooming, S.myBookings, S.hotel]
                : [S.grooming, S.spa, S.hotel];
        }
    } else if (contextType === "bookings") {
        suggestions = [S.latestBooking, S.rebook, S.services];
    } else if (contextType === "orders") {
        suggestions = [S.recentOrders, S.buyAgain, S.products];
    } else if (answerMode === "external_reference") {
        suggestions = getExternalSuggestions({ S, petType, context });
    } else if (answerMode === "internal_knowledge") {
        suggestions = getKnowledgeSuggestions({
            S,
            petType,
            productForm,
            context,
        });
    } else {
        suggestions = isLoggedIn
            ? [S.dogProducts, S.services, S.myBookings]
            : [S.dogProducts, S.services, S.login];
    }

    const fallback =
        (context?.confidence ?? 1) < 0.5
            ? [S.clarifyPetType, S.clarifyBudget, S.clarifyProduct]
            : isLoggedIn
              ? [S.products, S.services, S.myOrders]
              : [S.dogProducts, S.catProducts, S.login];

    return fillSuggestions(
        removeRedundantSuggestions({
            suggestions,
            context,
            language: language === "en" ? "en" : "vi",
        }),
        fallback,
        3,
    );
};

module.exports = {
    getSuggestionsByContext,
};
