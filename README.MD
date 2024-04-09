# Product API

## Description

This module provides services for managing requests, requesters, and approvers in a database using the pg library for PostgreSQL..

## Requirements

-   [Node.js](https://nodejs.org/en/)
-   [NPM](https://www.npmjs.com/)
-   [PostgreSQL client for Node.js](https://www.postgresql.org)

## Dependency

-   [POSTGRESQL](https://www.npmjs.com/package/pg)

## Usage

To utilize the module, import the default export init and call it. This method is asynchronous and requires the PostgreSQL pool as a parameter. Upon invocation, you will receive instances of the three service classes. The init function handles the creation of database tables if they do not already exist, and it provides the database instance to the classes.

```typescript
const { Pool } = require("pg");
const init,
    { Approver, Request, Requester } = require("path-to-module-entry-file");

const pool = new Pool({
    user: "your_username",
    host: "localhost",
    database: "your_database",
    password: "your_password",
    port: 5432,
});

const { requestService, requesterService, approverService } = await init(pool);
// Use the services here...
```

## Installation

```bash
$ npm install
```

## Build

```bash
# development
$ npm run build
```

## Running the app

```bash
# development
$ npm run start
```

## Test

An instance of a PostgreSQL pool needs to be created for the tests to run. Ensure you have PostgreSQL installed and running, and then create a pool instance. You can modify the code in the test-db.instance.ts file to create a pool for the test:

```bash
$ npm run test
```

## License

[MIT licensed](LICENSE)
