const passport = require('passport');
const passportJWT = require('passport-jwt');
const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;
const User = require('../models/user'); // Import the User model

// Custom function to extract the JWT token from the cookie
function extractTokenFromCookie(req) {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.token;
  }
  return token;
}


// Create a function to configure the Passport JWT strategy
function configurePassport() {
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token'),
        extractTokenFromCookie, // Extract the token from the cookie named 'token'
      ]),
    secretOrKey: 'your_secret_key', // Replace with your actual secret key used for JWT signing
  };

  const strategy = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
      // Find the user based on the userId in the payload
      const user = await User.findById(payload.userId);

      if (user) {
        // If the user is found, attach it to the request object for later use
        done(null, user);
      } else {
        // If the user is not found, return false
        done(null, false);
      }
    } catch (error) {
      done(error, false);
    }
  });

  // Use the strategy with Passport
  passport.use(strategy);
}

// Call the function to configure Passport JWT strategy
configurePassport();

// Create a middleware to authenticate the JWT token
const authenticateJWT = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (error, user) => {
    if (error || !user) {
      // If there's an error or user is not authenticated, redirect to the login page
      return res.redirect('/login');
    }
    // If the user is authenticated, continue to the next middleware
    req.user = user;
    return next();
  })(req, res, next);
};

module.exports = { authenticateJWT };
