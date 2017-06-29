/**
 * @author Matthew Ferreira
 * @file Defines an object that handles text documents.
 */

import { TextDocument } from 'vscode';

/**
 * Defines an object that handles text documents.
 */
export interface TextDocumentHandler {
    /**
     * Opens a text document.
     * @param fileName The name of the file to open as a text document.
     * @return A promise containing either the opened text document or an error.
     */
    open(fileName: string): Thenable<TextDocument>;
}
