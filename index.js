var fs = require('fs'),
    events = require('events'),
    ll = require('lazylines'),
    extract = {};

/**
 * Read a passwd or group formatted file and extract meaningful data
 *
 * @param type                The type of file to parse, [ 'user', 'group' ]
 * @param item                An item to look for, like {'username':'root'}
 * @param file [optional]     defaults to '/etc/passwd' or '/etc/group'
 * @param callback [optional] if supplied, callback with the results instead of emitting
 * @return EventEmitter       emits `type` and 'end'
 */
function parse_file(type, item, file, callback) {
  // Defaults
  if (typeof file === 'function') {
    callback = file;
    file = undefined;
  }

  if (!file) {
    switch (type) {
      case 'group': file = '/etc/group'; break;
      case 'user': file = '/etc/passwd'; break;
      case 'shadow': file = '/etc/shadow'; break;
      default: return callback(new Error('Type not supported')); break;
    }
  }

  // Create the event_emitter and streams
  var event_emitter = new events.EventEmitter(),
      file_stream = fs.createReadStream(file),
      line_stream = new ll.LineReadStream(file_stream);

  // Read line-by-line
  line_stream.on('line', function(line) {
    line = ll.chomp(line);
    // Ignore comments and blank lines
    if (line.length && line[0] !== '#') {
      // Emit the user / group
      event_emitter.emit(type, extract[type](line));
    }
  });
  line_stream.on('end', function() {
    // No more lines, forward the 'end' event
    event_emitter.emit('end');
  });

  if (callback) {
    // A call back was supplied, load it all up in memory and return it
    var ret = [];
    event_emitter.on(type, function(obj) {
      if (item) {
        // Looking for a specific item, check to see if we found it
        for (var key in item) {
          if (obj[key] === item[key]) {
            // Item found! kill the event listeners and return the obj
            event_emitter.removeAllListeners();
            return callback(null, obj);
          }
        }
      } else {
        // Not looking for anything in particular, push the results
        ret.push(obj);
      }
    });

    event_emitter.on('end', function() {
      if (item) {
        // Item not found :(
        return callback(new Error('Not found'));
      }
      callback(null, ret);
    });
  }

  return event_emitter;
}

// Get Users
module.exports.getUsers = function(file, callback) {
  return parse_file('user', null, file, callback);
};

// Get User
module.exports.getUser = function(user, file, callback) {
  return parse_file('user', user, file, callback);
};

// Get Groups
module.exports.getGroups = function(file, callback) {
  return parse_file('group', null, file, callback);
};

// Get Group
module.exports.getGroup = function(group, file, callback) {
  return parse_file('group', group, file, callback);
};

// Get Shadows
module.exports.getShadows = function(file, callback) {
  return parse_file('shadow', null, file, callback);
};

// Get Shadow
module.exports.getShadow = function(shadow, file, callback) {
  return parse_file('shadow', shadow, file, callback);
};

/**
 * Given a line from passwd, return a user object
 */
extract.user = function(line) {
  line_split = line.split(':');
  return {
    'username': line_split[0],
    'password': line_split[1],
    'uid': +line_split[2],
    'gid': +line_split[3],
    'comments': line_split[4],
    'home': line_split[5],
    'shell': line_split[6]
  };
};

/**
 * Given a line from group, return a group object
 */
extract.group = function(line) {
  line_split = line.split(':');
  return {
    'groupname': line_split[0],
    'password': line_split[1],
    'gid': +line_split[2],
    'users': (line_split[3]) ? line_split[3].split(',') : []
  };
};

/**
 * Given a line from group, return a group object
 */
extract.shadow = function(line) {
  line_split = line.split(':');
  return {
    'username': line_split[0],
    'password': line_split[1],
    'lastchg': +line_split[2],
    'min': +line_split[3],
    'max': +line_split[4],
    'warn': +line_split[5],
    'inactive': +line_split[6],
    'expire': +line_split[7],
    'flag': line_split[8]
  };
};
