/**
 * @author Matthew Ferreira
 * @file Parses cppcheck output and adds linting hints to files.
 */

import { Diagnostic, DiagnosticCollection, DiagnosticSeverity, Range, TextDocument } from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import SymbolSet from '../Symbols';
import { injectable, inject } from 'inversify';
import { v1 } from 'uuid';
import { parseString } from 'xml2js';
import { get, some } from 'lodash';
import { Analyzer } from '../Analyzer';
import { CppcheckDiagnostic } from '../CppcheckDiagnostic';
import { SuppressionProvider } from '../SuppressionProvider';
import { Linter } from '../Linter';
import { TextDocumentHandler } from '../TextDocumentHandler';

type SeverityLevel = 'Error' | 'Warning' | 'Information' | 'Hint' | 'None';
interface SeverityMaps {
    error: SeverityLevel;
    warning: SeverityLevel;
    style: SeverityLevel;
    performance: SeverityLevel;
    portability: SeverityLevel;
    information: SeverityLevel;
}

/**
 * Lints source code by calling into Cppcheck and analyzing its XML output.
 */
@injectable()
export class BasicLinter implements Linter {
    /**
     * Constructs a new instance of BasicLinter.
     * @param suppressionProvider The object that handles diagnostic suppression.
     * @param analyzer The object that analyzes source code files.
     * @param textDocumentHandler The object that handles text documents.
     */
    constructor(@inject(SymbolSet.SuppressionProvider) private suppressionProvider: SuppressionProvider,
                @inject(SymbolSet.Analyzer) private analyzer: Analyzer,
                @inject(SymbolSet.TextDocumentHandler) private textDocumentHandler: TextDocumentHandler) {}

    /**
     * Executes the linter by calling Cppcheck and parsing its XML output.
     * @param diagnosticCollection The collection to which lint diagnostics should be written.
     * @param config The extension configuration object.
     * @param workspaceDir The workspace directory.
     */
    Execute(diagnosticCollection: DiagnosticCollection, config: {[key:string]:any}, workspaceDir: string) {
        diagnosticCollection.clear();
        this.suppressionProvider.clear();
        let cppcheckOutput = this.analyzer.runLintMode(config, workspaceDir);
        this.parseXmlOutput(cppcheckOutput, diagnosticCollection, config, workspaceDir);
    }

    private getCorrectFileName(p: string, workspaceDir: string): string {
        if (!fs.existsSync(p)) {
            p = path.join(workspaceDir, p);
            if (!fs.existsSync(p)) {
                return null;
            }
        }
        return p;
    }

    private cppcheckSeverityToDiagnosticSeverity(severity: string, config: SeverityMaps): DiagnosticSeverity | Boolean {
        const cpplevel = (<any>config)[severity] as string;
        if (cpplevel === 'None') {
            return false;
        } else {
            return (<any>DiagnosticSeverity)[cpplevel] as DiagnosticSeverity;
        }
    }

    private readDiagnostic(error: any): CppcheckDiagnostic {
        let data = error['$'];
        let location = get(error, [ 'location', '0', '$' ], null);
        if (data && location) {
            let result = new CppcheckDiagnostic();
            result.Id = data.id;
            result.Severity = data.severity;
            result.File = location.file
            result.Line = location.line;
            result.Message = data.msg;
            return result;
        } else {
            return null;
        }
    }

    private parseXmlOutput(xml: string, diagnosticCollection: DiagnosticCollection, config: {[key:string]:any}, workspaceDir: string): void {
        parseString(xml, (error, result) => {
            if (error) {
                return;
            }

            let diagnosticsArray = get(result, [ 'results', 'errors', '0', 'error' ], null);
            if (!diagnosticsArray) {
                return;
            }

            let fileData: {[key:string]:CppcheckDiagnostic[]} = {};
            for (let index = 0; index < diagnosticsArray.length; index++) {
                let diagnostic = this.readDiagnostic(diagnosticsArray[index]);
                if (diagnostic) {
                    let fileName = this.getCorrectFileName(diagnostic.File, workspaceDir);
                    if (!(fileName in fileData)) {
                        fileData[fileName] = [];
                    }
                    if (!some(fileData[fileName], CppcheckDiagnostic.prototype.IsSameAs.bind(diagnostic))) {
                        fileData[fileName].push(diagnostic);
                        diagnostic.File = fileName;
                    }
                }
            }

            this.processFileErrorData(fileData, diagnosticCollection, config);
        });
    }

    private processFileErrorData(fileData: {[key:string]:CppcheckDiagnostic[]}, diagnosticCollection: DiagnosticCollection, config: {[key:string]:any}) {
        for (let fileName in fileData) {
            this.textDocumentHandler.open(fileName).then((doc: TextDocument) => {
                if (!doc) {
                    return;
                }
                let diagnostics: Diagnostic[] = [];
                for (let index = 0; index < fileData[fileName].length; index++) {
                    let error = fileData[fileName][index];
                    let line = Number(error.Line);
                    if (line > 0) {
                        line--;
                    }

                    let l = doc.lineAt(line);
                    let r = new Range(line, l.text.match(/\S/).index, line, l.text.length);
                    let level = this.cppcheckSeverityToDiagnosticSeverity(error.Severity, config['severityLevels'] as SeverityMaps);
                    if (level === undefined) {
                         level = DiagnosticSeverity.Information;
                    }
                    if (level !== false) {
                        let d = new Diagnostic(r, `(${error.Severity}) ${error.Message}`, <DiagnosticSeverity>level);
                        d.source = 'cppcheck';
                        d.code = v1().toString();
                        this.suppressionProvider.add(d.code, error);
                        diagnostics.push(d);
                    }
                }
                diagnosticCollection.set(doc.uri, diagnostics);
            }, (reason: any) => {
                console.log(reason.message || reason);
            })
        }
    }
}
