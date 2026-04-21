const { getFallbackReply, getFormLabel } = require("./utilsFormatter");
const normalizeText = require("../../../utils/normalizeText");

const FLAVOR_TERMS = [
    "ga",
    "bo",
    "ca",
    "ca hoi",
    "ca ngu",
    "vit",
    "cuu",
    "tom",
    "pho mai",
];

const extractFlavorTerm = (message = "") => {
    const text = normalizeText(message);
    if (!text) return null;
    return (
        FLAVOR_TERMS.find((term) => text.includes(normalizeText(term))) || null
    );
};

const extractBudgetValue = (message = "") => {
    const text = String(message || "");
    if (!text) return null;
    const normalized = text.replace(/[,\.]/g, "").toLowerCase();
    const vndMatch = normalized.match(/(\d{2,9})\s*(vnd|đ|dong)/i);
    if (vndMatch) return Number(vndMatch[1] || 0);
    const kMatch = normalized.match(/(\d{1,4})\s*k\b/i);
    if (kMatch) return Number(kMatch[1] || 0) * 1000;
    return null;
};

const isYesNoShopQuestion = (message = "") => {
    const text = normalizeText(message);
    if (!text) return false;
    return (
        text.startsWith("shop co") ||
        text.startsWith("co") ||
        text.includes("co ban") ||
        text.includes("co khong") ||
        text.includes("ban co")
    );
};

const asksForPrice = (message = "") => {
    const text = normalizeText(message);
    if (!text) return false;

    return (
        text.includes("gia bao nhieu") ||
        text.includes("bao nhieu tien") ||
        text.includes("gia") ||
        text.includes("price") ||
        text.includes("how much")
    );
};

const asksForStock = (message = "") => {
    const text = normalizeText(message);
    if (!text) return false;

    return (
        text.includes("con hang") ||
        text.includes("het hang") ||
        text.includes("co san khong") ||
        text.includes("co hang khong") ||
        text.includes("in stock") ||
        text.includes("available") ||
        text.includes("stock")
    );
};

const formatPrice = (value = 0, language = "vi") => {
    const num = Number(value || 0);
    if (!num) return language === "en" ? "0 VND" : "0 VND";
    return `${num.toLocaleString("vi-VN")} VND`;
};

const productHasFlavor = (product = {}, flavorTerm = "") => {
    if (!flavorTerm) return false;
    const haystack = normalizeText(
        `${product.name || ""} ${product.description || ""}`,
    );
    return haystack.includes(normalizeText(flavorTerm));
};

const buildProductReply = ({ items = [], language = "vi", context = {} }) => {
    const first = items[0];
    const count = items.length;
    const analysis = context?.analysis || {};
    const formLabel = getFormLabel(analysis.productForm, language);
    const userQuestion = context?.user_question || analysis?.raw || "";
    const flavorTerm = extractFlavorTerm(
        context?.user_question || analysis?.raw || "",
    );
    const budgetValue = extractBudgetValue(userQuestion);
    const isYesNo = isYesNoShopQuestion(userQuestion);
    const isPriceQuestion = asksForPrice(userQuestion);
    const isStockQuestion = asksForStock(userQuestion);
    const isBroadBrowseQuestion =
        !analysis?.productForm &&
        !analysis?.discountMode &&
        Boolean(analysis?.petType) &&
        (userQuestion.includes("san pham") ||
            userQuestion.includes("shop co") ||
            userQuestion.includes("co gi cho"));
    const petType = analysis?.petType || null;
    if (language === "vi" && isBroadBrowseQuestion) {
        return petType === "dog"
            ? `Shop mình có một số sản phẩm cho chó nha. Mình gợi ý vài lựa chọn nổi bật bên dưới, bạn muốn xem thức ăn, đồ chơi hay phụ kiện trước?`
            : `Shop mình có một số sản phẩm cho mèo nha. Mình gợi ý vài lựa chọn nổi bật bên dưới, bạn muốn xem thức ăn, đồ chơi hay phụ kiện trước?`;
    }
    const missingFlavorNote =
        flavorTerm && first && !productHasFlavor(first, flavorTerm)
            ? language === "en"
                ? `I don't see a clear "${flavorTerm}" flavor in the product info yet.`
                : `Mình chưa thấy thông tin vị "${flavorTerm}" trong dữ liệu sản phẩm.`
            : "";

    const clarifyNote =
        flavorTerm && first && !productHasFlavor(first, flavorTerm)
            ? language === "en"
                ? "Do you want to see similar options without that exact flavor?"
                : "Bạn có muốn xem các lựa chọn tương tự nếu không đúng vị đó không?"
            : "";

    const selectorSeed =
        Number(first?.product_id || 0) +
        Number(first?.price || 0) +
        Number(count || 0);

    const pickBySeed = (options = []) => {
        if (!options.length) return "";
        const index = Math.abs(selectorSeed) % options.length;
        return options[index];
    };

    const leadEnBudgetOptions = budgetValue
        ? [
              `With a budget of ${budgetValue} VND, `,
              `Given ${budgetValue} VND, `,
              `For ${budgetValue} VND, `,
          ]
        : [""];

    const leadViBudgetOptions = budgetValue
        ? [
              `Với ngân sách ${budgetValue} VND, `,
              `Trong tầm ${budgetValue} VND, `,
              `Khoảng ${budgetValue} VND, `,
          ]
        : [""];

    const leadEnYesNoOptions = isYesNo
        ? ["Yes, the shop has ", "Yes, we do have ", "The shop currently has "]
        : [""];

    const leadViYesNoOptions = isYesNo
        ? ["Shop mình có ", "Dạ có nhé, shop mình có ", "Có nha, shop mình có "]
        : [""];

    if (!count) {
        return getFallbackReply(language, "products");
    }

    const productName =
        first?.name || (language === "en" ? "the top option" : "món nổi bật");

    const firstPrice = formatPrice(first?.price || 0, language);
    const firstOriginalPrice = formatPrice(
        first?.original_price || 0,
        language,
    );
    const isDiscounted =
        Number(first?.original_price || 0) > Number(first?.price || 0);
    const inStock = Number(first?.quantity || 0) > 0;

    const followUpsEn = [
        "Want me to narrow it down by price, size, or brand?",
        "Do you want to filter by price range or size?",
        "I can also show similar options if you want.",
    ];

    const followUpsVi = [
        "Bạn muốn lọc thêm theo giá, size, hay hãng không?",
        "Muốn mình lọc theo khoảng giá hoặc size không?",
        "Mình cũng có thể gợi ý các lựa chọn tương tự nếu bạn muốn.",
    ];

    const askFilter =
        language === "en" ? pickBySeed(followUpsEn) : pickBySeed(followUpsVi);

    if (language === "en") {
        const label = formLabel ? `${formLabel} ` : "";
        const budgetLead = pickBySeed(leadEnBudgetOptions);
        const yesNoLead = isYesNo
            ? `${pickBySeed(leadEnYesNoOptions)}${label}products. `
            : "";

        if (count === 1 && isPriceQuestion) {
            if (isDiscounted) {
                return `${budgetLead}${yesNoLead}${productName} is currently ${firstPrice} (originally ${firstOriginalPrice}). ${askFilter}`.trim();
            }
            return `${budgetLead}${yesNoLead}${productName} is currently ${firstPrice}. ${askFilter}`.trim();
        }

        if (count > 1 && isPriceQuestion) {
            return `${budgetLead}${yesNoLead}I found ${count} ${label}products. The best match is ${productName}, currently ${firstPrice}. ${askFilter}`.trim();
        }

        if (count === 1 && isStockQuestion) {
            return inStock
                ? `${productName} is currently in stock. ${isDiscounted ? `Its current price is ${firstPrice} (originally ${firstOriginalPrice}).` : `Its current price is ${firstPrice}.`} ${askFilter}`.trim()
                : `${productName} is currently out of stock. Do you want to see similar alternatives?`;
        }

        if (count > 1 && isStockQuestion) {
            return `I found ${count} matching ${label}products. The best match is ${productName}, and it is currently ${inStock ? "in stock" : "out of stock"}. ${askFilter}`.trim();
        }

        if (count === 1) {
            if (analysis.discountMode === "discounted") {
                return `${budgetLead}${yesNoLead}I found one discounted ${label}product: ${productName}. ${missingFlavorNote} ${clarifyNote} ${askFilter}`.trim();
            }
            if (analysis.discountMode === "non_discounted") {
                return `${budgetLead}${yesNoLead}I found one non-discounted ${label}product: ${productName}. ${missingFlavorNote} ${clarifyNote} ${askFilter}`.trim();
            }
            return `${budgetLead}${yesNoLead}I found one ${label}product: ${productName}. ${missingFlavorNote} ${clarifyNote} ${askFilter}`.trim();
        }

        if (analysis.discountMode === "discounted") {
            return `${budgetLead}${yesNoLead}I found ${count} discounted ${label}products. The best match is ${productName}. ${askFilter}`;
        }

        if (analysis.discountMode === "non_discounted") {
            return `${budgetLead}${yesNoLead}I found ${count} non-discounted ${label}products. The best match is ${productName}. ${askFilter}`;
        }

        return `${budgetLead}${yesNoLead}I found ${count} ${label}products. The best match is ${productName}. ${askFilter}`;
    }

    const labelVi = formLabel ? `${formLabel} ` : "";
    const budgetLeadVi = pickBySeed(leadViBudgetOptions);
    const yesNoLeadVi = isYesNo
        ? `${pickBySeed(leadViYesNoOptions)}${labelVi}nhé. `
        : "";

    if (count === 1 && isPriceQuestion) {
        if (isDiscounted) {
            return `${budgetLeadVi}${yesNoLeadVi}Sản phẩm ${productName} hiện có giá ${firstPrice}, giá gốc ${firstOriginalPrice}. ${askFilter}`.trim();
        }
        return `${budgetLeadVi}${yesNoLeadVi}Sản phẩm ${productName} hiện có giá ${firstPrice}. ${askFilter}`.trim();
    }

    if (count > 1 && isPriceQuestion) {
        return `${budgetLeadVi}${yesNoLeadVi}Mình tìm thấy ${count} sản phẩm ${labelVi}phù hợp. Gợi ý nổi bật là ${productName}, hiện có giá ${firstPrice}. ${askFilter}`.trim();
    }

    if (count === 1 && isStockQuestion) {
        return inStock
            ? `Sản phẩm ${productName} hiện vẫn còn hàng. ${isDiscounted ? `Giá hiện tại là ${firstPrice}, giá gốc ${firstOriginalPrice}.` : `Giá hiện tại là ${firstPrice}.`} ${askFilter}`.trim()
            : `Sản phẩm ${productName} hiện đang hết hàng. Bạn có muốn mình gợi ý sản phẩm tương tự không?`;
    }

    if (count > 1 && isStockQuestion) {
        return `Mình tìm thấy ${count} sản phẩm ${labelVi}phù hợp. Gợi ý nổi bật là ${productName}, hiện ${inStock ? "còn hàng" : "hết hàng"}. ${askFilter}`.trim();
    }

    if (count === 1) {
        if (analysis.discountMode === "discounted") {
            return `${budgetLeadVi}${yesNoLeadVi}Mình thấy 1 sản phẩm ${labelVi}đang giảm giá: ${productName}. ${missingFlavorNote} ${clarifyNote} ${askFilter}`.trim();
        }
        if (analysis.discountMode === "non_discounted") {
            return `${budgetLeadVi}${yesNoLeadVi}Mình thấy 1 sản phẩm ${labelVi}không giảm giá: ${productName}. ${missingFlavorNote} ${clarifyNote} ${askFilter}`.trim();
        }
        return `${budgetLeadVi}${yesNoLeadVi}Mình thấy 1 sản phẩm ${labelVi}phù hợp: ${productName}. ${missingFlavorNote} ${clarifyNote} ${askFilter}`.trim();
    }

    if (analysis.discountMode === "discounted") {
        return `${budgetLeadVi}${yesNoLeadVi}Mình thấy ${count} sản phẩm ${labelVi}đang giảm giá. Gợi ý nổi bật là ${productName}. ${missingFlavorNote} ${clarifyNote} ${askFilter}`.trim();
    }

    if (analysis.discountMode === "non_discounted") {
        return `${budgetLeadVi}${yesNoLeadVi}Mình thấy ${count} sản phẩm ${labelVi}không giảm giá. Gợi ý nổi bật là ${productName}. ${missingFlavorNote} ${clarifyNote} ${askFilter}`.trim();
    }

    return `${budgetLeadVi}${yesNoLeadVi}Mình thấy ${count} sản phẩm ${labelVi}phù hợp. Gợi ý nổi bật là ${productName}. ${missingFlavorNote} ${clarifyNote} ${askFilter}`.trim();
};

const buildServiceReply = ({ items = [], language = "vi", intent }) => {
    const first = items[0];
    const count = items.length;

    if (!count) {
        return getFallbackReply(language, "services");
    }

    if (language === "en") {
        if (intent === "service_booking_intent") {
            return `I found ${count} suitable service option${count > 1 ? "s" : ""}. The best match is ${first?.name || "the first service"} below.`;
        }

        return `I found ${count} suitable service${count > 1 ? "s" : ""}. The best match is ${first?.name || "the first service"} below.`;
    }

    if (intent === "service_booking_intent") {
        return `Mình tìm thấy ${count} lựa chọn dịch vụ phù hợp. Nổi bật nhất là ${first?.name || "dịch vụ đầu tiên"} ở bên dưới.`;
    }

    return `Mình tìm thấy ${count} dịch vụ phù hợp. Nổi bật nhất là ${first?.name || "dịch vụ đầu tiên"} ở bên dưới.`;
};

const buildBookingReply = ({ items = [], language = "vi" }) => {
    if (!items.length) {
        return getFallbackReply(language, "bookings");
    }

    if (language === "en") {
        return `I found ${items.length} booking record${items.length > 1 ? "s" : ""} for you.`;
    }

    return `Mình tìm thấy ${items.length} booking phù hợp cho bạn.`;
};

const buildOrderReply = ({ items = [], language = "vi" }) => {
    if (!items.length) {
        return getFallbackReply(language, "orders");
    }

    if (language === "en") {
        return `I found ${items.length} order record${items.length > 1 ? "s" : ""} for you.`;
    }

    return `Mình tìm thấy ${items.length} đơn hàng phù hợp cho bạn.`;
};

module.exports = {
    buildProductReply,
    buildServiceReply,
    buildBookingReply,
    buildOrderReply,
};
