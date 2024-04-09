import { DBService } from '../db/db.service';
import { Approver } from '../domain/approver';

/**
 * Service class for managing Approvers.
 */
export class ApproverService {
    /**
     * Creates an instance of ApproverService.
     * @param dbService The database service instance.
     */
    constructor(private dbService: DBService) {}

    /**
     * Retrieves an Approver by ID.
     * @param approverId The ID of the Approver to retrieve.
     * @returns A Promise that resolves to the retrieved Approver.
     * @throws Error if the Approver is not found.
     */
    public async get(approverId: string): Promise<Approver> {
        const approver = await this.dbService.getApprover(approverId);
        if (!approver) {
            throw new Error('Approver not found');
        }

        return approver;
    }

    /**
     * Creates a new Approver.
     * @param approver The Approver object to create.
     * @returns A Promise that resolves when the Approver is created.
     */
    public async create(approver: Approver): Promise<void> {
        await this.dbService.insertApprover(approver);
    }
}
