"use strict";

const mongoose = require("mongoose");

const { Schema } = mongoose;

const climateAlertSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        message: {
            type: String,
            required: true,
            trim: true,
        },

        hazardType: {
            type: String,
            enum: [
                "landslide",
                "flood",
                "heavy_rainfall",
                "extreme_weather",
                "road_disruption",
                "climate",
            ],
            default: "climate",
        },

        severity: {
            type: String,
            enum: [
                "low",
                "medium",
                "high",
                "critical",
            ],
            default: "medium",
        },

        latitude: {
            type: Number,
        },

        longitude: {
            type: Number,
        },

        riskPercentage: {
            type: Number,
            min: 0,
            max: 100,
        },

        acknowledged: {
            type: Boolean,
            default: false,
        },

        acknowledgedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

climateAlertSchema.index({
    createdAt: -1,
});

climateAlertSchema.index({
    latitude: 1,
    longitude: 1,
});

climateAlertSchema.set(
    "toJSON",
    {
        virtuals: true,

        transform(doc, ret) {
            ret.id =
                ret._id.toString();

            delete ret._id;
            delete ret.__v;
        },
    }
);

module.exports =
    mongoose.model(
        "ClimateAlert",
        climateAlertSchema
    );