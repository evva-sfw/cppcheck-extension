/**
 * @author Matthew Ferreira
 * @file Tests functions in 'paramcheck.ts'.
 */

/// <reference types="mocha"/>

import * as assert from 'assert';
import * as pc from '../src/paramcheck';

suite('paramcheck', function() {
    suite('#isValidStandard', function() {
        test('returns false when given a bad standard', function() {
            assert.strictEqual(pc.isValidStandard('Pascal'), false);
            assert.strictEqual(pc.isValidLanguage('ISO8601'), false);
            assert.strictEqual(pc.isValidLanguage(null), false);
            assert.strictEqual(pc.isValidLanguage(undefined), false);
            assert.strictEqual(pc.isValidLanguage(''), false);
            assert.strictEqual(pc.isValidLanguage('ISO9000'), false);
            assert.strictEqual(pc.isValidLanguage('ecma-376'), false);
        });
        test('returns true when given valid standards', function() {
            const allowedStandards = [ 'posix', 'c89', 'c99', 'c11', 'c++03', 'c++11' ];
            for (let index = 0; index < allowedStandards.length; index++) {
                let element = allowedStandards[index];
                assert.strictEqual(pc.isValidStandard(element), true);
            }
        });
    });
    suite('#isValidPlatform', function() {
        test('returns false when given a bad platform', function() {
            assert.strictEqual(pc.isValidPlatform('ENIAC'), false);
            assert.strictEqual(pc.isValidPlatform('VC3600'), false);
            assert.strictEqual(pc.isValidPlatform('VAX'), false);
            assert.strictEqual(pc.isValidPlatform('UltraSPARC'), false);
            assert.strictEqual(pc.isValidPlatform(null), false);
            assert.strictEqual(pc.isValidPlatform(undefined), false);
            assert.strictEqual(pc.isValidPlatform(''), false);
        });
        test('returns true when given valid platforms', function() {
            const allowedPlatforms = [ 'unix32', 'unix64', 'win32A', 'win32W', 'win64', 'native' ];
            for (let index = 0; index < allowedPlatforms.length; index++) {
                let element = allowedPlatforms[index];
                assert.strictEqual(pc.isValidPlatform(element), true);
            }
        });
    });
    suite('#isValidLanguage', function() {
        test('returns false when given a bad language', function() {
            assert.strictEqual(pc.isValidLanguage('Pascal'), false);
            assert.strictEqual(pc.isValidLanguage('HTML'), false);
            assert.strictEqual(pc.isValidLanguage('Visual Basic'), false);
            assert.strictEqual(pc.isValidLanguage(''), false);
            assert.strictEqual(pc.isValidLanguage(undefined), false);
            assert.strictEqual(pc.isValidLanguage(null), false);
        });
        test('returns true when given a valid language', function() {
            const allowLanguages = [ 'c', 'c++' ];
            for (let index = 0; index < allowLanguages.length; index++) {
                let element = allowLanguages[index];
                assert.strictEqual(pc.isValidLanguage(element), true);
            }
        });
    });
});



