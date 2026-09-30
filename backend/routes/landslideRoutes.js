"use strict";

const express = require("express");

const {
    getRisk,
} = require(
    "../controllers/landslideController"
);

const router =
    express.Router();

router.get(
    "/risk",
    getRisk
);

module.exports =
    router;