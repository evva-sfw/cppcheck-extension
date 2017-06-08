/**
 * LINTER.TS
 * ---------
 * Parses cppcheck output and adds linting hints to files.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { v1 } from 'uuid';
import { parseString } from 'xml2js';
import { get, some } from 'lodash';
import { runLintMode } from './analyzer';
import { ErrorData, errorEqualTo } from './errorData';
import { addErrorData, clearErrorData } from './suppressionProvider';

type SeverityLevel = 'Error' | 'Warning' | 'Information' | 'Hint' | 'None';
interface SeverityMaps {
    error: SeverityLevel;
    warning: SeverityLevel;
    style: SeverityLevel;
    performance: SeverityLevel;
    portability: SeverityLevel;
    information: SeverityLevel;
}

function getCorrectFileName(p: string): string {
    if (!fs.existsSync(p)) {
        p = path.join(vscode.workspace.rootPath, p);
        if (!fs.existsSync(p)) {
            return null;
        }
    }
    return p;
}

function cppcheckSeverityToDiagnosticSeverity(severity: string, config: SeverityMaps): vscode.DiagnosticSeverity | Boolean {
    const cpplevel = (<any>config)[severity] as string;
    if (cpplevel === 'None') {
        return false;
    } else {
        return (<any>vscode.DiagnosticSeverity)[cpplevel] as vscode.DiagnosticSeverity;
    }
}

function readError(error: any): ErrorData {
    let data = error['$'];
    let location = get(error, [ 'location', '0', '$' ], null);
    if (data && location) {
        return {
            Id: data.id,
            Severity: data.severity,
            File: location.file,
            Line: location.line,
            Message: data.msg
        };
    } else {
        return null;
    }
}

function parseXmlOutput(xml: string, diagnosticCollection: vscode.DiagnosticCollection, config: {[key:string]:any}): void {
    parseString(xml, (error, result) => {
        if (error) {
            return;
        }

        let errorsArray = get(result, [ 'results', 'errors', '0', 'error' ], null);
        if (!errorsArray) {
            return;
        }

        let fileData: {[key:string]:ErrorData[]} = {};
        for (let index = 0; index < errorsArray.length; index++) {
            let error = readError(errorsArray[index]);
            if (error) {
                let fileName = getCorrectFileName(error.File)
                if (!(fileName in fileData)) {
                    fileData[fileName] = [];
                }
                if (!some(fileData[fileName], (ed: ErrorData) => errorEqualTo(error, ed))) {
                    fileData[fileName].push(error);
                    error.File = fileName;
                }
            }
        }

        processFileErrorData(fileData, diagnosticCollection, config);
    });
}

function processFileErrorData(fileData: {[key:string]:ErrorData[]}, diagnosticCollection: vscode.DiagnosticCollection, config: {[key:string]:any}) {
    for (let fileName in fileData) {
        vscode.workspace.openTextDocument(fileName).then((doc: vscode.TextDocument) => {
            let diagnostics: vscode.Diagnostic[] = [];
            for (let index = 0; index < fileData[fileName].length; index++) {
                let error = fileData[fileName][index];
                let line = Number(error.Line);
                if (line > 0) {
                    line--;
                }

                let l = doc.lineAt(line);
                let r = new vscode.Range(line, l.text.match(/\S/).index, line, l.text.length);
                let level = cppcheckSeverityToDiagnosticSeverity(error.Severity, config['severityLevels'] as SeverityMaps);
                if (level === undefined) {
                     level = vscode.DiagnosticSeverity.Information;
                }
                if (level !== false) {
                    let d = new vscode.Diagnostic(r, `(${error.Severity}) ${error.Message}`, <vscode.DiagnosticSeverity>level);
                    d.source = 'cppcheck';
                    d.code = v1().toString();
                    addErrorData(d.code, error);
                    diagnostics.push(d);
                }
            }
            diagnosticCollection.set(doc.uri, diagnostics);
        });
    }
}

export function Lint(diagnosticCollection: vscode.DiagnosticCollection, config: {[key:string]:any}) {
    diagnosticCollection.clear();
    clearErrorData();
    let cppcheckOutput = runLintMode(config, vscode.workspace.rootPath);
    parseXmlOutput(cppcheckOutput, diagnosticCollection, config);
}