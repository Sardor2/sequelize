const { AbstractDialect } = require('../abstract');
const ConnectionManager = require('./connection-manager');
const Query = require('./query');
const QueryGenerator = require('./query-generator');
const DataTypes = require('../../data-types').databricks;
const { DatabricksQueryInterface } = require('./query-interface');

'use strict';

class DatabricksDialect extends AbstractDialect {
	constructor(sequelize) {
		super();
		this.sequelize = sequelize;
		this.connectionManager = new ConnectionManager(this, sequelize);
		this.queryGenerator = new QueryGenerator({
			_dialect: this,
			sequelize,
		});
		this.queryInterface = new DatabricksQueryInterface(sequelize, this.queryGenerator);
	}

	get supports() {
		return {
			'DEFAULT': true,
			'DEFAULT VALUES': true,
			'VALUES ()': true,
			'LIMIT ON UPDATE': true,
			'ORDER NULLS': true,
			'UNION': true,
			'UNION ALL': true,
			'RIGHT JOIN': true,
			'EXISTS': true,
			'JOIN': true,
			'GROUP': true,
			'HAVING': true,
			'DISTINCT': true,
			'DISTINCT ON': true,
			'WITH': true,
			'ON DUPLICATE KEY': false,
			'INSERT IGNORE': false,
			'UPDATE': true,
			'DELETE': true,
			'TRUNCATE': true,
			'RETURNING': true,
			'EXCEPTION': true,
			'JSON': true,
			'ARRAY': true,
			'RANGE': true,
			'REGEXP': true,
			'I_LIKE': true,
			'ILIKE': true,
			'LIKE': true,
			'NOT LIKE': true,
			'NOT ILIKE': true,
			'NOT REGEXP': true,
			'NOT I_REGEXP': true,
			'REGEXP BINARY': true,
			'I_REGEXP BINARY': true,
			'BINARY': true,
			'COLLATE': true,
			'LIMIT': true,
			'OFFSET': true,
			'LOCK': true,
			'FOR SHARE': true,
			'FOR UPDATE': true,
			'SKIP LOCKED': true,
			'NO WAIT': true,
			'KEY': true,
			'FOREIGN KEY': false,
			'PRIMARY KEY': true,
			'UNIQUE': true,
			'INDEX': true,
			'SPATIAL': true,
			'CHECK': true,
			transactions: false,
		};
	}

	get defaultVersion() {
		return '1.0.0';
	}

	get Query() {
		return Query;
	}

	get QueryGenerator() {
		return this.queryGenerator;
	}

	get DataTypes() {
		return DataTypes;
	}

	get connectionManager() {
		return this.connectionManager;
	}

	get queryInterface() {
		return this.queryInterface;
	}
}

module.exports = DatabricksDialect;
