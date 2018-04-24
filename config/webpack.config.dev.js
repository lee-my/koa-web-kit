'use strict';

const path = require('path');
const webpackMerge = require('webpack-merge');
const DashboardPlugin = require('webpack-dashboard/plugin');
const baseWebpackConfig = require('./webpack.config.base');
const config = require('./env');
const utils = require('./utils');

const isHMREnabled = config.isHMREnabled();

const scssExtract = utils.getSCSSExtract(true, {
  allChunks: true,
});
const libSCSSExtract = utils.getLibSCSSExtract(true);
const libCSSExtract = utils.getLibCSSExtract(true, {
  allChunks: true,
});

console.log(
  Object.keys(scssExtract),
  Object.keys(libSCSSExtract),
  Object.keys(libCSSExtract)
);
const webpackConfig = webpackMerge(baseWebpackConfig, {
  output: {
    publicPath: isHMREnabled
      ? '/'
      : utils.normalizeTailSlash(
          utils.normalizePublicPath(
            path.join(config.getAppPrefix(), config.getStaticPrefix())
          ),
          config.isPrefixTailSlashEnabled()
        ),
    filename: '[name].js',
    chunkFilename: '[name].js',
  },
  module: {
    rules: [
      {
        test: /scss\/vendors\.scss$/,
        use: isHMREnabled
          ? utils.getLoaders(true, true)
          : libSCSSExtract.loader,
      },
      {
        //app scss
        test: /\.scss$/,
        exclude: [/node_modules/, /scss\/vendors\.scss$/],
        use: isHMREnabled ? utils.getLoaders(true, true) : scssExtract.loader,
      },
      {
        test: /\.css$/,
        use: isHMREnabled
          ? utils.getLoaders(true, true, false)
          : libCSSExtract.loader,
      },
    ],
  },
  devtool: 'cheap-module-source-map',
  plugins: [],
});

if (!isHMREnabled) {
  webpackConfig.plugins.push(new DashboardPlugin());
  webpackConfig.plugins.push(libSCSSExtract.plugin);
  webpackConfig.plugins.push(libCSSExtract.plugin);
  webpackConfig.plugins.push(scssExtract.plugin);
}
// console.log(webpackConfig);
// console.log(webpackConfig.plugins);
module.exports = webpackConfig;
