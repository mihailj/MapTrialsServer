/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mt_locations', {
    id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    latitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    longitude: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    active: {
      type: DataTypes.ENUM('y','n'),
      allowNull: false,
      defaultValue: "y"
    },
    date_added: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    }
  }, {
    tableName: 'mt_locations',
    classMethods: {
      associate: function associate(models) {
		models.mt_locations.hasMany(models.mt_objectives, { foreignKey: 'location_id'} );
		models.mt_locations.belongsTo(models.mt_users, { foreignKey: 'user_id'} );
		
      },
    }, 	
  });
};
