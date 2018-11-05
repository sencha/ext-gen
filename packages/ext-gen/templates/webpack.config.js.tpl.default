const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtWebpackPlugin = require('@sencha/ext-webpack-plugin')
const portfinder = require('portfinder')
const sourcePath = path.join(__dirname, './')

module.exports = async function (env) {
  var browserprofile
  if (env.browser != undefined) {
    browserprofile = JSON.parse(env.browser) || true
  }
  else {
    browserprofile = true
  }
  var watchprofile = env.watch || 'yes'
  var buildprofile = env.profile || process.env.npm_package_extbuild_defaultprofile
  var buildenvironment = env.environment || process.env.npm_package_extbuild_defaultenvironment
  var buildverbose = env.verbose || process.env.npm_package_extbuild_defaultverbose
  if (buildprofile == 'all') { buildprofile = '' }

  portfinder.basePort = (env && env.port) || 1962
  return portfinder.getPortPromise().then(port => {

  const nodeEnv = env && env.prod ? 'production' : 'development'
  const isProd = nodeEnv === 'production'

  const plugins = [
    new HtmlWebpackPlugin({
      template: 'index.html',
      hash: true
    }), 
    new ExtWebpackPlugin({
      framework: 'extjs',
      port: port,
      emit: true,
      browser: browserprofile,
      watch: watchprofile,
      profile: buildprofile,
      environment: buildenvironment,
      verbose: buildverbose
    })
  ]
  if (!isProd) {
    plugins.push(
      new webpack.HotModuleReplacementPlugin()
    )
  }

  return {
    mode: 'development',
    cache: true,
    devtool: isProd ? 'source-map' : 'cheap-module-source-map',
    context: sourcePath,
    entry: {
      'index': [
        'react-hot-loader/patch',
      ]
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
    plugins,
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
  })
}