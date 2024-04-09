import { Pool } from 'pg';
import { DBService } from './db/db.service';
import { Approver } from './domain/approver';
import { Request } from './domain/request';
import { Requester } from './domain/requester';
import { ApproverService } from './service/approver.service';
import { RequestService } from './service/request.service';
import { RequesterService } from './service/requester.service';

// set default time zone for dates
process.env.TZ = 'UTC';

/**
 * Initializes the module with a PostgreSQL pool and returns services for managing requests, requesters, and approvers.
 * @param pool A PostgreSQL pool instance.
 * @returns An object containing the initialized services.
 */
const init = async (
    pool: Pool,
): Promise<{
    requestService: RequestService;
    requesterService: RequesterService;
    approverService: ApproverService;
}> => {
    const dbService = new DBService(pool);

    // here for testing
    await dbService.deleteTables();
    await dbService.createTables();

    const requestService = new RequestService(dbService);
    const requesterService = new RequesterService(dbService);
    const approverService = new ApproverService(dbService);
    return { requestService, requesterService, approverService };
};

export default init;
export { Approver, Request, Requester };
