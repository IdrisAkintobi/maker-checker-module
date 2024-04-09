import { DBService } from '../db/db.service';
import { Requester } from '../domain/requester';

/**
 * Service class for managing Requesters.
 */
export class RequesterService {
    /**
     * Creates an instance of RequesterService.
     * @param dbService The database service instance.
     */
    constructor(private dbService: DBService) {}

    /**
     * Retrieves a requester by ID.
     * @param requesterId The ID of the requester to retrieve.
     * @returns A Promise that resolves to the retrieved Requester.
     * @throws Error if the requester is not found.
     */
    public async get(requesterId: string): Promise<Requester> {
        const requester = await this.dbService.getRequester(requesterId);
        if (!requester) {
            throw new Error('Requester not found');
        }

        return requester;
    }

    /**
     * Creates a new requester.
     * @param requester The Requester object to create.
     * @returns A Promise that resolves when the requester is created.
     */
    public async create(requester: Requester): Promise<void> {
        await this.dbService.insertRequester(requester);
    }
}
