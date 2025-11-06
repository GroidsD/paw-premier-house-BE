// import db from "../models";

// // 🧴 Tạo dịch vụ mới
// let createSpaService = (data) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const { status, translations } = data;

//             const newService = await db.Service.create(
//                 {
//                     status,
//                     translations,
//                 },
//                 {
//                     include: [
//                         { model: db.ServiceTranslate, as: "translations" },
//                     ],
//                 }
//             );

//             resolve(newService);
//         } catch (e) {
//             reject(e);
//         }
//     });
// };

// // 💅 Lấy tất cả dịch vụ
// let getAllSpaServices = () => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const services = await db.Service.findAll({
//                 include: [
//                     { model: db.ServiceTranslate, as: "translations" },
//                     { model: db.Media, as: "media_service" },
//                     { model: db.Media, as: "media_hotel" },
//                 ],
//                 order: [["services_id", "ASC"]],
//             });

//             resolve(services);
//         } catch (e) {
//             reject(e);
//         }
//     });
// };

// // 🔍 Lấy dịch vụ theo ID
// let getSpaServiceById = (id) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const service = await db.Service.findByPk(id, {
//                 include: [{ model: db.ServiceTranslate, as: "translations" }],
//             });

//             if (!service) reject("Spa Service not found");
//             else resolve(service);
//         } catch (e) {
//             reject(e);
//         }
//     });
// };

// // ✏️ Cập nhật dịch vụ
// let updateSpaService = (id, data) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const { status, translations } = data;
//             const service = await db.Service.findByPk(id);

//             if (!service) {
//                 reject("Spa Service not found");
//             } else {
//                 await service.update({ status });

//                 if (translations && translations.length > 0) {
//                     for (const t of translations) {
//                         if (t.serviceTranslate_id) {
//                             // Update translation cũ
//                             await db.ServiceTranslate.update(
//                                 {
//                                     name: t.name,
//                                     description: t.description,
//                                     price: t.price,
//                                 },
//                                 {
//                                     where: {
//                                         serviceTranslate_id:
//                                             t.serviceTranslate_id,
//                                     },
//                                 }
//                             );
//                         } else {
//                             // Thêm translation mới
//                             await db.ServiceTranslate.create({
//                                 ...t,
//                                 services_id: service.services_id,
//                             });
//                         }
//                     }
//                 }

//                 const updated = await db.Service.findByPk(id, {
//                     include: [
//                         { model: db.ServiceTranslate, as: "translations" },
//                     ],
//                 });
//                 resolve(updated);
//             }
//         } catch (e) {
//             reject(e);
//         }
//     });
// };

// // 🗑️ Xóa dịch vụ
// let deleteSpaService = (id) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const service = await db.Service.findByPk(id);
//             if (!service) {
//                 reject("Spa Service not found");
//             } else {
//                 await db.ServiceTranslate.destroy({
//                     where: { services_id: id },
//                 });
//                 await service.destroy();
//                 resolve("Spa Service deleted successfully");
//             }
//         } catch (e) {
//             reject(e);
//         }
//     });
// };

// let createAppointment = (data) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const { customer_id, staff_id, items, date } = data;

//             if (!customer_id || !items || items.length === 0) {
//                 return reject("Missing customer_id or items");
//             }

//             // Lấy thông tin dịch vụ
//             const serviceIds = items.map((i) => i.service_id);
//             const services = await db.Service.findAll({
//                 where: { services_id: serviceIds },
//                 include: [{ model: db.ServiceTranslate, as: "translations" }],
//             });

//             let total_price = 0;
//             const appointmentItems = [];

//             for (const item of items) {
//                 const service = services.find(
//                     (s) => s.services_id === item.service_id
//                 );
//                 if (!service) continue;

//                 const price = service.translations[0]?.price || 0;
//                 const lineTotal = price;

//                 appointmentItems.push({
//                     service_id: item.service_id,
//                     total_price: lineTotal,
//                 });

//                 total_price += lineTotal;
//             }

//             // Tạo lịch hẹn
//             const appointment = await db.Appointment.create({
//                 customer_id,
//                 staff_id,
//                 total_price,
//                 status: "pending",
//                 date,
//             });

//             // Gắn các dịch vụ vào AppointmentItem
//             for (const item of appointmentItems) {
//                 await db.AppointmentItem.create({
//                     ...item,
//                     appointment_id: appointment.appointment_id,
//                 });
//             }

//             resolve({
//                 errCode: 0,
//                 errMessage: "Appointment created successfully",
//                 appointment_id: appointment.appointment_id,
//             });
//         } catch (e) {
//             reject(e);
//         }
//     });
// };

// let getAllAppointments = () => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const appointments = await db.Appointment.findAll({
//                 include: [
//                     {
//                         model: db.User,
//                         as: "customer",
//                         attributes: ["user_id", "name", "email"],
//                     },
//                     {
//                         model: db.User,
//                         as: "staff",
//                         attributes: ["user_id", "name", "email"],
//                     },
//                     {
//                         model: db.AppointmentItem,
//                         as: "items",
//                         include: [
//                             {
//                                 model: db.Service,
//                                 as: "service",
//                                 include: [
//                                     {
//                                         model: db.ServiceTranslate,
//                                         as: "translations",
//                                     },
//                                 ],
//                             },
//                         ],
//                     },
//                 ],
//                 order: [["appointment_id", "DESC"]],
//             });

//             resolve(appointments);
//         } catch (e) {
//             reject(e);
//         }
//     });
// };

// let getAppointmentById = (id) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const appointment = await db.Appointment.findByPk(id, {
//                 include: [
//                     {
//                         model: db.User,
//                         as: "customer",
//                         attributes: ["user_id", "name", "email"],
//                     },
//                     {
//                         model: db.User,
//                         as: "staff",
//                         attributes: ["user_id", "name", "email"],
//                     },
//                     {
//                         model: db.AppointmentItem,
//                         as: "items",
//                         include: [
//                             {
//                                 model: db.Service,
//                                 as: "service",
//                                 include: [
//                                     {
//                                         model: db.ServiceTranslate,
//                                         as: "translations",
//                                     },
//                                 ],
//                             },
//                         ],
//                     },
//                 ],
//             });

//             if (!appointment) reject("Appointment not found");
//             else resolve(appointment);
//         } catch (e) {
//             reject(e);
//         }
//     });
// };

// let updateAppointmentStatus = (id, status) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const appointment = await db.Appointment.findByPk(id);
//             if (!appointment) return reject("Appointment not found");

//             appointment.status = status;
//             await appointment.save();

//             resolve({ errCode: 0, errMessage: "Status updated successfully" });
//         } catch (e) {
//             reject(e);
//         }
//     });
// };

// let deleteAppointment = (id) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const appointment = await db.Appointment.findByPk(id);
//             if (!appointment) return reject("Appointment not found");

//             await db.AppointmentItem.destroy({ where: { appointment_id: id } });
//             await appointment.destroy();

//             resolve({
//                 errCode: 0,
//                 errMessage: "Appointment deleted successfully",
//             });
//         } catch (e) {
//             reject(e);
//         }
//     });
// };

// export default {
//     createSpaService,
//     getAllSpaServices,
//     getSpaServiceById,
//     updateSpaService,
//     deleteSpaService,
//     createAppointment,
//     getAllAppointments,
//     getAppointmentById,
//     updateAppointmentStatus,
//     deleteAppointment,
// };
