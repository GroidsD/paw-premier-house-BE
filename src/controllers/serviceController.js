import serviceService from "../services/serviceService.js";
const fileToMedia = (file) => {
    if (!file) return null;

    const url = `/uploadImageServices/${file.filename}`;
    return {
        url,
        type: "image",
        filename: file.filename,
    };
};
let createService = async (req, res) => {
    try {
        const m = fileToMedia(req.file);
        if (m) req.body.media = [m];

        const result = await ServiceService.createService(req.body);

        return res.status(201).json({
            errCode: result.errCode,
            errMessage: result.errMessage,
            service: result.service,
        });
    } catch (e) {
        console.error(e);
        return res.status(400).json({ errCode: 1, errMessage: e.toString() });
    }
};

let getAllServices = async (req, res) => {
    try {
        const lang = req.query.lang || "vi";
        const services = await serviceService.getAllServices(lang);
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

let getServiceById = async (req, res) => {
    try {
        const service_id = req.query.service_id;
        const lang = req.query.lang || "vi";
        const service = await serviceService.getServiceById(service_id, lang);

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

let getServiceBySlug = async (req, res) => {
    try {
        const slug = req.query.slug;
        const lang = req.query.lang || "vi";

        const service = await serviceService.getServiceBySlug(slug, lang);

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

let updateService = async (req, res) => {
    try {
        const service_id = req.query.service_id;

        const m = fileToMedia(req.file);
        if (m) req.body.media = [m];

        const updated = await serviceService.updateService(
            service_id,
            req.body,
        );

        return res.status(updated?.errCode === 0 ? 200 : 404).json({
            errCode: updated.errCode,
            errMessage: updated.errMessage,
            service: updated.service || null,
        });
    } catch (e) {
        console.error(e);
        return res.status(400).json({ errCode: 1, errMessage: e.toString() });
    }
};

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

let restoreService = async (req, res) => {
    try {
        const service_id = req.query.service_id;
        const result = await serviceService.restoreService(service_id);

        return res.status(result.errCode === 0 ? 200 : 400).json({
            errCode: result.errCode,
            errMessage: result.errMessage,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            errCode: 1,
            errMessage: e.toString(),
        });
    }
};

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

let getServicesByCategory = async (req, res) => {
    try {
        const category_id = req.query.category_id;
        const lang = req.query.lang || "vi";
        const result = await serviceService.getServicesByCategory(category_id, lang);

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
    getServiceBySlug,
    updateService,
    softDeleteService,
    restoreService,
    hardDeleteService,
    getServicesByCategory,
};
