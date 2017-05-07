/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mt_tracking_sessions', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    admin_id_start: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    date_start: {
      type: DataTypes.DATE,
      allowNull: false
    },
    admin_id_end: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    date_end: {
      type: DataTypes.DATE,
      allowNull: true
    },
    user_id: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    }
  }, {
    tableName: 'mt_tracking_sessions',
    classMethods: {
      associate: function associate(models) {

		    models.mt_tracking_sessions.hasMany(models.mt_tracking, {foreignKey: 'session_id'});

      },
    },
  });
};
