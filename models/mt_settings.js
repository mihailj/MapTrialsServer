/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mt_settings', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'mt_settings'
  });
};
