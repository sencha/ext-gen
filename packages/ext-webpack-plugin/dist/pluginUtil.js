"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._constructor = _constructor;
exports._compilation = _compilation;
exports.emit = emit;
exports._prepareForBuild = _prepareForBuild;
exports._buildExtBundle = _buildExtBundle;
exports.executeAsync = executeAsync;
exports.log = log;
exports.logv = logv;
exports._getApp = _getApp;
exports._getVersions = _getVersions;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//**********
function _constructor(options) {
  const path = require('path');

  const fs = require('fs');

  var thisVars = {};
  var thisOptions = {};
  var plugin = {};

  if (options.framework == undefined) {
    thisVars.pluginErrors = [];
    thisVars.pluginErrors.push('webpack config: framework parameter on ext-webpack-plugin is not defined - values: react, angular, extjs');
    plugin.vars = thisVars;
    return plugin;
  }

  const validateOptions = require('schema-utils');

  validateOptions(require(`./${options.framework}Util`).getValidateOptions(), options, ''); //fix sencha cmd no jetty server problem

  var watchFile = path.resolve(process.cwd(), `node_modules/@sencha/cmd/dist/ant/build/app/watch-impl.xml`);
  logv(options, `modify ${watchFile}`);
  var data = fs.readFileSync(watchFile, 'utf-8');
  var ip = 'webServerRefId="app.web.server"';
  var newValue = data.replace(new RegExp(ip), '');
  fs.writeFileSync(watchFile, newValue, 'utf-8');
  thisVars = require(`./${options.framework}Util`).getDefaultVars();
  thisVars.framework = options.framework;

  switch (thisVars.framework) {
    case 'extjs':
      thisVars.pluginName = 'ext-webpack-plugin';
      break;

    case 'react':
      thisVars.pluginName = 'ext-react-webpack-plugin';
      break;

    case 'angular':
      thisVars.pluginName = 'ext-angular-webpack-plugin';
      break;

    default:
      thisVars.pluginName = 'ext-webpack-plugin';
  }

  thisVars.app = require('./pluginUtil')._getApp();
  logv(options, `pluginName - ${thisVars.pluginName}`);
  logv(options, `thisVars.app - ${thisVars.app}`);
  const rc = fs.existsSync(`.ext-${thisVars.framework}rc`) && JSON.parse(fs.readFileSync(`.ext-${thisVars.framework}rc`, 'utf-8')) || {};
  thisOptions = _objectSpread({}, require(`./${thisVars.framework}Util`).getDefaultOptions(), options, rc);
  logv(options, `thisOptions - ${JSON.stringify(thisOptions)}`);

  if (thisOptions.environment == 'production') {
    thisVars.production = true;
  } else {
    thisVars.production = false;
  }

  log(require('./pluginUtil')._getVersions(thisVars.app, thisVars.pluginName, thisVars.framework));
  log(thisVars.app + 'Building for ' + thisOptions.environment);
  plugin.vars = thisVars;
  plugin.options = thisOptions;
  return plugin;
} //**********


function _compilation(compiler, compilation, vars, options) {
  try {
    require('./pluginUtil').logv(options, 'FUNCTION _compilation');

    if (vars.production) {
      logv(options, `ext-compilation: production is ` + vars.production);
      compilation.hooks.succeedModule.tap(`ext-succeed-module`, module => {
        if (module.resource && module.resource.match(/\.(j|t)sx?$/) && !module.resource.match(/node_modules/) && !module.resource.match(`/ext-{$options.framework}/dist/`) && !module.resource.match(`/ext-${options.framework}-${options.toolkit}/`)) {
          vars.deps = [...(vars.deps || []), ...require(`./${vars.framework}Util`).extractFromSource(module, options, compilation)];
        }
      });
    } else {
      logv(options, `ext-compilation: production is ` + vars.production);
    }

    if (options.framework != 'angular') {
      compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tap(`ext-html-generation`, data => {
        logv(options, 'HOOK ext-html-generation');

        const path = require('path');

        var outputPath = '';

        if (compiler.options.devServer) {
          if (compiler.outputPath === '/') {
            outputPath = path.join(compiler.options.devServer.contentBase, outputPath);
          } else {
            if (compiler.options.devServer.contentBase == undefined) {
              outputPath = 'build';
            } else {
              outputPath = '';
            }
          }
        } else {
          outputPath = 'build';
        }

        outputPath = outputPath.replace(process.cwd(), '').trim();
        var jsPath = path.join(outputPath, vars.extPath, 'ext.js');
        var cssPath = path.join(outputPath, vars.extPath, 'ext.css');
        data.assets.js.unshift(jsPath);
        data.assets.css.unshift(cssPath);
        log(vars.app + `Adding ${jsPath} and ${cssPath} to index.html`);
      });
    } else {
      logv(options, 'skipped HOOK ext-html-generation');
    }
  } catch (e) {
    require('./pluginUtil').logv(options, e);

    compilation.errors.push('_compilation: ' + e);
  }
} //**********


function emit(_x, _x2, _x3, _x4, _x5) {
  return _emit.apply(this, arguments);
} //**********


function _emit() {
  _emit = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(compiler, compilation, vars, options, callback) {
    var log, logv, app, framework, path, _buildExtBundle, outputPath, command, parms, url, opn;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          log = require('./pluginUtil').log;
          logv = require('./pluginUtil').logv;
          logv(options, 'FUNCTION emit');
          app = vars.app;
          framework = vars.framework;
          path = require('path');
          _buildExtBundle = require('./pluginUtil')._buildExtBundle;
          outputPath = path.join(compiler.outputPath, vars.extPath);

          if (compiler.outputPath === '/' && compiler.options.devServer) {
            outputPath = path.join(compiler.options.devServer.contentBase, outputPath);
          }

          logv(options, 'outputPath: ' + outputPath);
          logv(options, 'framework: ' + framework);

          if (!(options.emit == true)) {
            _context.next = 30;
            break;
          }

          if (framework != 'extjs') {
            _prepareForBuild(app, vars, options, outputPath, compilation);
          } else {
            require(`./${framework}Util`)._prepareForBuild(app, vars, options, outputPath, compilation);
          }

          command = '';

          if (options.watch == 'yes') {
            command = 'watch';
          } else {
            command = 'build';
          } //var cmdPort = '--port'
          //var cmdPortVal = '1234'


          if (!(vars.rebuild == true)) {
            _context.next = 27;
            break;
          }

          parms = [];

          if (options.profile == undefined || options.profile == '' || options.profile == null) {
            //parms = ['app', command, cmdPort, cmdPortVal, '--web-server', 'false', options.environment]
            parms = ['app', command, '--web-server', 'false', options.environment];
          } else {
            //mjg
            //parms = ['app', command, options.profile, options.environment, '--web-server', false]
            //parms = ['app', command, cmdPort, cmdPortVal, '--web-server', 'false', options.profile, options.environment]
            parms = ['app', command, '--web-server', 'false', options.profile, options.environment];
          }

          if (!(vars.watchStarted == false)) {
            _context.next = 23;
            break;
          }

          _context.next = 22;
          return _buildExtBundle(app, compilation, outputPath, parms, options);

        case 22:
          vars.watchStarted = true;

        case 23:
          //const jsChunk = compilation.addChunk(`ext-angular-js`)
          //jsChunk.hasRuntime = jsChunk.isInitial = () => true;
          //jsChunk.files.push(path.join('build', 'ext-angular', 'ext.js'));
          //jsChunk.files.push(path.join('build', 'ext-angular',  'ext.css'));
          //jsChunk.id = -2; // this forces html-webpack-plugin to include ext.js first
          if (options.browser == true && options.watch == 'yes') {
            if (vars.browserCount == 0 && compilation.errors.length == 0) {
              url = 'http://localhost:' + options.port;
              log(app + `Opening browser at ${url}`);
              vars.browserCount++;
              opn = require('opn');
              opn(url);
            }
          } else {
            logv(options, 'browser NOT opened');
          }

          callback();
          _context.next = 28;
          break;

        case 27:
          callback();

        case 28:
          _context.next = 33;
          break;

        case 30:
          log(`${vars.app}FUNCTION emit not run`);

          if (options.browser == true) {
            if (vars.browserCount == 0 && options.watch == 'yes') {
              url = 'http://localhost:' + options.port;
              log(app + `Opening browser at ${url}`);
              vars.browserCount++;
              opn = require('opn');
              opn(url);
            }
          } else {
            logv(options, 'browser NOT opened');
          }

          callback();

        case 33:
          _context.next = 40;
          break;

        case 35:
          _context.prev = 35;
          _context.t0 = _context["catch"](0);

          require('./pluginUtil').logv(options, _context.t0);

          compilation.errors.push('emit: ' + _context.t0);
          callback();

        case 40:
        case "end":
          return _context.stop();
      }
    }, _callee, this, [[0, 35]]);
  }));
  return _emit.apply(this, arguments);
}

function _prepareForBuild(app, vars, options, output, compilation) {
  try {
    logv(options, 'FUNCTION _prepareForBuild');

    const rimraf = require('rimraf');

    const mkdirp = require('mkdirp');

    const fsx = require('fs-extra');

    const fs = require('fs');

    const path = require('path');

    var packages = options.packages;
    var toolkit = options.toolkit;
    var theme = options.theme;
    theme = theme || (toolkit === 'classic' ? 'theme-triton' : 'theme-material');
    logv(options, 'firstTime: ' + vars.firstTime);

    if (vars.firstTime) {
      rimraf.sync(output);
      mkdirp.sync(output);

      const buildXML = require('./artifacts').buildXML;

      const createAppJson = require('./artifacts').createAppJson;

      const createWorkspaceJson = require('./artifacts').createWorkspaceJson;

      const createJSDOMEnvironment = require('./artifacts').createJSDOMEnvironment;

      fs.writeFileSync(path.join(output, 'build.xml'), buildXML(vars.production, options), 'utf8');
      fs.writeFileSync(path.join(output, 'app.json'), createAppJson(theme, packages, toolkit, options), 'utf8');
      fs.writeFileSync(path.join(output, 'jsdom-environment.js'), createJSDOMEnvironment(options), 'utf8');
      fs.writeFileSync(path.join(output, 'workspace.json'), createWorkspaceJson(options), 'utf8');

      if (fs.existsSync(path.join(process.cwd(), 'resources/'))) {
        var fromResources = path.join(process.cwd(), 'resources/');
        var toResources = path.join(output, '../resources');
        fsx.copySync(fromResources, toResources);
        log(app + 'Copying ' + fromResources.replace(process.cwd(), '') + ' to: ' + toResources.replace(process.cwd(), ''));
      }

      if (fs.existsSync(path.join(process.cwd(), 'resources/'))) {
        var fromResources = path.join(process.cwd(), 'resources/');
        var toResources = path.join(output, 'resources');
        fsx.copySync(fromResources, toResources);
        log(app + 'Copying ' + fromResources.replace(process.cwd(), '') + ' to: ' + toResources.replace(process.cwd(), ''));
      }
    }

    vars.firstTime = false;
    var js = '';

    if (vars.production) {
      vars.deps.push('Ext.require("Ext.layout.*");\n');
      js = vars.deps.join(';\n');
    } else {
      js = 'Ext.require("Ext.*")';
    }

    if (vars.manifest === null || js !== vars.manifest) {
      vars.manifest = js;
      const manifest = path.join(output, 'manifest.js');
      fs.writeFileSync(manifest, js, 'utf8');
      vars.rebuild = true;
      var bundleDir = output.replace(process.cwd(), '');

      if (bundleDir.trim() == '') {
        bundleDir = './';
      }

      log(app + 'Building Ext bundle at: ' + bundleDir);
    } else {
      vars.rebuild = false;
      log(app + 'Ext rebuild NOT needed');
    }
  } catch (e) {
    require('./pluginUtil').logv(options, e);

    compilation.errors.push('_prepareForBuild: ' + e);
  }
} //**********


function _buildExtBundle(app, compilation, outputPath, parms, options) {
  try {
    const fs = require('fs');

    const logv = require('./pluginUtil').logv;

    logv(options, 'FUNCTION _buildExtBundle');
    let sencha;

    try {
      sencha = require('@sencha/cmd');
    } catch (e) {
      sencha = 'sencha';
    }

    if (fs.existsSync(sencha)) {
      logv(options, 'sencha folder exists');
    } else {
      logv(options, 'sencha folder DOES NOT exist');
    }

    return new Promise((resolve, reject) => {
      const onBuildDone = () => {
        logv(options, 'onBuildDone');
        resolve();
      };

      var opts = {
        cwd: outputPath,
        silent: true,
        stdio: 'pipe',
        encoding: 'utf-8'
      };
      executeAsync(app, sencha, parms, opts, compilation, options).then(function () {
        onBuildDone();
      }, function (reason) {
        reject(reason);
      });
    });
  } catch (e) {
    require('./pluginUtil').logv(options, e);

    compilation.errors.push('_buildExtBundle: ' + e);
    callback();
  }
} //**********


function executeAsync(_x6, _x7, _x8, _x9, _x10, _x11) {
  return _executeAsync.apply(this, arguments);
}

function _executeAsync() {
  _executeAsync = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(app, command, parms, opts, compilation, options) {
    var DEFAULT_SUBSTRS, substrings, chalk, crossSpawn, log;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          _context2.prev = 0;
          //const DEFAULT_SUBSTRS = ['[INF] Loading', '[INF] Processing', '[LOG] Fashion build complete', '[ERR]', '[WRN]', "[INF] Server", "[INF] Writing", "[INF] Loading Build", "[INF] Waiting", "[LOG] Fashion waiting"];
          DEFAULT_SUBSTRS = ["[INF] xServer", '[INF] Loading', '[INF] Append', '[INF] Processing', '[INF] Processing Build', '[LOG] Fashion build complete', '[ERR]', '[WRN]', "[INF] Writing", "[INF] Loading Build", "[INF] Waiting", "[LOG] Fashion waiting"];
          substrings = DEFAULT_SUBSTRS;
          chalk = require('chalk');
          crossSpawn = require('cross-spawn');
          log = require('./pluginUtil').log;
          logv(options, 'FUNCTION executeAsync');
          _context2.next = 9;
          return new Promise((resolve, reject) => {
            logv(options, `command - ${command}`);
            logv(options, `parms - ${parms}`);
            logv(options, `opts - ${JSON.stringify(opts)}`);
            let child = crossSpawn(command, parms, opts);
            child.on('close', (code, signal) => {
              logv(options, `on close: ` + code);

              if (code === 0) {
                resolve(0);
              } else {
                compilation.errors.push(new Error(code));
                resolve(0);
              }
            });
            child.on('error', error => {
              logv(options, `on error`);
              compilation.errors.push(error);
              resolve(0);
            });
            child.stdout.on('data', data => {
              var str = data.toString().replace(/\r?\n|\r/g, " ").trim();
              logv(options, `${str}`);

              if (data && data.toString().match(/waiting for changes\.\.\./)) {
                resolve(0);
              } else {
                if (substrings.some(function (v) {
                  return data.indexOf(v) >= 0;
                })) {
                  str = str.replace("[INF]", "");
                  str = str.replace("[LOG]", "");
                  str = str.replace(process.cwd(), '').trim();

                  if (str.includes("[ERR]")) {
                    compilation.errors.push(app + str.replace(/^\[ERR\] /gi, ''));
                    str = str.replace("[ERR]", `${chalk.red("[ERR]")}`);
                  }

                  log(`${app}${str}`);
                }
              }
            });
            child.stderr.on('data', data => {
              logv(options, `error on close: ` + data);
              var str = data.toString().replace(/\r?\n|\r/g, " ").trim();
              var strJavaOpts = "Picked up _JAVA_OPTIONS";
              var includes = str.includes(strJavaOpts);

              if (!includes) {
                console.log(`${app} ${chalk.red("[ERR]")} ${str}`);
              }
            });
          });

        case 9:
          _context2.next = 16;
          break;

        case 11:
          _context2.prev = 11;
          _context2.t0 = _context2["catch"](0);

          require('./pluginUtil').logv(options, _context2.t0);

          compilation.errors.push('executeAsync: ' + _context2.t0);
          callback();

        case 16:
        case "end":
          return _context2.stop();
      }
    }, _callee2, this, [[0, 11]]);
  }));
  return _executeAsync.apply(this, arguments);
}

function log(s) {
  require('readline').cursorTo(process.stdout, 0);

  try {
    process.stdout.clearLine();
  } catch (e) {}

  process.stdout.write(s);
  process.stdout.write('\n');
}

function logv(options, s) {
  if (options.verbose == 'yes') {
    require('readline').cursorTo(process.stdout, 0);

    try {
      process.stdout.clearLine();
    } catch (e) {}

    process.stdout.write(`-verbose: ${s}`);
    process.stdout.write('\n');
  }
}

function _getApp() {
  var chalk = require('chalk');

  var prefix = ``;

  const platform = require('os').platform();

  if (platform == 'darwin') {
    prefix = `ℹ ｢ext｣:`;
  } else {
    prefix = `i [ext]:`;
  }

  return `${chalk.green(prefix)} `;
}

function _getVersions(app, pluginName, frameworkName) {
  const path = require('path');

  const fs = require('fs'); // var nodeDir = path.resolve(__dirname)
  // var pkg = (fs.existsSync(nodeDir + '/package.json') && JSON.parse(fs.readFileSync(nodeDir + '/package.json', 'utf-8')) || {});
  // version = pkg.version
  // _resolved = pkg._resolved
  // if (_resolved == undefined) {
  //   edition = `Professional`
  // }
  // else {
  //   if (-1 == _resolved.indexOf('community')) {
  //     global.isCommunity = false
  //     edition = `Professional`
  //   }
  //   else {
  //     global.isCommunity = true
  //     edition = `Community`
  //   }
  // }


  var v = {};
  var pluginPath = path.resolve(process.cwd(), 'node_modules/@sencha', pluginName);
  var pluginPkg = fs.existsSync(pluginPath + '/package.json') && JSON.parse(fs.readFileSync(pluginPath + '/package.json', 'utf-8')) || {};
  v.pluginVersion = pluginPkg.version;
  v._resolved = pluginPkg._resolved;

  if (v._resolved == undefined) {
    v.edition = `Professional`;
  } else {
    if (-1 == v._resolved.indexOf('community')) {
      v.edition = `Professional`;
    } else {
      v.edition = `Community`;
    }
  }

  var webpackPath = path.resolve(process.cwd(), 'node_modules/webpack');
  var webpackPkg = fs.existsSync(webpackPath + '/package.json') && JSON.parse(fs.readFileSync(webpackPath + '/package.json', 'utf-8')) || {};
  v.webpackVersion = webpackPkg.version;
  var extPath = path.resolve(process.cwd(), 'node_modules/@sencha/ext');
  var extPkg = fs.existsSync(extPath + '/package.json') && JSON.parse(fs.readFileSync(extPath + '/package.json', 'utf-8')) || {};
  v.extVersion = extPkg.sencha.version;
  var cmdPath = path.resolve(process.cwd(), `node_modules/@sencha/cmd`);
  var cmdPkg = fs.existsSync(cmdPath + '/package.json') && JSON.parse(fs.readFileSync(cmdPath + '/package.json', 'utf-8')) || {};
  v.cmdVersion = cmdPkg.version_full;

  if (v.cmdVersion == undefined) {
    var cmdPath = path.resolve(process.cwd(), `node_modules/@sencha/${pluginName}/node_modules/@sencha/cmd`);
    var cmdPkg = fs.existsSync(cmdPath + '/package.json') && JSON.parse(fs.readFileSync(cmdPath + '/package.json', 'utf-8')) || {};
    v.cmdVersion = cmdPkg.version_full;
  }

  var frameworkInfo = '';

  if (frameworkName != undefined && frameworkName != 'extjs') {
    var frameworkPath = '';

    if (frameworkName == 'react') {
      frameworkPath = path.resolve(process.cwd(), 'node_modules/react');
    }

    if (frameworkName == 'angular') {
      frameworkPath = path.resolve(process.cwd(), 'node_modules/@angular/core');
    }

    var frameworkPkg = fs.existsSync(frameworkPath + '/package.json') && JSON.parse(fs.readFileSync(frameworkPath + '/package.json', 'utf-8')) || {};
    v.frameworkVersion = frameworkPkg.version;
    frameworkInfo = ', ' + frameworkName + ' v' + v.frameworkVersion;
  }

  return app + 'ext-webpack-plugin v' + v.pluginVersion + ', Ext JS v' + v.extVersion + ' ' + v.edition + ' Edition, Sencha Cmd v' + v.cmdVersion + ', webpack v' + v.webpackVersion + frameworkInfo;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wbHVnaW5VdGlsLmpzIl0sIm5hbWVzIjpbIl9jb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJwYXRoIiwicmVxdWlyZSIsImZzIiwidGhpc1ZhcnMiLCJ0aGlzT3B0aW9ucyIsInBsdWdpbiIsImZyYW1ld29yayIsInVuZGVmaW5lZCIsInBsdWdpbkVycm9ycyIsInB1c2giLCJ2YXJzIiwidmFsaWRhdGVPcHRpb25zIiwiZ2V0VmFsaWRhdGVPcHRpb25zIiwid2F0Y2hGaWxlIiwicmVzb2x2ZSIsInByb2Nlc3MiLCJjd2QiLCJsb2d2IiwiZGF0YSIsInJlYWRGaWxlU3luYyIsImlwIiwibmV3VmFsdWUiLCJyZXBsYWNlIiwiUmVnRXhwIiwid3JpdGVGaWxlU3luYyIsImdldERlZmF1bHRWYXJzIiwicGx1Z2luTmFtZSIsImFwcCIsIl9nZXRBcHAiLCJyYyIsImV4aXN0c1N5bmMiLCJKU09OIiwicGFyc2UiLCJnZXREZWZhdWx0T3B0aW9ucyIsInN0cmluZ2lmeSIsImVudmlyb25tZW50IiwicHJvZHVjdGlvbiIsImxvZyIsIl9nZXRWZXJzaW9ucyIsIl9jb21waWxhdGlvbiIsImNvbXBpbGVyIiwiY29tcGlsYXRpb24iLCJob29rcyIsInN1Y2NlZWRNb2R1bGUiLCJ0YXAiLCJtb2R1bGUiLCJyZXNvdXJjZSIsIm1hdGNoIiwidG9vbGtpdCIsImRlcHMiLCJleHRyYWN0RnJvbVNvdXJjZSIsImh0bWxXZWJwYWNrUGx1Z2luQmVmb3JlSHRtbEdlbmVyYXRpb24iLCJvdXRwdXRQYXRoIiwiZGV2U2VydmVyIiwiam9pbiIsImNvbnRlbnRCYXNlIiwidHJpbSIsImpzUGF0aCIsImV4dFBhdGgiLCJjc3NQYXRoIiwiYXNzZXRzIiwianMiLCJ1bnNoaWZ0IiwiY3NzIiwiZSIsImVycm9ycyIsImVtaXQiLCJjYWxsYmFjayIsIl9idWlsZEV4dEJ1bmRsZSIsIl9wcmVwYXJlRm9yQnVpbGQiLCJjb21tYW5kIiwid2F0Y2giLCJyZWJ1aWxkIiwicGFybXMiLCJwcm9maWxlIiwid2F0Y2hTdGFydGVkIiwiYnJvd3NlciIsImJyb3dzZXJDb3VudCIsImxlbmd0aCIsInVybCIsInBvcnQiLCJvcG4iLCJvdXRwdXQiLCJyaW1yYWYiLCJta2RpcnAiLCJmc3giLCJwYWNrYWdlcyIsInRoZW1lIiwiZmlyc3RUaW1lIiwic3luYyIsImJ1aWxkWE1MIiwiY3JlYXRlQXBwSnNvbiIsImNyZWF0ZVdvcmtzcGFjZUpzb24iLCJjcmVhdGVKU0RPTUVudmlyb25tZW50IiwiZnJvbVJlc291cmNlcyIsInRvUmVzb3VyY2VzIiwiY29weVN5bmMiLCJtYW5pZmVzdCIsImJ1bmRsZURpciIsInNlbmNoYSIsIlByb21pc2UiLCJyZWplY3QiLCJvbkJ1aWxkRG9uZSIsIm9wdHMiLCJzaWxlbnQiLCJzdGRpbyIsImVuY29kaW5nIiwiZXhlY3V0ZUFzeW5jIiwidGhlbiIsInJlYXNvbiIsIkRFRkFVTFRfU1VCU1RSUyIsInN1YnN0cmluZ3MiLCJjaGFsayIsImNyb3NzU3Bhd24iLCJjaGlsZCIsIm9uIiwiY29kZSIsInNpZ25hbCIsIkVycm9yIiwiZXJyb3IiLCJzdGRvdXQiLCJzdHIiLCJ0b1N0cmluZyIsInNvbWUiLCJ2IiwiaW5kZXhPZiIsImluY2x1ZGVzIiwicmVkIiwic3RkZXJyIiwic3RySmF2YU9wdHMiLCJjb25zb2xlIiwicyIsImN1cnNvclRvIiwiY2xlYXJMaW5lIiwid3JpdGUiLCJ2ZXJib3NlIiwicHJlZml4IiwicGxhdGZvcm0iLCJncmVlbiIsImZyYW1ld29ya05hbWUiLCJwbHVnaW5QYXRoIiwicGx1Z2luUGtnIiwicGx1Z2luVmVyc2lvbiIsInZlcnNpb24iLCJfcmVzb2x2ZWQiLCJlZGl0aW9uIiwid2VicGFja1BhdGgiLCJ3ZWJwYWNrUGtnIiwid2VicGFja1ZlcnNpb24iLCJleHRQa2ciLCJleHRWZXJzaW9uIiwiY21kUGF0aCIsImNtZFBrZyIsImNtZFZlcnNpb24iLCJ2ZXJzaW9uX2Z1bGwiLCJmcmFtZXdvcmtJbmZvIiwiZnJhbWV3b3JrUGF0aCIsImZyYW1l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L0UsR0FBcUYxQixDQUFDLENBQUNxQixPQUF2RixHQUFpRyx3QkFBakcsR0FBNEhyQixDQUFDLENBQUM2QixVQUE5SCxHQUEySSxhQUEzSSxHQUEySjdCLENBQUMsQ0FBQ3dCLGNBQTdKLEdBQThLTyxhQUFyTDtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gX2NvbnN0cnVjdG9yKG9wdGlvbnMpIHtcbiAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcblxuICB2YXIgdGhpc1ZhcnMgPSB7fVxuICB2YXIgdGhpc09wdGlvbnMgPSB7fVxuICB2YXIgcGx1Z2luID0ge31cblxuICBpZiAob3B0aW9ucy5mcmFtZXdvcmsgPT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc1ZhcnMucGx1Z2luRXJyb3JzID0gW11cbiAgICB0aGlzVmFycy5wbHVnaW5FcnJvcnMucHVzaCgnd2VicGFjayBjb25maWc6IGZyYW1ld29yayBwYXJhbWV0ZXIgb24gZXh0LXdlYnBhY2stcGx1Z2luIGlzIG5vdCBkZWZpbmVkIC0gdmFsdWVzOiByZWFjdCwgYW5ndWxhciwgZXh0anMnKVxuICAgIHBsdWdpbi52YXJzID0gdGhpc1ZhcnNcbiAgICByZXR1cm4gcGx1Z2luXG4gIH1cblxuICBjb25zdCB2YWxpZGF0ZU9wdGlvbnMgPSByZXF1aXJlKCdzY2hlbWEtdXRpbHMnKVxuICB2YWxpZGF0ZU9wdGlvbnMocmVxdWlyZShgLi8ke29wdGlvbnMuZnJhbWV3b3JrfVV0aWxgKS5nZXRWYWxpZGF0ZU9wdGlvbnMoKSwgb3B0aW9ucywgJycpXG5cblxuICAvL2ZpeCBzZW5jaGEgY21kIG5vIGpldHR5IHNlcnZlciBwcm9ibGVtXG5cbiAgdmFyIHdhdGNoRmlsZSA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLGBub2RlX21vZHVsZXMvQHNlbmNoYS9jbWQvZGlzdC9hbnQvYnVpbGQvYXBwL3dhdGNoLWltcGwueG1sYClcbiAgbG9ndihvcHRpb25zLCBgbW9kaWZ5ICR7d2F0Y2hGaWxlfWApXG4gIHZhciBkYXRhID0gZnMucmVhZEZpbGVTeW5jKHdhdGNoRmlsZSwgJ3V0Zi04Jyk7XG4gIHZhciBpcCA9ICd3ZWJTZXJ2ZXJSZWZJZD1cImFwcC53ZWIuc2VydmVyXCInO1xuICB2YXIgbmV3VmFsdWUgPSBkYXRhLnJlcGxhY2UobmV3IFJlZ0V4cChpcCksICcnKTtcbiAgZnMud3JpdGVGaWxlU3luYyh3YXRjaEZpbGUsIG5ld1ZhbHVlLCAndXRmLTgnKTtcblxuXG4gIHRoaXNWYXJzID0gcmVxdWlyZShgLi8ke29wdGlvbnMuZnJhbWV3b3JrfVV0aWxgKS5nZXREZWZhdWx0VmFycygpXG4gIHRoaXNWYXJzLmZyYW1ld29yayA9IG9wdGlvbnMuZnJhbWV3b3JrXG4gIHN3aXRjaCh0aGlzVmFycy5mcmFtZXdvcmspIHtcbiAgICBjYXNlICdleHRqcyc6XG4gICAgICB0aGlzVmFycy5wbHVnaW5OYW1lID0gJ2V4dC13ZWJwYWNrLXBsdWdpbidcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JlYWN0JzpcbiAgICAgIHRoaXNWYXJzLnBsdWdpbk5hbWUgPSAnZXh0LXJlYWN0LXdlYnBhY2stcGx1Z2luJ1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYW5ndWxhcic6XG4gICAgICB0aGlzVmFycy5wbHVnaW5OYW1lID0gJ2V4dC1hbmd1bGFyLXdlYnBhY2stcGx1Z2luJ1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRoaXNWYXJzLnBsdWdpbk5hbWUgPSAnZXh0LXdlYnBhY2stcGx1Z2luJ1xuICB9XG4gIHRoaXNWYXJzLmFwcCA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLl9nZXRBcHAoKVxuICBsb2d2KG9wdGlvbnMsIGBwbHVnaW5OYW1lIC0gJHt0aGlzVmFycy5wbHVnaW5OYW1lfWApXG4gIGxvZ3Yob3B0aW9ucywgYHRoaXNWYXJzLmFwcCAtICR7dGhpc1ZhcnMuYXBwfWApXG5cbiAgY29uc3QgcmMgPSAoZnMuZXhpc3RzU3luYyhgLmV4dC0ke3RoaXNWYXJzLmZyYW1ld29ya31yY2ApICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGAuZXh0LSR7dGhpc1ZhcnMuZnJhbWV3b3JrfXJjYCwgJ3V0Zi04JykpIHx8IHt9KVxuICB0aGlzT3B0aW9ucyA9IHsgLi4ucmVxdWlyZShgLi8ke3RoaXNWYXJzLmZyYW1ld29ya31VdGlsYCkuZ2V0RGVmYXVsdE9wdGlvbnMoKSwgLi4ub3B0aW9ucywgLi4ucmMgfVxuICBsb2d2KG9wdGlvbnMsIGB0aGlzT3B0aW9ucyAtICR7SlNPTi5zdHJpbmdpZnkodGhpc09wdGlvbnMpfWApXG4gIGlmICh0aGlzT3B0aW9ucy5lbnZpcm9ubWVudCA9PSAncHJvZHVjdGlvbicpIFxuICAgIHt0aGlzVmFycy5wcm9kdWN0aW9uID0gdHJ1ZX1cbiAgZWxzZSBcbiAgICB7dGhpc1ZhcnMucHJvZHVjdGlvbiA9IGZhbHNlfVxuICBsb2cocmVxdWlyZSgnLi9wbHVnaW5VdGlsJykuX2dldFZlcnNpb25zKHRoaXNWYXJzLmFwcCwgdGhpc1ZhcnMucGx1Z2luTmFtZSwgdGhpc1ZhcnMuZnJhbWV3b3JrKSlcbiAgbG9nKHRoaXNWYXJzLmFwcCArICdCdWlsZGluZyBmb3IgJyArIHRoaXNPcHRpb25zLmVudmlyb25tZW50KVxuXG4gIHBsdWdpbi52YXJzID0gdGhpc1ZhcnNcbiAgcGx1Z2luLm9wdGlvbnMgPSB0aGlzT3B0aW9uc1xuICByZXR1cm4gcGx1Z2luXG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF9jb21waWxhdGlvbihjb21waWxlciwgY29tcGlsYXRpb24sIHZhcnMsIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2d2KG9wdGlvbnMsJ0ZVTkNUSU9OIF9jb21waWxhdGlvbicpXG4gICAgaWYgKHZhcnMucHJvZHVjdGlvbikge1xuICAgICAgbG9ndihvcHRpb25zLGBleHQtY29tcGlsYXRpb246IHByb2R1Y3Rpb24gaXMgYCArICB2YXJzLnByb2R1Y3Rpb24pXG4gICAgICBjb21waWxhdGlvbi5ob29rcy5zdWNjZWVkTW9kdWxlLnRhcChgZXh0LXN1Y2NlZWQtbW9kdWxlYCwgKG1vZHVsZSkgPT4ge1xuICAgICAgICBpZiAobW9kdWxlLnJlc291cmNlICYmIG1vZHVsZS5yZXNvdXJjZS5tYXRjaCgvXFwuKGp8dClzeD8kLykgJiYgIW1vZHVsZS5yZXNvdXJjZS5tYXRjaCgvbm9kZV9tb2R1bGVzLykgJiYgIW1vZHVsZS5yZXNvdXJjZS5tYXRjaChgL2V4dC17JG9wdGlvbnMuZnJhbWV3b3JrfS9kaXN0L2ApICYmICFtb2R1bGUucmVzb3VyY2UubWF0Y2goYC9leHQtJHtvcHRpb25zLmZyYW1ld29ya30tJHtvcHRpb25zLnRvb2xraXR9L2ApKSB7XG4gICAgICAgICAgdmFycy5kZXBzID0gWyBcbiAgICAgICAgICAgIC4uLih2YXJzLmRlcHMgfHwgW10pLCBcbiAgICAgICAgICAgIC4uLnJlcXVpcmUoYC4vJHt2YXJzLmZyYW1ld29ya31VdGlsYCkuZXh0cmFjdEZyb21Tb3VyY2UobW9kdWxlLCBvcHRpb25zLCBjb21waWxhdGlvbikgXG4gICAgICAgICAgXVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxvZ3Yob3B0aW9ucyxgZXh0LWNvbXBpbGF0aW9uOiBwcm9kdWN0aW9uIGlzIGAgKyAgdmFycy5wcm9kdWN0aW9uKVxuICAgIH1cbiAgICBpZiAob3B0aW9ucy5mcmFtZXdvcmsgIT0gJ2FuZ3VsYXInKSB7XG4gICAgICBjb21waWxhdGlvbi5ob29rcy5odG1sV2VicGFja1BsdWdpbkJlZm9yZUh0bWxHZW5lcmF0aW9uLnRhcChgZXh0LWh0bWwtZ2VuZXJhdGlvbmAsKGRhdGEpID0+IHtcbiAgICAgICAgbG9ndihvcHRpb25zLCdIT09LIGV4dC1odG1sLWdlbmVyYXRpb24nKVxuICAgICAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gICAgICAgIHZhciBvdXRwdXRQYXRoID0gJydcbiAgICAgICAgaWYgKGNvbXBpbGVyLm9wdGlvbnMuZGV2U2VydmVyKSB7XG4gICAgICAgICAgaWYgKGNvbXBpbGVyLm91dHB1dFBhdGggPT09ICcvJykge1xuICAgICAgICAgICAgb3V0cHV0UGF0aCA9IHBhdGguam9pbihjb21waWxlci5vcHRpb25zLmRldlNlcnZlci5jb250ZW50QmFzZSwgb3V0cHV0UGF0aClcbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBpZiAoY29tcGlsZXIub3B0aW9ucy5kZXZTZXJ2ZXIuY29udGVudEJhc2UgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgIG91dHB1dFBhdGggPSAnYnVpbGQnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgb3V0cHV0UGF0aCA9ICcnXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIG91dHB1dFBhdGggPSAnYnVpbGQnXG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0UGF0aCA9IG91dHB1dFBhdGgucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykudHJpbSgpXG4gICAgICAgIHZhciBqc1BhdGggPSBwYXRoLmpvaW4ob3V0cHV0UGF0aCwgdmFycy5leHRQYXRoLCAnZXh0LmpzJylcbiAgICAgICAgdmFyIGNzc1BhdGggPSBwYXRoLmpvaW4ob3V0cHV0UGF0aCwgdmFycy5leHRQYXRoLCAnZXh0LmNzcycpXG4gICAgICAgIGRhdGEuYXNzZXRzLmpzLnVuc2hpZnQoanNQYXRoKVxuICAgICAgICBkYXRhLmFzc2V0cy5jc3MudW5zaGlmdChjc3NQYXRoKVxuICAgICAgICBsb2codmFycy5hcHAgKyBgQWRkaW5nICR7anNQYXRofSBhbmQgJHtjc3NQYXRofSB0byBpbmRleC5odG1sYClcbiAgICAgIH0pXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbG9ndihvcHRpb25zLCdza2lwcGVkIEhPT0sgZXh0LWh0bWwtZ2VuZXJhdGlvbicpXG4gICAgfVxuICB9XG4gIGNhdGNoKGUpIHtcbiAgICByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2d2KG9wdGlvbnMsZSlcbiAgICBjb21waWxhdGlvbi5lcnJvcnMucHVzaCgnX2NvbXBpbGF0aW9uOiAnICsgZSlcbiAgfVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbWl0KGNvbXBpbGVyLCBjb21waWxhdGlvbiwgdmFycywgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBsb2cgPSByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2dcbiAgICBjb25zdCBsb2d2ID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndlxuICAgIGxvZ3Yob3B0aW9ucywnRlVOQ1RJT04gZW1pdCcpXG4gICAgdmFyIGFwcCA9IHZhcnMuYXBwXG4gICAgdmFyIGZyYW1ld29yayA9IHZhcnMuZnJhbWV3b3JrXG4gICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuICAgIGNvbnN0IF9idWlsZEV4dEJ1bmRsZSA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLl9idWlsZEV4dEJ1bmRsZVxuICAgIGxldCBvdXRwdXRQYXRoID0gcGF0aC5qb2luKGNvbXBpbGVyLm91dHB1dFBhdGgsdmFycy5leHRQYXRoKVxuICAgIGlmIChjb21waWxlci5vdXRwdXRQYXRoID09PSAnLycgJiYgY29tcGlsZXIub3B0aW9ucy5kZXZTZXJ2ZXIpIHtcbiAgICAgIG91dHB1dFBhdGggPSBwYXRoLmpvaW4oY29tcGlsZXIub3B0aW9ucy5kZXZTZXJ2ZXIuY29udGVudEJhc2UsIG91dHB1dFBhdGgpXG4gICAgfVxuICAgIGxvZ3Yob3B0aW9ucywnb3V0cHV0UGF0aDogJyArIG91dHB1dFBhdGgpXG4gICAgbG9ndihvcHRpb25zLCdmcmFtZXdvcms6ICcgKyBmcmFtZXdvcmspXG4gICAgaWYgKG9wdGlvbnMuZW1pdCA9PSB0cnVlKSB7XG4gICAgICBpZiAoZnJhbWV3b3JrICE9ICdleHRqcycpIHtcbiAgICAgICAgX3ByZXBhcmVGb3JCdWlsZChhcHAsIHZhcnMsIG9wdGlvbnMsIG91dHB1dFBhdGgsIGNvbXBpbGF0aW9uKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHJlcXVpcmUoYC4vJHtmcmFtZXdvcmt9VXRpbGApLl9wcmVwYXJlRm9yQnVpbGQoYXBwLCB2YXJzLCBvcHRpb25zLCBvdXRwdXRQYXRoLCBjb21waWxhdGlvbilcbiAgICAgIH1cblxuICAgICAgdmFyIGNvbW1hbmQgPSAnJ1xuICAgICAgaWYgKG9wdGlvbnMud2F0Y2ggPT0gJ3llcycpIHtcbiAgICAgICAgY29tbWFuZCA9ICd3YXRjaCdcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBjb21tYW5kID0gJ2J1aWxkJ1xuICAgICAgfVxuXG4gICAgICAvL3ZhciBjbWRQb3J0ID0gJy0tcG9ydCdcbiAgICAgIC8vdmFyIGNtZFBvcnRWYWwgPSAnMTIzNCdcbiAgICAgIGlmICh2YXJzLnJlYnVpbGQgPT0gdHJ1ZSkge1xuICAgICAgICB2YXIgcGFybXMgPSBbXVxuICAgICAgICBpZiAob3B0aW9ucy5wcm9maWxlID09IHVuZGVmaW5lZCB8fCBvcHRpb25zLnByb2ZpbGUgPT0gJycgfHwgb3B0aW9ucy5wcm9maWxlID09IG51bGwpIHtcbiAgICAgICAgICAvL3Bhcm1zID0gWydhcHAnLCBjb21tYW5kLCBjbWRQb3J0LCBjbWRQb3J0VmFsLCAnLS13ZWItc2VydmVyJywgJ2ZhbHNlJywgb3B0aW9ucy5lbnZpcm9ubWVudF1cbiAgICAgICAgICBwYXJtcyA9IFsnYXBwJywgY29tbWFuZCwgJy0td2ViLXNlcnZlcicsICdmYWxzZScsIG9wdGlvbnMuZW52aXJvbm1lbnRdXG5cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHsgLy9tamdcbiAgICAgICAgICAvL3Bhcm1zID0gWydhcHAnLCBjb21tYW5kLCBvcHRpb25zLnByb2ZpbGUsIG9wdGlvbnMuZW52aXJvbm1lbnQsICctLXdlYi1zZXJ2ZXInLCBmYWxzZV1cbiAgICAgICAgICAvL3Bhcm1zID0gWydhcHAnLCBjb21tYW5kLCBjbWRQb3J0LCBjbWRQb3J0VmFsLCAnLS13ZWItc2VydmVyJywgJ2ZhbHNlJywgb3B0aW9ucy5wcm9maWxlLCBvcHRpb25zLmVudmlyb25tZW50XVxuICAgICAgICAgIHBhcm1zID0gWydhcHAnLCBjb21tYW5kLCAnLS13ZWItc2VydmVyJywgJ2ZhbHNlJywgb3B0aW9ucy5wcm9maWxlLCBvcHRpb25zLmVudmlyb25tZW50XVxuXG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhcnMud2F0Y2hTdGFydGVkID09IGZhbHNlKSB7XG4gICAgICAgICAgYXdhaXQgX2J1aWxkRXh0QnVuZGxlKGFwcCwgY29tcGlsYXRpb24sIG91dHB1dFBhdGgsIHBhcm1zLCBvcHRpb25zKVxuICAgICAgICAgIHZhcnMud2F0Y2hTdGFydGVkID0gdHJ1ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy9jb25zdCBqc0NodW5rID0gY29tcGlsYXRpb24uYWRkQ2h1bmsoYGV4dC1hbmd1bGFyLWpzYClcbiAgICAgICAgLy9qc0NodW5rLmhhc1J1bnRpbWUgPSBqc0NodW5rLmlzSW5pdGlhbCA9ICgpID0+IHRydWU7XG4gICAgICAgIC8vanNDaHVuay5maWxlcy5wdXNoKHBhdGguam9pbignYnVpbGQnLCAnZXh0LWFuZ3VsYXInLCAnZXh0LmpzJykpO1xuICAgICAgICAvL2pzQ2h1bmsuZmlsZXMucHVzaChwYXRoLmpvaW4oJ2J1aWxkJywgJ2V4dC1hbmd1bGFyJywgICdleHQuY3NzJykpO1xuICAgICAgICAvL2pzQ2h1bmsuaWQgPSAtMjsgLy8gdGhpcyBmb3JjZXMgaHRtbC13ZWJwYWNrLXBsdWdpbiB0byBpbmNsdWRlIGV4dC5qcyBmaXJzdFxuXG4gICAgICAgIGlmKG9wdGlvbnMuYnJvd3NlciA9PSB0cnVlICYmIG9wdGlvbnMud2F0Y2ggPT0gJ3llcycpIHtcbiAgICAgICAgICBpZiAodmFycy5icm93c2VyQ291bnQgPT0gMCAmJiBjb21waWxhdGlvbi5lcnJvcnMubGVuZ3RoID09IDApIHtcbiAgICAgICAgICAgIHZhciB1cmwgPSAnaHR0cDovL2xvY2FsaG9zdDonICsgb3B0aW9ucy5wb3J0XG4gICAgICAgICAgICBsb2coYXBwICsgYE9wZW5pbmcgYnJvd3NlciBhdCAke3VybH1gKVxuICAgICAgICAgICAgdmFycy5icm93c2VyQ291bnQrK1xuICAgICAgICAgICAgY29uc3Qgb3BuID0gcmVxdWlyZSgnb3BuJylcbiAgICAgICAgICAgIG9wbih1cmwpXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGxvZ3Yob3B0aW9ucywnYnJvd3NlciBOT1Qgb3BlbmVkJylcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjaygpXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2soKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxvZyhgJHt2YXJzLmFwcH1GVU5DVElPTiBlbWl0IG5vdCBydW5gKVxuICAgICAgaWYob3B0aW9ucy5icm93c2VyID09IHRydWUpIHtcbiAgICAgICAgaWYgKHZhcnMuYnJvd3NlckNvdW50ID09IDAgJiYgb3B0aW9ucy53YXRjaCA9PSAneWVzJykge1xuICAgICAgICAgIHZhciB1cmwgPSAnaHR0cDovL2xvY2FsaG9zdDonICsgb3B0aW9ucy5wb3J0XG4gICAgICAgICAgbG9nKGFwcCArIGBPcGVuaW5nIGJyb3dzZXIgYXQgJHt1cmx9YClcbiAgICAgICAgICB2YXJzLmJyb3dzZXJDb3VudCsrXG4gICAgICAgICAgY29uc3Qgb3BuID0gcmVxdWlyZSgnb3BuJylcbiAgICAgICAgICBvcG4odXJsKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgbG9ndihvcHRpb25zLCdicm93c2VyIE5PVCBvcGVuZWQnKVxuICAgICAgfVxuICAgICAgY2FsbGJhY2soKVxuICAgIH1cbiAgfVxuICBjYXRjaChlKSB7XG4gICAgcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndihvcHRpb25zLGUpXG4gICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goJ2VtaXQ6ICcgKyBlKVxuICAgIGNhbGxiYWNrKClcbiAgfVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBfcHJlcGFyZUZvckJ1aWxkKGFwcCwgdmFycywgb3B0aW9ucywgb3V0cHV0LCBjb21waWxhdGlvbikge1xuICB0cnkge1xuICAgIGxvZ3Yob3B0aW9ucywnRlVOQ1RJT04gX3ByZXBhcmVGb3JCdWlsZCcpXG4gICAgY29uc3QgcmltcmFmID0gcmVxdWlyZSgncmltcmFmJylcbiAgICBjb25zdCBta2RpcnAgPSByZXF1aXJlKCdta2RpcnAnKVxuICAgIGNvbnN0IGZzeCA9IHJlcXVpcmUoJ2ZzLWV4dHJhJylcbiAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbiAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbiAgICB2YXIgcGFja2FnZXMgPSBvcHRpb25zLnBhY2thZ2VzXG4gICAgdmFyIHRvb2xraXQgPSBvcHRpb25zLnRvb2xraXRcbiAgICB2YXIgdGhlbWUgPSBvcHRpb25zLnRoZW1lXG5cbiAgICB0aGVtZSA9IHRoZW1lIHx8ICh0b29sa2l0ID09PSAnY2xhc3NpYycgPyAndGhlbWUtdHJpdG9uJyA6ICd0aGVtZS1tYXRlcmlhbCcpXG4gICAgbG9ndihvcHRpb25zLCdmaXJzdFRpbWU6ICcgKyB2YXJzLmZpcnN0VGltZSlcbiAgICBpZiAodmFycy5maXJzdFRpbWUpIHtcbiAgICAgIHJpbXJhZi5zeW5jKG91dHB1dClcbiAgICAgIG1rZGlycC5zeW5jKG91dHB1dClcbiAgICAgIGNvbnN0IGJ1aWxkWE1MID0gcmVxdWlyZSgnLi9hcnRpZmFjdHMnKS5idWlsZFhNTFxuICAgICAgY29uc3QgY3JlYXRlQXBwSnNvbiA9IHJlcXVpcmUoJy4vYXJ0aWZhY3RzJykuY3JlYXRlQXBwSnNvblxuICAgICAgY29uc3QgY3JlYXRlV29ya3NwYWNlSnNvbiA9IHJlcXVpcmUoJy4vYXJ0aWZhY3RzJykuY3JlYXRlV29ya3NwYWNlSnNvblxuICAgICAgY29uc3QgY3JlYXRlSlNET01FbnZpcm9ubWVudCA9IHJlcXVpcmUoJy4vYXJ0aWZhY3RzJykuY3JlYXRlSlNET01FbnZpcm9ubWVudFxuXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihvdXRwdXQsICdidWlsZC54bWwnKSwgYnVpbGRYTUwodmFycy5wcm9kdWN0aW9uLCBvcHRpb25zKSwgJ3V0ZjgnKVxuICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ob3V0cHV0LCAnYXBwLmpzb24nKSwgY3JlYXRlQXBwSnNvbih0aGVtZSwgcGFja2FnZXMsIHRvb2xraXQsIG9wdGlvbnMpLCAndXRmOCcpXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihvdXRwdXQsICdqc2RvbS1lbnZpcm9ubWVudC5qcycpLCBjcmVhdGVKU0RPTUVudmlyb25tZW50KG9wdGlvbnMpLCAndXRmOCcpXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihvdXRwdXQsICd3b3Jrc3BhY2UuanNvbicpLCBjcmVhdGVXb3Jrc3BhY2VKc29uKG9wdGlvbnMpLCAndXRmOCcpXG5cbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCdyZXNvdXJjZXMvJykpKSB7XG4gICAgICAgIHZhciBmcm9tUmVzb3VyY2VzID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdyZXNvdXJjZXMvJylcbiAgICAgICAgdmFyIHRvUmVzb3VyY2VzID0gcGF0aC5qb2luKG91dHB1dCwgJy4uL3Jlc291cmNlcycpXG4gICAgICAgIGZzeC5jb3B5U3luYyhmcm9tUmVzb3VyY2VzLCB0b1Jlc291cmNlcylcbiAgICAgICAgbG9nKGFwcCArICdDb3B5aW5nICcgKyBmcm9tUmVzb3VyY2VzLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpICsgJyB0bzogJyArIHRvUmVzb3VyY2VzLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpKVxuICAgICAgfVxuXG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwncmVzb3VyY2VzLycpKSkge1xuICAgICAgICB2YXIgZnJvbVJlc291cmNlcyA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncmVzb3VyY2VzLycpXG4gICAgICAgIHZhciB0b1Jlc291cmNlcyA9IHBhdGguam9pbihvdXRwdXQsICdyZXNvdXJjZXMnKVxuICAgICAgICBmc3guY29weVN5bmMoZnJvbVJlc291cmNlcywgdG9SZXNvdXJjZXMpXG4gICAgICAgIGxvZyhhcHAgKyAnQ29weWluZyAnICsgZnJvbVJlc291cmNlcy5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSArICcgdG86ICcgKyB0b1Jlc291cmNlcy5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSlcbiAgICAgIH1cbiAgICB9XG4gICAgdmFycy5maXJzdFRpbWUgPSBmYWxzZVxuICAgIHZhciBqcyA9ICcnXG4gICAgaWYgKHZhcnMucHJvZHVjdGlvbikge1xuICAgICAgdmFycy5kZXBzLnB1c2goJ0V4dC5yZXF1aXJlKFwiRXh0LmxheW91dC4qXCIpO1xcbicpXG4gICAgICBqcyA9IHZhcnMuZGVwcy5qb2luKCc7XFxuJyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAganMgPSAnRXh0LnJlcXVpcmUoXCJFeHQuKlwiKSdcbiAgICB9XG4gICAgaWYgKHZhcnMubWFuaWZlc3QgPT09IG51bGwgfHwganMgIT09IHZhcnMubWFuaWZlc3QpIHtcbiAgICAgIHZhcnMubWFuaWZlc3QgPSBqc1xuICAgICAgY29uc3QgbWFuaWZlc3QgPSBwYXRoLmpvaW4ob3V0cHV0LCAnbWFuaWZlc3QuanMnKVxuICAgICAgZnMud3JpdGVGaWxlU3luYyhtYW5pZmVzdCwganMsICd1dGY4JylcbiAgICAgIHZhcnMucmVidWlsZCA9IHRydWVcbiAgICAgIHZhciBidW5kbGVEaXIgPSBvdXRwdXQucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJylcbiAgICAgIGlmIChidW5kbGVEaXIudHJpbSgpID09ICcnKSB7YnVuZGxlRGlyID0gJy4vJ31cbiAgICAgIGxvZyhhcHAgKyAnQnVpbGRpbmcgRXh0IGJ1bmRsZSBhdDogJyArIGJ1bmRsZURpcilcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2YXJzLnJlYnVpbGQgPSBmYWxzZVxuICAgICAgbG9nKGFwcCArICdFeHQgcmVidWlsZCBOT1QgbmVlZGVkJylcbiAgICB9XG4gIH1cbiAgY2F0Y2goZSkge1xuICAgIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3Yob3B0aW9ucyxlKVxuICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKCdfcHJlcGFyZUZvckJ1aWxkOiAnICsgZSlcbiAgfVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBfYnVpbGRFeHRCdW5kbGUoYXBwLCBjb21waWxhdGlvbiwgb3V0cHV0UGF0aCwgcGFybXMsIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbiAgICBjb25zdCBsb2d2ID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndlxuICAgIGxvZ3Yob3B0aW9ucywnRlVOQ1RJT04gX2J1aWxkRXh0QnVuZGxlJylcblxuICAgIGxldCBzZW5jaGE7IHRyeSB7IHNlbmNoYSA9IHJlcXVpcmUoJ0BzZW5jaGEvY21kJykgfSBjYXRjaCAoZSkgeyBzZW5jaGEgPSAnc2VuY2hhJyB9XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoc2VuY2hhKSkge1xuICAgICAgbG9ndihvcHRpb25zLCdzZW5jaGEgZm9sZGVyIGV4aXN0cycpXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbG9ndihvcHRpb25zLCdzZW5jaGEgZm9sZGVyIERPRVMgTk9UIGV4aXN0JylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgb25CdWlsZERvbmUgPSAoKSA9PiB7XG4gICAgICAgIGxvZ3Yob3B0aW9ucywnb25CdWlsZERvbmUnKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH1cblxuICAgICAgdmFyIG9wdHMgPSB7IGN3ZDogb3V0cHV0UGF0aCwgc2lsZW50OiB0cnVlLCBzdGRpbzogJ3BpcGUnLCBlbmNvZGluZzogJ3V0Zi04J31cbiAgICAgIGV4ZWN1dGVBc3luYyhhcHAsIHNlbmNoYSwgcGFybXMsIG9wdHMsIGNvbXBpbGF0aW9uLCBvcHRpb25zKS50aGVuIChcbiAgICAgICAgZnVuY3Rpb24oKSB7IG9uQnVpbGREb25lKCkgfSwgXG4gICAgICAgIGZ1bmN0aW9uKHJlYXNvbikgeyByZWplY3QocmVhc29uKSB9XG4gICAgICApXG4gICAgfSlcbiAgfVxuICBjYXRjaChlKSB7XG4gICAgcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndihvcHRpb25zLGUpXG4gICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goJ19idWlsZEV4dEJ1bmRsZTogJyArIGUpXG4gICAgY2FsbGJhY2soKVxuICB9XG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVBc3luYyAoYXBwLCBjb21tYW5kLCBwYXJtcywgb3B0cywgY29tcGlsYXRpb24sIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICAvL2NvbnN0IERFRkFVTFRfU1VCU1RSUyA9IFsnW0lORl0gTG9hZGluZycsICdbSU5GXSBQcm9jZXNzaW5nJywgJ1tMT0ddIEZhc2hpb24gYnVpbGQgY29tcGxldGUnLCAnW0VSUl0nLCAnW1dSTl0nLCBcIltJTkZdIFNlcnZlclwiLCBcIltJTkZdIFdyaXRpbmdcIiwgXCJbSU5GXSBMb2FkaW5nIEJ1aWxkXCIsIFwiW0lORl0gV2FpdGluZ1wiLCBcIltMT0ddIEZhc2hpb24gd2FpdGluZ1wiXTtcbiAgICBjb25zdCBERUZBVUxUX1NVQlNUUlMgPSBbXCJbSU5GXSB4U2VydmVyXCIsICdbSU5GXSBMb2FkaW5nJywgJ1tJTkZdIEFwcGVuZCcsICdbSU5GXSBQcm9jZXNzaW5nJywgJ1tJTkZdIFByb2Nlc3NpbmcgQnVpbGQnLCAnW0xPR10gRmFzaGlvbiBidWlsZCBjb21wbGV0ZScsICdbRVJSXScsICdbV1JOXScsIFwiW0lORl0gV3JpdGluZ1wiLCBcIltJTkZdIExvYWRpbmcgQnVpbGRcIiwgXCJbSU5GXSBXYWl0aW5nXCIsIFwiW0xPR10gRmFzaGlvbiB3YWl0aW5nXCJdO1xuICAgIHZhciBzdWJzdHJpbmdzID0gREVGQVVMVF9TVUJTVFJTIFxuICAgIHZhciBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbiAgICBjb25zdCBjcm9zc1NwYXduID0gcmVxdWlyZSgnY3Jvc3Mtc3Bhd24nKVxuICAgIGNvbnN0IGxvZyA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ1xuICAgIGxvZ3Yob3B0aW9ucywgJ0ZVTkNUSU9OIGV4ZWN1dGVBc3luYycpXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbG9ndihvcHRpb25zLGBjb21tYW5kIC0gJHtjb21tYW5kfWApXG4gICAgICBsb2d2KG9wdGlvbnMsIGBwYXJtcyAtICR7cGFybXN9YClcbiAgICAgIGxvZ3Yob3B0aW9ucywgYG9wdHMgLSAke0pTT04uc3RyaW5naWZ5KG9wdHMpfWApXG4gICAgICBsZXQgY2hpbGQgPSBjcm9zc1NwYXduKGNvbW1hbmQsIHBhcm1zLCBvcHRzKVxuICAgICAgY2hpbGQub24oJ2Nsb3NlJywgKGNvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgICBsb2d2KG9wdGlvbnMsIGBvbiBjbG9zZTogYCArIGNvZGUpIFxuICAgICAgICBpZihjb2RlID09PSAwKSB7IHJlc29sdmUoMCkgfVxuICAgICAgICBlbHNlIHsgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goIG5ldyBFcnJvcihjb2RlKSApOyByZXNvbHZlKDApIH1cbiAgICAgIH0pXG4gICAgICBjaGlsZC5vbignZXJyb3InLCAoZXJyb3IpID0+IHsgXG4gICAgICAgIGxvZ3Yob3B0aW9ucywgYG9uIGVycm9yYCkgXG4gICAgICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKGVycm9yKVxuICAgICAgICByZXNvbHZlKDApXG4gICAgICB9KVxuICAgICAgY2hpbGQuc3Rkb3V0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgdmFyIHN0ciA9IGRhdGEudG9TdHJpbmcoKS5yZXBsYWNlKC9cXHI/XFxufFxcci9nLCBcIiBcIikudHJpbSgpXG4gICAgICAgIGxvZ3Yob3B0aW9ucywgYCR7c3RyfWApXG4gICAgICAgIGlmIChkYXRhICYmIGRhdGEudG9TdHJpbmcoKS5tYXRjaCgvd2FpdGluZyBmb3IgY2hhbmdlc1xcLlxcLlxcLi8pKSB7XG4gICAgICAgICAgcmVzb2x2ZSgwKVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmIChzdWJzdHJpbmdzLnNvbWUoZnVuY3Rpb24odikgeyByZXR1cm4gZGF0YS5pbmRleE9mKHYpID49IDA7IH0pKSB7IFxuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoXCJbSU5GXVwiLCBcIlwiKVxuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoXCJbTE9HXVwiLCBcIlwiKVxuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpLnRyaW0oKVxuICAgICAgICAgICAgaWYgKHN0ci5pbmNsdWRlcyhcIltFUlJdXCIpKSB7XG4gICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKGFwcCArIHN0ci5yZXBsYWNlKC9eXFxbRVJSXFxdIC9naSwgJycpKTtcbiAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoXCJbRVJSXVwiLCBgJHtjaGFsay5yZWQoXCJbRVJSXVwiKX1gKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9nKGAke2FwcH0ke3N0cn1gKSBcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBjaGlsZC5zdGRlcnIub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICBsb2d2KG9wdGlvbnMsIGBlcnJvciBvbiBjbG9zZTogYCArIGRhdGEpIFxuICAgICAgICB2YXIgc3RyID0gZGF0YS50b1N0cmluZygpLnJlcGxhY2UoL1xccj9cXG58XFxyL2csIFwiIFwiKS50cmltKClcbiAgICAgICAgdmFyIHN0ckphdmFPcHRzID0gXCJQaWNrZWQgdXAgX0pBVkFfT1BUSU9OU1wiO1xuICAgICAgICB2YXIgaW5jbHVkZXMgPSBzdHIuaW5jbHVkZXMoc3RySmF2YU9wdHMpXG4gICAgICAgIGlmICghaW5jbHVkZXMpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHthcHB9ICR7Y2hhbGsucmVkKFwiW0VSUl1cIil9ICR7c3RyfWApXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuICBjYXRjaChlKSB7XG4gICAgcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndihvcHRpb25zLGUpXG4gICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goJ2V4ZWN1dGVBc3luYzogJyArIGUpXG4gICAgY2FsbGJhY2soKVxuICB9IFxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBsb2cocykge1xuICByZXF1aXJlKCdyZWFkbGluZScpLmN1cnNvclRvKHByb2Nlc3Muc3Rkb3V0LCAwKVxuICB0cnkge1xuICAgIHByb2Nlc3Muc3Rkb3V0LmNsZWFyTGluZSgpXG4gIH1cbiAgY2F0Y2goZSkge31cbiAgcHJvY2Vzcy5zdGRvdXQud3JpdGUocylcbiAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoJ1xcbicpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2d2KG9wdGlvbnMsIHMpIHtcbiAgaWYgKG9wdGlvbnMudmVyYm9zZSA9PSAneWVzJykge1xuICAgIHJlcXVpcmUoJ3JlYWRsaW5lJykuY3Vyc29yVG8ocHJvY2Vzcy5zdGRvdXQsIDApXG4gICAgdHJ5IHtcbiAgICAgIHByb2Nlc3Muc3Rkb3V0LmNsZWFyTGluZSgpXG4gICAgfVxuICAgIGNhdGNoKGUpIHt9XG4gICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoYC12ZXJib3NlOiAke3N9YClcbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSgnXFxuJylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gX2dldEFwcCgpIHtcbiAgdmFyIGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuICB2YXIgcHJlZml4ID0gYGBcbiAgY29uc3QgcGxhdGZvcm0gPSByZXF1aXJlKCdvcycpLnBsYXRmb3JtKClcbiAgaWYgKHBsYXRmb3JtID09ICdkYXJ3aW4nKSB7IHByZWZpeCA9IGDihLkg772iZXh0772jOmAgfVxuICBlbHNlIHsgcHJlZml4ID0gYGkgW2V4dF06YCB9XG4gIHJldHVybiBgJHtjaGFsay5ncmVlbihwcmVmaXgpfSBgXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfZ2V0VmVyc2lvbnMoYXBwLCBwbHVnaW5OYW1lLCBmcmFtZXdvcmtOYW1lKSB7XG4gIGNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbiAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG5cblxuXG4gIC8vIHZhciBub2RlRGlyID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSlcbiAgLy8gdmFyIHBrZyA9IChmcy5leGlzdHNTeW5jKG5vZGVEaXIgKyAnL3BhY2thZ2UuanNvbicpICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKG5vZGVEaXIgKyAnL3BhY2thZ2UuanNvbicsICd1dGYtOCcpKSB8fCB7fSk7XG4gIC8vIHZlcnNpb24gPSBwa2cudmVyc2lvblxuICAvLyBfcmVzb2x2ZWQgPSBwa2cuX3Jlc29sdmVkXG4gIC8vIGlmIChfcmVzb2x2ZWQgPT0gdW5kZWZpbmVkKSB7XG4gIC8vICAgZWRpdGlvbiA9IGBQcm9mZXNzaW9uYWxgXG4gIC8vIH1cbiAgLy8gZWxzZSB7XG4gIC8vICAgaWYgKC0xID09IF9yZXNvbHZlZC5pbmRleE9mKCdjb21tdW5pdHknKSkge1xuICAvLyAgICAgZ2xvYmFsLmlzQ29tbXVuaXR5ID0gZmFsc2VcbiAgLy8gICAgIGVkaXRpb24gPSBgUHJvZmVzc2lvbmFsYFxuICAvLyAgIH1cbiAgLy8gICBlbHNlIHtcbiAgLy8gICAgIGdsb2JhbC5pc0NvbW11bml0eSA9IHRydWVcbiAgLy8gICAgIGVkaXRpb24gPSBgQ29tbXVuaXR5YFxuICAvLyAgIH1cbiAgLy8gfVxuXG5cblxuXG5cbiAgdmFyIHYgPSB7fVxuICB2YXIgcGx1Z2luUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCdub2RlX21vZHVsZXMvQHNlbmNoYScsIHBsdWdpbk5hbWUpXG4gIHZhciBwbHVnaW5Qa2cgPSAoZnMuZXhpc3RzU3luYyhwbHVnaW5QYXRoKycvcGFja2FnZS5qc29uJykgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMocGx1Z2luUGF0aCsnL3BhY2thZ2UuanNvbicsICd1dGYtOCcpKSB8fCB7fSk7XG4gIHYucGx1Z2luVmVyc2lvbiA9IHBsdWdpblBrZy52ZXJzaW9uXG4gIHYuX3Jlc29sdmVkID0gcGx1Z2luUGtnLl9yZXNvbHZlZFxuICBpZiAodi5fcmVzb2x2ZWQgPT0gdW5kZWZpbmVkKSB7XG4gICAgdi5lZGl0aW9uID0gYFByb2Zlc3Npb25hbGBcbiAgfVxuICBlbHNlIHtcbiAgICBpZiAoLTEgPT0gdi5fcmVzb2x2ZWQuaW5kZXhPZignY29tbXVuaXR5JykpIHtcbiAgICAgIHYuZWRpdGlvbiA9IGBQcm9mZXNzaW9uYWxgXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdi5lZGl0aW9uID0gYENvbW11bml0eWBcbiAgICB9XG4gIH1cblxuICB2YXIgd2VicGFja1BhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwnbm9kZV9tb2R1bGVzL3dlYnBhY2snKVxuICB2YXIgd2VicGFja1BrZyA9IChmcy5leGlzdHNTeW5jKHdlYnBhY2tQYXRoKycvcGFja2FnZS5qc29uJykgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMod2VicGFja1BhdGgrJy9wYWNrYWdlLmpzb24nLCAndXRmLTgnKSkgfHwge30pO1xuICB2LndlYnBhY2tWZXJzaW9uID0gd2VicGFja1BrZy52ZXJzaW9uXG5cbiAgdmFyIGV4dFBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwnbm9kZV9tb2R1bGVzL0BzZW5jaGEvZXh0JylcbiAgdmFyIGV4dFBrZyA9IChmcy5leGlzdHNTeW5jKGV4dFBhdGgrJy9wYWNrYWdlLmpzb24nKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhleHRQYXRoKycvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgdi5leHRWZXJzaW9uID0gZXh0UGtnLnNlbmNoYS52ZXJzaW9uXG5cbiAgdmFyIGNtZFBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSxgbm9kZV9tb2R1bGVzL0BzZW5jaGEvY21kYClcbiAgdmFyIGNtZFBrZyA9IChmcy5leGlzdHNTeW5jKGNtZFBhdGgrJy9wYWNrYWdlLmpzb24nKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhjbWRQYXRoKycvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgdi5jbWRWZXJzaW9uID0gY21kUGtnLnZlcnNpb25fZnVsbFxuXG4gIGlmICh2LmNtZFZlcnNpb24gPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIGNtZFBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSxgbm9kZV9tb2R1bGVzL0BzZW5jaGEvJHtwbHVnaW5OYW1lfS9ub2RlX21vZHVsZXMvQHNlbmNoYS9jbWRgKVxuICAgIHZhciBjbWRQa2cgPSAoZnMuZXhpc3RzU3luYyhjbWRQYXRoKycvcGFja2FnZS5qc29uJykgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoY21kUGF0aCsnL3BhY2thZ2UuanNvbicsICd1dGYtOCcpKSB8fCB7fSk7XG4gICAgdi5jbWRWZXJzaW9uID0gY21kUGtnLnZlcnNpb25fZnVsbFxuICB9XG5cbiAgdmFyIGZyYW1ld29ya0luZm8gPSAnJ1xuICAgaWYgKGZyYW1ld29ya05hbWUgIT0gdW5kZWZpbmVkICYmIGZyYW1ld29ya05hbWUgIT0gJ2V4dGpzJykge1xuICAgIHZhciBmcmFtZXdvcmtQYXRoID0gJydcbiAgICBpZiAoZnJhbWV3b3JrTmFtZSA9PSAncmVhY3QnKSB7XG4gICAgICBmcmFtZXdvcmtQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksJ25vZGVfbW9kdWxlcy9yZWFjdCcpXG4gICAgfVxuICAgIGlmIChmcmFtZXdvcmtOYW1lID09ICdhbmd1bGFyJykge1xuICAgICAgZnJhbWV3b3JrUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCdub2RlX21vZHVsZXMvQGFuZ3VsYXIvY29yZScpXG4gICAgfVxuICAgIHZhciBmcmFtZXdvcmtQa2cgPSAoZnMuZXhpc3RzU3luYyhmcmFtZXdvcmtQYXRoKycvcGFja2FnZS5qc29uJykgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoZnJhbWV3b3JrUGF0aCsnL3BhY2thZ2UuanNvbicsICd1dGYtOCcpKSB8fCB7fSk7XG4gICAgdi5mcmFtZXdvcmtWZXJzaW9uID0gZnJhbWV3b3JrUGtnLnZlcnNpb25cbiAgICBmcmFtZXdvcmtJbmZvID0gJywgJyArIGZyYW1ld29ya05hbWUgKyAnIHYnICsgdi5mcmFtZXdvcmtWZXJzaW9uXG4gIH1cbiAgcmV0dXJuIGFwcCArICdleHQtd2VicGFjay1wbHVnaW4gdicgKyB2LnBsdWdpblZlcnNpb24gKyAnLCBFeHQgSlMgdicgKyB2LmV4dFZlcnNpb24gKyAnICcgKyB2LmVkaXRpb24gKyAnIEVkaXRpb24sIFNlbmNoYSBDbWQgdicgKyB2LmNtZFZlcnNpb24gKyAnLCB3ZWJwYWNrIHYnICsgdi53ZWJwYWNrVmVyc2lvbiArIGZyYW1ld29ya0luZm9cbiB9Il19