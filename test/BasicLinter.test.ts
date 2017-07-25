/**
 * @author Matthew Ferreira
 * @file Tests the BasicLinter class.
 */

/// <reference types="mocha"/>

import * as assert from 'assert';
import { MockAnalyzer } from './mocks/Analyzer';
import { MockDiagnosticCollection } from './mocks/DiagnosticCollection';
import { MockSuppressionProvider } from './mocks/SuppressionProvider';
import { MockTextDocumentHandler } from './mocks/TextDocumentHandler';
import { MockUserOutput } from './mocks/UserOutput';
import { BasicLinter } from '../src/impl/BasicLinter';

suite('BasicLinter', function () {
  suite('#Execute', function () {
    test('calls "clear" on the DiagnosticCollection instance', function () {
      let analyzer = new MockAnalyzer();
      let suppressionProvider = new MockSuppressionProvider();
      let textDocumentHandler = new MockTextDocumentHandler();
      let userOutput = new MockUserOutput();
      let linter = new BasicLinter(suppressionProvider, analyzer, textDocumentHandler, userOutput);
      let diagnosticCollection = new MockDiagnosticCollection();
      linter.Execute(diagnosticCollection, {}, 'C:/Workspaces');
      assert.strictEqual(diagnosticCollection.wasClear, true);
    });
    test('calls "clear" on the SuppressionProvider instance', function () {
      let analyzer = new MockAnalyzer();
      let suppressionProvider = new MockSuppressionProvider();
      let textDocumentHandler = new MockTextDocumentHandler();
      let userOutput = new MockUserOutput();
      let linter = new BasicLinter(suppressionProvider, analyzer, textDocumentHandler, userOutput);
      let diagnosticCollection = new MockDiagnosticCollection();
      linter.Execute(diagnosticCollection, {}, 'C:/Workspaces');
      assert.strictEqual(suppressionProvider.wasClear, true);
    });
    test('calls "runLintMode" on the Analyzer instance', function () {
      let analyzer = new MockAnalyzer();
      let suppressionProvider = new MockSuppressionProvider();
      let textDocumentHandler = new MockTextDocumentHandler();
      let userOutput = new MockUserOutput();
      let linter = new BasicLinter(suppressionProvider, analyzer, textDocumentHandler, userOutput);
      let diagnosticCollection = new MockDiagnosticCollection();
      linter.Execute(diagnosticCollection, {}, 'C:/Workspaces');
      assert.strictEqual(analyzer.wasRunLintMode, true);
    });
  });
});
