/**
 * @author Matthew Ferreira
 * @file Tests the CppcheckAnalyzer class.
 */

/// <reference types="mocha"/>

import * as assert from 'assert';
import { MockOutputChannel } from './mocks/OutputChannel';
import { MockUserOutput } from './mocks/UserOutput';
import { CppcheckAnalyzer } from '../src/impl/CppcheckAnalyzer';

suite('CppcheckAnalyzer', function() {
    suite('#runOnFile', function() {
        test('shows a message if not enabled', function() {
            let outputChannel = new MockOutputChannel();
            let userOutput = new MockUserOutput();
            let analyzer = new CppcheckAnalyzer(userOutput, outputChannel);
            let config: {[key:string]:any} = {};
            config['enable'] = false;
            analyzer.runOnFile(config, 'filename.cpp', 'C:/Workspaces');
            assert.strictEqual(userOutput.wasShowInfo, true);
        });
    });
});