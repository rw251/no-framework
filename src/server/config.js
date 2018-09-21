const dotenv = require('dotenv');
const pino = require('pino')();

dotenv.load({ path: '.env' });

const mustExist = function mustExist(name) {
  if (!process.env[name]) {
    pino.fatal(`${name} is not defined but is mandatory.`);
    pino.info('Exiting...');
    return process.exit(1);
  }
  return process.env[name];
};

const ENV = {
  // mongo url
  MONGO_URL: mustExist('MONGODB_URI'),

  // passport secret for expressjs authentication
  PASSPORT_SECRET: mustExist('PASSPORT_SECRET'),

  // server details
  SERVER_PORT: process.env.SMASH_PORT,
  // SERVER_URL: mustExist('SERVER_URL'),

  SENDGRID_USERNAME: mustExist('SENDGRID_USERNAME'),
  SENDGRID_PASSWORD: mustExist('SENDGRID_PASSWORD'),

  EMAIL_SENDER: mustExist('DEFAULT_EMAIL_SENDER'),
  EMAIL_PASSWORD_RESET_LINK: process.env.EMAIL_PASSWORD_RESET_LINK,
  EMAIL_PASSWORD_RESET: process.env.EMAIL_PASSWORD_RESET,

  EMAIL_SUPPORT: mustExist('SUPPORT_EMAIL'),

};

module.exports = {
  mongoUrl: ENV.MONGO_URL,
  mongoSessionUrl: mustExist('MONGO_SESSION_URL'),
  // user auth
  passport: { secret: ENV.PASSPORT_SECRET },
  server: { port: ENV.SERVER_PORT },
  email: {
    username: ENV.SENDGRID_USERNAME,
    password: ENV.SENDGRID_PASSWORD,
    from: ENV.EMAIL_SENDER,
    fromPasswordResetLink: ENV.EMAIL_PASSWORD_RESET_LINK || ENV.EMAIL_SENDER,
    fromPasswordReset: ENV.EMAIL_PASSWORD_RESET || ENV.EMAIL_SENDER,
    support: ENV.EMAIL_SUPPORT,
  },
  mode: process.env.MODE || 'development',
  ourURL: mustExist('OUR_URL'),
  oauth2: {
    clientId: mustExist('OAUTH2_CLIENT_ID'),
    clientSecret: mustExist('OAUTH2_CLIENT_SECRET'),
  },
};
