/**
 * @author Matthew Ferreira
 * @file A mock OutputChannel used to abstract out vscode.
 */

import { OutputChannel } from 'vscode';

export class MockOutputChannel implements OutputChannel {
  name: string;
  append(_value: string): void { }
  appendLine(_value: string): void { }
  clear(): void { }
  show(_arg1?: any, _arg2?: any): void { }
  hide(): void { }
  dispose(): void { }
}
