const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
  passport = require('passport');
const { User } = require('./models');

require('./passport');

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username,
    expiresIn: '7d',
    algorithm: 'HS256'
  });
}

module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, 
    (error, user, info) => {
      if(error || !user) {
        console.log(error);return res.status(400).json({
          message: 'Something is not right',
          user: User
        });
      }

  req.login(user, {session: false}, (error) => {
    if (error) {
      res.send(error);
    }
    let token = generateJWTToken(user.toJSON());
    return res.json({ user, token});
  });
  }) (req, res);
 });
}