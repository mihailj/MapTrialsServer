var _ = require('lodash');

var models  = require('./models');

/*
var sqldb = require('./sqldb');
var User = sqldb.User;
var OAuthClient = sqldb.OAuthClient;
var OAuthAccessToken = sqldb.OAuthAccessToken;
var OAuthAuthorizationCode = sqldb.OAuthAuthorizationCode;
var OAuthRefreshToken = sqldb.OAuthRefreshToken;*/


function getAccessToken(bearerToken) {
  /*return OAuthAccessToken
    .findOne({
      where: {access_token: bearerToken},
      attributes: [['access_token', 'accessToken'], ['expires', 'accessTokenExpiresAt'],'scope'],
      include: [
        {
          model: User,
          attributes: ['id', 'username'],
        }, OAuthClient
      ],
    })
    .then(function (accessToken) {
      if (!accessToken) return false;
      var token = accessToken.toJSON();
      token.user = token.User;
      token.client = token.OAuthClient;
      token.scope = token.scope
      return token;
    })
    .catch(function (err) {
      console.log("getAccessToken - Err: ")
    });*/
	
	return models.oauth_access_tokens.find({
      where: {access_token: bearerToken},
      attributes: [['access_token', 'accessToken'], ['expires', 'accessTokenExpiresAt'],'scope'],
      include: [
        {
          model: models.mt_users,
          attributes: ['id', 'username'],
        }, models.oauth_clients
      ],
    })
	.then(function(accessToken) {
		
      if (!accessToken) return false;

	  /*console.log('--- ACCESS TOKEN ---');
	  console.log(accessToken);*/
	  
      var token = accessToken.toJSON();
      token.user = token.mt_user;
      token.client = token.oauth_client;
      token.scope = token.scope
	  
	  /*console.log('--- TOKEN ---');
	  console.log(token);*/
	  
      return token;
		
	  }, function(error) {
		console.log("getAccessToken - Err: ", error)
	  });	
}

function getClient(clientId, clientSecret) {
/*  const options = {
    where: {client_id: clientId},
    attributes: ['id', 'client_id', 'redirect_uri'],
  };
  if (clientSecret) options.where.client_secret = clientSecret;

  return sqldb.OAuthClient
    .findOne(options)
    .then(function (client) {
      if (!client) return new Error("client not found");
      var clientWithGrants = client.toJSON()
      clientWithGrants.grants = ['authorization_code', 'password', 'refresh_token', 'client_credentials']
      // Todo: need to create another table for redirect URIs
      clientWithGrants.redirectUris = [clientWithGrants.redirect_uri]
      delete clientWithGrants.redirect_uri
      //clientWithGrants.refreshTokenLifetime = integer optional
      //clientWithGrants.accessTokenLifetime  = integer optional
      return clientWithGrants
    }).catch(function (err) {
      console.log("getClient - Err: ", err)
    });*/
	var params = { client_id: clientId };
    if (clientSecret != null) {
      params.client_secret = clientSecret;
    }
  
	return models.oauth_clients.find({ where: params })
	.then(function(client) {
		
      if (!client) return new Error("client not found");
	
      var clientWithGrants = client.toJSON()
      clientWithGrants.grants = ['authorization_code', 'password', 'refresh_token', 'client_credentials']
      // Todo: need to create another table for redirect URIs
      clientWithGrants.redirectUris = [clientWithGrants.redirect_uri]
      delete clientWithGrants.redirect_uri
      //clientWithGrants.refreshTokenLifetime = integer optional
      //clientWithGrants.accessTokenLifetime  = integer optional
	  
	  //console.log(clientWithGrants);
	  
      return clientWithGrants	
		
	  }, function(error) {
		console.log("getClient - Err: ", error)
	  });
}


function getUser(username, password) {
  /*return User
    .findOne({
      where: {username: username},
      attributes: ['id', 'username', 'password'],
    })
    .then(function (user) {
      return user.password == password ? user.toJSON() : false;
    })
    .catch(function (err) {
      console.log("getUser - Err: ", err)
    });*/
	
	return models.mt_users.find({ where: { username: username } })
	.then(function(user) {
		
      if (!user) return new Error("user not found");
	
	  //console.log(user.toJSON());
	
	  return user.password == password ? user.toJSON() : false;

	  }, function(error) {
		console.log("getUser - Err: ", error)
	  });	
	
}

function revokeAuthorizationCode(code) {
  return models.oauth_authorization_codes.findOne({
    where: {
      authorization_code: code.code
    }
  }).then(function (rCode) {
    //if(rCode) rCode.destroy();
    /***
     * As per the discussion we need set older date
     * revokeToken will expected return a boolean in future version
     * https://github.com/oauthjs/node-oauth2-server/pull/274
     * https://github.com/oauthjs/node-oauth2-server/issues/290
     */
    var expiredCode = code
    expiredCode.expiresAt = new Date('2015-05-28T06:59:53.000Z')
    return expiredCode
  }).catch(function (err) {
    console.log("getUser - Err: ", err)
  });
}

function revokeToken(token) {
  return OAuthRefreshToken.findOne({
    where: {
      refresh_token: token.refreshToken
    }
  }).then(function (rT) {
    if (rT) rT.destroy();
    /***
     * As per the discussion we need set older date
     * revokeToken will expected return a boolean in future version
     * https://github.com/oauthjs/node-oauth2-server/pull/274
     * https://github.com/oauthjs/node-oauth2-server/issues/290
     */
    var expiredToken = token
    expiredToken.refreshTokenExpiresAt = new Date('2015-05-28T06:59:53.000Z')
    return expiredToken
  }).catch(function (err) {
    console.log("revokeToken - Err: ", err)
  });
}


function saveToken(token, client, user) {
/*console.log('--- SAVE TOKEN ---');
console.log('--- token: ');
console.log(token);
console.log('--- client: ');
console.log(client);
console.log('--- user: ');
console.log(user);
*/
  return Promise.all([
      models.oauth_access_tokens.create({
        access_token: token.accessToken,
        expires: token.accessTokenExpiresAt,
        client_id: client.id,
        user_id: user.id,
        scope: token.scope
      }),
      token.refreshToken ? models.oauth_refresh_tokens.create({ // no refresh token for client_credentials
        refresh_token: token.refreshToken,
        expires: token.refreshTokenExpiresAt,
        client_id: client.id,
        user_id: user.id,
        scope: token.scope
      }) : [],

    ])
    .then(function (resultsArray) {
      return _.assign(  // expected to return client and user, but not returning
        {
          client: client,
          user: user,
          access_token: token.accessToken, // proxy
          refresh_token: token.refreshToken, // proxy
        },
        token
      )
    })
    .catch(function (err) {
      console.log("revokeToken - Err: ", err)
    });
}

function getAuthorizationCode(code) {
  return models.oauth_authorization_codes
    .findOne({
      attributes: ['client_id', 'expires', 'user_id', 'scope'],
      where: {authorization_code: code},
      include: [models.mt_users, models.oauth_clients]
    })
    .then(function (authCodeModel) {
      if (!authCodeModel) return false;
      var client = authCodeModel.oauth_client.toJSON()
      var user = authCodeModel.mt_user.toJSON()
      return reCode = {
        code: code,
        client: client,
        expiresAt: authCodeModel.expires,
        redirectUri: client.redirect_uri,
        user: user,
        scope: authCodeModel.scope,
      };
    }).catch(function (err) {
      console.log("getAuthorizationCode - Err: ", err)
    });
}

function saveAuthorizationCode(code, client, user) {
  return models.oauth_authorization_codes
    .create({
      expires: code.expiresAt,
      client_id: client.id,
      authorization_code: code.authorizationCode,
      user_id: user.id,
      scope: code.scope
    })
    .then(function () {
      code.code = code.authorizationCode
      return code
    }).catch(function (err) {
      console.log("saveAuthorizationCode - Err: ", err)
    });
}

function getUserFromClient(client) {
  var options = {
    where: {client_id: client.client_id},
    include: [models.mt_users],
    attributes: ['id', 'client_id', 'redirect_uri'],
  };
  if (client.client_secret) options.where.client_secret = client.client_secret;

  return models.o_auth_clients
    .findOne(options)
    .then(function (client) {
      if (!client) return false;
      if (!client.mt_users) return false;
      return client.mt_users.toJSON();
    }).catch(function (err) {
      console.log("getUserFromClient - Err: ", err)
    });
}

function getRefreshToken(refreshToken) {
  if (!refreshToken || refreshToken === 'undefined') return false

  return models.oauth_refresh_tokens
    .findOne({
      attributes: ['client_id', 'user_id', 'expires'],
      where: {refresh_token: refreshToken},
      include: [models.o_auth_clients, models.mt_users]

    })
    .then(function (savedRT) {
      var tokenTemp = {
        user: savedRT ? savedRT.mt_users.toJSON() : {},
        client: savedRT ? savedRT.o_auth_clients.toJSON() : {},
        refreshTokenExpiresAt: savedRT ? new Date(savedRT.expires) : null,
        refreshToken: refreshToken,
        refresh_token: refreshToken,
        scope: savedRT.scope
      };
      return tokenTemp;

    }).catch(function (err) {
      console.log("getRefreshToken - Err: ", err)
    });
}

function verifyScope(token, scope) {
	/*console.log('--- VERIFY SCOPE ---');
	console.log('token.scope: ' + token.scope);
	console.log('scope: ' + scope);*/
	
	if (scope.indexOf(',') > -1) {
		var scopes = scope.split(',');
		
		return (scopes.indexOf(token.scope) > -1)?true:false
	} else {
		return token.scope === scope
	}
}

function validateScope(user, client, scope) {
	
	/*console.log('--- VALIDATE SCOPE ---');			
	console.log('scope: ' + scope);	*/
	
  return (user.scope === scope && client.scope === scope && scope !== null)?scope:false
  //return true
}

module.exports = {
  //generateOAuthAccessToken, optional - used for jwt
  //generateAuthorizationCode, optional
  //generateOAuthRefreshToken, - optional
  getAccessToken: getAccessToken,
  getAuthorizationCode: getAuthorizationCode, //getOAuthAuthorizationCode renamed to,
  getClient: getClient,
  getRefreshToken: getRefreshToken,
  getUser: getUser,
  getUserFromClient: getUserFromClient,
  //grantTypeAllowed, Removed in oauth2-server 3.0
  revokeAuthorizationCode: revokeAuthorizationCode,
  revokeToken: revokeToken,
  saveToken: saveToken,//saveOAuthAccessToken, renamed to
  saveAuthorizationCode: saveAuthorizationCode, //renamed saveOAuthAuthorizationCode,
  validateScope: validateScope,
  verifyScope: verifyScope,
  
}