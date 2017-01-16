/*
 * EXTENSION.TS
 * ------------
 * Contains the logic for loading and configuring the 'cppcheck' extension.
 */
"use strict";
const vscode = require("vscode");
const fs = require("fs");
const _ = require("lodash");
const pc = require("./paramcheck");
const an = require("./analyzer");
let disposables;
let config;
let outputChannel;
let statusItem;
function activate(context) {
    console.log("Cppcheck now loaded");
    disposables = new Set();
    outputChannel = vscode.window.createOutputChannel("Cppcheck");
    disposables.add(outputChannel);
    const runAnalysis_d = vscode.commands.registerCommand("cppcheck.runAnalysis", runAnalysis);
    const runAnalysisAllFiles_d = vscode.commands.registerCommand("cppcheck.runAnalysisAllFiles", runAnalysisAllFiles);
    const showCommands_d = vscode.commands.registerCommand("cppcheck.showCommands", showCommands);
    context.subscriptions.push(runAnalysis_d);
    context.subscriptions.push(runAnalysisAllFiles_d);
    context.subscriptions.push(showCommands_d);
    statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -1000);
    statusItem.text = "Cppcheck";
    statusItem.command = "cppcheck.showCommands";
    disposables.add(statusItem);
    configChanged();
    const configListener = vscode.workspace.onDidChangeConfiguration(configChanged);
    disposables.add(configListener);
}
exports.activate = activate;
function deactivate() {
    _.each(disposables, doDispose);
}
exports.deactivate = deactivate;
function doDispose(item) {
    item.dispose();
}
function showCommands() {
    let items = [];
    items.push({ description: "Runs the analyzer on the current file.", label: "Analyze current file", detail: null, command: runAnalysis });
    items.push({ description: "Runs the analyzer on the entire workspace.", label: "Analyze workspace", detail: null, command: runAnalysisAllFiles });
    vscode.window.showQuickPick(items, { matchOnDetail: true, matchOnDescription: true }).then(selectedItem => {
        if (selectedItem && typeof selectedItem.command === "function") {
            selectedItem.command();
        }
    });
}
function runAnalysis() {
    let langId = vscode.window.activeTextEditor.document.languageId;
    if (langId !== "cpp" && langId !== "c") {
        vscode.window.showErrorMessage("Cppcheck: Analysis can only be run on C or C++ files.");
        return Promise.resolve();
    }
    let fileName = vscode.window.activeTextEditor.document.fileName;
    let workspaceDir = vscode.workspace.rootPath;
    let out = an.runOnFile(config, fileName, workspaceDir);
    outputChannel.clear();
    outputChannel.appendLine(out);
    return Promise.resolve();
}
function runAnalysisAllFiles() {
    if (!vscode.workspace.rootPath) {
        vscode.window.showErrorMessage("Cppcheck: A workspace must be opened.");
        return Promise.resolve();
    }
    let workspaceDir = vscode.workspace.rootPath;
    let out = an.runOnWorkspace(config, workspaceDir);
    outputChannel.clear();
    outputChannel.appendLine(out);
    return Promise.resolve();
}
function findCppcheckPath(settings) {
    let cppcheckPath = settings.get("cppcheckPath", null);
    if (_.isNull(cppcheckPath)) {
        var file = process.env["ProgramFiles"] + "\\Cppcheck\\cppcheck.exe";
        if (fs.existsSync(file)) {
            cppcheckPath = file;
        }
    }
    return cppcheckPath;
}
function configChanged() {
    config = {};
    let settings = vscode.workspace.getConfiguration("cppcheck");
    if (settings) {
        let enable = settings.get("enable", false);
        var cppcheckPath = findCppcheckPath(settings);
        if (!fs.existsSync(cppcheckPath)) {
            vscode.window.showInformationMessage("Cppcheck: Could not find cppcheck executable");
            enable = false;
        }
        config["enable"] = enable;
        config["cppcheckPath"] = cppcheckPath;
        config["includePaths"] = settings.get("includePaths", []);
        config["define"] = settings.get("define", []);
        config["undefine"] = settings.get("undefine", []);
        config["suppressions"] = settings.get("suppressions", []);
        config["verbose"] = settings.get("verbose", false);
        let standard = settings.get("standard", ["c11", "c++11"]);
        let outStandard = [];
        _.each(standard, function (stElem) {
            if (pc.isValidStandard(stElem)) {
                outStandard.push(stElem);
            }
            else {
                vscode.window.showErrorMessage("Cppcheck: Invalid standard given: " + stElem);
            }
        });
        config["standard"] = outStandard;
        let platform = settings.get("platform", "native");
        if (platform) {
            if (pc.isValidPlatform(platform.toString())) {
                config["platform"] = platform;
            }
            else {
                vscode.window.showErrorMessage("Cppcheck: Invalid platform given: " + platform);
            }
        }
        let showStatusBarItem = settings.get("showStatusBarItem", true);
        if (showStatusBarItem) {
            statusItem.show();
        }
        else {
            statusItem.hide();
        }
    }
}
//# sourceMappingURL=extension.js.map