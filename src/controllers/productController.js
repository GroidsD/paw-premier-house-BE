import ProductService from "../services/ProductService.js";

// CREATE - Tạo sản phẩm mới
const createProduct = async (req, res) => {
    try {
        const data = { ...req.body };

        // FormData -> string, ép kiểu số
        data.productCategories_id = data.productCategories_id
            ? Number(data.productCategories_id)
            : null;
        data.original_price = Number(data.original_price || 0);
        data.discount = Number(data.discount || 0);
        data.quantity = Number(data.quantity || 0);

        // ✅ tags nếu gửi JSON string
        if (typeof data.tags === "string") {
            try {
                data.tags = JSON.parse(data.tags);
            } catch {
                data.tags = [];
            }
        }

        // ✅ mainIndex: FE gửi index ảnh chính (optional)
        const mainIndex = Number(data.mainIndex || 0);

        // ✅ convert files -> media array
        const files = req.files || [];
        data.media = files.map((f, idx) => ({
            url: `/uploadImageProducts/${f.filename}`,
            type: "image",
            is_main: idx === mainIndex, // ảnh chính
            alt_text: data.name || "product image",
        }));

        // gọi service bạn đã có
        const result = await ProductService.createProduct(data);
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            errCode: 500,
            errMessage: e.message || "Server error",
        });
    }
};

// READ ALL - Lấy tất cả sản phẩm
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

// READ ONE - Lấy sản phẩm theo ID
let getProductById = async (req, res) => {
    try {
        const product_id = req.query.product_id;
        const product = await ProductService.getProductById(product_id);

        if (!product) {
            return res.status(404).json({
                errCode: 1,
                errMessage: "Product not found",
            });
        }

        return res.status(200).json({
            errCode: 0,
            product,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

// UPDATE - Cập nhật sản phẩm
// let updateProduct = async (req, res) => {
//     try {
//         const product_id = req.query.product_id;
//         const updated = await ProductService.updateProduct(
//             product_id,
//             req.body,
//         );
//         if (!updated) {
//             return res.status(404).json({
//                 errCode: 1,
//                 errMessage: "Product not found",
//                 product: null,
//             });
//         }
//         return res.status(200).json({
//             errCode: updated.errCode,
//             errMessage: updated.errMessage,
//             product: updated.product,
//         });
//     } catch (e) {
//         console.error(e);
//         return res.status(400).json({
//             errCode: 1,
//             errMessage: e.toString(),
//         });
//     }
// };
const parseMaybeJson = (v, fallback) => {
    if (v === undefined || v === null) return fallback;
    if (typeof v !== "string") return v;
    try {
        return JSON.parse(v);
    } catch {
        return v;
    }
};

const toBool = (v) => v === true || v === "true" || v === 1 || v === "1";

let updateProduct = async (req, res) => {
    try {
        const product_id = req.query.product_id;

        // req.body của multipart toàn là string
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

        body.removedMediaIds = parseMaybeJson(body.removedMediaIds, []);
        body.replaceAllImages =
            body.replaceAllImages !== undefined
                ? toBool(body.replaceAllImages)
                : false;

        body.mainIndex =
            body.mainIndex !== undefined ? Number(body.mainIndex) : 0;
        body.mainOldId =
            body.mainOldId !== undefined ? Number(body.mainOldId) : null;

        const result = await ProductService.updateProduct(
            product_id,
            body,
            req.files,
        );

        return res.status(200).json(result);
    } catch (e) {
        console.error("updateProduct controller error:", e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
            details: e?.message || String(e),
        });
    }
};
// SOFT DELETE - đổi status thành deleted
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

// HARD DELETE - xóa hoàn toàn sản phẩm
let hardDeleteProduct = async (req, res) => {
    try {
        const product_id = req.query.product_id;
        const result = await ProductService.hardDeleteProduct(product_id);

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
