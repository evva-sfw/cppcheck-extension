/**
 * @author Matthew Ferreira
 * @file Defines a class that provides output to the user by implementing vscode messages.
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
  showError(message: string): void {
    vscode.window.showErrorMessage(message);
  }

  /**
   * Shows an informational message.
   */
  showInfo(message: string): void {
    vscode.window.showInformationMessage(message);
  }

  /**
   * Shows a warning message.
   */
  showWarning(message: string): void {
    vscode.window.showWarningMessage(message);
  }
}