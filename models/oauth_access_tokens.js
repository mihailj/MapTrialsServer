/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('oauth_access_tokens', {
    id: {
      type: DataTypes.INTEGER(14),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    access_token: {
      type: DataTypes.STRING,
      allowNull: true
    },
    expires: {
      type: DataTypes.DATE,
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
    tableName: 'oauth_access_tokens',
	classMethods: {
      associate: function(models) {
        models.oauth_access_tokens.belongsTo(models.oauth_clients, {
          foreignKey: 'client_id',
        });

        models.oauth_access_tokens.belongsTo(models.mt_users, {
          foreignKey: 'user_id',
        });
      },
    }
  });

};

/*

module.exports.getAccessToken = function(bearerToken, callback) {
  OAuthAccessTokensModel.findOne({ accessToken: bearerToken }, callback);
};

module.exports.saveAccessToken = function(token, clientId, expires, userId, callback) {
  var fields = {
    clientId: clientId,
    userId: userId,
    expires: expires
  };

  OAuthAccessTokensModel.update({ accessToken: token }, fields, { upsert: true }, function(err) {
    if (err) {
      console.error(err);
    }

    callback(err);
  });
};*/