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
    'mysql -u ' + this.conf.user + ' -e "drop database if exists \\`' + this.conf.database +'\\`"', 
    'mysql -u ' + this.conf.user + ' -e "create database \\`' + this.conf.database +'\\` default character set utf8 collate utf8_general_ci"',
    'mysql -u ' + this.conf.user + ' "' + this.conf.database +'" < '+ this.conf.dbStructureFile
  ];

  var execCommand = function(command, done) {
    exec(command, function (err, stdout, stderr) {
      if (err || stderr) return cb(err || stderr);
      done(null, stdout);
    });
  };

  async.eachSeries(commands, execCommand, cb);
};

Factory.prototype.define = function(name, attrs) {
  this.fixtures[name] = attrs;
};

Factory.prototype.assoc = function(name, attr) {
  var that = this;
  return function(callback) {
    that.create(name, null, function onCompleteCreateAssoc(err, id) {
      if (err) return callback(err);
      callback(null, id);
    });
  };
};

Factory.prototype.create = function(name, attrs, cb) {
  var that = this;
  var fixture = (attrs || this.fixtures[name]);
  if (!fixture) return cb('Fixture ' + name + ' is not defined.'); 

  var saveAssoc = function(prop, callback) {
    fixture[prop](function onCompleteSaveAssoc(err, assocId){
      if (err) return cb(err);
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

    async.mapSeries(assocs, saveAssoc, function onCompleteSaveAssocs(err, results){
        callback(null, results[0]);
    });
  };

  var save = function(callback) {
    that.db.query(null, 'insert into ' + name + ' set ?', [ fixture ], that.db.insertId(function(err, res){
      callback(err, res);
    }));
  };

  async.series([saveAssocs, save], function onCompleteCreate(err, results) {
    cb(null, results);
  });
};

module.exports = exports = new Factory();