const User = require('../models/User');
const practiceController = require('./practice');
const utils = require('./utils');

/**
 * List all users
 */

// lean true returns json objects i.e. smaller but can't then save/update them
const listAllUsers = () => User.find().lean().exec();

// lean true returns json objects i.e. smaller but can't then save/update them
const getUser = email => User.findOne({ email }).lean().exec();

exports.listJSON = (req, res, next) => {
  listAllUsers()
    .then(users => res.send(users))
    .catch(err => next(err));
};

exports.list = (req, res, next) => {
  listAllUsers()
    .then((users) => {
      const data = utils.getGlobalData(req.user);
      data.title = 'Users';
      data.users = users;
      return res.render('account/listUsers', data);
    })
    .catch(err => next(err));
};

exports.getJSON = (req, res, next) => {
  getUser(req.params.email)
    .then(user => res.send(user))
    .catch(err => next(err));
};

exports.add = async (req, res, next) => {
  try {
    const data = utils.getGlobalData(req.user);
    data.practices = await practiceController.list();
    data.title = 'Users';
    return res.render('account/addUser', data);
  } catch (err) {
    return next(err);
  }
};

exports.postAdd = async (req, res, next) => {
  let data;
  try {
    data = utils.getGlobalData(req.user);
    data.practices = await practiceController.list();
  } catch (err) {
    return next(err);
  }

  return User.findOne({ email: req.body.email }, (err, user) => {
    if (err) {
      console.log(`Error in SignUp: ${err}`);
      req.flash('danger', 'Error while calling db to check if account already exists.');
      return res.render('account/addUser', data);
    }
    if (user) {
      console.log(`User already exists with email: ${req.body.email}`);
      req.flash('danger', 'An account with that email address already exists.');
      return res.render('account/addUser', data);
    }
    // if there is no user with that email
    // create the user
    const roles = ['authenticated'];
    if (req.body.isAdmin) roles.push('admin');
    if (req.body.isCCG) roles.push('ccg');

    const { name, email, password } = req.body;
    let { practices } = req.body;
    if (!practices) practices = [];
    if (typeof practices === 'string') practices = [practices];

    const newUser = new User({
      email,
      name,
      password,
      roles,
      practices,
    });

    // save the user
    return newUser.save((saveErr) => {
      if (saveErr) {
        console.log(`Error in Saving user: ${saveErr}`);
        req.flash('danger', 'Error saving new user.');
        return res.render('account/addUser', data);
      }
      console.log('User Registration succesful');
      return res.redirect('/users');
    });
  });
};

exports.edit = async (req, res, next) => {
  try {
    const data = utils.getGlobalData(req.user);
    data.practices = await practiceController.list();
    data.user = await getUser(req.params.email);
    data.title = 'Users';
    return res.render('account/editUser', data);
  } catch (err) {
    return next(err);
  }
};

exports.postEdit = (req, res) => {
  const data = utils.getGlobalData(req.user);
  const { email } = req.params;
  User.findOne({ email }, (err, user) => {
    // In case of any error, return using the done method
    if (err) {
      console.log(`Error in SignUp: ${err}`);
      req.flash('danger', 'Error while calling db to find user.');
      return res.render('account/editUser', data);
    }
    // doesn't exist
    if (!user) {
      console.log(`Attempting to edit an unknown user: ${email}`);
      req.flash('danger', 'Attempting to edit an unknown user.');
      return res.render('account/editUser', data);
    }
    data.user = user;
    const roles = ['authenticated'];
    if (req.body.isAdmin) roles.push('admin');
    if (req.body.isCCG) roles.push('ccg');
    const originalUser = user;

    let { practices } = req.body;
    if (!practices) practices = [];
    if (typeof practices === 'string') practices = [practices];


    if (email === req.body.email) {
      // email not changing so update is fine
      user.name = req.body.name;
      user.roles = roles;
      user.practices = practices;
      // save the user
      return user.save((saveErr) => {
        if (saveErr) {
          console.log(`Error in Saving user: ${saveErr}`);
          req.flash('danger', 'Error saving new user.');
          return res.render('account/editUser', data);
        }
        return res.redirect('/users');
      });
    }
    // check no existing user with that email
    return User.findOne({ email: req.body.email }, (findErr, existingUser) => {
      if (findErr) {
        console.log(`Error while checking if new email appears in system: ${err}`);
        req.flash('danger', 'Error while checking if new email appears in system.');
        return res.render('account/editUser', data);
      }
      // if there is already a user with the modified email address
      if (existingUser) {
        console.log(`Trying to change the email to one that already appears in the system: ${email}`);
        req.flash('danger', 'Trying to change the email to one that already appears in the system.');
        return res.render('account/editUser', data);
      }
      originalUser.email = req.body.email;
      originalUser.name = req.body.name;
      originalUser.roles = roles;
      originalUser.practices = practices;
      // save the user
      return originalUser.save((saveErr) => {
        if (saveErr) {
          console.log(`Error in Saving user: ${saveErr}`);
          req.flash('danger', 'Error saving new user.');
          return res.render('account/editUser', data);
        }
        console.log('User Registration succesful');
        return res.redirect('/users');
      });
    });
  });
};

exports.delete = (req, res) => {
  const data = utils.getGlobalData(req.user);
  data.email = req.params.email;
  res.render('account/deleteUser', data);
};

exports.postDelete = (req, res) => {
  User.find({ email: req.params.email }).remove(() => {
    res.redirect('/users');
  });
};
