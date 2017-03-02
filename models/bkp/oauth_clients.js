/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('oauth_clients', {
    id: {
      type: DataTypes.INTEGER(14),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    client_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    client_secret: {
      type: DataTypes.STRING,
      allowNull: true
    },
    redirect_uri: {
      type: DataTypes.STRING,
      allowNull: true
    },
    grant_types: {
      type: DataTypes.STRING,
      allowNull: true
    },
    scope: {
      type: DataTypes.STRING,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    }
  }, {
    tableName: 'oauth_clients',

    classMethods: {
      associate: function associate(models) {
        models.oauth_clients.belongsTo(models.mt_users, {
          foreignKey: 'user_id',
        });
      },
    },
  });
};
