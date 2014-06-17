factory-mysql-fixtures
======================

[![Build Status](https://travis-ci.org/maxcnunes/factory-mysql-fixtures.png?branch=master)](https://travis-ci.org/maxcnunes/factory-mysql-fixtures)

  Factory to load fixtures on mysql database. Based on [Factory Girl](https://github.com/thoughtbot/factory_girl) and [Factory Lady](https://github.com/petejkim/factory-lady).
  

## Installation

Install via npm:

    $ npm install factory-mysql-fixtures

## Usage

### Configuring Factory

```javascript
var Factory = require('factory-mysql-fixtures');

var dbConf = {
  host: 'localhost',
  user: 'root',
  database: 'db-test',
  password: 'db-password', // optional
  timezone: 'utc',
  dbStructureFile: './build/structure.sql' // set your own script to reload initial data when calling clean method
};
  
Factory.config(dbConf);
```

### Defining Factories

```javascript
var _nameIndex = 0;
Factory.define('person', { 
  name: function(cb) { cb('Jack - ' + _nameIndex++ ); } // lazy attribute
  email: 'jack@mail.com' 
});

Factory.define('device', { 
  hash: 'hash1', 
  person_id: Factory.assoc('person', 'id') // simply Factory.assoc('person') for person object itself
});

```

### Using Factories

```javascript
Factory.create('person', { name: 'Fred', email: 'fred@mail.com' }, function(err, result) {
  // result is the saved person id
});

Factory.create('device', null, function(err, result) {
  // result is the saved device id
});

```

### Clean Database

```javascript
Factory.clean(function(err) {
  // data reloaded
});

```

## License

Copyright (c) 2014 Max Claus Nunes. This software is licensed under the [MIT License](http://raw.github.com/maxcnunes/factory-mysql-fixtures/master/LICENSE).