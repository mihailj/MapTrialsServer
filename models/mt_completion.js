/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mt_completion', {
    id: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    objective_id: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    user_comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_completed: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    date_approved: {
      type: DataTypes.DATE,
      allowNull: true
    },
    objective_photo: {
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
    distance: {
      type: DataTypes.FLOAT,
      allowNull: true
    },	
    approved: {
      type: DataTypes.ENUM('y','n'),
      allowNull: false,
      defaultValue: "n"
    },
    approved_by_user_id: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    score: {
      type: DataTypes.BIGINT,
      allowNull: true
    }
  }, {
    tableName: 'mt_completion',
    classMethods: {
      associate: function associate(models) {
        models.mt_completion.belongsTo(models.mt_objectives, {
          foreignKey: 'objective_id',
        });
        models.mt_completion.belongsTo(models.mt_users, {
          foreignKey: 'user_id',
        });		
      },
    },
  });
};
