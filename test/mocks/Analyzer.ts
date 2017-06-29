/**
 * @author Matthew Ferreira
 * @file A mock implementation of Analyzer used to verify usage of the interface.
 */

import { Analyzer } from '../../src/Analyzer';

export class MockAnalyzer implements Analyzer {
    /** Indicates whether the 'runLintMode' function was called. */
    wasRunLintMode: boolean = false;

    /** Indicates whether the 'runOnFile' function was called. */
    wasRunOnFile: boolean = false;

    /** Indicates whether the 'runOnWorkspace' function was called. */
    wasRunOnWorkspace: boolean = false;

    /** If set, the 'runLintMode' function will return this. */
    runLintModeReturn: string;

    /** If set, the 'runOnFile' function will return this. */
    runOnFileReturn: string;

    /** If set, the 'runOnWorkspace' function will return this. */
    runOnWorkspaceReturn: string;

    runLintMode(_config: {[key:string]:any}, _workspaceDir: string): string {
        this.wasRunLintMode = true;
        return this.runLintModeReturn || '';
    }

    runOnFile(_config: {[key:string]:any}, _fileName: string, _workspaceDir: string): string {
        this.wasRunOnFile = true;
        return this.runOnFileReturn || '';
    }

    runOnWorkspace(_config: {[key:string]:any}, _workspaceDir: string): string {
        this.wasRunOnWorkspace = true;
        return this.runOnWorkspaceReturn || '';
    }
}
