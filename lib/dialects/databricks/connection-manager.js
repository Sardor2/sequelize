const { ConnectionManager } = require('sequelize/lib/dialects/abstract/connection-manager');
const { Sequelize } = require('sequelize');
const { DBSQLClient } = require('@databricks/sql');

class DatabricksConnectionManager extends ConnectionManager {
	constructor(dialect, sequelize) {
		super(dialect, sequelize);
		this.sequelize = sequelize;
		this.config = sequelize.config;
	}

	async connect(config) {
		const connectionConfig = {
			host: config.host,
			port: config.port || 443,
			username: config.username,
			oauthClientId: config.oauthClientId,
			oauthClientSecret: config.oauthClientSecret,		
		};

		try {
			const connection = await this._createConnection(connectionConfig);
			return connection;
		} catch (error) {
			throw new Sequelize.ConnectionError(error);
		}
	}

	async disconnect(connection) {
		if (connection) {
			try {
				await promisify(connection.end).bind(connection)();
			} catch (error) {
				throw new Sequelize.ConnectionError(error);
			}
		}
	}

	async _createConnection(config) {
		try {
			const client = new DBSQLClient();
			const connection = await client.connect({
				host: config.host,
				path: `/sql/protocolv1/o/${config.organizationId}/${config.clusterId}`,
				token: config.token,
			});
			return connection;
		} catch (error) {
			throw new Sequelize.ConnectionError(error);
		}
		
	}
}
module.exports = DatabricksConnectionManager;