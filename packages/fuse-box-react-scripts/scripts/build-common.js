// @remove-on-eject-begin
/**
 * Copyright (c) 2017-present, Off Grid Networks. 
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */
// @remove-on-eject-end

const paths = require('../config/paths'),
    fsbx = require("fuse-box"),
    FuseBox = fsbx.FuseBox,
    path = require('path'),
    fs = require('fs-extra'),
    chalk = require('chalk');

const bundleFile = 'bundle.js';

exports.initBuilder = function() {

    var fuseConfigFile = (process.env.NODE_ENV == 'production') ? "fuse.config.prod.js" : "fuse.config.dev.js";
    var fuseConfigPath = path.resolve(__dirname, '../config', fuseConfigFile);
 
     // OVERRIDE WITH LOCAL PACKAGE VERSION IF IT EXISTS
    if (fs.existsSync(path.join(paths.appConfig, fuseConfigFile)))
      fuseConfigPath = path.join(paths.appConfig, fuseConfigFile);
 
     var fuseConfig = require(fuseConfigPath);
    return fuseConfig.initBuilder(paths, bundleFile);
}

exports.copyStaticFolder = function copyStaticFolder() {
    fs.copySync(paths.appPublic, paths.appBuild, {
        dereference: true,
        filter: file => file !== paths.appHtml
    });
    console.log(chalk.green('Copied static assets.'));
    console.log();
}

exports.copyHTMLFile = function copyHTMLFile() {
    var publicUrl = paths.publicUrl || "/";

    [paths.appHtml].forEach(function (file) {
        console.log('  Copying ' + chalk.cyan(path.relative(paths.appDirectory, file)) + ' to the build folder');
        var content = fs
            .readFileSync(file, 'utf8')
            .replace(/%PUBLIC_URL%/g, publicUrl.replace(/\/$/, ''))
            .replace(/<\/body>/g, '<script type="text/javascript" src="/static/js/' + bundleFile + '"></script></body>')

        fs.writeFileSync(path.join(paths.appBuild, path.basename(file)), content);
    });
    console.log();
}
