/*
 * ANALYZER.JS
 * -----------
 * Contains the class that runs the 'cppcheck' static code analyzer.
 */

const vscode = require("vscode");
const cp = require("child_process");
const pc = require("./paramcheck");
const _ = require("lodash");

export function runOnFile(config, fileName, workspaceDir) {
    if (!config["enable"]) {
        vscode.window.showInformationMessage("Cppcheck is not enabled.");
        return;
    }

    let params = getCppcheckParameters(config, false);
    params.push(fileName);
    let out = runCppcheck(params, config, workspaceDir);
    return out;
}

export function runOnWorkspace(config, workspaceDir) {
    if (!config["enable"]) {
        vscode.window.showInformationMessage("Cppcheck is not enabled.");
        return;
    }

    let params = getCppcheckParameters(config, true);
    params.push(workspaceDir);
    let out = runCppcheck(params, config, workspaceDir);
    return out;
}

function runCppcheck(params, config, workspaceDir) {
    let start = "Cppcheck started: " + new Date().toString();
    console.log("Cppcheck: " + config["cppcheckPath"]);
    console.log("Cppcheck: params = " + params);
    let result = cp.spawnSync(config["cppcheckPath"], params, { "cwd": workspaceDir } );
    let stdout = "" + result.stdout;
    let stderr = "" + result.stderr;
    let end = "Cppcheck ended: " + new Date().toString();
    let out = [start, stdout, stderr, end].join("\n");
    return out;
}

function getCppcheckParameters(config, unusedFunction) {
    let enableParams = unusedFunction
                        ? [ "--enable=warning,style,performance,portability,information,unusedFunction" ]
                        : [ "--enable=warning,style,performance,portability,information" ];
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

    if (config["verbose"] === true) {
        params.push("--verbose");
    }

    return params;
}

function getIncludeParams(config) {
    let paths = config["includePaths"];
    let params = [];

    if (paths) {
        _.each(paths, element => {
            params.push('-I"' + element + '"');
        });
    }

    return params;
}

function getPlatformParams(config) {
    let platform = config["platform"];

    if (platform) {
        if (!pc.isValidPlatform(platform)) {
            return "--platform=native";
        }

        return "--platform=" + platform;
    }

    return "--platform=native";
}

function getStandardParams(config) {
    let standard = config["standard"];
    let params = [];

    if (standard) {
        _.each(standard, element => {
            if (pc.isValidStandard(element)) {
                params.push("--std=" + element);
            }
        });
    }
    else {
        params.push("--std=c++11");
        params.push("--std=c11");
    }

    return params;
}

function getDefineParams(config) {
    let define = config["define"];
    let params = [];

    if (define) {
        _.each(define, element => {
            params.push("-D" + element);
        });
    }

    return params;
}

function getUndefineParams(config) {
    let undefine = config["undefine"];
    let params = [];

    if (undefine) {
        _.each(undefine, element => {
            params.push("-U" + element);
        });
    }

    return params;
}

function getSuppressionParams(config) {
    let suppressions = config["suppressions"];
    let params = [];

    if (suppressions) {
        _.each(suppressions, element => {
            params.push("--suppress=" + element);
        })
    }

    return params;
}
