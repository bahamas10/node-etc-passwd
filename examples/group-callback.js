#!/usr/bin/env node

var passwd = require('../');

passwd.getGroups(function(err, groups) {
  if (err) throw err;
  console.log(JSON.stringify(groups));
});
