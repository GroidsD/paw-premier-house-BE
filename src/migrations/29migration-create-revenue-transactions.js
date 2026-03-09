"use strict";

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable("revenue_transactions", {
            revenue_id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            source_type: {
                type: Sequelize.ENUM("order", "booking"),
                allowNull: false,
            },

            order_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "orders",
                    key: "order_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            booking_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: "bookings",
                    key: "booking_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },

            transaction_type: {
                type: Sequelize.ENUM("income", "refund", "adjustment"),
                allowNull: false,
                defaultValue: "income",
            },

            gross_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },

            discount_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },

            net_amount: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false,
                defaultValue: 0,
            },

            status: {
                type: Sequelize.ENUM("recorded", "cancelled"),
                allowNull: false,
                defaultValue: "recorded",
            },

            transaction_date: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn("NOW"),
            },

            note: {
                type: Sequelize.STRING,
                allowNull: true,
            },

            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn("NOW"),
            },

            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.fn("NOW"),
            },
        });

        await queryInterface.addIndex("revenue_transactions", ["source_type"]);
        await queryInterface.addIndex("revenue_transactions", ["order_id"]);
        await queryInterface.addIndex("revenue_transactions", ["booking_id"]);
        await queryInterface.addIndex("revenue_transactions", [
            "transaction_type",
        ]);
        await queryInterface.addIndex("revenue_transactions", [
            "transaction_date",
        ]);
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable("revenue_transactions");

        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_revenue_transactions_source_type";',
        );
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_revenue_transactions_transaction_type";',
        );
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_revenue_transactions_status";',
        );
    },
};
