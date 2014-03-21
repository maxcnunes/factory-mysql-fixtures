'use strict';

var extend = require('util')._extend;
var async = require('async');
var _ = require('lodash');
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
  return function (callback) {
    that.create(name, null, function onCreateAssoc(err, id) {
      if (err) return callback(err);
      callback(null, id);
    });
  };
};

Factory.prototype.create = function(name, attrs, cb) {
  var that = this;
  var _fixture = (attrs || this.fixtures[name]);
  if (!_fixture) return cb('Fixture ' + name + ' is not defined.');

  var fixture = _.clone(_fixture);

  var saveAssocs = function(callback) {
    saveAllAssocs(fixture, callback);
  };

  var save = function(callback) {
    that.db.query(null, 'insert into ' + name + ' set ?', [ fixture ], that.db.insertId(callback));
  };

  async.series([saveAssocs, save], function onCompleteCreate(err, results) {
    if (err) return cb(err);
    cb(null, getLastResult(results));
  });
};

//PRIVATE METHODS

var saveAllAssocs = function(fixture, callback) {
  if (!fixture) return callback();

  var saveEachAssoc = function(prop, callback) {
    fixture[prop](function onCompleteSaveEachAssoc(err, assocId){
      if(getFnName(fixture[prop]) !== 'onCreateAssoc'){
        assocId = err;
        err = null;
      };
      
      if (err) return callback(err);
      
      fixture[prop] = assocId;
      callback(null, fixture[prop]);
    });
  };

  var assocs = getAllAssocs(fixture);

  async.mapSeries(assocs, saveEachAssoc, function onCompleteSaveAllAssocs(err, results){
    if (err) return callback(err);
    callback(null, getLastResult(results));
  });
};

var getAllAssocs = function(fixture) {
  var assocs = [];
  for (var prop in fixture) {
    if(fixture.hasOwnProperty(prop) && typeof fixture[prop] === 'function'){
      assocs.push(prop);
    }
 }
 return assocs;
};

var getLastResult = function(results, callback) {
  return results.length > 0 ? results[results.length - 1] : 0;
};

var getFnName = function(fn) {
  var f = typeof fn == 'function';
  var s = f && fn.toString().match(/function ([^\(]+)/);
  return (!f && 'not a function') || (s && s[1] || 'anonymous');
};

module.exports = exports = new Factory();