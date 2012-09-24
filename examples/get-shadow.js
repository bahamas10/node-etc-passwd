#!/usr/bin/env node

var passwd = require('../');

passwd.getShadow({'username': process.argv[2] || 'root'}, function(err, shadow) {
  if (err) throw err;
  console.log(JSON.stringify(shadow));
});
