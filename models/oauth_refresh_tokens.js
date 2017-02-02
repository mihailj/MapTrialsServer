/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('oauth_refresh_tokens', {
    id: {
      type: DataTypes.INTEGER(14),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    refresh_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    scope: {
      type: DataTypes.STRING,
      allowNull: true
    },
    client_id: {
      type: DataTypes.INTEGER(14),
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'oauth_refresh_tokens',
    classMethods: {
      associate: function associate(models) {
        models.oauth_refresh_tokens.belongsTo(models.oauth_clients, {
          foreignKey: 'client_id',
        });

        models.oauth_refresh_tokens.belongsTo(models.mt_users, {
          foreignKey: 'user_id',
        });
      },
	}
  });
};
