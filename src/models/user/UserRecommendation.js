"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class UserRecommendation extends Model {
        static associate(models) {
            UserRecommendation.belongsTo(models.User, {
                foreignKey: "user_id",
                as: "user",
            });
        }
    }

    UserRecommendation.init(
        {
            recommendation_id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false,
            },
            user_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            entity_type: {
                type: DataTypes.ENUM("products", "pets", "users", "services"),
                allowNull: false,
            },
            entity_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            score: {
                type: DataTypes.FLOAT,
                defaultValue: 0,
                comment: "Điểm đánh giá mức độ phù hợp (AI hoặc rule)",
            },
            recommendation_reason: {
                type: DataTypes.STRING,
                allowNull: true,
                comment:
                    "Lý do gợi ý (ví dụ: dịch vụ tương tự, đánh giá cao...)",
            },

            // ✅ Thêm 2 cột mới:
            algorithm_type: {
                type: DataTypes.STRING,
                allowNull: true,
                comment:
                    "Loại thuật toán tạo gợi ý (rule_based, ai_model_v1, ...)",
            },
            valid_until: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: "Ngày hết hạn của gợi ý (để cập nhật định kỳ)",
            },

            created_at: DataTypes.DATE,
            updated_at: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: "UserRecommendation",
            tableName: "UserRecommendations",
            freezeTableName: true,
            timestamps: true,
            createdAt: "created_at",
            updatedAt: "updated_at",
        }
    );

    return UserRecommendation;
};
