import { DBService } from '../db/db.service';
import { Approver } from '../domain/approver';
import { Request } from '../domain/request';

/**
 * Service class for managing Requests.
 */
export class RequestService {
    /**
     * Creates an instance of RequestService.
     * @param dbService The database service instance.
     */
    constructor(private dbService: DBService) {}

    /**
     * Processes a request by updating its status based on the provided Approver.
     * @param requestId The ID of the request to process.
     * @param approver The Approver object responsible for approving or rejecting the request.
     * @returns A Promise that resolves when the request is processed.
     * @throws Error if the request is expired, already processed, or the Approver is not allowed to approve the request.
     */
    public async processRequest(
        requestId: string,
        approver: Approver,
        approve = true,
    ): Promise<void> {
        const request = await this.get(requestId);

        const canApproveRequest = this.canApproveRequest(request, approver);

        if (!canApproveRequest) {
            throw new Error('Approver has no permission to approve this request');
        }

        if (approve) {
            await this.dbService.updateRequestStatus(request.id, 'APPROVED');
        } else {
            await this.dbService.updateRequestStatus(request.id, 'REJECTED');
        }
    }

    /**
     * Retrieves a request by ID.
     * @param requestId The ID of the request to retrieve.
     * @returns A Promise that resolves to the retrieved Request.
     * @throws Error if the request is not found.
     */
    public async get(requestId: string): Promise<Request> {
        const request = await this.dbService.getRequest(requestId);
        if (!request) {
            throw new Error('Request not found');
        }

        return request;
    }

    /**
     * Creates a new request.
     * @param request The Request object to create.
     * @returns A Promise that resolves when the request is created.
     */
    public async create(request: Request): Promise<void> {
        if (request.isExpired()) {
            throw new Error('Request is expired');
        }
        if (request.type !== request.requester.role) {
            throw new Error('Request type must match requester role');
        }
        await this.dbService.insertRequest(request);
    }

    private canApproveRequest(request: Request, approver: Approver): boolean {
        if (request.isExpired()) {
            throw new Error('Request is expired');
        }

        if (request.status !== 'PENDING') {
            throw new Error('Request is already processed');
        }

        if (!approver.allowedTypes.includes(request.type)) {
            throw new Error('Approver is not allowed to approve this request type');
        }

        //TODO: THIS REQUIRES SOME CLARIFICATION
        if (request.requester.role === 'A') {
            throw new Error('Approver cannot approve request created by Requester of type A');
        }

        return approver.allowedTypes.includes(request.type);
    }
}
