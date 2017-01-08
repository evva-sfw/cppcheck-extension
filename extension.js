const vscode = require('vscode');
const cp = require("child_process");
const fs = require("fs");
const _ = require("underscore");

let disposables;
let config;
let outputChannel;

function activate(context) {
    console.log('Cppcheck now loaded');
    disposables = new Set();

    outputChannel = vscode.window.createOutputChannel("Cppcheck");
    disposables.add(outputChannel);

    configChanged();
    const configListener = vscode.workspace.onDidChangeConfiguration(configChanged);
    disposables.add(configListener);

    const runAnalysis_d = vscode.commands.registerCommand("cppcheck.runAnalysis", runAnalysis);
    const runAnalysisAllFiles_d = vscode.commands.registerCommand("cppcheck.runAnalysisAllFiles", runAnalysisAllFiles);
    const showCommands_d = vscode.commands.registerCommand("cppcheck.showCommands", showCommands);

    context.subscriptions.push(runAnalysis_d);
    context.subscriptions.push(runAnalysisAllFiles_d);
    context.subscriptions.push(showCommands_d);

    let statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -1000);
    statusItem.text = "Cppcheck";
    statusItem.command = "cppcheck.showCommands";
    statusItem.show();
    disposables.add(statusItem);
}

function deactivate() {
    _.each(disposables, doDispose);
}

function doDispose(item) {
    item.dispose();
}

function showCommands() {
    let items = [ ];

    items.push({ description: "Runs the analyzer on the current file.", label: "Analyze current file", detail: null, command: runAnalysis });
    items.push({ description: "Runs the analyzer on the entire workspace.", label: "Analyze workspace", detail: null, command: runAnalysisAllFiles });

    vscode.window.showQuickPick(items, { matchOnDetail: true, matchOnDescription: true }).then(selectedItem => {
        selectedItem.command();
    })
}

function getCppcheckParameters(unusedFunction) {
    let enableParams = unusedFunction ? [ "--enable=warning,style,performance,portability,information,unusedFunction" ] : [ "--enable=warning,style,performance,portability,information" ];
    let includeParams = getIncludeParams();
    let platformParams = getPlatformParams();
    let standardParams = getStandardParams();
    let params = enableParams.concat(includeParams).concat(standardParams);
    params.push(platformParams);
    return params;
}

function runCppcheck(params) {
    let dirName = vscode.workspace.rootPath;
    let start = "Cppcheck started: " + new Date().toString();
    console.log("Cppcheck: " + config["cppcheckPath"]);
    console.log("Cppcheck: params = " + params);
    let result = cp.spawnSync(config["cppcheckPath"], params, { "cwd": dirName } );
    let stdout = "" + result.stdout;
    let stderr = "" + result.stderr;
    let end = "Cppcheck ended: " + new Date().toString();
    
    outputChannel.clear();
    outputChannel.appendLine(start);
    outputChannel.appendLine(stdout);
    outputChannel.appendLine(stderr);
    outputChannel.appendLine(end);
}

function runAnalysis() {
    if (!config["enable"]) {
        vscode.window.showInformationMessage("Cppcheck is not enabled.");
        return;
    }

    let fileName = vscode.window.activeTextEditor.document.fileName;
    let params = getCppcheckParameters(false);
    params.push(fileName);

    runCppcheck(params);
}

function runAnalysisAllFiles() {
    if (!config["enable"]) {
        vscode.window.showInformationMessage("Cppcheck is not enabled.");
        return;
    }

    let dirName = vscode.workspace.rootPath;
    let params = getCppcheckParameters(true);
    params.push(dirName);

    runCppcheck(params);
}

function configChanged() {
    config = { };
    let settings = vscode.workspace.getConfiguration("cppcheck");
    
    if (settings) {
        let enable = settings.get("enable", false);

        function findCppcheckPath() {
            let cppcheckPath = settings.get("cppcheckPath", null);
        
            if (_.isNull(cppcheckPath)) {
                var file = process.env["ProgramFiles"] + "\\Cppcheck\\cppcheck.exe";

                if (fs.existsSync(file)) {
                    cppcheckPath = file;
                }
            }
        
            return cppcheckPath;
        }

        var cppcheckPath = findCppcheckPath();

        if (!fs.existsSync(cppcheckPath)) {
            vscode.window.showInformationMessage("Cppcheck: Could not find cppcheck.exe");
            enable = false;
        }

        config["enable"] = enable;
        config["cppcheckPath"] = cppcheckPath;
        config["includePaths"] = settings.get("includePaths", [ ]);

        let standard = settings.get("standard", [ "c11", "c++11" ]);
        let outStandard = [ ];
        _.each(standard, function(stElem) {
            if (isValidStandard(stElem))
                outStandard.push(stElem);
            else
                vscode.window.showErrorMessage("Cppcheck: Invalid standard given: " + stElem);
        });

        config["standard"] = outStandard;

        let platform = settings.get("platform");
        if (platform) {
            if (isValidPlatform(platform))
                config["platform"] = platform;
            else
                vscode.window.showErrorMessage("Cppcheck: Invalid platform given: " + platform);
        }
    }
}

function getIncludeParams() {
    let paths = config["includePaths"];
    let params = [ ];

    if (paths) {
        _.each(paths, function(element) {
            params.push('-I"' + element + '"');
        }, this);
    }

    return params;
}

function isValidStandard(standard) {
    const allowedStandards = [ "posix", "c89", "c99", "c11", "c++03", "c++11" ];
    return _.contains(allowedStandards, standard);
}

function isValidPlatform(platform) {
    const allowedPlatforms = [ "unix32", "unix64", "win32A", "win32W", "win64", "native" ];
    return _.contains(allowedPlatforms, platform);
}

function getPlatformParams() {
    let platform = config["platform"];

    if (platform) {
        if (!isValidPlatform(platform)) {
            return "--platform=native";
        }

        return "--platform=" + platform;
    }

    return "--platform=native";
}

function getStandardParams() {
    let standard = config["standard"];
    let params = [ ];

    if (standard) {
        _.each(standard, function(element) {
            if (isValidStandard(element))
                params.push("--std=" + element);
        }, this);
    }
    else {
        params.push("--std=c++11");
        params.push("--std=c11");
    }

    return params;
}

exports.activate = activate;
exports.deactivate = deactivate;