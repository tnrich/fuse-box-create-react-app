// @remove-on-eject-begin
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * Portions Copyright (c) 2017-present, Off Grid Networks. 
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
// @remove-on-eject-end

var process = require('process');
process.env.NODE_ENV = "development";
process.env.BABEL_ENV = 'production';

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({ silent: true });

const fsbx = require("fuse-box");
const FuseBox = fsbx.FuseBox;
var express = require('express');

var chalk = require('chalk');
var detect = require('detect-port');
var clearConsole = require('react-dev-utils/clearConsole');
var checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
var getProcessForPort = require('react-dev-utils/getProcessForPort');
var openBrowser = require('react-dev-utils/openBrowser');
var prompt = require('react-dev-utils/prompt');
var fs = require('fs-extra');
var paths = require('../config/paths');
var buildcommon = require('./build-common');

var url = require('url');
var path = require('path');

var useYarn = fs.existsSync(paths.yarnLockFile);
var cli = useYarn ? 'yarn' : 'npm';
var isInteractive = process.stdout.isTTY;

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appIndexJs, paths.appHtml('index.html')])) {
  process.exit(1);
}

if (paths.appStoriesJs && !checkRequiredFiles([
  paths.appHtml('iframe.html'),
  path.resolve(paths.appSrc, '__stories__/index.js')])) {
  process.exit(1);
}


// Tools like Cloud9 rely on this.
var DEFAULT_PORT = process.env.PORT || 3000;

// Print out errors
function printErrors(summary, errors) {
  console.log(chalk.red(summary));
  console.log();
  errors.forEach(err => {
    console.log(err.message || err);
    console.log();
  });
}

// Primary Build function for Create-React-App
function buildApp(port) {

  buildcommon.copyStaticFolder();

  var server = buildcommon.initBuilder(port)
    .devServer('>index.js', {
      port: port,
      root: paths.appBuild
    });

  server.httpServer.app.use(express.static(paths.appStoriesBuild));
  server.httpServer.app.get('*', function (req, res) {
    res.sendFile(path.join(paths.appStoriesBuild, 'index.html'));
  });

  return Promise.resolve(server);
}

// Alternative Build function for Create-React-Component
function buildStoriesComponent(port) {

  buildcommon.copyStaticFolder({ 'index.html': 'manager', 'iframe.html': 'stories' }, paths.appStoriesBuild);

  return buildcommon.initBuilder('manager', paths.appStoriesJs, path.join(paths.appStoriesBuild, paths.Bundle))
    .bundle(">index.js")
    .then(function (val) {
      if (!val) return Promise.reject(val);

      var server = buildcommon.initBuilder('stories', paths.appSrc, path.join(paths.appStoriesBuild, paths.Bundle))
        .devServer('>__stories__/index.js', {
          port: port,
          root: paths.appStoriesBuild
        });

      server.httpServer.app.use(express.static(paths.appStoriesBuild));
      server.httpServer.app.get('*', function (req, res) {
        res.sendFile(path.join(paths.appStoriesBuild, 'index.html'));
      });

      return server;

    });
}

function runDevServer(host, port, protocol) {

  if (isInteractive) {
    clearConsole();
  }

  fs.emptyDirSync(paths.appBuild);

  if (paths.appStoriesJs)
    fs.emptyDirSync(paths.appStoriesBuild);

  var builder = paths.appStoriesJs ? buildStoriesComponent : buildApp;

  var server = builder(port)
    .then(function (server) {
      process.nextTick(() => {

        console.log(chalk.cyan('Starting the development server...'));
        console.log();

        openBrowser(protocol + '://' + host + ':' + port + '/');
      });
    }).catch(function (err) {
      printErrors('Failed during development hosting', [err]);
      process.exit(1);
    });

}

function run(port) {
  var protocol = process.env.HTTPS === 'true' ? "https" : "http";
  var host = process.env.HOST || 'localhost';
  runDevServer(host, port, protocol);
}

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `detect()` Promise resolves to the next free port.
detect(DEFAULT_PORT).then(port => {
  if (port === DEFAULT_PORT) {
    run(port);
    return;
  }

  if (isInteractive) {
    clearConsole();
    var existingProcess = getProcessForPort(DEFAULT_PORT);
    var question =
      chalk.yellow('Something is already running on port ' + DEFAULT_PORT + '.' +
        ((existingProcess) ? ' Probably:\n  ' + existingProcess : '')) +
      '\n\nWould you like to run the app on another port instead?';

    prompt(question, true).then(shouldChangePort => {
      if (shouldChangePort) {
        run(port);
      }
    });
  } else {
    console.log(chalk.red('Something is already running on port ' + DEFAULT_PORT + '.'));
  }
});

var useYarn = fs.existsSync(paths.yarnLockFile);

