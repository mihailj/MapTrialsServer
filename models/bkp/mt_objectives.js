/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mt_objectives', {
    id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    location_id: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    active: {
      type: DataTypes.ENUM('y','n'),
      allowNull: false,
      defaultValue: "y"
    },
    completed: {
      type: DataTypes.ENUM('y','n'),
      allowNull: false,
      defaultValue: "n"
    },
    multiple: {
      type: DataTypes.ENUM('y','n'),
      allowNull: false,
      defaultValue: "n"
    },
    score: {
      type: DataTypes.BIGINT,
      allowNull: false
    },
    date_added: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    date_completed: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'mt_objectives'
  });
};
