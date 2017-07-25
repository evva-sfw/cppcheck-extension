/**
 * @author Matthew Ferreira
 * @file A mock implementation of SuppressionProvider used to verify usage of the interface.
 */

import { CancellationToken, CodeActionContext, Command, Range, TextDocument, TextEditor, TextEditorEdit } from 'vscode';
import { CppcheckDiagnostic } from '../../src/CppcheckDiagnostic';
import { SuppressionProvider } from '../../src/SuppressionProvider';

export class MockSuppressionProvider implements SuppressionProvider {
  /** Indicates whether the 'add' function was called. */
  wasAdd: boolean = false;

  /** Indicates whether the 'clear' function was called. */
  wasClear: boolean = false;

  /** Indicates whether the 'provideCodeActions' function was called. */
  wasProvideCodeActions: boolean = false;

  /** Indicates whether the 'setAllowInlineSuppressions' function was called. */
  wasSetAllowInlineSuppressions: boolean = false;

  /** Indicates whether the 'suppress' function was called. */
  wasSuppress: boolean = false;

  add(_code: string, _diagnostic: CppcheckDiagnostic): void {
    this.wasAdd = true;
  }

  clear(): void {
    this.wasClear = true;
  }

  provideCodeActions(_document: TextDocument, _range: Range, _context: CodeActionContext, _token: CancellationToken): Command[] {
    this.wasProvideCodeActions = true;
    return [];
  }

  setAllowInlineSuppressions(_allow: Boolean): void {
    this.wasSetAllowInlineSuppressions = true;
  }

  suppress(_editor: TextEditor, _edit: TextEditorEdit, _diagnostic: CppcheckDiagnostic): void {
    this.wasSuppress = true;
  }
}
