/**
 * Represents a requester who can make requests.
 */
export class Requester {
    /**
     * Creates a new Requester instance.
     * @param id The unique identifier of the requester.
     * @param name The name of the requester.
     * @param role The role of the requester, which can be "A", "B", or "C".
     */
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly role: 'A' | 'B' | 'C',
    ) {}
}
