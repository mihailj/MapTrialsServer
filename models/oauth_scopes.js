/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('oauth_scopes', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    scope: {
      type: DataTypes.STRING,
      allowNull: true
    },
    is_default: {
      type: DataTypes.INTEGER(1),
      allowNull: true
    }
  }, {
    tableName: 'oauth_scopes'
  });
};
