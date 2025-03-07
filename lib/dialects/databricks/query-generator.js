const AbstractQueryGenerator = require('../abstract/query-generator');
const Utils = require('../../utils');

'use strict';


class DatabricksQueryGenerator extends AbstractQueryGenerator {
	constructor(options) {
		super(options);
	}

	quoteIdentifier(identifier) {
		if (identifier === '*') {
			return identifier;
		}
		return `\`${identifier.replace(/`/g, '``')}\``;
	}

	createDatabaseQuery(databaseName, options) {
		return `CREATE DATABASE IF NOT EXISTS ${this.quoteIdentifier(databaseName)}`;
	}

	dropDatabaseQuery(databaseName, options) {
		return `DROP DATABASE IF EXISTS ${this.quoteIdentifier(databaseName)}`;
	}

	createSchemaQuery(schemaName, options) {
		return `CREATE SCHEMA IF NOT EXISTS ${this.quoteIdentifier(schemaName)}`;
	}

		// write a custom create table quer
	createTableQuery(tableName, attributes, options) {
		const primaryKeys = [];
		const attrStrings = [];

		for (const attrName in attributes) {
			const definition = attributes[attrName];
			let attrString = `${this.quoteIdentifier(attrName)} ${definition.type}`;

			if (definition.allowNull === false) {
				attrString += ' NOT NULL';
			}

			if (definition.defaultValue !== undefined) {
				attrString += ` DEFAULT ${this.escape(definition.defaultValue)}`;
			}

			if (definition.primaryKey === true) {
				primaryKeys.push(attrName);
			}

			attrStrings.push(attrString);
		}

		let sql = `CREATE TABLE IF NOT EXISTS ${this.quoteIdentifier(tableName)} (${attrStrings.join(', ')}`;

		if (primaryKeys.length > 0) {
			sql += `, PRIMARY KEY (${primaryKeys.map(pk => this.quoteIdentifier(pk)).join(', ')})`;
		}

		sql += ')';

		return sql;
	}

	describeTableQuery(tableName, options) {
		return `DESCRIBE ${this.quoteIdentifier(tableName)}`;
	}

	tableExistsQuery(tableName, options) {
		return `SHOW TABLES LIKE ${this.escape(tableName)}`;
	}

	addColumnQuery(tableName, attributes, options) {
		const attrString = this.attributesToSQL(attributes);
		return `ALTER TABLE ${this.quoteIdentifier(tableName)} ADD COLUMN ${attrString}`;
	}

	removeColumnQuery(tableName, attributeName, options) {
		return `ALTER TABLE ${this.quoteIdentifier(tableName)} DROP COLUMN ${this.quoteIdentifier(attributeName)}`;
	}

	changeColumnQuery(tableName, attributes, options) {
		const attrString = this.attributesToSQL(attributes);
		return `ALTER TABLE ${this.quoteIdentifier(tableName)} CHANGE COLUMN ${attrString}`;
	}

	renameColumnQuery(tableName, attrNameBefore, attrNameAfter, options) {
		return `ALTER TABLE ${this.quoteIdentifier(tableName)} CHANGE COLUMN ${this.quoteIdentifier(attrNameBefore)} ${this.quoteIdentifier(attrNameAfter)}`;
	}

	handleSequelizeMethod(attr, tableName, factory, options, prepend) {
		if (attr instanceof Utils.Json) {
			// Parse nested object
			if (attr.conditions) {
				const conditions = this.parseConditionObject(attr.conditions).map(condition =>
					`${this.jsonPathExtractionQuery(condition.path[0], _.tail(condition.path))} = '${condition.value}'`
				);
	
				return conditions.join(' AND ');
			}
			if (attr.path) {
				let str;
	
				// Allow specifying conditions using the sqlite json functions
				if (this._checkValidJsonStatement(attr.path)) {
					str = attr.path;
				} else {
					// Also support json property accessors
					const paths = _.toPath(attr.path);
					const column = paths.shift();
					str = this.jsonPathExtractionQuery(column, paths);
				}
	
				if (attr.value) {
					str += util.format(' = %s', this.escape(attr.value));
				}
	
				return str;
			}
		} else if (attr instanceof Utils.Cast) {
			if (/timestamp/i.test(attr.type)) {
				attr.type = 'datetime';
			} else if (attr.json && /boolean/i.test(attr.type)) {
				// true or false cannot be casted as booleans within a JSON structure
				attr.type = 'char';
			} else if (/double precision/i.test(attr.type) || /boolean/i.test(attr.type) || /integer/i.test(attr.type)) {
				attr.type = 'decimal';
			} else if (/text/i.test(attr.type)) {
				attr.type = 'char';
			}
		}
	
		return super.handleSequelizeMethod(attr, tableName, factory, options, prepend);
	}
	


	attributesToSQL(attributes) {
		const attrString = Object.keys(attributes).map(attrName => {
			const definition = attributes[attrName];
			let attrString = `${this.quoteIdentifier(attrName)} ${definition.type}`;

			if (definition.allowNull === false) {
				attrString += ' NOT NULL';
			}

			if (definition.defaultValue !== undefined) {
				attrString += ` DEFAULT ${this.escape(definition.defaultValue)}`;
			}

			return attrString;
		});

		return attrString.join(', ');
	}

	truncateTableQuery(tableName) {
		return Utils.joinSQLFragments([
					'TRUNCATE',
					this.quoteTable(tableName)
		]);
	}

	

	// Override methods specific to Databricks if needed
	// Example:
	// generateSelectQuery(tableName, options) {
	//   // Custom implementation for Databricks
	// }

	// Add any additional methods specific to Databricks
}

module.exports = DatabricksQueryGenerator;
