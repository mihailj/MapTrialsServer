/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mt_messages', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.ENUM('single','multiple','all'),
      allowNull: false,
      defaultValue: "single"
    },
    user_id: {
      type: DataTypes.INTEGER(10),
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: true
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    recipient_id: {
      type: DataTypes.INTEGER(10),
      allowNull: true
    },
    sent_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: sequelize.literal('CURRENT_TIMESTAMP')
    },
    reply_to: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    uid: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, {
    tableName: 'mt_messages',
    classMethods: {
      associate: function associate(models) {
        models.mt_messages.belongsTo(models.mt_users, {
          as: 'user_sender',
          foreignKey: 'user_id',
        });
		    models.mt_messages.belongsTo(models.mt_users, {
          as: 'user_recipient',
          foreignKey: 'recipient_id'
        });

      },
    },
  });
};
