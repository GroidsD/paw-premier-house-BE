import spaService from "../services/SpaService.js";

// 🧴 Tạo dịch vụ mới
let createSpaService = async (req, res) => {
  try {
    const data = req.body;
    const result = await spaService.createSpaService(data);
    return res.status(200).json(result);
  } catch (e) {
    console.error("Error in createSpaService:", e);
    return res.status(500).json({ error: e.message || "Server error" });
  }
};

// 💅 Lấy tất cả dịch vụ
let getAllSpaServices = async (req, res) => {
  try {
    const services = await spaService.getAllSpaServices();
    return res.status(200).json(services);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

// 🔍 Lấy 1 dịch vụ theo ID
let getSpaServiceById = async (req, res) => {
    try {
        const { service_id } = req.query;
        const service = await spaService.getSpaServiceById(service_id);
        return res.status(200).json(service);
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};

// ✏️ Cập nhật dịch vụ
let updateSpaService = async (req, res) => {
  try {
    const { id, ...data } = req.body;
    const updated = await spaService.updateSpaService(id, data);
    return res.status(200).json(updated);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

// 🗑️ Xóa dịch vụ
let deleteSpaService = async (req, res) => {
    try {
        const { service_id } = req.query;
        const message = await spaService.deleteSpaService(service_id);
        return res.status(200).json({ message });
    } catch (e) {
        return res.status(500).json({ error: e.message });
    }
};

let createAppointment = async (req, res) => {
  try {
    const data = await spaService.createAppointment(req.body);
    return res.status(200).json(data);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ errCode: -1, errMessage: e.message || e });
  }
};

let getAllAppointments = async (req, res) => {
  try {
    const data = await spaService.getAllAppointments();
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ errMessage: e.message || e });
  }
};

let getAppointmentById = async (req, res) => {
  try {
    const { id } = req.query;
    const data = await spaService.getAppointmentById(id);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ errMessage: e.message || e });
  }
};

let updateAppointmentStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    const data = await spaService.updateAppointmentStatus(id, status);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ errMessage: e.message || e });
  }
};

let deleteAppointment = async (req, res) => {
  try {
    const { id } = req.query;
    const data = await spaService.deleteAppointment(id);
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ errMessage: e.message || e });
  }
};

export default {
  createSpaService,
  getAllSpaServices,
  getSpaServiceById,
  updateSpaService,
  deleteSpaService,
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  deleteAppointment,
};
