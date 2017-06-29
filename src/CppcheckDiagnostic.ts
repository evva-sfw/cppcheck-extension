/**
 * @author Matthew Ferreira
 * @file Defines the CppcheckDiagnostic data object.
 */

/**
 * Contains information about a single Cppcheck diagnostic.
 */
export class CppcheckDiagnostic {
    /**
     * The code that identifies the diagnostic. Each diagnostic generated by Cppcheck has a code, which is not unique.
     * If the same diagnostic generated in multiple places, each has the same code.
     */
    Id: string;

    /**
     * The severity of the diagnostic (e.g. warning).
     */
    Severity: string;

    /**
     * The file in which the diagnostic occurred.
     */
    File: string;

    /**
     * The line within the file on which the diagnostic occurred.
     */
    Line: string;

    /**
     * The diagnostic message. This is the output provided to the user.
     */
    Message: string;

    /**
     * Determines if this instance of CppcheckDiagnostic is the same as a different instance.
     * @param other Another instance of CppcheckDiagnostic.
     * @return true if the other instance is the same, otherwise false.
     */
    IsSameAs(other: CppcheckDiagnostic): Boolean {
        return this.Id === other.Id && this.File === other.File && this.Line === other.Line;
    }
}
