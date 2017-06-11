/*
 * SUPPRESSIONPROVIDER.TS
 * ----------------------
 * Defines a class that provides inline suppression of cppcheck diagnostics.
 */

import * as vscode from 'vscode';
import { ErrorData } from './errorData';

let errorDataMap: {[key:string]:ErrorData} = {};
let allowInlineSuppressions: Boolean = true;

export function suppressionCommand(_editor: vscode.TextEditor, edit: vscode.TextEditorEdit, error: ErrorData) {
    if (!allowInlineSuppressions) {
        vscode.window.showWarningMessage('Cppcheck: Inline suppressions are not currently enabled.');
    }
    let p: vscode.Position = new vscode.Position(Number.parseInt(error.Line) - 1, 0);
    let value = `// cppcheck-suppress ${error.Id}\n`;
    edit.insert(p, value);
}

export class SuppressionProvider implements vscode.CodeActionProvider {
    public provideCodeActions(_document: vscode.TextDocument, _range: vscode.Range, context: vscode.CodeActionContext, _token: vscode.CancellationToken): vscode.Command[] {
        let commands: vscode.Command[] = [];
        for (let index = 0; index < context.diagnostics.length; index++) {
            let d = context.diagnostics[index];
            if (d.code in errorDataMap) {
                let error = errorDataMap[d.code];
                let command: vscode.Command = {
                    command: 'cppcheck.suppressionCommand',
                    arguments: [ error ],
                    title: 'Suppress this message'
                };
                commands.push(command);
            }
        }
        return commands;
    }
}

export function addErrorData(code: string, error: ErrorData) {
    errorDataMap[code] = error;
}

export function clearErrorData() {
    errorDataMap = {};
}

export function setAllowInlineSuppressions(allow: Boolean) {
    allowInlineSuppressions = allow;
}