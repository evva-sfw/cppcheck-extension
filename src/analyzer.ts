/*
 * ANALYZER.TS
 * -----------
 * Contains the functions that runs the 'cppcheck' static code analyzer.
 */

import * as vscode from 'vscode';
import { spawnSync } from 'child_process';
import { each } from 'lodash';
const substituteVariables = require('var-expansion').substituteVariables; // no types available
const slash = require('slash'); // no types available
import * as pc from './paramcheck';

let outputChannel: vscode.OutputChannel;
export function setOutputChannel(channel: vscode.OutputChannel): void {
    outputChannel = channel;
}

export function runOnFile(config: {[key:string]:any}, fileName: string, workspaceDir: string): string {
    if (!config['enable']) {
        vscode.window.showInformationMessage('Cppcheck is not enabled.');
        return undefined;
    }

    let params = getCppcheckParameters(config, false, false);
    params.push(`"${fileName}"`);
    let out = runCppcheck(params, config, workspaceDir);
    return out;
}

export function runOnWorkspace(config: {[key:string]:any}, workspaceDir: string): string {
    if (!config['enable']) {
        vscode.window.showInformationMessage('Cppcheck is not enabled.');
        return undefined;
    }

    let params = getCppcheckParameters(config, true, false);
    params.push(`"${workspaceDir}"`);
    let out = runCppcheck(params, config, workspaceDir);
    return out;
}

/** Lint mode does not append 'inconslusive' or 'verbose' to the command line, even if the options are set. */
export function runLintMode(config: {[key:string]:any}, workspaceDir: string): string {
    if (!config['enable']) {
        vscode.window.showInformationMessage('Cppcheck is not enabled.');
        return undefined;
    }

    let params = getCppcheckParameters(config, true, true);
    params.push('--xml-version=2');
    params.push(`"${workspaceDir}"`);
    let out = spawnSync(config['cppcheckPath'], params, { 'cwd' : workspaceDir }).stderr.toString('utf8');
    return out;
}

function runCppcheck(params: string[], config: {[key:string]:any}, workspaceDir: string): string {
    let start = 'Cppcheck started: ' + new Date().toString();
    let result = spawnSync(config['cppcheckPath'], params, { 'cwd': workspaceDir });
    let end = 'Cppcheck ended: ' + new Date().toString();
    let resultsArray: string[] = [start, result.stdout.toString('utf8'), result.stderr.toString('utf8'), end];

    if (config['outputCommandLine']) {
        let commandLine = `${config['cppcheckPath']} ${params.join(' ')}`;
        resultsArray.unshift(commandLine);
    }

    let out = resultsArray.join('\n');
    return out;
}

function getCppcheckParameters(config: {[key:string]:any}, unusedFunction: boolean, lintMode: boolean): string[] {
    let enableParams = unusedFunction
                        ? [ '--enable=warning,style,performance,portability,information,unusedFunction' ]
                        : [ '--enable=warning,style,performance,portability,information' ];
    let includeParams = getIncludeParams(config);
    let standardParams = getStandardParams(config);
    let defineParams = getDefineParams(config);
    let undefineParams = getUndefineParams(config);
    let suppressionParams = getSuppressionParams(config);
    let languageParam = getLanguageParam(config);
    let params = enableParams
                    .concat(includeParams)
                    .concat(standardParams)
                    .concat(defineParams)
                    .concat(undefineParams)
                    .concat(suppressionParams)
                    .concat(languageParam);
    let platformParams = getPlatformParams(config);
    params.push(platformParams);

    if (!lintMode && config['verbose'] === true) {
        params.push('--verbose');
    }

    if (config['force'] === true) {
        params.push('--force');
    }

    if (config['allowInlineSuppressions'] === true) {
        params.push('--inline-suppr');
    }

    if (!lintMode && config['inconclusive'] === true) {
        params.push('--inconclusive');
    }

    return params;
}

function getIncludeParams(config: {[key:string]:any}): string[] {
    let paths = config['includePaths'];
    let params: string[] = [];

    if (paths) {
        each(paths, (element: string) => {
            let value = expandVariables(element);
            if (value.error) {
                outputChannel.appendLine(`Error expanding include path '${element}': ${value.error.message}`);
            } else {
                params.push(`-I"${value.result}"`);
            }
        });
    }

    return params;
}

interface IExpansionResult {
    error?: any;
    result?: string;
}

function expandVariables(str: string): IExpansionResult {
    process.env.workspaceRoot = vscode.workspace.rootPath;
    let { value, error } = substituteVariables(str, { env: process.env });

    if (error) {
        return { error: error };
    } else if (value === '') {
        return { error: `Expanding '${str}' resulted in an empty string.` };
    } else {
        return { result: slash(value) };
    }
}

function getPlatformParams(config: {[key:string]:any}): string {
    let platform = config['platform'];

    if (platform) {
        if (!pc.isValidPlatform(platform)) {
            return '--platform=native';
        }

        return `--platform=${platform}`;
    }

    return '--platform=native';
}

function getStandardParams(config: {[key:string]:any}): string[] {
    let standard = config['standard'];
    let params: string[] = [];

    if (standard) {
        each(standard, (element: string) => {
            if (pc.isValidStandard(element)) {
                params.push(`--std=${element}`);
            }
        });
    }
    else {
        params.push('--std=c++11');
        params.push('--std=c11');
    }

    return params;
}

function getDefineParams(config: {[key:string]:any}): string[] {
    let define = config['define'];
    let params: string[] = [];

    if (define) {
        each(define, (element: string) => {
            params.push(`-D${element}`);
        });
    }

    return params;
}

function getUndefineParams(config: {[key:string]:any}): string[] {
    let undefine = config['undefine'];
    let params: string[] = [];

    if (undefine) {
        each(undefine, (element: string) => {
            params.push(`-U${element}`);
        });
    }

    return params;
}

function getSuppressionParams(config: {[key:string]:any}): string[] {
    let suppressions = config['suppressions'];
    let params: string[] = [];

    if (suppressions) {
        each(suppressions, (element: string) => {
            params.push(`--suppress=${element}`);
        });
    }

    return params;
}

function getLanguageParam(config: {[key:string]:any}): string[] {
    let language = config['language'];
    let params: string[] = [];

    if (pc.isValidLanguage(language)) {
        params.push(`--language=${language}`);
    }

    return params;
}