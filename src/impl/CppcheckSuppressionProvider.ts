/*
 * SUPPRESSIONPROVIDER.TS
 * ----------------------
 * Defines a class that provides inline suppression of cppcheck diagnostics.
 */

import { CancellationToken, CodeActionContext, Command, Position, Range, TextDocument, TextEditor, TextEditorEdit } from 'vscode';
import { injectable, inject } from 'inversify';
import { CppcheckDiagnostic } from '../CppcheckDiagnostic';
import { UserOutput } from '../UserOutput';
import { SuppressionProvider } from '../SuppressionProvider';
import SymbolSet from '../Symbols';

/**
 * Provides inline code suppression of cppcheck warnings and messages.
 */
@injectable()
export class CppcheckSuppressionProvider implements SuppressionProvider {
    /**
     * Indicates whether inline suppressions are allowed. The provider will display a warning message,
     * but will otherwise still insert the suppression when requested.
     */
    private allowInlineSuppressions: Boolean = true;

    /**
     * Maps unique codes to cppcheck diagnostic objects.
     */
    private diagnosticMap: {[key:string]:CppcheckDiagnostic} = {};

    /**
     * Constructs an interface of SuppressionProvider.
     * @param userOutput The interface used for displaying output to the user.
     */
    constructor(@inject(SymbolSet.UserOutput) private userOutput: UserOutput) {}

    /**
     * Adds a cppcheck diagnostic to the suppression provider.
     * @param code A unique code used to associate the cppcheck diagnostic with a vscode problem.
     * @param diagnostic Diagnostic output from cppcheck.
     */
    add(code: string, diagnostic: CppcheckDiagnostic): void {
        this.diagnosticMap[code] = diagnostic;
    }

    /**
     * Clears all cppcheck diagnostics from the suppression provider.
     */
    clear(): void {
        this.diagnosticMap = {};
    }

    /**
     * Given a context object containing diagnostics, generates a set of applicable code actions for suppressing the associated warnings or messages.
     * @param _document The parameter is not used.
     * @param _range The parameter is not used.
     * @param context The context of the code action. A code is embedded within each diagnostic within the context, and is matched to a suppressable message or warning.
     * @param _token The parameter is not used.
     * @return The set of suppression code actions.
     */
    public provideCodeActions(_document: TextDocument, _range: Range, context: CodeActionContext, _token: CancellationToken): Command[] {
        let commands: Command[] = [];
        for (let index = 0; index < context.diagnostics.length; index++) {
            let d = context.diagnostics[index];
            if (d.code in this.diagnosticMap) {
                let error = this.diagnosticMap[d.code];
                let command: Command = {
                    command: 'cppcheck.suppressionCommand',
                    arguments: [ error ],
                    title: 'Suppress this message'
                };
                commands.push(command);
            }
        }
        return commands;
    }

    /**
     * Informs the suppression provider whether inline suppressions are allowed.
     * @param allow Indicates whether inline suppressions are allowed.
     */
    setAllowInlineSuppressions(allow: Boolean): void {
        this.allowInlineSuppressions = allow;
    }

    /**
     * Suppresses a single warning or message.
     * @param _editor The parameter is not used.
     * @param edit A single edit that will contain the added suppression.
     * @param diagnostic Contains diagnostic information from Cppcheck.
     */
    public suppress(_editor: TextEditor, edit: TextEditorEdit, diagnostic: CppcheckDiagnostic): void {
        if (!this.allowInlineSuppressions) {
            this.userOutput.ShowWarning('Cppcheck: Inline suppressions are not currently enabled.');
        }
        let p: Position = new Position(Number.parseInt(diagnostic.Line) - 1, 0);
        let value = `// cppcheck-suppress ${diagnostic.Id}\n`;
        edit.insert(p, value);
    }
}
