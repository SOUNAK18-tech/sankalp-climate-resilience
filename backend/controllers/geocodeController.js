"use strict";

// -----------------------------------------------------------------------------
// FORWARD GEOCODING
// Place name -> latitude / longitude
// -----------------------------------------------------------------------------

const getGeocode = async (
    req,
    res
) => {
    try {
        const {
            q,
        } = req.query;

        if (
            !q ||
            typeof q !== "string" ||
            q.trim() === ""
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Query parameter 'q' is required",
            });
        }

        const nominatimUrl =
            "https://nominatim.openstreetmap.org/search" +
            `?q=${encodeURIComponent(
                q.trim()
            )}` +
            "&format=json" +
            "&limit=5" +
            "&addressdetails=1";

        const response =
            await fetch(
                nominatimUrl,
                {
                    headers: {
                        "User-Agent":
                            "Sankalp-Climate-Intelligence/1.0",
                        Accept:
                            "application/json",
                    },
                }
            );

        if (!response.ok) {
            return res.status(
                response.status
            ).json({
                success: false,
                message:
                    "Geocoding service unavailable",
            });
        }

        const data =
            await response.json();

        const results =
            data.map(
                (item) => ({
                    name:
                        item.display_name,

                    latitude:
                        Number(
                            item.lat
                        ),

                    longitude:
                        Number(
                            item.lon
                        ),

                    type:
                        item.type,

                    address:
                        item.address ||
                        {},
                })
            );

        res.status(200).json({
            success: true,
            results,
        });
    } catch (error) {
        console.error(
            "Geocode error:",
            error
        );

        res.status(503).json({
            success: false,
            message:
                `Geocoding failed: ${error.message}`,
        });
    }
};

// -----------------------------------------------------------------------------
// REVERSE GEOCODING
// latitude / longitude -> place
// -----------------------------------------------------------------------------

const getReverseGeocode =
    async (
        req,
        res
    ) => {
        try {
            const {
                lat,
                lon,
            } = req.query;

            if (
                !Number.isFinite(
                    Number(lat)
                ) ||
                !Number.isFinite(
                    Number(lon)
                )
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Valid lat and lon are required",
                });
            }

            const url =
                "https://nominatim.openstreetmap.org/reverse" +
                `?lat=${Number(lat)}` +
                `&lon=${Number(lon)}` +
                "&format=json" +
                "&addressdetails=1";

            const response =
                await fetch(
                    url,
                    {
                        headers: {
                            "User-Agent":
                                "Sankalp-Climate-Intelligence/1.0",
                            Accept:
                                "application/json",
                        },
                    }
                );

            if (!response.ok) {
                return res.status(
                    response.status
                ).json({
                    success: false,
                    message:
                        "Reverse geocoding service unavailable",
                });
            }

            const data =
                await response.json();

            res.status(200).json({
                success: true,

                result: {
                    displayName:
                        data.display_name,

                    latitude:
                        Number(
                            data.lat
                        ),

                    longitude:
                        Number(
                            data.lon
                        ),

                    address:
                        data.address ||
                        {},
                },
            });
        } catch (error) {
            console.error(
                "Reverse geocode error:",
                error
            );

            res.status(503).json({
                success: false,
                message:
                    `Reverse geocoding failed: ${error.message}`,
            });
        }
    };

module.exports = {
    getGeocode,
    getReverseGeocode,
};