/**
 * @file SuppressionProvider.ts
 * @desc Defines an interface for an object that can suppress cppcheck diagnostic warnings and messages.
 */

import { CodeActionProvider, TextEditor, TextEditorEdit } from 'vscode';
import { CppcheckDiagnostic } from './CppcheckDiagnostic';

export interface SuppressionProvider extends CodeActionProvider {
    /**
     * Adds a cppcheck diagnostic to the suppression provider.
     * @param code A unique code used to associate the cppcheck diagnostic with a vscode problem.
     * @param diagnostic Diagnostic output from cppcheck.
     */
    add(code: string, diagnostic: CppcheckDiagnostic): void;

    /**
     * Clears all cppcheck diagnostics from the suppression provider.
     */
    clear(): void;

    /**
     * Informs the suppression provider whether inline suppressions are allowed.
     * @param allow Indicates whether inline suppressions are allowed.
     */
    setAllowInlineSuppressions(allow: Boolean): void;

    /**
     * Suppresses a single warning or message.
     * @param _editor The parameter is not used.
     * @param edit A single edit that will contain the added suppression.
     * @param diagnostic Contains diagnostic information from Cppcheck.
     */
    suppress(_editor: TextEditor, edit: TextEditorEdit, diagnostic: CppcheckDiagnostic): void
}