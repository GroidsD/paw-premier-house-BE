const normalizeText = require("../../utils/normalizeText");

const extractProductSignals = (message = "") => {
    const text = normalizeText(message);

    const signals = {
        raw: text,
        petType: null,
        productType: null,
        petSize: null,
        keywords: [],
    };

    if (
        text.includes("cho") ||
        text.includes("cho con") ||
        text.includes("cun") ||
        text.includes("dog")
    ) {
        signals.petType = "dog";
    }

    if (text.includes("meo") || text.includes("cat")) {
        signals.petType = "cat";
    }

    if (
        text.includes("nho") ||
        text.includes("mini") ||
        text.includes("be") ||
        text.includes("size s") ||
        text.includes("small")
    ) {
        signals.petSize = "small";
    }

    if (
        text.includes("vua") ||
        text.includes("size m") ||
        text.includes("medium")
    ) {
        signals.petSize = "medium";
    }

    if (
        text.includes("lon") ||
        text.includes("to") ||
        text.includes("size l") ||
        text.includes("large")
    ) {
        signals.petSize = "large";
    }

    if (
        text.includes("thuc an") ||
        text.includes("hat") ||
        text.includes("pate") ||
        text.includes("snack")
    ) {
        signals.productType = "food";
        signals.keywords.push("food", "pate", "kibble", "snack");
    }

    if (
        text.includes("do choi") ||
        text.includes("toy") ||
        text.includes("bong") ||
        text.includes("xuong nhai")
    ) {
        signals.productType = "toy";
        signals.keywords.push("toy", "ball", "chew");
    }

    if (
        text.includes("sua tam") ||
        text.includes("tam") ||
        text.includes("grooming") ||
        text.includes("ve sinh")
    ) {
        signals.productType = "bath";
        signals.keywords.push("shampoo", "bath", "grooming", "clean");
    }

    if (text.includes("phu kien") || text.includes("accessory")) {
        signals.productType = "accessory";
        signals.keywords.push("accessory");
    }

    if (!signals.productType) {
        signals.keywords.push(...text.split(" ").filter(Boolean));
    }

    return signals;
};

module.exports = extractProductSignals;
