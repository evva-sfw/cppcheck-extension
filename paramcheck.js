/*
 * PARAMCHECK.JS
 * -------------
 * Contains functions that check whether provided parameters are valid.
 */

const _ = require("lodash");

export function isValidStandard(standard) {
    const allowedStandards = [ "posix", "c89", "c99", "c11", "c++03", "c++11" ];
    return _.contains(allowedStandards, standard);
}

export function isValidPlatform(platform) {
    const allowedPlatforms = [ "unix32", "unix64", "win32A", "win32W", "win64", "native" ];
    return _.contains(allowedPlatforms, platform);
}
