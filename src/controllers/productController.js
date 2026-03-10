import ProductService from "../services/ProductService.js";

let parseMaybeJson = (v, fallback) => {
    if (v === undefined || v === null) return fallback;
    if (typeof v !== "string") return v;
    try {
        return JSON.parse(v);
    } catch {
        return fallback;
    }
};

let toBool = (v) => v === true || v === "true" || v === 1 || v === "1";

const createProduct = async (req, res) => {
    try {
        const data = { ...req.body };

        data.productCategories_id = data.productCategories_id
            ? Number(data.productCategories_id)
            : null;

        data.original_price = Number(data.original_price || 0);
        data.discount = Number(data.discount || 0);
        data.quantity = Number(data.quantity || 0);
        data.has_variants = toBool(data.has_variants);
        data.variants = parseMaybeJson(data.variants, []);

        if (Array.isArray(data.variants)) {
            data.variants = data.variants.map((v) => ({
                ...v,
                productVariant_id: v.productVariant_id
                    ? Number(v.productVariant_id)
                    : undefined,
                original_price: Number(v.original_price || 0),
                discount: Number(v.discount || 0),
                quantity: Number(v.quantity || 0),
                reserved_quantity: Number(v.reserved_quantity || 0),
                isActive: v.isActive !== undefined ? toBool(v.isActive) : true,
            }));
        }

        const mainIndex = Number(data.mainIndex || 0);
        const files = req.files || [];

        data.media = files.map((f, idx) => ({
            url: `/uploadImageProducts/${f.filename}`,
            type: "image",
            is_main: idx === mainIndex,
            alt_text: data.name || "product image",
        }));

        const result = await ProductService.createProduct(data);

        return res.status(result.errCode === 0 ? 200 : 400).json(result);
    } catch (e) {
        return res.status(500).json({
            errCode: -1,
            errMessage: e.message || "Server error",
        });
    }
};

let getAllProducts = async (req, res) => {
    try {
        const products = await ProductService.getAllProducts();
        return res.status(200).json({
            errCode: 0,
            products,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

let getProductById = async (req, res) => {
    try {
        const product_id = req.query.product_id;
        const result = await ProductService.getProductById(product_id);

        return res.status(result.errCode === 0 ? 200 : 404).json(result);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

let updateProduct = async (req, res) => {
    try {
        const product_id = req.query.product_id;
        const body = { ...req.body };

        body.productCategories_id = body.productCategories_id
            ? Number(body.productCategories_id)
            : undefined;

        body.original_price =
            body.original_price !== undefined
                ? Number(body.original_price)
                : undefined;

        body.discount =
            body.discount !== undefined ? Number(body.discount) : undefined;

        body.quantity =
            body.quantity !== undefined ? Number(body.quantity) : undefined;

        body.isActive =
            body.isActive !== undefined ? toBool(body.isActive) : undefined;

        body.isDelete =
            body.isDelete !== undefined ? toBool(body.isDelete) : undefined;

        body.has_variants =
            body.has_variants !== undefined
                ? toBool(body.has_variants)
                : undefined;

        body.variants = parseMaybeJson(body.variants, []);
        body.removedVariantIds = parseMaybeJson(body.removedVariantIds, []);
        body.removedMediaIds = parseMaybeJson(body.removedMediaIds, []);

        body.replaceAllImages =
            body.replaceAllImages !== undefined
                ? toBool(body.replaceAllImages)
                : false;

        body.mainIndex =
            body.mainIndex !== undefined ? Number(body.mainIndex) : 0;

        body.mainOldId =
            body.mainOldId !== undefined ? Number(body.mainOldId) : null;

        if (Array.isArray(body.variants)) {
            body.variants = body.variants.map((v) => ({
                ...v,
                productVariant_id: v.productVariant_id
                    ? Number(v.productVariant_id)
                    : undefined,
                original_price: Number(v.original_price || 0),
                discount: Number(v.discount || 0),
                quantity: Number(v.quantity || 0),
                reserved_quantity: Number(v.reserved_quantity || 0),
                isActive: v.isActive !== undefined ? toBool(v.isActive) : true,
            }));
        }

        if (Array.isArray(body.removedVariantIds)) {
            body.removedVariantIds = body.removedVariantIds
                .map((id) => Number(id))
                .filter((id) => Number.isFinite(id));
        }

        if (Array.isArray(body.removedMediaIds)) {
            body.removedMediaIds = body.removedMediaIds
                .map((id) => Number(id))
                .filter((id) => Number.isFinite(id));
        }

        const result = await ProductService.updateProduct(
            product_id,
            body,
            req.files || [],
        );

        return res.status(result.errCode === 0 ? 200 : 400).json(result);
    } catch (e) {
        console.error("updateProduct controller error:", e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
            details: e?.message || String(e),
        });
    }
};

let softDeleteProduct = async (req, res) => {
    try {
        const product_id = req.query.product_id;
        const result = await ProductService.softDeleteProduct(product_id);

        return res.status(200).json({
            errCode: 0,
            errMessage: "Product soft deleted successfully",
            product: result,
        });
    } catch (e) {
        console.error(e);
        return res.status(404).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

let hardDeleteProduct = async (req, res) => {
    try {
        const product_id = req.query.product_id;
        await ProductService.hardDeleteProduct(product_id);

        return res.status(200).json({
            errCode: 0,
            errMessage: "Product hard deleted successfully",
        });
    } catch (e) {
        console.error(e);
        return res.status(404).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

export default {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    softDeleteProduct,
    hardDeleteProduct,
};
