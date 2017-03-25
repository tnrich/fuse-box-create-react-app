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

var nonce = 'xxxxxxxx-xxxx-4xxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
})

const bundleSuffix = '-' + nonce + '.js';
const BUNDLE = 'bundle'

exports.initBuilder = function (bundlePrefix, srcDir, targetDir, nononce) {

    var bundleFile = nononce ? (bundlePrefix + '.js') : (bundlePrefix || BUNDLE) + bundleSuffix

    var fuseConfigFile = (process.env.NODE_ENV == 'production') ? "fuse.config.prod.js" : "fuse.config.dev.js";
    var fuseConfigPath = path.resolve(__dirname, '../config', fuseConfigFile);

    // OVERRIDE WITH LOCAL PACKAGE VERSION IF IT EXISTS
    if (fs.existsSync(path.join(paths.appConfig, fuseConfigFile)))
        fuseConfigPath = path.join(paths.appConfig, fuseConfigFile);

    var fuseConfig = require(fuseConfigPath);
    return fuseConfig.initBuilder(paths, bundleFile, srcDir, targetDir);
}

exports.copyStaticFolder = function copyStaticFolder(htmlBundleMap, targetDir) {

    htmlBundleMap = htmlBundleMap || { 'index.html': BUNDLE };
    targetDir = targetDir || paths.appBuild;

    fs.ensureDirSync(targetDir);

    var excludingPaths = Object.keys(htmlBundleMap).map(function (key) { return paths.appHtml(key) })

    if (Array.isArray(paths.appPublic)) {
        paths.appPublic.forEach(function (pathPublic) {
            fs.copySync(pathPublic, targetDir, {
                dereference: true,
                filter: file => !(excludingPaths.includes(file))
            });
        })
    } else {
        fs.copySync(paths.appPublic, targetDir, {
            dereference: true,
            filter: file => !(excludingPaths.includes(file))
        });
    }

    copyHTMLFiles_(htmlBundleMap, targetDir);

    console.log(chalk.green('Copied static assets.'));
    console.log();
}

function copyHTMLFiles_(htmlBundleMap, targetDir) {
    targetDir = targetDir || paths.appBuild;

    var publicUrl = paths.publicUrl || "/";

    Object.keys(htmlBundleMap).forEach(function (file) {
        var bundlePrefix = htmlBundleMap[file];
        var relativeBundle = '/' + path.join(paths.Bundle, bundlePrefix + bundleSuffix).replace(path.sep, '/');
        console.log('  Copying ' + chalk.cyan(file) + ' to the build folder');
        var content = fs
            .readFileSync(paths.appHtml(file), 'utf8')
            .replace(/%PUBLIC_URL%/g, publicUrl.replace(/\/$/, ''))
            .replace(/<\/body>/g, '<script type="text/javascript" src="' + relativeBundle + '"></script></body>')
        fs.writeFileSync(path.join(targetDir, file), content);
    });
    console.log();
}

if (!Array.prototype.includes) {
    Object.defineProperty(Array.prototype, 'includes', {
        value: function (searchElement, fromIndex) {

            if (this == null) {
                throw new TypeError('"this" is null or not defined');
            }

            var o = Object(this);

            var len = o.length >>> 0;

            if (len === 0) {
                return false;
            }

            var n = fromIndex | 0;

            var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);

            function sameValueZero(x, y) {
                return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
            }

            while (k < len) {
                if (sameValueZero(o[k], searchElement)) {
                    return true;
                }
                k++;
            }

            return false;
        }
    });
}