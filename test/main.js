var should = require('chai').should();
var expect = require('chai').expect;
var Factory = require('../lib/main');
var exec = require('child_process').exec;
var async = require('async');

var dbConf = {
  host: 'localhost',
  user: 'root',
  database: 'db-test',
  timezone: 'utc',
  dbStructureFile: '/srv/build/structure.sql'
};

before(function cleanDB(cb) {
  var commands = [
    'mysql -u root -e "drop database if exists \\`' + dbConf.database +'\\`"', 
    'mysql -u root -e "create database \\`' + dbConf.database +'\\` default character set utf8 collate utf8_general_ci"',
    'mysql -u root "' + dbConf.database +'" < '+ dbConf.dbStructureFile
  ];

  var execCommand = function(command, done) {
    exec(command, function (err, stdout, stderr) {
      if (err || stderr) return cb(err || stderr);
      done(null, stdout);
    });
  };

  async.eachSeries(commands, execCommand, cb);
});

describe('Factory MySql Fixtures', function() {
  describe('.config', function() {
    it('initializes the db configuration', function() {
      Factory.config(dbConf);
      Factory.db.should.to.not.be.empty;
    });
  });

  describe('.create', function() {
    it('creates a new fixture', function(done) {
      Factory.create('person', { name: 'Fred', email: 'Email' }, function(err, result) {
        expect(err).to.be.null;
        result.should.to.not.be.empty;
        done();
      });
    });
  });

  describe('.clean', function() {
    it('cleans the database', function(done) {
      Factory.clean(function(err) {
        expect(err).to.be.null;
        done();
      });
    });
  });

  describe('.define', function() {
    it('defines a new fixture', function(done) {
      Factory.define('device', { hash: 'hash1', person_id: Factory.assoc('person', 'id') }, function(err, result) {
        Factory.create('device', null, function(err, result) {
          expect(err).to.be.null;
          result.should.to.not.be.empty;
          done();
        });
      });
    });
  });

});