/*
 * PARAMCHECK.TEST.TS
 * ------------------
 * Tests functions in 'paramcheck.ts'.
 */

import * as assert from 'assert';
import * as pc from '../src/paramcheck';

suite('paramcheck tests', paramcheckTests);

function paramcheckTests() {
    test('isValidStandard: bad standard', testIsValidStandard_BadStandard);
    test('isValidStandard: allowed standards', testIsValidStandard_AllowedStandards);

    test('isValidPlatform: bad platform', testIsValidPlatform_BadPlatform);
    test('isValidPlatform: allowed platforms', testIsValidPlatform_AllowedPlatforms);

    test('isValidLanguage: bad language', testIsValidLanguage_BadLanguage);
    test('isValidLanguage: allowed languages', testIsValidLanguage_AllowedLanguages);
}

function testIsValidStandard_BadStandard() {
    assert.strictEqual(pc.isValidStandard('Pascal'), false);
}

function testIsValidStandard_AllowedStandards() {
    const allowedStandards = [ 'posix', 'c89', 'c99', 'c11', 'c++03', 'c++11' ];
    for (let index = 0; index < allowedStandards.length; index++) {
        let element = allowedStandards[index];
        assert.strictEqual(pc.isValidStandard(element), true);
    }
}

function testIsValidPlatform_BadPlatform() {
    assert.strictEqual(pc.isValidPlatform('ENIAC'), false);
}

function testIsValidPlatform_AllowedPlatforms() {
    const allowedPlatforms = [ 'unix32', 'unix64', 'win32A', 'win32W', 'win64', 'native' ];
    for (let index = 0; index < allowedPlatforms.length; index++) {
        let element = allowedPlatforms[index];
        assert.strictEqual(pc.isValidPlatform(element), true);
    }
}

function testIsValidLanguage_BadLanguage() {
    assert.strictEqual(pc.isValidLanguage('Pascal'), false);
    assert.strictEqual(pc.isValidLanguage('HTML'), false);
    assert.strictEqual(pc.isValidLanguage('Visual Basic'), false);
}

function testIsValidLanguage_AllowedLanguages() {
    const allowLanguages = [ 'c', 'c++' ];
    for (let index = 0; index < allowLanguages.length; index++) {
        let element = allowLanguages[index];
        assert.strictEqual(pc.isValidLanguage(element), true);
    }
}
