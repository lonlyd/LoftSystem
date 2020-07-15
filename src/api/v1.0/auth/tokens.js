const jwt = require('jsonwebtoken');
const _ = require('lodash');
const helper = require('../helpers/serialize');

const createTokens = async function (user, secret) {
  const createToken = await jwt.sign(
    {
      user: _.pick(user, 'id')
    },
    secret,
    {
      expiresIn: '10m'
    },
  );

  const createRefreshToken = await jwt.sign(
    {
      user: _.pick(user, 'id')
    },
    secret,
    {
      expiresIn: '7d'
    },
  );
  const verifyToken = jwt.verify(createToken, secret);
  const verifyRefresh = jwt.verify(createRefreshToken, secret);

  return {
    accessToken: createToken,
    refreshToken: createRefreshToken,
    accessTokenExpiredAt: verifyToken.exp * 1000,
    refreshTokenExpiredAt: verifyRefresh.exp * 1000,
  }
};

const refreshTokens = async function (refreshToken, models, SECRET) {
  const user = await getUserByToken(refreshToken, models, SECRET);
  if (user) {
    return {
      ...helper.serializeUser(user),
      ...(await createTokens(user, SECRET)),
    }
  } else {
    return {}
  }
}
const getUserByToken = async function (token, models, SECRET) {
  let userId = -1
  try {
    userId = jwt.verify(token, SECRET).user.id;
  } catch (err) {
    return {}
  }
  const user = await models.getUserById(userId);
  return user;
}
module.exports = {
  createTokens,
  refreshTokens,
  getUserByToken,
}