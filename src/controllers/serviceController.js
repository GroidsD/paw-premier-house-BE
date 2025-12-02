import serviceService from "../services/serviceService.js";

// CREATE - Tạo service mới
let createService = async (req, res) => {
    try {
        const result = await serviceService.createService(req.body);
        return res.status(201).json({
            errCode: 0,
            errMessage: "Service created successfully",
            service: result,
        });
    } catch (e) {
        console.error(e);
        return res.status(400).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

// READ ALL - Lấy tất cả service
let getAllServices = async (req, res) => {
    try {
        const services = await serviceService.getAllServices();
        return res.status(200).json({
            errCode: 0,
            services,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

// READ ONE - Lấy service theo ID
let getServiceById = async (req, res) => {
    try {
        const service_id = req.query.service_id;
        const service = await serviceService.getServiceById(service_id);

        if (!service) {
            return res.status(404).json({
                errCode: 1,
                errMessage: "Service not found",
            });
        }

        return res.status(200).json({
            errCode: 0,
            service,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: -1,
            errMessage: "Server error",
        });
    }
};

// UPDATE - Cập nhật service
let updateService = async (req, res) => {
    try {
        const service_id = req.query.service_id;
        const updated = await serviceService.updateService(
            service_id,
            req.body
        );

        if (!updated) {
            return res.status(404).json({
                errCode: 1,
                errMessage: "Service not found",
                service: null,
            });
        }

        return res.status(200).json({
            errCode: updated.errCode,
            errMessage: updated.errMessage,
            service: updated.service,
        });
    } catch (e) {
        console.error(e);
        return res.status(400).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

// SOFT DELETE - Đánh dấu là đã xóa (isDeleted = true)
let softDeleteService = async (req, res) => {
    try {
        const service_id = req.query.service_id;
        const result = await serviceService.softDeleteService(service_id);

        return res.status(200).json({
            errCode: 0,
            errMessage: "Service soft deleted successfully",
            service: result,
        });
    } catch (e) {
        console.error(e);
        return res.status(404).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

// HARD DELETE - Xóa hoàn toàn
let hardDeleteService = async (req, res) => {
    try {
        const service_id = req.query.service_id;
        await serviceService.hardDeleteService(service_id);

        return res.status(200).json({
            errCode: 0,
            errMessage: "Service hard deleted successfully",
        });
    } catch (e) {
        console.error(e);
        return res.status(404).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

// GET SERVICES BY CATEGORY
let getServicesByCategory = async (req, res) => {
    try {
        const category_id = req.query.category_id;
        const result = await serviceService.getServicesByCategory(category_id);

        if (result.errCode !== 0) {
            return res.status(404).json({
                errCode: result.errCode,
                errMessage: result.errMessage,
                services: [],
            });
        }

        return res.status(200).json({
            errCode: 0,
            errMessage: result.errMessage,
            services: result.services,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

export default {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    softDeleteService,
    hardDeleteService,
    getServicesByCategory,
};
