/**
 * @author Matthew Ferreira
 * @file A mock implementation of TextDocumentHandler that verifies usage of the interface.
 */

import { TextDocument } from 'vscode';
import { TextDocumentHandler } from '../../src/TextDocumentHandler';

export class MockTextDocumentHandler implements TextDocumentHandler {
  /** Indicates whether the 'open' function was called. */
  wasOpen: boolean = false;

  /** If set, the 'open' function will return this. */
  openReturn: TextDocument;

  open(_fileName: string): Thenable<TextDocument> {
    this.wasOpen = true;
    if (this.openReturn) {
      return Promise.resolve(this.openReturn);
    } else {
      return Promise.reject('No text document available');
    }
  }
}
