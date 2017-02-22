/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * Portions Copyright (c) 2017-present, Off Grid Networks. 
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

var fs = require('fs-extra');
var path = require('path');
var paths = require('../config/paths');
var prompt = require('react-dev-utils/prompt');
var spawnSync = require('cross-spawn').sync;
var chalk = require('chalk');
var green = chalk.green;
var cyan = chalk.cyan;

prompt(
  'Are you sure you want to eject the FuseBox configuration? This action is permanent (unless you delete the ejected files).',
  false
).then(shouldEject => {
  if (!shouldEject) {
    console.log(cyan('Close one! Eject aborted.'));
    process.exit(1);
  }

  console.log('Ejecting Configuration...');

  var ownPath = path.join(__dirname, '..');
  var appPath =  fs.realpathSync(process.cwd());

  function verifyAbsent(file) {
    if (fs.existsSync(path.join(appPath, file))) {
      console.error(
        '`' + file + '` already exists in your app folder. We cannot ' +
        'continue as you would lose all the changes in that file or directory. ' +
        'Please move or delete it (maybe make a copy for backup) and run this ' +
        'command again.'
      );
      process.exit(1);
    }
  }

  var folders = [
    'config'
  ];

  var files = [
    path.join('config', 'fuse.config.dev.js'),
    path.join('config', 'fuse.config.prod.js'),
   ];

  // Ensure that the app folder is clean and we won't override any files
  folders.forEach(verifyAbsent);
  files.forEach(verifyAbsent);

  // Copy the files over
  folders.forEach(function(folder) {
    fs.mkdirSync(path.join(appPath, folder))
  });

  console.log();
  console.log(cyan('Copying files into ' + appPath));
  files.forEach(function(file) {
    console.log('  Adding ' + cyan(file) + ' to the project');
    var content = fs
      .readFileSync(path.join(ownPath, file), 'utf8')
      // Remove dead code from .js files on eject
      .replace(/\/\/ @remove-on-eject-begin([\s\S]*?)\/\/ @remove-on-eject-end/mg, '')
      // Remove dead code from .applescript files on eject
      .replace(/-- @remove-on-eject-begin([\s\S]*?)-- @remove-on-eject-end/mg, '')
      .trim() + '\n';
    fs.writeFileSync(path.join(appPath, file), content);
  });
  console.log();
  console.log(green('Ejected successfully!'));
  console.log();

  console.log()
})
