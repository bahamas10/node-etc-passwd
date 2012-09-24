#!/usr/bin/env node

var passwd = require('../');

passwd.getShadows(function(err, shadow) {
  if (err) throw err;
  console.log(JSON.stringify(shadow));
});
