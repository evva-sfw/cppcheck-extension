/*
 * ERRORDATA.TS
 * ------------
 * Defines the ErrorData class.
 */

export class ErrorData {
    Id: string;
    Severity: string;
    File: string;
    Line: string;
    Message: string;
}

export function errorEqualTo(left: ErrorData, right: ErrorData) {
    return left.Id === right.Id && left.File === left.File && left.Line === right.Line;
}