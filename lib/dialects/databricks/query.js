const AbstractQuery = require('../abstract/query');
const sequelizeErrors = require('../../errors');
const { logger } = require('../../utils/logger');

'use strict';


class Query extends AbstractQuery {
	constructor(connection, sequelize, options) {
		super(connection, sequelize, options);
		this.options = options;
		this.connection = connection;
		this.instance = options.instance;
		this.model = options.model;
	}

	async run(sql) {
		this.sql = sql;
		// Implement query execution logic specific to Databricks dialect
		const session = await this.connection.openSession();
		const queryOperation = await session.executeStatement(sql, {
      runAsync: true,
    });
		const result = await queryOperation.fetchAll();
		await queryOperation.close();
    await session.close();
    await client.close();
		
		return result
	}

	formatResults(data) {
		// Implement result formatting based on Databricks response
		return data;
	}

	formatError(err) {
		// Implement error formatting based on Databricks response
		return new sequelizeErrors.DatabaseError(err);
	}
}

module.exports = Query;
Query.prototype.handleShowIndexesQuery = function (data) {
	// Implement handling of SHOW INDEXES query results
	return data;
};

Query.prototype.handleShowTablesQuery = function (data) {
	// Implement handling of SHOW TABLES query results
	return data;
};