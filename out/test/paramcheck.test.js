/*
 * PARAMCHECK.TEST.TS
 * ------------------
 * Tests functions in 'paramcheck.ts'.
 */
"use strict";
const assert = require("assert");
const pc = require("../src/paramcheck");
suite("paramcheck tests", paramcheckTests);
function paramcheckTests() {
    test("isValidStandard: bad standard", testIsValidStandard_BadStandard);
    test("isValidStandard: allowed standards", testIsValidStandard_AllowedStandards);
    test("isValidPlatform: bad platform", testIsValidPlatform_BadPlatform);
    test("isValidPlatform: allowed platforms", testIsValidPlatform_AllowedPlatforms);
}
function testIsValidStandard_BadStandard() {
    assert.strictEqual(pc.isValidStandard("Pascal"), false);
}
function testIsValidStandard_AllowedStandards() {
    const allowedStandards = ["posix", "c89", "c99", "c11", "c++03", "c++11"];
    for (let index = 0; index < allowedStandards.length; index++) {
        let element = allowedStandards[index];
        assert.strictEqual(pc.isValidStandard(element), true);
    }
}
function testIsValidPlatform_BadPlatform() {
    assert.strictEqual(pc.isValidPlatform("ENIAC"), false);
}
function testIsValidPlatform_AllowedPlatforms() {
    const allowedPlatforms = ["unix32", "unix64", "win32A", "win32W", "win64", "native"];
    for (let index = 0; index < allowedPlatforms.length; index++) {
        let element = allowedPlatforms[index];
        assert.strictEqual(pc.isValidPlatform(element), true);
    }
}
//# sourceMappingURL=paramcheck.test.js.map