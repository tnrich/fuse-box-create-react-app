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

// Do this as the first thing so that any code reading it knows the right env.
var process = require('process');
process.env.NODE_ENV = 'production';

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
require('dotenv').config({ silent: true });

var chalk = require('chalk');
var fs = require('fs-extra');
var url = require('url');
var path = require('path');
var buildcommon = require('./build-common');
var paths = require('../config/paths');
var checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');

var useYarn = fs.existsSync(paths.yarnLockFile);

// Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

(function main() {

  // Remove all content but keep the directory so that
  // if you're in it, you don't end up in Trash
  fs.emptyDirSync(paths.appBuild);

  // Start the fuse-box build and then copy static assets
  build();

})();

// Create the production build and print the deployment instructions.
function build() {
  console.log('Creating an optimized production build...');

  return buildcommon.initBuilder()
    .bundle(">index.js **/*.jsx **/*.json +node_modules/**/*.js")
    .then(function (val) {
      if (val) {
        console.log(chalk.green('Compiled successfully.'));
        console.log();

        buildcommon.copyStaticFolder();
        buildcommon.copyHTMLFile();

        var openCommand = process.platform === 'win32' ? 'start' : 'open';
        var appPackage = require(paths.appPackageJson);
        var publicUrl = paths.publicUrl;
        var publicPath = appPackage.homepage || "/";
        var publicPathname = url.parse(publicPath).pathname;
        if (publicUrl && publicUrl.indexOf('.github.io/') !== -1) {
          // "homepage": "http://user.github.io/project"
          console.log('The project was built assuming it is hosted at ' + chalk.green(publicPathname) + '.');
          console.log('You can control this with the ' + chalk.green('homepage') + ' field in your ' + chalk.cyan('package.json') + '.');
          console.log();
          console.log('The ' + chalk.cyan('build') + ' folder is ready to be deployed.');
          console.log('To publish it at ' + chalk.green(publicUrl) + ', run:');
          // If script deploy has been added to package.json, skip the instructions
          if (typeof appPackage.scripts.deploy === 'undefined') {
            console.log();
            if (useYarn) {
              console.log('  ' + chalk.cyan('yarn') + ' add --dev gh-pages');
            } else {
              console.log('  ' + chalk.cyan('npm') + ' install --save-dev gh-pages');
            }
            console.log();
            console.log('Add the following script in your ' + chalk.cyan('package.json') + '.');
            console.log();
            console.log('    ' + chalk.dim('// ...'));
            console.log('    ' + chalk.yellow('"scripts"') + ': {');
            console.log('      ' + chalk.dim('// ...'));
            console.log('      ' + chalk.yellow('"predeploy"') + ': ' + chalk.yellow('"npm run build",'));
            console.log('      ' + chalk.yellow('"deploy"') + ': ' + chalk.yellow('"gh-pages -d build"'));
            console.log('    }');
            console.log();
            console.log('Then run:');
          }
          console.log();
          console.log('  ' + chalk.cyan(useYarn ? 'yarn' : 'npm') + ' run deploy');
          console.log();
        } else if (publicPath !== '/') {
          // "homepage": "http://mywebsite.com/project"
          console.log('The project was built assuming it is hosted at ' + chalk.green(publicPath) + '.');
          console.log('You can control this with the ' + chalk.green('homepage') + ' field in your ' + chalk.cyan('package.json') + '.');
          console.log();
          console.log('The ' + chalk.cyan('build') + ' folder is ready to be deployed.');
          console.log();
        } else {
          if (publicUrl) {
            // "homepage": "http://mywebsite.com"
            console.log('The project was built assuming it is hosted at ' + chalk.green(publicUrl) + '.');
            console.log('You can control this with the ' + chalk.green('homepage') + ' field in your ' + chalk.cyan('package.json') + '.');
            console.log();
          } else {
            // no homepage
            console.log('The project was built assuming it is hosted at the server root.');
            console.log('To override this, specify the ' + chalk.green('homepage') + ' in your ' + chalk.cyan('package.json') + '.');
            console.log('For example, add this to build it for GitHub Pages:')
            console.log();
            console.log('  ' + chalk.green('"homepage"') + chalk.cyan(': ') + chalk.green('"http://myname.github.io/myapp"') + chalk.cyan(','));
            console.log();
          }
          console.log('The ' + chalk.cyan('build') + ' folder is ready to be deployed.');
          console.log('You may also serve it locally with a static server:')
          console.log();
          if (useYarn) {
            console.log('  ' + chalk.cyan('yarn') + ' global add pushstate-server');
          } else {
            console.log('  ' + chalk.cyan('npm') + ' install -g pushstate-server');
          }
          console.log('  ' + chalk.cyan('pushstate-server') + ' build');
          console.log('  ' + chalk.cyan(openCommand) + ' http://localhost:9000');
          console.log();
        }
      }
      return true;
    });
}
