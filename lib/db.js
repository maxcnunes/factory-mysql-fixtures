
'use strict';

var mysql = require('mysql');

var Connection = module.exports = function(opts) {
  this.pool = mysql.createPool(opts);
};

/**
 * query([conn], sql, params, cb)
 */
Connection.prototype.query = function() {
  var args = Array.prototype.slice.call(arguments);
  var cb = args[args.length - 1];

  var connArg = arguments[0];

  if (connArg && typeof connArg === 'object' && '_socket' in connArg) var conn = args.shift();
  if (typeof connArg === 'object' && connArg === null) args.shift();

  var query = function(conn, release) {

    if (release && typeof cb === 'function') {
      args[args.length - 1] = function() {
        conn.release();
        cb.apply(null, Array.prototype.slice.call(arguments));
      }
    }

    conn.query.apply(conn, args);
  };

  if (conn) return query(conn);

  this.pool.getConnection(function(err, conn) {
    if (err) return cb(err);
    query(conn, true);
  });
};


/* Helper Methods 
------------------*/

Connection.prototype.insertId = function(cb) {
  return function(err, info) {
    if (err) return cb(err);
    cb(null, info.insertId);
  };
};