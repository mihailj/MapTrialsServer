/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mt_users', {
    id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('normal','admin'),
      allowNull: false,
      defaultValue: "normal"
    },
    score: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: "0"
    },
    objectives_completed: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: "0"
    },	
	scope: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, {
    tableName: 'mt_users',
    classMethods: {
      associate: function associate(models) {
		models.mt_users.hasMany(models.mt_completion, {foreignKey: 'user_id'});
      },	  
    },	
  });
};
