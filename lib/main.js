'use strict';

var async = require('async');
var db = require('./db');
var exec = require('child_process').exec;

var Factory = function(ctx) {
};

Factory.prototype.config = function(conf) {
  this.conf = conf;
  this.db = new db(conf);
  this.fixtures = {};
};

Factory.prototype.clean = function(cb) {
  var commands = [
    'mysql -u root -e "drop database if exists \\`' + this.conf.database +'\\`"', 
    'mysql -u root -e "create database \\`' + this.conf.database +'\\` default character set utf8 collate utf8_general_ci"',
    'mysql -u root "' + this.conf.database +'" < '+ this.conf.dbStructureFile
  ];

  var execCommand = function(command, done) {
    exec(command, function (err, stdout, stderr) {
      if (err || stderr) return cb(err || stderr);
      done(null, stdout);
    });
  };

  async.eachSeries(commands, execCommand, cb);
};

Factory.prototype.define = function(name, attrs, cb) {
  this.fixtures[name] = attrs;
  cb();
};

Factory.prototype.assoc = function(name, attr) {
  var that = this;
    return function(callback) {
      that.create(name, { name: 'Fred2', email: 'Email2' }, function(err, id) {
        callback(id);
      });
    };
  };

Factory.prototype.create = function(name, attrs, cb) {
  var that = this;
  var fixture = this.fixtures[name];
  
  var saveAssoc = function(prop, callback) {
    fixture[prop](function(assocId){
      fixture[prop] = assocId[1];
      callback(null, fixture[prop]);
    });
  };

  var saveAssocs = function(callback) {
    if (!fixture) return callback();
      var assocs = [];
      for (var prop in fixture) {
        if(fixture.hasOwnProperty(prop) && typeof fixture[prop] === 'function'){
          assocs.push(prop);
        }
     }

    async.mapSeries(assocs, saveAssoc, function(err, results){
        callback(null, results[0]);
    });
  };

  var save = function(callback) {
    that.db.query(null, 'insert into ' + name + ' set ?', [ attrs || fixture ], that.db.insertId(function(err, res){
      callback(err, res);
    }));
  };

  async.series([saveAssocs, save], function(err, results) {
    cb(null, results);
  });
};

module.exports = exports = new Factory();