import ServiceService from "../services/ServiceService.js";
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
        // ✅ gắn ảnh vào body.media
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
// let createService = async (req, res) => {
//     try {
//         const result = await ServiceService.createService(req.body);
//         return res.status(201).json({
//             errCode: 0,
//             errMessage: "Service created successfully",
//             service: result,
//         });
//     } catch (e) {
//         console.error(e);
//         return res.status(400).json({
//             errCode: 1,
//             errMessage: e.toString(),
//         });
//     }
// };

let getAllServices = async (req, res) => {
    try {
        const services = await ServiceService.getAllServices();
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
        const service = await ServiceService.getServiceById(service_id);

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

// let updateService = async (req, res) => {
//     try {
//         const service_id = req.query.service_id;
//         const updated = await ServiceService.updateService(
//             service_id,
//             req.body,
//         );

//         if (!updated) {
//             return res.status(404).json({
//                 errCode: 1,
//                 errMessage: "Service not found",
//                 service: null,
//             });
//         }

//         return res.status(200).json({
//             errCode: updated.errCode,
//             errMessage: updated.errMessage,
//             service: updated.service,
//         });
//     } catch (e) {
//         console.error(e);
//         return res.status(400).json({
//             errCode: 1,
//             errMessage: e.toString(),
//         });
//     }
// };

let updateService = async (req, res) => {
    try {
        const service_id = req.query.service_id;

        // ✅ nếu có upload ảnh mới thì set media mới
        const m = fileToMedia(req.file);
        if (m) req.body.media = [m];

        const updated = await ServiceService.updateService(
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
        const result = await ServiceService.softDeleteService(service_id);

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

let hardDeleteService = async (req, res) => {
    try {
        const service_id = req.query.service_id;
        await ServiceService.hardDeleteService(service_id);

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
        const result = await ServiceService.getServicesByCategory(category_id);

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
