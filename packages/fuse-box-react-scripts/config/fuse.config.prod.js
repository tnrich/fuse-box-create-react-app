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

const fsbx = require("fuse-box"),
    FuseBox = fsbx.FuseBox,
    env = require('./env')(),
    path = require('path');

exports.initBuilder = function initBuilderProd(paths, bundleFile, srcDir, targetDir) {
    srcDir = srcDir || paths.appSrc;
    targetDir = targetDir || path.join(paths.appBuild, paths.Bundle);

    return FuseBox.init({
        homeDir: srcDir,
        sourceMaps: true,
        outFile: path.join(targetDir, bundleFile),
        plugins: [
            fsbx.EnvPlugin(env.raw),
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

exports.babelConfig = function babelConfig(srcDir, targetDir) {
    srcDir = srcDir || paths.appSrc;
    targetDir = targetDir || paths.appBuild;

    return {
        homeDir: srcDir,
        sourceMaps: false,
        outDir: targetDir,
        presets: ['react-app']
    }
}

