'use strict';

var ROUTERS_PATH = __dirname + '/../../backend/webserver/routes/';
var MAIN_APPLICATION_PATH = __dirname + '/../../backend/webserver/application';

var async = require('async');

function getRouter(route, dependencies) {
  return require(ROUTERS_PATH + route)(dependencies);
}

function getApplication(router) {
  var application = require(MAIN_APPLICATION_PATH);
  var all = getRouter('all');
  application.use(all);
  application.use(router);
  return application;
}

function createConference(name, members, history, done) {
  var Conference = require('mongoose').model('Conference');
  var json = {
    _id: name,
    members: members || [],
    history: history || []
  };
  var conference = new Conference(json);
  return conference.save(done);
}

/**
 * This enables deployments of common needed resources (domain, users)
 * using defined fixtures.
 * Currently it supports for each fixture the creation of one domain,
 * and users belonging to this domain.
 * The first user of the list is automatically added as the domain administrator.
 *
 *
 * @param {string} name
 * @param {object} testEnv
 * @param {object} options
 * @param {function} callback
 * @return {*}
 */
function applyDeployment(name, testEnv, options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }
  var fixturesPath = options.fixtures ? options.fixtures : testEnv.fixtures + '/deployments';
  var fixtures = require(fixturesPath);
  if (! (name in fixtures)) {
    return callback(new Error('Unknown fixture name ' + name));
  }
  var deployment = fixtures[name]();
  require(testEnv.basePath + '/backend/core').db.mongo;

  deployment.models = {};

  var User = require('mongoose').model('User');
  async.map(deployment.users, function(user, callback) {
      new User(user).save(function(err, saved) {
        if (err) {
          console.log(err);
        }
        return callback(err, saved);
      });
    },
    function(err, results) {
      callback(err, results);
    }
  );
}

/**
 *
 * @type {{getRouter: getRouter, getApplication: getApplication, createConference: createConference, applyDeployment: applyDeployment}|*}
 */
module.exports = {
  getRouter: getRouter,
  getApplication: getApplication,
  createConference: createConference,
  applyDeployment: applyDeployment
};