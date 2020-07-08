const passport = require('passport');
const tokens = require('../auth/tokens.js');
const secret = require('../auth/config.json');
const helper = require('../helpers/serialize');



module.exports.post = async function (req, res, next) {
  passport.authenticate(
    'local',
    { session: false },
    async (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(400).json({});
      }
      if (user) {
        const token = await tokens.createTokens(user, secret.secret);
        res.json({
          ...helper.serializeUser(user),
          ...token,
        });
      }
    },
  )(req, res, next);
}