/**
 * @file UserOutput.ts
 * @author Matthew Ferreira
 * @desc Defines a type that provides output to the user.
 */

/**
 * Defines methods for displaying output for the user.
 */
export interface UserOutput {
    /**
     * Shows an error message.
     */
    ShowError(message: string): void;

    /**
     * Shows an informational message.
     */
    ShowInfo(message: string): void;

    /**
     * Shows a warning message.
     */
    ShowWarning(message: string): void;
}