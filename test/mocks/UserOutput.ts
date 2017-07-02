/**
 * @author Matthew Ferreira
 * @file A mock implementation of UserOutput that verifies usage of the interface.
 */

import { UserOutput } from '../../src/UserOutput';

export class MockUserOutput implements UserOutput {
    /** Indicates whether the 'showError' function was called. */
    wasShowError: boolean = false;

    /** Indicates whether the 'showInfo' function was called. */
    wasShowInfo: boolean = false;

    /** Indicates whether the 'showWarning' function was called. */
    wasShowWarning: boolean = false;

    showError(_message: string): void {
        this.wasShowError = true;
    }
    showInfo(_message: string): void {
        this.wasShowInfo = true;
    }

    showWarning(_message: string): void {
        this.wasShowWarning = true;
    }

}
