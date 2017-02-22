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
    path = require('path');

exports.initBuilder = function initBuilderDev(paths, bundleFile) {
    return FuseBox.init({
        homeDir: paths.appSrc,
        outFile: path.join(paths.appBundle, bundleFile),
        plugins: [
            fsbx.EnvPlugin({
                "NODE_ENV": process.env.NODE_ENV
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