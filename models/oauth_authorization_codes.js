/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('oauth_authorization_codes', {
    id: {
      type: DataTypes.INTEGER(14),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    authorization_code: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    redirect_uri: {
      type: DataTypes.STRING,
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
    tableName: 'oauth_authorization_codes'
  });
};
