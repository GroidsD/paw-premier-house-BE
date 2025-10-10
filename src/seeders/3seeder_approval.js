"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("Approvals", [
      {
        equipmentId: 1,
        requestedBy: 2,
        assignedApproverId: 3,
        approvedBy: null,
        status: "pending",
        approvedAt: null,
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        equipmentId: 2,
        requestedBy: 2,
        assignedApproverId: 3,
        approvedBy: 3,
        status: "approved",
        approvedAt: new Date(),
        rejectionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        equipmentId: 3,
        requestedBy: 2,
        assignedApproverId: 3,
        approvedBy: 3,
        status: "rejected",
        approvedAt: new Date(),
        rejectionReason: "Không đủ thông tin thiết bị.",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Approvals", null, {});
  },
};
