/**
 * @author Matthew Ferreira
 * @file Defines a type that provides output to the user.
 */

/**
 * Defines methods for displaying output for the user.
 */
export interface UserOutput {
    /**
     * Shows an error message.
     */
    showError(message: string): void;

    /**
     * Shows an informational message.
     */
    showInfo(message: string): void;

    /**
     * Shows a warning message.
     */
    showWarning(message: string): void;
}