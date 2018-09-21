const passport = require('passport');
// const OAuth2GoogleStrategy = require('passport-google-oauth20').Strategy;
const LocalStrategy = require('passport-local').Strategy;
// const config = require('../config');

const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((sessionUser, done) => {
  done(null, sessionUser);
});

passport.use(
  'login',
  new LocalStrategy(
    { passReqToCallback: true },
    ((req, username, password, done) => {
      // check in mongo if a user with email exists or not
      User.findOne(
        { email: username },
        (err, user) => {
        // In case of any error, return using the done method
          if (err) { return done(err); }
          // email does not exist, log the error and redirect back
          if (!user) {
            console.log(`User Not Found with email ${username}`);
            return done(null, false, req.flash('error', 'User Not found.'));
          }
          if (user.registrationCode) {
            return done(null, false, req.flash('error', 'Sorry you haven\t yet confirmed your email address. Please check your spam/junk folder.'));
          }
          // User exists but wrong password, log the error
          if (!user.isPasswordMatch(password)) {
            console.log('Invalid Password');
            return done(null, false, req.flash('error', 'Invalid Password')); // redirect back to login page
          }

          user.last_login = new Date();
          return user.save((saveErr) => {
            if (saveErr) {
              console.log(`Error in updating users last login date: ${err}`);
            }
            return done(null, user);
          });
        }
      );
    })
  )
);

/*
  Use oauth2 - google for now but will change to own provider
*/
// passport.use(new OAuth2GoogleStrategy({
//   clientID: config.oauth2.clientId,
//   clientSecret: config.oauth2.clientSecret,
//   callbackURL: `${config.ourURL}/auth/google/callback`,
//   userProfileURL: 'https://www.googleapis.com/oauth2/v3/userinfo',
//   scope: ['email'],
// }, (accessToken, refreshToken, profile, cb) => {
//   // profile.emails [ { value:'email...', verified:true} ]
//   if (!profile.emails || profile.emails.length === 0)
//    return cb(null, false, { msg: 'No email address associated with that account.' });
//   const validEmails = profile.emails.filter(v => v.verified).map(v => v.value);
//   if (validEmails.length === 0)
//    return cb(null, false, { msg: 'No valid email address associated with that account.' });
//   return User.findOne({ email: { $in: validEmails } }, (err, user) => {
//     if (err) { return cb(err); }
//     if (!user) {
//       const newUser = new User({
//         email: validEmails[0],
//         name: profile.displayName,
//       });
//       newUser.save((errSave) => {
//         if (errSave) return cb(errSave);
//         return cb(null, newUser);
//       });
//     }
//     return cb(null, user);
//   });
// }));
