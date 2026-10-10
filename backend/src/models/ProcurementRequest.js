const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProcurementRequest = sequelize.define(
    "ProcurementRequest",
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },

        requestNumber: {
            type: DataTypes.STRING(50),
            allowNull: false,
            unique: true
        },

        title: {
            type: DataTypes.STRING(150),
            allowNull: false
        },

        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },

        priority: {
            type: DataTypes.ENUM(
                "LOW",
                "MEDIUM",
                "HIGH",
                "URGENT"
            ),
            defaultValue: "MEDIUM"
        },

        status: {
            type: DataTypes.ENUM(
                "PENDING",
                "APPROVED",
                "REJECTED",
                "PROCESSING",
                "COMPLETED"
            ),
            defaultValue: "PENDING"
        },

        requestedBy: {
            type: DataTypes.INTEGER,
            allowNull: false
        },

        approvedBy: {
            type: DataTypes.INTEGER,
            allowNull: true
        },

        approvalNote: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    },
    {
        tableName: "procurement_requests",
        timestamps: true
    }
);

module.exports = ProcurementRequest;