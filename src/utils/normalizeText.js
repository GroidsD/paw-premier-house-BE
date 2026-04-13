const normalizeText = (value = "") => {
    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/Đ/g, "d")
        .replace(/[^\w\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
};

module.exports = normalizeText;
