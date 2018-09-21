const crypto = require('crypto');
const mongoose = require('mongoose');

const validatePresenceOf = value => value.length;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    validate: [validatePresenceOf, 'Name cannot be blank'],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/.+@.+\..+/, 'Please enter a valid email'],
    validate: [validatePresenceOf, 'Email cannot be blank'],
  },
  roles: {
    type: Array,
    default: ['authenticated'],
  },
  hashed_password: {
    type: String,
    validate: [validatePresenceOf, 'Password cannot be blank'],
  },
  salt: String,
  password_recovery_code: { type: String },
  password_recovery_expiry: { type: Date },
  practices: {
    type: Array,
    default: [],
  },
}, { timestamps: true });

/**
 * Virtuals
 */
userSchema.virtual('password').set(function setPassword(password) {
  this.localPassword = password;
  this.salt = this.makeSalt();
  this.hashed_password = this.hashPassword(password);
}).get(function getPassword() {
  return this.localPassword;
});

/**
 * Methods
 */
userSchema.methods = {

  /**
   * HasRole - check if the user has required role
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  hasRole(role) {
    const { roles } = this;
    return roles.indexOf('admin') !== -1 || roles.indexOf(role) !== -1;
  },

  /**
   * IsAdmin - check if the user is an administrator
   *
   * @return {Boolean}
   * @api public
   */
  isAdmin() {
    return this.roles.indexOf('admin') !== -1;
  },

  /**
     * IsPasswordMatch - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
  isPasswordMatch(plainText) {
    return this.hashPassword(plainText) === this.hashed_password;
  },

  /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
  makeSalt() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Hash password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  hashPassword(password) {
    if (!password || !this.salt) return '';
    const salt = Buffer.from(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha1').toString('base64');
  },
};

/**
 * Helper method for getting user's gravatar.
 */

userSchema.methods.gravatar = function gravatar(size = 200) {
  if (!this.email) {
    return `https://gravatar.com/avatar/?s=${size}&d=retro`;
  }
  const md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return `https://gravatar.com/avatar/${md5}?s=${size}&d=retro`;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
