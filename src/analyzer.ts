/**
 * @file Analyzer.ts
 * @author Matthew Ferreira
 * @desc Defines an object that analyzes source code files.
 */

export interface Analyzer {
    /**
     * Runs the analyzer for the linter. The results of analysis are an XML string, for the ease of parsing.
     * @param config The extension configuration object.
     * @param workspaceDir The workspace directory.
     * @return A string containing the result of the analysis, in XML format.
     */
    runLintMode(config: {[key:string]:any}, workspaceDir: string): string

    /**
     * Runs the analyzer on a single file.
     * @param config The extension configuration object.
     * @param fileName The file to analyzer.
     * @param workspaceDir The workspace directory. This need not contain the file, only the root.
     * @return A string containing the results of the analysis.
     */
    runOnFile(config: {[key:string]:any}, fileName: string, workspaceDir: string): string;

    /**
     * Runs the analyzer on an entire workspace.
     * @param config The extension configuration object.
     * @param workspaceDir The workspace directory.
     * @return A string containing the results of the analysis.
     */
    runOnWorkspace(config: {[key:string]:any}, workspaceDir: string): string;
}
