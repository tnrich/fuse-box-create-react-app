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

exports.initBuilder = function initBuilder() {
    return FuseBox.init({
        homeDir: paths.appSrc,
        sourceMap: {
            bundleReference: "sourcemaps.js.map",
            outFile: path.join(paths.appBuild, "static", "js", "sourcemaps.js.map"),
        },
        outFile: path.join(paths.appBuild, "static", "js", bundleFile),
        plugins: [
             fsbx.EnvPlugin({
            'NODE_ENV': JSON.stringify('production')
        }),
            fsbx.SVGPlugin(),
            fsbx.CSSPlugin(),
            fsbx.HTMLPlugin({ useDefault: false }),
            fsbx.BabelPlugin({
                config: {
                    sourceMaps: true,
                    presets: ['react-app']
                }
            }),
            fsbx.UglifyJSPlugin({
                compress: {
                    screw_ie8: true, // React doesn't support IE8
                    warnings: true
                },
                mangle: {
                    screw_ie8: true
                },
                output: {
                    comments: false,
                    screw_ie8: true
                }
            })
        ]
    });
}

exports.initBuilderDev = function initBuilderDev() {
    console.log(">>>>  " + bundleFile);
    return FuseBox.init({
        homeDir: paths.appSrc,
        outFile: path.join(paths.appBuild, "static", "js", bundleFile),
        plugins: [
            fsbx.EnvPlugin({
            'NODE_ENV': JSON.stringify('development')
        }),
            fsbx.SVGPlugin(),
            fsbx.CSSPlugin(),
            fsbx.HTMLPlugin({ useDefault: false }),
            fsbx.BabelPlugin({
                config: {
                    sourceMaps: true,
                    presets: ['react-app']
                }
            })
        ]
    });
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
            .replace(/<\/body>/g, '<script type="text/javascript" src="./static/js/' + bundleFile + '"></script></body>')

        fs.writeFileSync(path.join(paths.appBuild, path.basename(file)), content);
    });
    console.log();
}
