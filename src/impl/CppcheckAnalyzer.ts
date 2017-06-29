/**
 * @author Matthew Ferreira
 * @file Contains the functions that run the 'cppcheck' static code analyzer.
 */

import { OutputChannel } from 'vscode';
import { spawnSync } from 'child_process';
import { each } from 'lodash';
const substituteVariables = require('var-expansion').substituteVariables; // no types available
const slash = require('slash'); // no types available
import { injectable, inject } from 'inversify';
import * as pc from '../paramcheck';
import { Analyzer } from '../Analyzer';
import { UserOutput } from '../UserOutput';
import SymbolSet from '../Symbols';

interface IExpansionResult {
    error?: any;
    result?: string;
}

/**
 * Runs the Cppcheck analyzer.
 */
@injectable()
export class CppcheckAnalyzer implements Analyzer {
    /**
     * Constructs a new instance of Analyzer.
     * @param userOutput Displays output to the user.
     * @param outputChannel The channel to which results should be written.
     */
    constructor(@inject(SymbolSet.UserOutput) private userOutput: UserOutput,
                @inject(SymbolSet.OutputChannel) private outputChannel: OutputChannel) {}

    /**
     * Runs Cppcheck on a single file.
     * @param config The extension configuration object.
     * @param fileName The file to analyzer.
     * @param workspaceDir The workspace directory. This need not contain the file, only the root.
     * @return A string containing the results of the analysis.
     */
    runOnFile(config: {[key:string]:any}, fileName: string, workspaceDir: string): string {
        if (!config['enable']) {
            this.userOutput.ShowInfo('Cppcheck is not enabled.');
            return undefined;
        }

        let params = this.getCppcheckParameters(config, workspaceDir, false, false);
        params.push(`"${fileName}"`);
        return this.runCppcheck(params, config, workspaceDir);
    }

    /**
     * Runs Cppcheck on the entire workspace.
     * @param config The extension configuration object.
     * @param workspaceDir The workspace directory.
     * @return A string containing the results of the analysis.
     */
    runOnWorkspace(config: {[key:string]:any}, workspaceDir: string): string {
        if (!config['enable']) {
            this.userOutput.ShowInfo('Cppcheck is not enabled.');
            return undefined;
        }

        let params = this.getCppcheckParameters(config, workspaceDir, true, false);
        params.push(`"${workspaceDir}"`);
        return this.runCppcheck(params, config, workspaceDir);
    }

    /**
     * Runs Cppcheck for the linter. This mode is the same as 'runOnWorkspace' but does not append 'inconslusive' or
     * 'verbose' to the command line, even if the options are set. In addtion, the results are an XML string, for the
     * ease of parsing.
     * @param config The extension configuration object.
     * @param workspaceDir The workspace directory.
     * @return A string containing the result of the analysis, in XML format.
     */
    runLintMode(config: {[key:string]:any}, workspaceDir: string): string {
        if (!config['enable']) {
            this.userOutput.ShowInfo('Cppcheck is not enabled.');
            return undefined;
        }

        let params = this.getCppcheckParameters(config, workspaceDir, true, true);
        params.push('--xml-version=2');
        params.push(`"${workspaceDir}"`);
        return spawnSync(config['cppcheckPath'], params, { 'cwd' : workspaceDir }).stderr.toString('utf8');
    }

    /**
     * Runs Cppcheck with the given parameters.
     * @param params The parameters to pass to Cppcheck.
     * @param config The extension configuration object.
     * @param workspaceDir The workspace directory.
     * @return A string containing the results of the analysis.
     */
    private runCppcheck(params: string[], config: {[key:string]:any}, workspaceDir: string): string {
        let start = 'Cppcheck started: ' + new Date().toString();
        let result = spawnSync(config['cppcheckPath'], params, { 'cwd': workspaceDir });
        let end = 'Cppcheck ended: ' + new Date().toString();
        let resultsArray: string[] = [start, result.stdout.toString('utf8'), result.stderr.toString('utf8'), end];

        if (config['outputCommandLine']) {
            let commandLine = `${config['cppcheckPath']} ${params.join(' ')}`;
            resultsArray.unshift(commandLine);
        }

        return resultsArray.join('\n');
    }

    /**
     * Collects Cppcheck parameters from the extension configuration object and the provided extra parameters.
     * @param config The extension configuration object.
     * @param workspaceDir The workspace directory.
     * @param unusedFunction Indicates whether to include warnings for unused functions.
     * @param lintMode Indicates whether the analyzer is running on behalf of the linter.
     */
    private getCppcheckParameters(config: {[key:string]:any}, workspaceDir: string, unusedFunction: boolean, lintMode: boolean): string[] {
        let enableParams = unusedFunction
                            ? [ '--enable=warning,style,performance,portability,information,unusedFunction' ]
                            : [ '--enable=warning,style,performance,portability,information' ];
        let includeParams = this.getIncludeParams(config, workspaceDir);
        let standardParams = this.getStandardParams(config);
        let defineParams = this.getDefineParams(config);
        let undefineParams = this.getUndefineParams(config);
        let suppressionParams = this.getSuppressionParams(config);
        let languageParam = this.getLanguageParams(config);
        let platformParam = this.getPlatformParams(config);
        let params = enableParams
                        .concat(includeParams)
                        .concat(standardParams)
                        .concat(defineParams)
                        .concat(undefineParams)
                        .concat(suppressionParams)
                        .concat(languageParam)
                        .concat(platformParam);

        if (!lintMode) {
            if (config['verbose'] === true) {
                params.push('--verbose');
            }

            if (config['inconclusive'] === true) {
                params.push('--inconclusive');
            }
        }

        if (config['force'] === true) {
            params.push('--force');
        }

        if (config['allowInlineSuppressions'] === true) {
            params.push('--inline-suppr');
        }

        return params;
    }

    /**
     * Collects the configured include paths as a set of parameters.
     * @param config The extension configuration object.
     * @param workspaceDir The workspace directory.
     * @return An array of strings containing the include path parameters.
     */
    private getIncludeParams(config: {[key:string]:any}, workspaceDir: string): string[] {
        let paths = config['includePaths'];
        let params: string[] = [];

        if (paths) {
            each(paths, (element: string) => {
                let value = this.expandVariables(element, workspaceDir);
                if (value.error) {
                    this.outputChannel.appendLine(`Error expanding include path '${element}': ${value.error.message}`);
                } else {
                    params.push(`-I"${value.result}"`);
                }
            });
        }

        return params;
    }

    /**
     * Expands environment variables contained in a path. The vscode 'workspaceRoot' variable is also expanded.
     * @param path The path to expand.
     * @param workspaceDir The workspace directory.
     * @return An object describing the expansion.
     */
    private expandVariables(path: string, workspaceDir: string): IExpansionResult {
        process.env.workspaceRoot = workspaceDir;
        let { value, error } = substituteVariables(path, { env: process.env });

        if (error) {
            return { error: error };
        } else if (value === '') {
            return { error: `Expanding '${path}' resulted in an empty string.` };
        } else {
            return { result: slash(value) };
        }
    }

    /**
     * Collects the Cppcheck platform parameter.
     * @param config The extension configuration object.
     * @return An array of strings containing the platform parameter.
     */
    private getPlatformParams(config: {[key:string]:any}): string[] {
        let platform = config['platform'];
        let params: string[] = [];

        if (platform && pc.isValidPlatform(platform)) {
            params.push(`--platform=${platform}`);
        } else {
            params.push('--platform=native');
        }

        return params;
    }

    /**
     * Collects the language standard parameters.
     * @param config The extension configuration object.
     * @return An array of strings containing the language standard parameters.
     */
    private getStandardParams(config: {[key:string]:any}): string[] {
        let standard = config['standard'];
        let params: string[] = [];

        if (standard) {
            each(standard, (element: string) => {
                if (pc.isValidStandard(element)) {
                    params.push(`--std=${element}`);
                }
            });
        }
        else {
            params.push('--std=c++11');
            params.push('--std=c11');
        }

        return params;
    }

    /**
     * Collects the preprocessor define parameters.
     * @param config The extension configuration object.
     * @return An array of strings containing the define parameters.
     */
    private getDefineParams(config: {[key:string]:any}): string[] {
        let define = config['define'];
        let params: string[] = [];

        if (define) {
            each(define, (element: string) => {
                params.push(`-D${element}`);
            });
        }

        return params;
    }

    /**
     * Collects the preprocessor undefine parameters.
     * @param config The extension configuration object.
     * @return An array of strings containing the undefine parameters.
     */
    private getUndefineParams(config: {[key:string]:any}): string[] {
        let undefine = config['undefine'];
        let params: string[] = [];

        if (undefine) {
            each(undefine, (element: string) => {
                params.push(`-U${element}`);
            });
        }

        return params;
    }

    /**
     * Collects the diagnostic suppression parameters.
     * @param config The extension configuration object.
     * @return An array of strings containing the suppression parameters.
     */
    private getSuppressionParams(config: {[key:string]:any}): string[] {
        let suppressions = config['suppressions'];
        let params: string[] = [];

        if (suppressions) {
            each(suppressions, (element: string) => {
                params.push(`--suppress=${element}`);
            });
        }

        return params;
    }

    /**
     * Collects the language parameter.
     * @param config The extension configuration object.
     * @return An array of strings containing the language paramter.
     */
    private getLanguageParams(config: {[key:string]:any}): string[] {
        let language = config['language'];
        let params: string[] = [];

        if (pc.isValidLanguage(language)) {
            params.push(`--language=${language}`);
        }

        return params;
    }
}
