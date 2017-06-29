/**
 * @author Matthew Ferreira
 * @file A mock DiagnosticCollection used to abstract out vscode.
 */

import { Diagnostic, DiagnosticCollection, Uri } from 'vscode';

export class MockDiagnosticCollection implements DiagnosticCollection {
    /** Indicates whether the 'set' function was called. */
    wasSet: boolean = false;

    /** Indicates whether the 'clear' function was called. */
    wasClear: boolean = false;

    name: string;

    set(_uri: any, _diagnostics?: any) {
        this.wasSet = true;
    }

    clear(): void {
        this.wasClear = true;
    }

    delete(_uri: Uri): void {}

    dispose(): void {}

    forEach(_callback: (uri: Uri, diagnostics: Diagnostic[], collection: DiagnosticCollection) => any, _thisArg?: any): void {}

    get(_uri: Uri): Diagnostic[] {
        return [];
    }

    has(_uri: Uri): boolean {
        return false;
    }
}
