/**
 * @file VscodeUserOutput.TS
 * @author Matthew Ferreira
 * @desc Defines a class that provides output to the user by implementing vscode messages.
 */

import * as vscode from 'vscode';
import { UserOutput } from '../UserOutput';
import { injectable } from 'inversify';

/**
 * Displays output to the user via vscode messages.
 */
@injectable()
export class VscodeUserOutput implements UserOutput {
    /**
     * Shows an error message.
     */
    ShowError(message: string): void {
        vscode.window.showErrorMessage(message);
    }

    /**
     * Shows an informational message.
     */
    ShowInfo(message: string): void {
        vscode.window.showInformationMessage(message);
    }

    /**
     * Shows a warning message.
     */
    ShowWarning(message: string): void {
        vscode.window.showWarningMessage(message);
    }
}