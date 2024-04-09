import { Requester } from './requester';

/**
 * Represents a request with a unique identifier, requester, type, expiration date, and status.
 */
export class Request {
    /**
     * Creates a new Request instance.
     * @param id The unique identifier of the request.
     * @param requester The requester of the request.
     * @param type The type of the request, which can be "A", "B", or "C".
     * @param expirationDate The expiration date of the request.
     * @param status The status of the request, which can be "PENDING", "APPROVED", or "REJECTED" (default is "PENDING").
     */
    constructor(
        public readonly id: string,
        public readonly requester: Requester,
        public readonly type: 'A' | 'B' | 'C',
        public readonly expirationDate: Date,
        public readonly status: 'PENDING' | 'APPROVED' | 'REJECTED' = 'PENDING',
    ) {}

    /**
     * Checks if the request is expired based on the expiration date.
     * @returns True if the request is expired, false otherwise.
     */
    public isExpired(): boolean {
        return this.expirationDate < new Date();
    }
}
