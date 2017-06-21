/**
 * @file VscodeTextDocumentHandler.ts
 * @author Matthew Ferreira
 * @desc Implements a text document handler by simply calling into vscode.
 */

import * as vscode from 'vscode';
import { TextDocumentHandler } from '../TextDocumentHandler';
import { injectable } from 'inversify';

/**
 * Implements a text document handler by simply calling into vscode.
 */
@injectable()
export class VscodeTextDocumentHandler implements TextDocumentHandler {
    /**
     * Opens a text document.
     * @param fileName The name of the file to open as a text document.
     * @return A promise containing either the opened text document or an error.
     */
    open(fileName: string): Thenable<vscode.TextDocument> {
        return vscode.workspace.openTextDocument(fileName);
    }
}
