import { Pool } from 'pg';
import { Approver } from '../domain/approver';
import { Request } from '../domain/request';
import { Requester } from '../domain/requester';

/**
 * A service class for interacting with the database.
 */
export class DBService {
    private readonly pool: Pool;

    /**
     * Creates a new DBService instance.
     * @param pool The Pool instance for connecting to the PostgreSQL database.
     */
    constructor(pool: Pool) {
        this.pool = pool;
    }

    /**
     * Creates the necessary tables in the database if they do not exist.
     */
    public async createTables(): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            await client.query(`
                CREATE TABLE IF NOT EXISTS requester (
                    id VARCHAR(255) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    role CHAR(1) NOT NULL CHECK (role IN ('A', 'B', 'C'))
                );
            `);
            await client.query(`
                CREATE TABLE IF NOT EXISTS request (
                    id VARCHAR(255) PRIMARY KEY,
                    requester_id VARCHAR(255) NOT NULL REFERENCES requester(id) ON DELETE CASCADE,
                    type CHAR(1) NOT NULL CHECK (type IN ('A', 'B', 'C')),
                    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
                    expiration_date TIMESTAMP NOT NULL
                );
            `);
            await client.query(`
                    CREATE TABLE IF NOT EXISTS approver (
                    id VARCHAR(255) PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    allowed_types CHAR(1)[] NOT NULL CHECK (array_length(allowed_types, 1) > 0 AND array_length(allowed_types, 1) < 4)
                );
            `);
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Error creating tables:', error);
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Inserts a new requester into the database.
     * @param requester The requester object to insert.
     */
    public async insertRequester(requester: Requester): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query('INSERT INTO requester (id, name, role) VALUES ($1, $2, $3)', [
                requester.id,
                requester.name,
                requester.role,
            ]);
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves a requester from the database by ID.
     * @param id The ID of the requester to retrieve.
     * @returns A Promise that resolves to the retrieved requester, or null if not found.
     */
    public async getRequester(id: string): Promise<Requester | null> {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT * FROM requester WHERE id = $1', [id]);
            if (result.rowCount === 0) {
                return null;
            }
            const row = result.rows[0];
            return new Requester(row.id, row.name, row.role);
        } finally {
            client.release();
        }
    }

    /**
     * Inserts a new request into the database.
     * @param request The request object to insert.
     */
    public async insertRequest(request: Request): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query(
                'INSERT INTO request (id, requester_id, type, expiration_date) VALUES ($1, $2, $3, $4)',
                [
                    request.id,
                    request.requester.id,
                    request.type,
                    request.expirationDate.toISOString(),
                ],
            );
        } finally {
            client.release();
        }
    }

    /**
     * Updates the status of a request in the database.
     * @param requestId The ID of the request to update.
     * @param status The new status of the request ("APPROVED" or "REJECTED").
     */
    public async updateRequestStatus(
        requestId: string,
        status: 'APPROVED' | 'REJECTED',
    ): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query('UPDATE request SET status = $1 WHERE id = $2', [status, requestId]);
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves a request from the database by ID, including the associated requester information.
     * @param requestId The ID of the request to retrieve.
     * @returns A Promise that resolves to the retrieved request, or null if not found.
     */
    public async getRequest(requestId: string): Promise<Request | null> {
        const client = await this.pool.connect();
        try {
            const result = await client.query(
                `
                SELECT r.id, r.requester_id, r.type, r.status, r.expiration_date, rq.name, rq.role
                FROM request r
                JOIN requester rq ON r.requester_id = rq.id
                WHERE r.id = $1
            `,
                [requestId],
            );
            if (result.rowCount === 0) {
                return null;
            }
            const row = result.rows[0];
            return new Request(
                row.id,
                new Requester(row.requester_id as string, row.name, row.role),
                row.type,
                new Date(row.expiration_date),
                row.status,
            );
        } finally {
            client.release();
        }
    }

    /**
     * Inserts a new approver into the database.
     * @param approver The approver object to insert.
     */
    public async insertApprover(approver: Approver): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query(
                'INSERT INTO approver (id, name, allowed_types) VALUES ($1, $2, $3)',
                [approver.id, approver.name, `{${approver.allowedTypes.join()}}`],
            );
        } finally {
            client.release();
        }
    }

    /**
     * Retrieves an approver from the database by ID.
     * @param id The ID of the approver to retrieve.
     * @returns A Promise that resolves to the retrieved approver, or null if not found.
     */
    public async getApprover(id: string): Promise<Approver | null> {
        const client = await this.pool.connect();
        try {
            const result = await client.query('SELECT * FROM approver WHERE id = $1', [id]);
            if (result.rowCount === 0) {
                return null;
            }
            const row = result.rows[0];
            return new Approver(row.id, row.name, row.allowed_types);
        } finally {
            client.release();
        }
    }

    /**
     * Delete all tables
     * Used for testing purposes
     */
    public async deleteTables(): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query('DROP TABLE IF EXISTS requester CASCADE');
            await client.query('DROP TABLE IF EXISTS request CASCADE');
            await client.query('DROP TABLE IF EXISTS approver CASCADE');
        } finally {
            client.release();
        }
    }
}
