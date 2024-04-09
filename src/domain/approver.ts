/**
 * Represents an approver who can approve or deny requests.
 */
export class Approver {
    /**
     * Creates a new Approver instance.
     * @param id The unique identifier of the approver.
     * @param name The name of the approver.
     * @param allowedTypes An array of request types that the approver is allowed to approve.
     *                     The types can be "A", "B", or "C".
     */
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly allowedTypes: ('A' | 'B' | 'C')[],
    ) {}
}
