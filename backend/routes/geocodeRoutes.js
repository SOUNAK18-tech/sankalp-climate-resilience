"use strict";

const express =
    require("express");

const {
    getGeocode,
    getReverseGeocode,
} = require(
    "../controllers/geocodeController"
);

const router =
    express.Router();

router.get(
    "/",
    getGeocode
);

router.get(
    "/reverse",
    getReverseGeocode
);

module.exports =
    router;