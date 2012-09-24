#!/usr/bin/env node

var passwd = require('../'),
    shadows = passwd.getShadows();

shadows.on('shadow', function(shadow) {
  console.log(JSON.stringify(shadow));
});

shadows.on('end', function() {
  console.log('Done.');
});
