/**
 * @author Matthew Ferreira
 * @file Contains the exported set of injection symbols.
 */

let SymbolSet = {
  Analyzer: Symbol('Analyzer'),
  Linter: Symbol('Linter'),
  SuppressionProvider: Symbol('SuppressionProvider'),
  TextDocumentHandler: Symbol('TextDocumentHandler'),
  UserOutput: Symbol('UserOutput'),

  Manager: Symbol('Manager'),
  OutputChannel: Symbol('OutputChannel')
};

export default SymbolSet;
