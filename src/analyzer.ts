/*
 * ANALYZER.TS
 * -----------
 * Contains the functions that runs the 'cppcheck' static code analyzer.
 */

import * as vscode from 'vscode';
import { spawnSync } from 'child_process';
import { each } from 'lodash';
import * as pc from './paramcheck';

export function runOnFile(config: {[key:string]:any}, fileName: string, workspaceDir: string) {
    if (!config['enable']) {
        vscode.window.showInformationMessage('Cppcheck is not enabled.');
        return undefined;
    }

    let params = getCppcheckParameters(config, false);
    params.push(fileName);
    let out = runCppcheck(params, config, workspaceDir);
    return out;
}

export function runOnWorkspace(config: {[key:string]:any}, workspaceDir: string) {
    if (!config['enable']) {
        vscode.window.showInformationMessage('Cppcheck is not enabled.');
        return undefined;
    }

    let params = getCppcheckParameters(config, true);
    params.push(workspaceDir);
    let out = runCppcheck(params, config, workspaceDir);
    return out;
}

function runCppcheck(params: string[], config: {[key:string]:any}, workspaceDir: string) {
    let start = 'Cppcheck started: ' + new Date().toString();
    let result = spawnSync(config['cppcheckPath'], params, { 'cwd': workspaceDir } );
    let stdout = '' + result.stdout;
    let stderr = '' + result.stderr;
    let end = 'Cppcheck ended: ' + new Date().toString();
    let out = [start, stdout, stderr, end].join('\n');
    return out;
}

function getCppcheckParameters(config: {[key:string]:any}, unusedFunction: boolean) {
    let enableParams = unusedFunction
                        ? [ '--enable=warning,style,performance,portability,information,unusedFunction' ]
                        : [ '--enable=warning,style,performance,portability,information' ];
    let includeParams = getIncludeParams(config);
    let standardParams = getStandardParams(config);
    let defineParams = getDefineParams(config);
    let undefineParams = getUndefineParams(config);
    let suppressionParams = getSuppressionParams(config);
    let params = enableParams
                    .concat(includeParams)
                    .concat(standardParams)
                    .concat(defineParams)
                    .concat(undefineParams)
                    .concat(suppressionParams);
    let platformParams = getPlatformParams(config);
    params.push(platformParams);

    if (config['verbose'] === true) {
        params.push('--verbose');
    }

    return params;
}

function getIncludeParams(config: {[key:string]:any}) {
    let paths = config['includePaths'];
    let params: string[] = [];

    if (paths) {
        each(paths, (element: string) => {
            params.push('-I"' + element + '"');
        });
    }

    return params;
}

function getPlatformParams(config: {[key:string]:any}) {
    let platform = config['platform'];

    if (platform) {
        if (!pc.isValidPlatform(platform)) {
            return '--platform=native';
        }

        return '--platform=' + platform;
    }

    return '--platform=native';
}

function getStandardParams(config: {[key:string]:any}) {
    let standard = config['standard'];
    let params: string[] = [];

    if (standard) {
        each(standard, (element: string) => {
            if (pc.isValidStandard(element)) {
                params.push('--std=' + element);
            }
        });
    }
    else {
        params.push('--std=c++11');
        params.push('--std=c11');
    }

    return params;
}

function getDefineParams(config: {[key:string]:any}) {
    let define = config['define'];
    let params: string[] = [];

    if (define) {
        each(define, (element: string) => {
            params.push('-D' + element);
        });
    }

    return params;
}

function getUndefineParams(config: {[key:string]:any}) {
    let undefine = config['undefine'];
    let params: string[] = [];

    if (undefine) {
        each(undefine, (element: string) => {
            params.push('-U' + element);
        });
    }

    return params;
}

function getSuppressionParams(config: {[key:string]:any}) {
    let suppressions = config['suppressions'];
    let params: string[] = [];

    if (suppressions) {
        each(suppressions, (element: string) => {
            params.push('--suppress=' + element);
        });
    }

    return params;
}
