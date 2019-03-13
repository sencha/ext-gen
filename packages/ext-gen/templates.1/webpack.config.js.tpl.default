const ExtWebpackPlugin = require('@sencha/ext-webpack-plugin');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const portfinder = require('portfinder');

module.exports = async function (env) {
  var browserprofile
  var watchprofile
  var buildenvironment = env.environment || process.env.npm_package_extbuild_defaultenvironment
  if (buildenvironment == 'production') {
    browserprofile = false
    watchprofile = 'no'
  }
  else {
    if (env.browser == undefined) {env.browser = true}
    browserprofile = JSON.parse(env.browser) || true
    watchprofile = env.watch || 'yes'
  }
  const isProd = buildenvironment === 'production'
  var buildprofile = env.profile || process.env.npm_package_extbuild_defaultprofile
  var buildenvironment = env.environment || process.env.npm_package_extbuild_defaultenvironment
  var buildverbose = env.verbose || process.env.npm_package_extbuild_defaultverbose
  if (buildprofile == 'all') { buildprofile = '' }
  if (env.treeshake == undefined) {env.treeshake = false}
  var treeshake = env.treeshake ? JSON.parse(env.treeshake) : false
  var basehref = env.basehref || '/'
  var mode = isProd ? 'production': 'development'

  portfinder.basePort = (env && env.port) || 1962;
  return portfinder.getPortPromise().then(port => {
    const nodeEnv = env && env.prod ? 'production' : 'development'
    const isProd = nodeEnv === 'production'
    const plugins = [
      new HtmlWebpackPlugin({
        template: 'index.html',
        hash: true,
        inject: "body"
      }), 
      new ExtWebpackPlugin({
        framework: 'extjs',
        port: port,
        emit: true,
        browser: browserprofile,
        treeshake: treeshake,
        watch: watchprofile,
        profile: buildprofile, 
        environment: buildenvironment, 
        verbose: buildverbose
      })
    ]
//    if (!isProd) {
//      plugins.push(
//        new webpack.HotModuleReplacementPlugin()
//      )
//    }
    return {
      performance: { hints: false },
      mode: mode,
      devtool: (mode === 'development') ? 'inline-source-map' : false,
      context: path.join(__dirname, './'),
      entry: {
        main: "./app.js"
      },
      output: {
        path: path.resolve(__dirname, './'),
        filename: '[name].js'
      },
      module: {
        rules: [
          {
            test: /.js$/,
            exclude: /node_modules/
          }
        ]
      },
      plugins: plugins,
      devServer: {
        contentBase: './',
        historyApiFallback: true,
        host: '0.0.0.0',
        hot: false,
        port,
        disableHostCheck: false,
        compress: isProd,
        inline: !isProd,
        stats: {
          entrypoints: false,
          assets: false,
          children: false,
          chunks: false,
          hash: false,
          modules: false,
          publicPath: false,
          timings: false,
          version: false,
          warnings: false,
          colors: {
            green: '[32m'
          }
        }
      }
    }
  });
}
