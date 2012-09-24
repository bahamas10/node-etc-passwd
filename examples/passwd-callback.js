#!/usr/bin/env node

var passwd = require('../');

passwd.getUsers(function(err, users) {
  if (err) throw err;
  console.log(JSON.stringify(users));
});
