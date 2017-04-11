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

exports.initBuilder = function initBuilderDev(paths, bundleFile, srcDir, targetDir) {
    srcDir = srcDir || paths.appSrc;
    targetDir = targetDir || path.join(paths.appBuild, paths.Bundle);

    return FuseBox.init({
        homeDir: srcDir,
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
            })
        ]
    });
}
