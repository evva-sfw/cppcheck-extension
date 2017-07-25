/**
 * @author Matthew Ferreira
 * @file Defines an object that lints source code files.
 */

import { DiagnosticCollection } from 'vscode';

export interface Linter {
  /**
   * Executes the linter.
   * @param diagnosticCollection The collection to which lint diagnostics should be written.
   * @param config The extension configuration object.
   * @param workspaceDir The workspace directory.
   */
  Execute(diagnosticCollection: DiagnosticCollection, config: { [key: string]: any }, workspaceDir: string): void;
}
