/*
 * PARAMCHECK.JS
 * -------------
 * Contains functions that check whether provided parameters are valid.
 */

const _ = require("lodash");

exports.isValidStandard = isValidStandard;
exports.isValidPlatform = isValidPlatform;

function isValidStandard(standard) {
    const allowedStandards = [ "posix", "c89", "c99", "c11", "c++03", "c++11" ];
    return _.includes(allowedStandards, standard);
}

function isValidPlatform(platform) {
    const allowedPlatforms = [ "unix32", "unix64", "win32A", "win32W", "win64", "native" ];
    return _.includes(allowedPlatforms, platform);
}
