/*
 * PARAMCHECK.TS
 * -------------
 * Contains functions that check whether provided parameters are valid.
 */
"use strict";
const _ = require("lodash");
function isValidStandard(standard) {
    const allowedStandards = ["posix", "c89", "c99", "c11", "c++03", "c++11"];
    return _.includes(allowedStandards, standard);
}
exports.isValidStandard = isValidStandard;
function isValidPlatform(platform) {
    const allowedPlatforms = ["unix32", "unix64", "win32A", "win32W", "win64", "native"];
    return _.includes(allowedPlatforms, platform);
}
exports.isValidPlatform = isValidPlatform;
//# sourceMappingURL=paramcheck.js.map