/**
 * @file extension.ts
 * @author Matthew Ferreira
 * @desc Contains the logic for loading and configuring the 'cppcheck' extension.
 */

import * as vscode from 'vscode';
import { existsSync } from 'fs';
import { platform } from 'os';
import { join } from 'path';
import { each, isNull } from 'lodash';
import * as opn from 'opn';
import * as pc from './paramcheck';

import { SuppressionProvider } from './SuppressionProvider';
import { CppcheckSuppressionProvider } from './impl/CppcheckSuppressionProvider';

import { Analyzer } from './Analyzer';
import { CppcheckAnalyzer } from './impl/CppcheckAnalyzer';

import { UserOutput } from './UserOutput';
import { VscodeUserOutput } from './impl/VscodeUserOutput';

import { Linter } from './Linter';
import { BasicLinter } from './impl/BasicLinter';

import { TextDocumentHandler } from './TextDocumentHandler';
import { VscodeTextDocumentHandler } from './impl/VscodeTextDocumentHandler';

let config: {[key:string]:any};
let outputChannel: vscode.OutputChannel;
let statusItem: vscode.StatusBarItem;

let diagnosticCollection: vscode.DiagnosticCollection = vscode.languages.createDiagnosticCollection('cppcheck');
let lastRootPath: string = '';
let lintInterval: NodeJS.Timer;

class Manager {
    constructor(private analyzer: Analyzer,
                private suppressionProvider: SuppressionProvider,
                private linter: Linter) {}

    configureExtension(context: vscode.ExtensionContext) {
        const filter: vscode.DocumentFilter = { language: 'cpp', scheme: 'file' };
        context.subscriptions.push(vscode.languages.registerCodeActionsProvider(filter, this.suppressionProvider));

        const cmd = vscode.commands.registerTextEditorCommand('cppcheck.suppressionCommand', this.suppressionProvider.suppress.bind(this.suppressionProvider));
        context.subscriptions.push(cmd);
    }

    /**
     * Runs the source code linter on the workspace.
     * @param config The extension configuration object.
     * @param diagnosticCollection The collection to which lint diagnostics should be written.
     * @param workspaceDir The workspace directory. This need not contain the file, only the root.
     */
    runLinter(config: {[key:string]:any}, diagnosticCollection: vscode.DiagnosticCollection, workspaceDir: string): void {
        this.linter.Execute(diagnosticCollection, config, workspaceDir);
    }

    /**
     * Runs Cppcheck on a single file.
     * @param config The extension configuration object.
     * @param fileName The file to analyzer.
     * @param workspaceDir The workspace directory. This need not contain the file, only the root.
     * @return A string containing the results of the analysis.
     */
    runOnFile(config: {[key:string]:any}, fileName: string, workspaceDir: string): string {
        return this.analyzer.runOnFile(config, fileName, workspaceDir);
    }

    /**
     * Runs Cppcheck on the entire workspace.
     * @param config The extension configuration object.
     * @param workspaceDir The workspace directory.
     * @return A string containing the results of the analysis.
     */
    runOnWorkspace(config: {[key:string]:any}, workspaceDir: string): string {
        return this.analyzer.runOnWorkspace(config, workspaceDir);
    }

    /**
     * Informs the suppression provider whether inline suppressions are allowed.
     * @param allow Indicates whether inline suppressions are allowed.
     */
    setAllowInlineSuppressions(allow: Boolean) {
        this.suppressionProvider.setAllowInlineSuppressions(allow);
    }
}

let manager: Manager;

export function activate(context: vscode.ExtensionContext) {
    outputChannel = vscode.window.createOutputChannel('Cppcheck');
    context.subscriptions.push(outputChannel);
    outputChannel.appendLine('Cppcheck is running.');

    const userOutput: UserOutput = new VscodeUserOutput();
    const analyzer: Analyzer = new CppcheckAnalyzer(userOutput, outputChannel);
    const suppressionProvider: SuppressionProvider = new CppcheckSuppressionProvider(userOutput);
    const textDocumentHandler: TextDocumentHandler = new VscodeTextDocumentHandler();
    const linter = new BasicLinter(suppressionProvider, analyzer, textDocumentHandler);

    manager = new Manager(analyzer, suppressionProvider, linter);
    manager.configureExtension(context);

    const runAnalysis_d = vscode.commands.registerCommand('cppcheck.runAnalysis', runAnalysis);
    const runAnalysisAllFiles_d = vscode.commands.registerCommand('cppcheck.runAnalysisAllFiles', runAnalysisAllFiles);
    const showCommands_d = vscode.commands.registerCommand('cppcheck.showCommands', showCommands);
    const readTheManual_d = vscode.commands.registerCommand('cppcheck.readTheManual', readTheManual);

    context.subscriptions.push(runAnalysis_d);
    context.subscriptions.push(runAnalysisAllFiles_d);
    context.subscriptions.push(showCommands_d);
    context.subscriptions.push(readTheManual_d);

    // const suppressionCommand_d = vscode.commands.registerTextEditorCommand('cppcheck.suppressionCommand', suppressionCommand);
    // context.subscriptions.push(suppressionCommand_d);

    statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, -1000);
    statusItem.text = 'Cppcheck';
    statusItem.command = 'cppcheck.showCommands';
    context.subscriptions.push(statusItem);

    configChanged();
    const configListener = vscode.workspace.onDidChangeConfiguration(configChanged);
    context.subscriptions.push(configListener);

    vscode.workspace.onDidSaveTextDocument((() => lintIfEnabled()).bind(this));

    // const filter: vscode.DocumentFilter = { language: 'cpp', scheme: 'file' };
    // context.subscriptions.push(vscode.languages.registerCodeActionsProvider(filter, new SuppressionProvider()));

    context.subscriptions.push(diagnosticCollection);
}

export function deactivate() {
    clearInterval(lintInterval);
}

function lintIfEnabled() {
    if (config['lintingEnabled']) {
        manager.runLinter(config, diagnosticCollection, vscode.workspace.rootPath);
    }
}

function checkWorkspaceChanged() {
    if (lastRootPath !== vscode.workspace.rootPath) {
        lastRootPath = vscode.workspace.rootPath;
        lintIfEnabled();
    }
}

function readTheManual(): Promise<void> {
    opn('http://cppcheck.sourceforge.net/manual.html');
    return Promise.resolve();
}

function showCommands() {
    interface CommandQuickPickItem extends vscode.QuickPickItem {
        command: () => Promise<void>;
    }

    let items: CommandQuickPickItem[] = [];
    items.push({ description: 'Runs the analyzer on the current file.', label: 'Analyze current file', command: runAnalysis });
    items.push({ description: 'Runs the analyzer on the entire workspace.', label: 'Analyze workspace', command: runAnalysisAllFiles });
    items.push({ description: 'Opens your web browser to the Cppcheck manual.', label: 'Read the manual', command: readTheManual });

    vscode.window.showQuickPick(items, { matchOnDetail: true, matchOnDescription: true }).then(selectedItem => {
        if (selectedItem && typeof selectedItem.command === 'function') {
            selectedItem.command();
        }
    });
}

function runAnalysis(): Promise<void> {
    if (!existsSync(config['cppcheckPath'])) {
        vscode.window.showErrorMessage('Cppcheck: Could not find cppcheck executable');
        return Promise.resolve();
    }

    let langId = vscode.window.activeTextEditor.document.languageId;
    if (langId !== 'cpp' && langId !== 'c') {
        vscode.window.showErrorMessage('Cppcheck: Analysis can only be run on C or C++ files.');
        return Promise.resolve();
    }

    let fileName = vscode.window.activeTextEditor.document.fileName;
    let workspaceDir = vscode.workspace.rootPath;
    let out = manager.runOnFile(config, fileName, workspaceDir);

    if (config['showOutputAfterRunning']) {
        outputChannel.show();
    }

    outputChannel.clear();
    outputChannel.appendLine(out);
    return Promise.resolve();
}

function runAnalysisAllFiles(): Promise<void> {
    if (!existsSync(config['cppcheckPath'])) {
        vscode.window.showErrorMessage('Cppcheck: Could not find cppcheck executable');
        return Promise.resolve();
    }

    if (!vscode.workspace.rootPath) {
        vscode.window.showErrorMessage('Cppcheck: A workspace must be open.');
        return Promise.resolve();
    }

    let workspaceDir = vscode.workspace.rootPath;
    let out = manager.runOnWorkspace(config, workspaceDir);

    if (config['showOutputAfterRunning']) {
        outputChannel.show();
    }

    outputChannel.clear();
    outputChannel.appendLine(out);
    return Promise.resolve();
}

function findCppcheckPath(settings: vscode.WorkspaceConfiguration) {
    let cppcheckPath = settings.get('cppcheckPath', null);

    if (isNull(cppcheckPath)) {
        let p = platform();
        if (p === 'win32') {
            let file = join(process.env['ProgramFiles'], 'Cppcheck', 'cppcheck.exe');
            // hard coded basically, but at least it can work
            let file64 = join(process.env.systemdrive, 'Program Files', 'Cppcheck', 'cppcheck.exe');
            if (existsSync(file)) {
                cppcheckPath = file;
            } else if (existsSync(file64)) {
                cppcheckPath = file64;
            }
        }
        else if (p === 'linux' || p === 'darwin') {
            let attempts = [ '/usr/bin/cppcheck', '/usr/sbin/cppcheck', '/usr/share/bin/cppcheck', '/usr/local/bin/cppcheck' ];
            for (let index = 0; index < attempts.length; index++) {
                if (existsSync(attempts[index])) {
                    cppcheckPath = attempts[index];
                    break;
                }
            }
        }
    }

    return cppcheckPath;
}

function configChanged() {
    config = {};
    let settings = vscode.workspace.getConfiguration('cppcheck');

    if (settings) {
        let enable = settings.get('enable', true);
        var cppcheckPath = findCppcheckPath(settings);

        if (!existsSync(cppcheckPath)) {
            vscode.window.showInformationMessage('Cppcheck: Could not find cppcheck executable');
            enable = false;
        }

        config['enable'] = enable;
        config['cppcheckPath'] = cppcheckPath;
        config['includePaths'] = settings.get('includePaths', []);
        config['define'] = settings.get('define', []);
        config['undefine'] = settings.get('undefine', []);
        config['suppressions'] = settings.get('suppressions', []);
        config['verbose'] = settings.get('verbose', false);
        config['force'] = settings.get('force', false);
        config['language'] = settings.get('language', 'c++');
        config['inconclusive'] = settings.get('inconclusive', false);
        config['showOutputAfterRunning'] = settings.get('showOutputAfterRunning', true);
        config['lintingEnabled'] = settings.get('lintingEnabled', false);
        config['outputCommandLine'] = settings.get('outputCommandLine', false);
        config['allowInlineSuppressions'] = settings.get('allowInlineSuppressions', true);
        config['severityLevels'] = settings.get('severityLevels', {
            error: 'Error',
            warning: 'Warning',
            style: 'Information',
            performance: 'Warning',
            portability: 'Warning',
            information: 'Information'
        });

        let standard = settings.get('standard', [ 'c11', 'c++11' ]);
        let outStandard: string[] = [];
        each(standard, function(stElem: string) {
            if (pc.isValidStandard(stElem)) {
                outStandard.push(stElem);
            }
            else {
                vscode.window.showErrorMessage('Cppcheck: Invalid standard given: ' + stElem);
            }
        });

        config['standard'] = outStandard;

        let platform = settings.get('platform', 'native');
        if (platform) {
            if (pc.isValidPlatform(platform.toString())) {
                config['platform'] = platform;
            }
            else {
                vscode.window.showErrorMessage('Cppcheck: Invalid platform given: ' + platform);
            }
        }

        let showStatusBarItem = settings.get('showStatusBarItem', true);
        if (showStatusBarItem) {
            statusItem.show();
        }
        else {
            statusItem.hide();
        }

        clearInterval(lintInterval);
        if (config['lintingEnabled']) {
            lintIfEnabled();
            lintInterval = setInterval((() => checkWorkspaceChanged()).bind(this), 1500);
        } else {
            diagnosticCollection.clear();
        }

        manager.setAllowInlineSuppressions(<Boolean>config['allowInlineSuppressions']);
    }
}
