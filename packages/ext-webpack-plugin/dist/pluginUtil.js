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

  validateOptions(require(`./${options.framework}Util`).getValidateOptions(), options, '');
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

  const fs = require('fs');

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
  if (vars.production) {
    logv(options, `ext-compilation-production`);
    compilation.hooks.succeedModule.tap(`ext-succeed-module`, module => {
      if (module.resource && module.resource.match(/\.(j|t)sx?$/) && !module.resource.match(/node_modules/) && !module.resource.match('/ext-react/dist/')) {
        vars.deps = [...(vars.deps || []), ...require(`./${vars.framework}Util`).extractFromSource(module._source._value)];
      }
    });
  } else {
    logv(options, `ext-compilation`);
  }

  if (options.framework != 'angular') {
    compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tap(`ext-html-generation`, data => {
      logv(options, 'FUNCTION ext-html-generation');

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
      var cssPath = path.join(outputPath, vars.extPath, 'ext.css'); //data.assets.js.unshift(jsPath)
      //data.assets.css.unshift(cssPath)

      log(vars.app + `Adding ${jsPath} and ${cssPath} to index.html`);
    });
  }
} //**********
// export async function emit2(compiler, compilation, vars, options, callback) {
//   var app = vars.app
//   var framework = vars.framework
//   const log = require('./pluginUtil').log
//   const logv = require('./pluginUtil').logv
//   logv(options,'FUNCTION ext-emit')
//   const path = require('path')
//   const _buildExtBundle = require('./pluginUtil')._buildExtBundle
//   let outputPath = path.join(compiler.outputPath,vars.extPath)
//   if (compiler.outputPath === '/' && compiler.options.devServer) {
//     outputPath = path.join(compiler.options.devServer.contentBase, outputPath)
//   }
//   logv(options,'outputPath: ' + outputPath)
//   logv(options,'framework: ' + framework)
//   if (framework != 'extjs') {
//     _prepareForBuild(app, vars, options, outputPath)
//   }
//   else {
//     require(`./${framework}Util`)._prepareForBuild(app, vars, options, outputPath, compilation)
//   }
//   if (vars.rebuild == true) {
//     var parms = []
//     if (options.profile == undefined || options.profile == '' || options.profile == null) {
//       parms = ['app', 'build', options.environment]
//     }
//     else {
//       parms = ['app', 'build', options.profile, options.environment]
//     }
//     await _buildExtBundle(app, compilation, outputPath, parms, options)
//     if(options.browser == true) {
//       if (vars.browserCount == 0 && compilation.errors.length == 0) {
//         var url = 'http://localhost:' + options.port
//         log(app + `Opening browser at ${url}`)
//         vars.browserCount++
//         const opn = require('opn')
//         opn(url)
//       }
//     }
//     else {
//       logv(options,'browser NOT opened')
//     }
//     callback()
//   }
//   else {
//     callback()
//   }
// }
//**********


function emit(_x, _x2, _x3, _x4, _x5) {
  return _emit.apply(this, arguments);
} //**********


function _emit() {
  _emit = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(compiler, compilation, vars, options, callback) {
    var app, framework, log, logv, path, _buildExtBundle, outputPath, parms, url, opn;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          app = vars.app;
          framework = vars.framework;
          log = require('./pluginUtil').log;
          logv = require('./pluginUtil').logv;
          logv(options, 'FUNCTION ext-emit');
          path = require('path');
          _buildExtBundle = require('./pluginUtil')._buildExtBundle;
          outputPath = path.join(compiler.outputPath, vars.extPath);

          if (compiler.outputPath === '/' && compiler.options.devServer) {
            outputPath = path.join(compiler.options.devServer.contentBase, outputPath);
          }

          logv(options, 'outputPath: ' + outputPath);
          logv(options, 'framework: ' + framework);

          if (!(options.emit == true)) {
            _context.next = 22;
            break;
          }

          if (framework != 'extjs') {
            _prepareForBuild(app, vars, options, outputPath);
          } else {
            require(`./${framework}Util`)._prepareForBuild(app, vars, options, outputPath, compilation);
          }

          if (!(vars.rebuild == true)) {
            _context.next = 20;
            break;
          }

          parms = [];

          if (options.profile == undefined || options.profile == '' || options.profile == null) {
            parms = ['app', 'build', options.environment];
          } else {
            parms = ['app', 'build', options.profile, options.environment];
          }

          _context.next = 18;
          return _buildExtBundle(app, compilation, outputPath, parms, options);

        case 18:
          if (options.browser == true) {
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

        case 20:
          _context.next = 25;
          break;

        case 22:
          log(`${vars.app}Emit not run`);

          if (options.browser == true) {
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

        case 25:
        case "end":
          return _context.stop();
      }
    }, _callee, this);
  }));
  return _emit.apply(this, arguments);
}

function _prepareForBuild(app, vars, options, output) {
  logv(options, '_prepareForBuild');

  const rimraf = require('rimraf');

  const mkdirp = require('mkdirp');

  const fsx = require('fs-extra');

  const fs = require('fs');

  const path = require('path');

  var packages = options.packages;
  var toolkit = options.toolkit;
  var theme = options.theme;
  theme = theme || (toolkit === 'classic' ? 'theme-triton' : 'theme-material');
  logv(options, vars.firstTime);

  if (vars.firstTime) {
    logv(options, output);
    rimraf.sync(output);
    mkdirp.sync(output);
    logv(options, require('./artifacts'));

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

    if (fs.existsSync(path.join(process.cwd(), vars.extPath + '/packages/'))) {
      var fromPackages = path.join(process.cwd(), vars.extPath + '/packages/');
      var toPackages = path.join(output, 'packages/');
      fsx.copySync(fromPackages, toPackages);
      log(app + 'Copying ' + fromPackages.replace(process.cwd(), '') + ' to: ' + toPackages.replace(process.cwd(), ''));
    }

    if (fs.existsSync(path.join(process.cwd(), vars.extPath + '/overrides/'))) {
      var fromOverrides = path.join(process.cwd(), vars.extPath + '/overrides/');
      var toOverrides = path.join(output, 'overrides/');
      fsx.copySync(fromOverrides, toOverrides);
      log(app + 'Copying ' + fromOverrides.replace(process.cwd(), '') + ' to: ' + toOverrides.replace(process.cwd(), ''));
    }
  }

  vars.firstTime = false;
  let js;

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
    log(app + 'Building Ext bundle at: ' + output.replace(process.cwd(), ''));
  } else {
    vars.rebuild = false;
    log(app + 'ExtReact rebuild NOT needed');
  }
} //**********


function _buildExtBundle(app, compilation, outputPath, parms, options) {
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
          //const DEFAULT_SUBSTRS = ['[INF] Loading', '[INF] Processing', '[LOG] Fashion build complete', '[ERR]', '[WRN]', "[INF] Server", "[INF] Writing", "[INF] Loading Build", "[INF] Waiting", "[LOG] Fashion waiting"];
          DEFAULT_SUBSTRS = ['[INF] Loading', '[INF] Append', '[INF] Processing', '[INF] Processing Build', '[LOG] Fashion build complete', '[ERR]', '[WRN]', "[INF] Server", "[INF] Writing", "[INF] Loading Build", "[INF] Waiting", "[LOG] Fashion waiting"];
          substrings = DEFAULT_SUBSTRS;
          chalk = require('chalk');
          crossSpawn = require('cross-spawn');
          log = require('./pluginUtil').log;
          logv(options, 'FUNCTION executeAsync');
          _context2.next = 8;
          return new Promise((resolve, reject) => {
            logv(options, `command - ${command}`);
            logv(options, `parms - ${parms}`);
            logv(options, `opts - ${JSON.stringify(opts)}`);
            let child = crossSpawn(command, parms, opts);
            child.on('close', (code, signal) => {
              logv(options, `on close`);

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

              if (data && data.toString().match(/Waiting for changes\.\.\./)) {
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
              logv(options, `error on close`);
              var str = data.toString().replace(/\r?\n|\r/g, " ").trim();
              var strJavaOpts = "Picked up _JAVA_OPTIONS";
              var includes = str.includes(strJavaOpts);

              if (!includes) {
                console.log(`${app} ${chalk.red("[ERR]")} ${str}`);
              }
            });
          });

        case 8:
        case "end":
          return _context2.stop();
      }
    }, _callee2, this);
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

  const fs = require('fs');

  var v = {};
  var pluginPath = path.resolve(process.cwd(), 'node_modules/@sencha', pluginName);
  var pluginPkg = fs.existsSync(pluginPath + '/package.json') && JSON.parse(fs.readFileSync(pluginPath + '/package.json', 'utf-8')) || {};
  v.pluginVersion = pluginPkg.version;
  var webpackPath = path.resolve(process.cwd(), 'node_modules/webpack');
  var webpackPkg = fs.existsSync(webpackPath + '/package.json') && JSON.parse(fs.readFileSync(webpackPath + '/package.json', 'utf-8')) || {};
  v.webpackVersion = webpackPkg.version;
  var extPath = path.resolve(process.cwd(), 'node_modules/@sencha/ext');
  var extPkg = fs.existsSync(extPath + '/package.json') && JSON.parse(fs.readFileSync(extPath + '/package.json', 'utf-8')) || {};
  v.extVersion = extPkg.sencha.version;
  var cmdPath = path.resolve(process.cwd(), `node_modules/@sencha/${pluginName}/node_modules/@sencha/cmd`);
  var cmdPkg = fs.existsSync(cmdPath + '/package.json') && JSON.parse(fs.readFileSync(cmdPath + '/package.json', 'utf-8')) || {};
  v.cmdVersion = cmdPkg.version_full;
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

  return app + 'ext-webpack-plugin v' + v.pluginVersion + ', Ext JS v' + v.extVersion + ', Sencha Cmd v' + v.cmdVersion + ', webpack v' + v.webpackVersion + frameworkInfo;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wbHVnaW5VdGlsLmpzIl0sIm5hbWVzIjpbIl9jb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJ0aGlzVmFycyIsInRoaXNPcHRpb25zIiwicGx1Z2luIiwiZnJhbWV3b3JrIiwidW5kZWZpbmVkIiwicGx1Z2luRXJyb3JzIiwicHVzaCIsInZhcnMiLCJ2YWxpZGF0ZU9wdGlvbnMiLCJyZXF1aXJlIiwiZ2V0VmFsaWRhdGVPcHRpb25zIiwiZ2V0RGVmYXVsdFZhcnMiLCJwbHVnaW5OYW1lIiwiYXBwIiwiX2dldEFwcCIsImxvZ3YiLCJmcyIsInJjIiwiZXhpc3RzU3luYyIsIkpTT04iLCJwYXJzZSIsInJlYWRGaWxlU3luYyIsImdldERlZmF1bHRPcHRpb25zIiwic3RyaW5naWZ5IiwiZW52aXJvbm1lbnQiLCJwcm9kdWN0aW9uIiwibG9nIiwiX2dldFZlcnNpb25zIiwiX2NvbXBpbGF0aW9uIiwiY29tcGlsZXIiLCJjb21waWxhdGlvbiIsImhvb2tzIiwic3VjY2VlZE1vZHVsZSIsInRhcCIsIm1vZHVsZSIsInJlc291cmNlIiwibWF0Y2giLCJkZXBzIiwiZXh0cmFjdEZyb21Tb3VyY2UiLCJfc291cmNlIiwiX3ZhbHVlIiwiaHRtbFdlYnBhY2tQbHVnaW5CZWZvcmVIdG1sR2VuZXJhdGlvbiIsImRhdGEiLCJwYXRoIiwib3V0cHV0UGF0aCIsImRldlNlcnZlciIsImpvaW4iLCJjb250ZW50QmFzZSIsInJlcGxhY2UiLCJwcm9jZXNzIiwiY3dkIiwidHJpbSIsImpzUGF0aCIsImV4dFBhdGgiLCJjc3NQYXRoIiwiZW1pdCIsImNhbGxiYWNrIiwiX2J1aWxkRXh0QnVuZGxlIiwiX3ByZXBhcmVGb3JCdWlsZCIsInJlYnVpbGQiLCJwYXJtcyIsInByb2ZpbGUiLCJicm93c2VyIiwiYnJvd3NlckNvdW50IiwiZXJyb3JzIiwibGVuZ3RoIiwidXJsIiwicG9ydCIsIm9wbiIsIm91dHB1dCIsInJpbXJhZiIsIm1rZGlycCIsImZzeCIsInBhY2thZ2VzIiwidG9vbGtpdCIsInRoZW1lIiwiZmlyc3RUaW1lIiwic3luYyIsImJ1aWxkWE1MIiwiY3JlYXRlQXBwSnNvbiIsImNyZWF0ZVdvcmtzcGFjZUpzb24iLCJjcmVhdGVKU0RPTUVudmlyb25tZW50Iiwid3JpdGVGaWxlU3luYyIsImZyb21SZXNvdXJjZXMiLCJ0b1Jlc291cmNlcyIsImNvcHlTeW5jIiwiZnJvbVBhY2thZ2VzIiwidG9QYWNrYWdlcyIsImZyb21PdmVycmlkZXMiLCJ0b092ZXJyaWRlcyIsImpzIiwibWFuaWZlc3QiLCJzZW5jaGEiLCJlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJvbkJ1aWxkRG9uZSIsIm9wdHMiLCJzaWxlbnQiLCJzdGRpbyIsImVuY29kaW5nIiwiZXhlY3V0ZUFzeW5jIiwidGhlbiIsInJlYXNvbiIsImNvbW1hbmQiLCJERUZBVUxUX1NVQlNUUlMiLCJzdWJzdHJpbmdzIiwiY2hhbGsiLCJjcm9zc1NwYXduIiwiY2hpbGQiLCJvbiIsImNvZGUiLCJzaWduYWwiLCJFcnJvciIsImVycm9yIiwic3Rkb3V0Iiwic3RyIiwidG9TdHJpbmciLCJzb21lIiwidiIsImluZGV4T2YiLCJpbmNsdWRlcyIsInJlZCIsInN0ZGVyciIsInN0ckphdmFPcHRzIiwiY29uc29sZSIsInMiLCJjdXJzb3JUbyIsImNsZWFyTGluZSIsIndyaXRlIiwidmVyYm9zZSIsInByZWZpeCIsInBsYXRmb3JtIiwiZ3JlZW4iLCJmcmFtZXdvcmtOYW1lIiwicGx1Z2luUGF0aCIsInBsdWdpblBrZyIsInBsdWdpblZlcnNpb24iLCJ2ZXJzaW9uIiwid2VicGFja1BhdGgiLCJ3ZWJwYWNrUGtnIiwid2VicGFja1ZlcnNpb24iLCJleHRQa2ciLCJleHRWZXJzaW9uIiwiY21kUGF0aCIsImNtZFBrZyIsImNtZFZlcnNpb24iLCJ2ZXJzaW9uX2Z1bGwiLCJmcmFtZXdvcmtJbmZvIiwiZnJhbWV3b3JrUGF0aCIsImZyYW1ld29ya1BrZyIsImZyYW1ld29ya1ZlcnNpb24iXSwibWFwcGluZ3MiOiI7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R0FBb0pPLGFBQTNKO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyIvLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBfY29uc3RydWN0b3Iob3B0aW9ucykge1xuICB2YXIgdGhpc1ZhcnMgPSB7fVxuICB2YXIgdGhpc09wdGlvbnMgPSB7fVxuICB2YXIgcGx1Z2luID0ge31cblxuICBpZiAob3B0aW9ucy5mcmFtZXdvcmsgPT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc1ZhcnMucGx1Z2luRXJyb3JzID0gW11cbiAgICB0aGlzVmFycy5wbHVnaW5FcnJvcnMucHVzaCgnd2VicGFjayBjb25maWc6IGZyYW1ld29yayBwYXJhbWV0ZXIgb24gZXh0LXdlYnBhY2stcGx1Z2luIGlzIG5vdCBkZWZpbmVkIC0gdmFsdWVzOiByZWFjdCwgYW5ndWxhciwgZXh0anMnKVxuICAgIHBsdWdpbi52YXJzID0gdGhpc1ZhcnNcbiAgICByZXR1cm4gcGx1Z2luXG4gIH1cblxuICBjb25zdCB2YWxpZGF0ZU9wdGlvbnMgPSByZXF1aXJlKCdzY2hlbWEtdXRpbHMnKVxuICB2YWxpZGF0ZU9wdGlvbnMocmVxdWlyZShgLi8ke29wdGlvbnMuZnJhbWV3b3JrfVV0aWxgKS5nZXRWYWxpZGF0ZU9wdGlvbnMoKSwgb3B0aW9ucywgJycpXG5cbiAgdGhpc1ZhcnMgPSByZXF1aXJlKGAuLyR7b3B0aW9ucy5mcmFtZXdvcmt9VXRpbGApLmdldERlZmF1bHRWYXJzKClcbiAgdGhpc1ZhcnMuZnJhbWV3b3JrID0gb3B0aW9ucy5mcmFtZXdvcmtcbiAgc3dpdGNoKHRoaXNWYXJzLmZyYW1ld29yaykge1xuICAgIGNhc2UgJ2V4dGpzJzpcbiAgICAgIHRoaXNWYXJzLnBsdWdpbk5hbWUgPSAnZXh0LXdlYnBhY2stcGx1Z2luJ1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAncmVhY3QnOlxuICAgICAgdGhpc1ZhcnMucGx1Z2luTmFtZSA9ICdleHQtcmVhY3Qtd2VicGFjay1wbHVnaW4nXG4gICAgICBicmVhaztcbiAgICBjYXNlICdhbmd1bGFyJzpcbiAgICAgIHRoaXNWYXJzLnBsdWdpbk5hbWUgPSAnZXh0LWFuZ3VsYXItd2VicGFjay1wbHVnaW4nXG4gICAgICBicmVhaztcbiAgICBkZWZhdWx0OlxuICAgICAgdGhpc1ZhcnMucGx1Z2luTmFtZSA9ICdleHQtd2VicGFjay1wbHVnaW4nXG4gIH1cbiAgdGhpc1ZhcnMuYXBwID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykuX2dldEFwcCgpXG4gIGxvZ3Yob3B0aW9ucywgYHBsdWdpbk5hbWUgLSAke3RoaXNWYXJzLnBsdWdpbk5hbWV9YClcbiAgbG9ndihvcHRpb25zLCBgdGhpc1ZhcnMuYXBwIC0gJHt0aGlzVmFycy5hcHB9YClcbiAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG4gIGNvbnN0IHJjID0gKGZzLmV4aXN0c1N5bmMoYC5leHQtJHt0aGlzVmFycy5mcmFtZXdvcmt9cmNgKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhgLmV4dC0ke3RoaXNWYXJzLmZyYW1ld29ya31yY2AsICd1dGYtOCcpKSB8fCB7fSlcbiAgdGhpc09wdGlvbnMgPSB7IC4uLnJlcXVpcmUoYC4vJHt0aGlzVmFycy5mcmFtZXdvcmt9VXRpbGApLmdldERlZmF1bHRPcHRpb25zKCksIC4uLm9wdGlvbnMsIC4uLnJjIH1cbiAgbG9ndihvcHRpb25zLCBgdGhpc09wdGlvbnMgLSAke0pTT04uc3RyaW5naWZ5KHRoaXNPcHRpb25zKX1gKVxuICBpZiAodGhpc09wdGlvbnMuZW52aXJvbm1lbnQgPT0gJ3Byb2R1Y3Rpb24nKSBcbiAgICB7dGhpc1ZhcnMucHJvZHVjdGlvbiA9IHRydWV9XG4gIGVsc2UgXG4gICAge3RoaXNWYXJzLnByb2R1Y3Rpb24gPSBmYWxzZX1cbiAgbG9nKHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLl9nZXRWZXJzaW9ucyh0aGlzVmFycy5hcHAsIHRoaXNWYXJzLnBsdWdpbk5hbWUsIHRoaXNWYXJzLmZyYW1ld29yaykpXG4gIGxvZyh0aGlzVmFycy5hcHAgKyAnQnVpbGRpbmcgZm9yICcgKyB0aGlzT3B0aW9ucy5lbnZpcm9ubWVudClcblxuICBwbHVnaW4udmFycyA9IHRoaXNWYXJzXG4gIHBsdWdpbi5vcHRpb25zID0gdGhpc09wdGlvbnNcbiAgcmV0dXJuIHBsdWdpblxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBfY29tcGlsYXRpb24oY29tcGlsZXIsIGNvbXBpbGF0aW9uLCB2YXJzLCBvcHRpb25zKSB7XG4gIGlmICh2YXJzLnByb2R1Y3Rpb24pIHtcbiAgICBsb2d2KG9wdGlvbnMsYGV4dC1jb21waWxhdGlvbi1wcm9kdWN0aW9uYClcbiAgICBjb21waWxhdGlvbi5ob29rcy5zdWNjZWVkTW9kdWxlLnRhcChgZXh0LXN1Y2NlZWQtbW9kdWxlYCwgKG1vZHVsZSkgPT4ge1xuICAgICAgaWYgKG1vZHVsZS5yZXNvdXJjZSAmJiBtb2R1bGUucmVzb3VyY2UubWF0Y2goL1xcLihqfHQpc3g/JC8pICYmICFtb2R1bGUucmVzb3VyY2UubWF0Y2goL25vZGVfbW9kdWxlcy8pICYmICFtb2R1bGUucmVzb3VyY2UubWF0Y2goJy9leHQtcmVhY3QvZGlzdC8nKSkge1xuICAgICAgICB2YXJzLmRlcHMgPSBbIFxuICAgICAgICAgIC4uLih2YXJzLmRlcHMgfHwgW10pLCBcbiAgICAgICAgICAuLi5yZXF1aXJlKGAuLyR7dmFycy5mcmFtZXdvcmt9VXRpbGApLmV4dHJhY3RGcm9tU291cmNlKG1vZHVsZS5fc291cmNlLl92YWx1ZSkgXG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9KVxuICB9XG4gIGVsc2Uge1xuICAgIGxvZ3Yob3B0aW9ucywgYGV4dC1jb21waWxhdGlvbmApXG4gIH1cbiAgaWYgKG9wdGlvbnMuZnJhbWV3b3JrICE9ICdhbmd1bGFyJykge1xuICAgIGNvbXBpbGF0aW9uLmhvb2tzLmh0bWxXZWJwYWNrUGx1Z2luQmVmb3JlSHRtbEdlbmVyYXRpb24udGFwKGBleHQtaHRtbC1nZW5lcmF0aW9uYCwoZGF0YSkgPT4ge1xuICAgICAgbG9ndihvcHRpb25zLCdGVU5DVElPTiBleHQtaHRtbC1nZW5lcmF0aW9uJylcbiAgICAgIGNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbiAgICAgIHZhciBvdXRwdXRQYXRoID0gJydcbiAgICAgIGlmIChjb21waWxlci5vcHRpb25zLmRldlNlcnZlcikge1xuICAgICAgICBpZiAoY29tcGlsZXIub3V0cHV0UGF0aCA9PT0gJy8nKSB7XG4gICAgICAgICAgb3V0cHV0UGF0aCA9IHBhdGguam9pbihjb21waWxlci5vcHRpb25zLmRldlNlcnZlci5jb250ZW50QmFzZSwgb3V0cHV0UGF0aClcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoY29tcGlsZXIub3B0aW9ucy5kZXZTZXJ2ZXIuY29udGVudEJhc2UgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBvdXRwdXRQYXRoID0gJ2J1aWxkJ1xuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG91dHB1dFBhdGggPSAnJ1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIG91dHB1dFBhdGggPSAnYnVpbGQnXG4gICAgICB9XG4gICAgICBvdXRwdXRQYXRoID0gb3V0cHV0UGF0aC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKS50cmltKClcbiAgICAgIHZhciBqc1BhdGggPSBwYXRoLmpvaW4ob3V0cHV0UGF0aCwgdmFycy5leHRQYXRoLCAnZXh0LmpzJylcbiAgICAgIHZhciBjc3NQYXRoID0gcGF0aC5qb2luKG91dHB1dFBhdGgsIHZhcnMuZXh0UGF0aCwgJ2V4dC5jc3MnKVxuICAgICAgLy9kYXRhLmFzc2V0cy5qcy51bnNoaWZ0KGpzUGF0aClcbiAgICAgIC8vZGF0YS5hc3NldHMuY3NzLnVuc2hpZnQoY3NzUGF0aClcbiAgICAgIGxvZyh2YXJzLmFwcCArIGBBZGRpbmcgJHtqc1BhdGh9IGFuZCAke2Nzc1BhdGh9IHRvIGluZGV4Lmh0bWxgKVxuICAgIH0pXG4gIH1cbn1cblxuLy8qKioqKioqKioqXG4vLyBleHBvcnQgYXN5bmMgZnVuY3Rpb24gZW1pdDIoY29tcGlsZXIsIGNvbXBpbGF0aW9uLCB2YXJzLCBvcHRpb25zLCBjYWxsYmFjaykge1xuLy8gICB2YXIgYXBwID0gdmFycy5hcHBcbi8vICAgdmFyIGZyYW1ld29yayA9IHZhcnMuZnJhbWV3b3JrXG4vLyAgIGNvbnN0IGxvZyA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ1xuLy8gICBjb25zdCBsb2d2ID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndlxuLy8gICBsb2d2KG9wdGlvbnMsJ0ZVTkNUSU9OIGV4dC1lbWl0Jylcbi8vICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuLy8gICBjb25zdCBfYnVpbGRFeHRCdW5kbGUgPSByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5fYnVpbGRFeHRCdW5kbGVcbi8vICAgbGV0IG91dHB1dFBhdGggPSBwYXRoLmpvaW4oY29tcGlsZXIub3V0cHV0UGF0aCx2YXJzLmV4dFBhdGgpXG4vLyAgIGlmIChjb21waWxlci5vdXRwdXRQYXRoID09PSAnLycgJiYgY29tcGlsZXIub3B0aW9ucy5kZXZTZXJ2ZXIpIHtcbi8vICAgICBvdXRwdXRQYXRoID0gcGF0aC5qb2luKGNvbXBpbGVyLm9wdGlvbnMuZGV2U2VydmVyLmNvbnRlbnRCYXNlLCBvdXRwdXRQYXRoKVxuLy8gICB9XG4vLyAgIGxvZ3Yob3B0aW9ucywnb3V0cHV0UGF0aDogJyArIG91dHB1dFBhdGgpXG4vLyAgIGxvZ3Yob3B0aW9ucywnZnJhbWV3b3JrOiAnICsgZnJhbWV3b3JrKVxuLy8gICBpZiAoZnJhbWV3b3JrICE9ICdleHRqcycpIHtcbi8vICAgICBfcHJlcGFyZUZvckJ1aWxkKGFwcCwgdmFycywgb3B0aW9ucywgb3V0cHV0UGF0aClcbi8vICAgfVxuLy8gICBlbHNlIHtcbi8vICAgICByZXF1aXJlKGAuLyR7ZnJhbWV3b3JrfVV0aWxgKS5fcHJlcGFyZUZvckJ1aWxkKGFwcCwgdmFycywgb3B0aW9ucywgb3V0cHV0UGF0aCwgY29tcGlsYXRpb24pXG4vLyAgIH1cbi8vICAgaWYgKHZhcnMucmVidWlsZCA9PSB0cnVlKSB7XG4vLyAgICAgdmFyIHBhcm1zID0gW11cbi8vICAgICBpZiAob3B0aW9ucy5wcm9maWxlID09IHVuZGVmaW5lZCB8fCBvcHRpb25zLnByb2ZpbGUgPT0gJycgfHwgb3B0aW9ucy5wcm9maWxlID09IG51bGwpIHtcbi8vICAgICAgIHBhcm1zID0gWydhcHAnLCAnYnVpbGQnLCBvcHRpb25zLmVudmlyb25tZW50XVxuLy8gICAgIH1cbi8vICAgICBlbHNlIHtcbi8vICAgICAgIHBhcm1zID0gWydhcHAnLCAnYnVpbGQnLCBvcHRpb25zLnByb2ZpbGUsIG9wdGlvbnMuZW52aXJvbm1lbnRdXG4vLyAgICAgfVxuLy8gICAgIGF3YWl0IF9idWlsZEV4dEJ1bmRsZShhcHAsIGNvbXBpbGF0aW9uLCBvdXRwdXRQYXRoLCBwYXJtcywgb3B0aW9ucylcbiAgICBcbi8vICAgICBpZihvcHRpb25zLmJyb3dzZXIgPT0gdHJ1ZSkge1xuLy8gICAgICAgaWYgKHZhcnMuYnJvd3NlckNvdW50ID09IDAgJiYgY29tcGlsYXRpb24uZXJyb3JzLmxlbmd0aCA9PSAwKSB7XG4vLyAgICAgICAgIHZhciB1cmwgPSAnaHR0cDovL2xvY2FsaG9zdDonICsgb3B0aW9ucy5wb3J0XG4vLyAgICAgICAgIGxvZyhhcHAgKyBgT3BlbmluZyBicm93c2VyIGF0ICR7dXJsfWApXG4vLyAgICAgICAgIHZhcnMuYnJvd3NlckNvdW50Kytcbi8vICAgICAgICAgY29uc3Qgb3BuID0gcmVxdWlyZSgnb3BuJylcbi8vICAgICAgICAgb3BuKHVybClcbi8vICAgICAgIH1cbi8vICAgICB9XG4vLyAgICAgZWxzZSB7XG4vLyAgICAgICBsb2d2KG9wdGlvbnMsJ2Jyb3dzZXIgTk9UIG9wZW5lZCcpXG4vLyAgICAgfVxuLy8gICAgIGNhbGxiYWNrKClcbi8vICAgfVxuLy8gICBlbHNlIHtcbi8vICAgICBjYWxsYmFjaygpXG4vLyAgIH1cbi8vIH1cblxuLy8qKioqKioqKioqXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZW1pdChjb21waWxlciwgY29tcGlsYXRpb24sIHZhcnMsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIHZhciBhcHAgPSB2YXJzLmFwcFxuICB2YXIgZnJhbWV3b3JrID0gdmFycy5mcmFtZXdvcmtcbiAgY29uc3QgbG9nID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9nXG4gIGNvbnN0IGxvZ3YgPSByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2d2XG4gIGxvZ3Yob3B0aW9ucywnRlVOQ1RJT04gZXh0LWVtaXQnKVxuICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gIGNvbnN0IF9idWlsZEV4dEJ1bmRsZSA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLl9idWlsZEV4dEJ1bmRsZVxuICBsZXQgb3V0cHV0UGF0aCA9IHBhdGguam9pbihjb21waWxlci5vdXRwdXRQYXRoLHZhcnMuZXh0UGF0aClcbiAgaWYgKGNvbXBpbGVyLm91dHB1dFBhdGggPT09ICcvJyAmJiBjb21waWxlci5vcHRpb25zLmRldlNlcnZlcikge1xuICAgIG91dHB1dFBhdGggPSBwYXRoLmpvaW4oY29tcGlsZXIub3B0aW9ucy5kZXZTZXJ2ZXIuY29udGVudEJhc2UsIG91dHB1dFBhdGgpXG4gIH1cbiAgbG9ndihvcHRpb25zLCdvdXRwdXRQYXRoOiAnICsgb3V0cHV0UGF0aClcbiAgbG9ndihvcHRpb25zLCdmcmFtZXdvcms6ICcgKyBmcmFtZXdvcmspXG4gIGlmIChvcHRpb25zLmVtaXQgPT0gdHJ1ZSkge1xuICAgIGlmIChmcmFtZXdvcmsgIT0gJ2V4dGpzJykge1xuICAgICAgX3ByZXBhcmVGb3JCdWlsZChhcHAsIHZhcnMsIG9wdGlvbnMsIG91dHB1dFBhdGgpXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmVxdWlyZShgLi8ke2ZyYW1ld29ya31VdGlsYCkuX3ByZXBhcmVGb3JCdWlsZChhcHAsIHZhcnMsIG9wdGlvbnMsIG91dHB1dFBhdGgsIGNvbXBpbGF0aW9uKVxuICAgIH1cbiAgICBpZiAodmFycy5yZWJ1aWxkID09IHRydWUpIHtcbiAgICAgIHZhciBwYXJtcyA9IFtdXG4gICAgICBpZiAob3B0aW9ucy5wcm9maWxlID09IHVuZGVmaW5lZCB8fCBvcHRpb25zLnByb2ZpbGUgPT0gJycgfHwgb3B0aW9ucy5wcm9maWxlID09IG51bGwpIHtcbiAgICAgICAgcGFybXMgPSBbJ2FwcCcsICdidWlsZCcsIG9wdGlvbnMuZW52aXJvbm1lbnRdXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgcGFybXMgPSBbJ2FwcCcsICdidWlsZCcsIG9wdGlvbnMucHJvZmlsZSwgb3B0aW9ucy5lbnZpcm9ubWVudF1cbiAgICAgIH1cbiAgICAgIGF3YWl0IF9idWlsZEV4dEJ1bmRsZShhcHAsIGNvbXBpbGF0aW9uLCBvdXRwdXRQYXRoLCBwYXJtcywgb3B0aW9ucylcbiAgICAgIFxuICAgICAgaWYob3B0aW9ucy5icm93c2VyID09IHRydWUpIHtcbiAgICAgICAgaWYgKHZhcnMuYnJvd3NlckNvdW50ID09IDAgJiYgY29tcGlsYXRpb24uZXJyb3JzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgdmFyIHVybCA9ICdodHRwOi8vbG9jYWxob3N0OicgKyBvcHRpb25zLnBvcnRcbiAgICAgICAgICBsb2coYXBwICsgYE9wZW5pbmcgYnJvd3NlciBhdCAke3VybH1gKVxuICAgICAgICAgIHZhcnMuYnJvd3NlckNvdW50KytcbiAgICAgICAgICBjb25zdCBvcG4gPSByZXF1aXJlKCdvcG4nKVxuICAgICAgICAgIG9wbih1cmwpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBsb2d2KG9wdGlvbnMsJ2Jyb3dzZXIgTk9UIG9wZW5lZCcpXG4gICAgICB9XG4gICAgICBjYWxsYmFjaygpXG4gICAgfVxuICB9XG4gIGVsc2Uge1xuICAgIGxvZyhgJHt2YXJzLmFwcH1FbWl0IG5vdCBydW5gKVxuICAgIGlmKG9wdGlvbnMuYnJvd3NlciA9PSB0cnVlKSB7XG4gICAgICBpZiAodmFycy5icm93c2VyQ291bnQgPT0gMCAmJiBjb21waWxhdGlvbi5lcnJvcnMubGVuZ3RoID09IDApIHtcbiAgICAgICAgdmFyIHVybCA9ICdodHRwOi8vbG9jYWxob3N0OicgKyBvcHRpb25zLnBvcnRcbiAgICAgICAgbG9nKGFwcCArIGBPcGVuaW5nIGJyb3dzZXIgYXQgJHt1cmx9YClcbiAgICAgICAgdmFycy5icm93c2VyQ291bnQrK1xuICAgICAgICBjb25zdCBvcG4gPSByZXF1aXJlKCdvcG4nKVxuICAgICAgICBvcG4odXJsKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxvZ3Yob3B0aW9ucywnYnJvd3NlciBOT1Qgb3BlbmVkJylcbiAgICB9XG4gICAgY2FsbGJhY2soKVxuICB9XG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF9wcmVwYXJlRm9yQnVpbGQoYXBwLCB2YXJzLCBvcHRpb25zLCBvdXRwdXQpIHtcbiAgbG9ndihvcHRpb25zLCdfcHJlcGFyZUZvckJ1aWxkJylcbiAgY29uc3QgcmltcmFmID0gcmVxdWlyZSgncmltcmFmJylcbiAgY29uc3QgbWtkaXJwID0gcmVxdWlyZSgnbWtkaXJwJylcbiAgY29uc3QgZnN4ID0gcmVxdWlyZSgnZnMtZXh0cmEnKVxuICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbiAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuXG4gIHZhciBwYWNrYWdlcyA9IG9wdGlvbnMucGFja2FnZXNcbiAgdmFyIHRvb2xraXQgPSBvcHRpb25zLnRvb2xraXRcbiAgdmFyIHRoZW1lID0gb3B0aW9ucy50aGVtZVxuXG4gIHRoZW1lID0gdGhlbWUgfHwgKHRvb2xraXQgPT09ICdjbGFzc2ljJyA/ICd0aGVtZS10cml0b24nIDogJ3RoZW1lLW1hdGVyaWFsJylcbiAgbG9ndihvcHRpb25zLHZhcnMuZmlyc3RUaW1lKVxuICBpZiAodmFycy5maXJzdFRpbWUpIHtcbiAgICBsb2d2KG9wdGlvbnMsb3V0cHV0KVxuICAgIHJpbXJhZi5zeW5jKG91dHB1dClcbiAgICBta2RpcnAuc3luYyhvdXRwdXQpXG4gICAgbG9ndihvcHRpb25zLHJlcXVpcmUoJy4vYXJ0aWZhY3RzJykpXG4gICAgY29uc3QgYnVpbGRYTUwgPSByZXF1aXJlKCcuL2FydGlmYWN0cycpLmJ1aWxkWE1MXG4gICAgY29uc3QgY3JlYXRlQXBwSnNvbiA9IHJlcXVpcmUoJy4vYXJ0aWZhY3RzJykuY3JlYXRlQXBwSnNvblxuICAgIGNvbnN0IGNyZWF0ZVdvcmtzcGFjZUpzb24gPSByZXF1aXJlKCcuL2FydGlmYWN0cycpLmNyZWF0ZVdvcmtzcGFjZUpzb25cbiAgICBjb25zdCBjcmVhdGVKU0RPTUVudmlyb25tZW50ID0gcmVxdWlyZSgnLi9hcnRpZmFjdHMnKS5jcmVhdGVKU0RPTUVudmlyb25tZW50XG5cbiAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihvdXRwdXQsICdidWlsZC54bWwnKSwgYnVpbGRYTUwodmFycy5wcm9kdWN0aW9uLCBvcHRpb25zKSwgJ3V0ZjgnKVxuICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKG91dHB1dCwgJ2FwcC5qc29uJyksIGNyZWF0ZUFwcEpzb24odGhlbWUsIHBhY2thZ2VzLCB0b29sa2l0LCBvcHRpb25zKSwgJ3V0ZjgnKVxuICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKG91dHB1dCwgJ2pzZG9tLWVudmlyb25tZW50LmpzJyksIGNyZWF0ZUpTRE9NRW52aXJvbm1lbnQob3B0aW9ucyksICd1dGY4JylcbiAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihvdXRwdXQsICd3b3Jrc3BhY2UuanNvbicpLCBjcmVhdGVXb3Jrc3BhY2VKc29uKG9wdGlvbnMpLCAndXRmOCcpXG5cbiAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3Jlc291cmNlcy8nKSkpIHtcbiAgICAgIHZhciBmcm9tUmVzb3VyY2VzID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdyZXNvdXJjZXMvJylcbiAgICAgIHZhciB0b1Jlc291cmNlcyA9IHBhdGguam9pbihvdXRwdXQsICcuLi9yZXNvdXJjZXMnKVxuICAgICAgZnN4LmNvcHlTeW5jKGZyb21SZXNvdXJjZXMsIHRvUmVzb3VyY2VzKVxuICAgICAgbG9nKGFwcCArICdDb3B5aW5nICcgKyBmcm9tUmVzb3VyY2VzLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpICsgJyB0bzogJyArIHRvUmVzb3VyY2VzLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpKVxuICAgIH1cblxuICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCdyZXNvdXJjZXMvJykpKSB7XG4gICAgICB2YXIgZnJvbVJlc291cmNlcyA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncmVzb3VyY2VzLycpXG4gICAgICB2YXIgdG9SZXNvdXJjZXMgPSBwYXRoLmpvaW4ob3V0cHV0LCAncmVzb3VyY2VzJylcbiAgICAgIGZzeC5jb3B5U3luYyhmcm9tUmVzb3VyY2VzLCB0b1Jlc291cmNlcylcbiAgICAgIGxvZyhhcHAgKyAnQ29weWluZyAnICsgZnJvbVJlc291cmNlcy5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSArICcgdG86ICcgKyB0b1Jlc291cmNlcy5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSlcbiAgICB9XG5cbiAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSx2YXJzLmV4dFBhdGggKyAnL3BhY2thZ2VzLycpKSkge1xuICAgICAgdmFyIGZyb21QYWNrYWdlcyA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLHZhcnMuZXh0UGF0aCArICcvcGFja2FnZXMvJylcbiAgICAgIHZhciB0b1BhY2thZ2VzID0gcGF0aC5qb2luKG91dHB1dCwgJ3BhY2thZ2VzLycpXG4gICAgICBmc3guY29weVN5bmMoZnJvbVBhY2thZ2VzLCB0b1BhY2thZ2VzKVxuICAgICAgbG9nKGFwcCArICdDb3B5aW5nICcgKyBmcm9tUGFja2FnZXMucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykgKyAnIHRvOiAnICsgdG9QYWNrYWdlcy5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSlcbiAgICB9XG5cbiAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSx2YXJzLmV4dFBhdGggKyAnL292ZXJyaWRlcy8nKSkpIHtcbiAgICAgIHZhciBmcm9tT3ZlcnJpZGVzID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksdmFycy5leHRQYXRoICsgJy9vdmVycmlkZXMvJylcbiAgICAgIHZhciB0b092ZXJyaWRlcyA9IHBhdGguam9pbihvdXRwdXQsICdvdmVycmlkZXMvJylcbiAgICAgIGZzeC5jb3B5U3luYyhmcm9tT3ZlcnJpZGVzLCB0b092ZXJyaWRlcylcbiAgICAgIGxvZyhhcHAgKyAnQ29weWluZyAnICsgZnJvbU92ZXJyaWRlcy5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSArICcgdG86ICcgKyB0b092ZXJyaWRlcy5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSlcbiAgICB9XG4gIH1cbiAgdmFycy5maXJzdFRpbWUgPSBmYWxzZVxuICBsZXQganNcbiAgaWYgKHZhcnMucHJvZHVjdGlvbikge1xuICAgIHZhcnMuZGVwcy5wdXNoKCdFeHQucmVxdWlyZShcIkV4dC5sYXlvdXQuKlwiKTtcXG4nKVxuICAgIGpzID0gdmFycy5kZXBzLmpvaW4oJztcXG4nKTtcbiAgfVxuICBlbHNlIHtcbiAgICBqcyA9ICdFeHQucmVxdWlyZShcIkV4dC4qXCIpJ1xuICB9XG4gIGlmICh2YXJzLm1hbmlmZXN0ID09PSBudWxsIHx8IGpzICE9PSB2YXJzLm1hbmlmZXN0KSB7XG4gICAgdmFycy5tYW5pZmVzdCA9IGpzXG4gICAgY29uc3QgbWFuaWZlc3QgPSBwYXRoLmpvaW4ob3V0cHV0LCAnbWFuaWZlc3QuanMnKVxuICAgIGZzLndyaXRlRmlsZVN5bmMobWFuaWZlc3QsIGpzLCAndXRmOCcpXG4gICAgdmFycy5yZWJ1aWxkID0gdHJ1ZVxuICAgIGxvZyhhcHAgKyAnQnVpbGRpbmcgRXh0IGJ1bmRsZSBhdDogJyArIG91dHB1dC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSlcbiAgfVxuICBlbHNlIHtcbiAgICB2YXJzLnJlYnVpbGQgPSBmYWxzZVxuICAgIGxvZyhhcHAgKyAnRXh0UmVhY3QgcmVidWlsZCBOT1QgbmVlZGVkJylcbiAgfVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBfYnVpbGRFeHRCdW5kbGUoYXBwLCBjb21waWxhdGlvbiwgb3V0cHV0UGF0aCwgcGFybXMsIG9wdGlvbnMpIHtcbiAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG4gIGNvbnN0IGxvZ3YgPSByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2d2XG4gIGxvZ3Yob3B0aW9ucywnRlVOQ1RJT04gX2J1aWxkRXh0QnVuZGxlJylcblxuICBsZXQgc2VuY2hhOyB0cnkgeyBzZW5jaGEgPSByZXF1aXJlKCdAc2VuY2hhL2NtZCcpIH0gY2F0Y2ggKGUpIHsgc2VuY2hhID0gJ3NlbmNoYScgfVxuICBpZiAoZnMuZXhpc3RzU3luYyhzZW5jaGEpKSB7XG4gICAgbG9ndihvcHRpb25zLCdzZW5jaGEgZm9sZGVyIGV4aXN0cycpXG4gIH1cbiAgZWxzZSB7XG4gICAgbG9ndihvcHRpb25zLCdzZW5jaGEgZm9sZGVyIERPRVMgTk9UIGV4aXN0JylcbiAgfVxuXG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICBjb25zdCBvbkJ1aWxkRG9uZSA9ICgpID0+IHtcbiAgICBsb2d2KG9wdGlvbnMsJ29uQnVpbGREb25lJylcbiAgICByZXNvbHZlKClcbiAgIH1cblxuICAgdmFyIG9wdHMgPSB7IGN3ZDogb3V0cHV0UGF0aCwgc2lsZW50OiB0cnVlLCBzdGRpbzogJ3BpcGUnLCBlbmNvZGluZzogJ3V0Zi04J31cbiAgIGV4ZWN1dGVBc3luYyhhcHAsIHNlbmNoYSwgcGFybXMsIG9wdHMsIGNvbXBpbGF0aW9uLCBvcHRpb25zKS50aGVuIChcbiAgICAgZnVuY3Rpb24oKSB7IG9uQnVpbGREb25lKCkgfSwgXG4gICAgIGZ1bmN0aW9uKHJlYXNvbikgeyByZWplY3QocmVhc29uKSB9XG4gICApXG4gfSlcbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZUFzeW5jIChhcHAsIGNvbW1hbmQsIHBhcm1zLCBvcHRzLCBjb21waWxhdGlvbiwgb3B0aW9ucykge1xuICAvL2NvbnN0IERFRkFVTFRfU1VCU1RSUyA9IFsnW0lORl0gTG9hZGluZycsICdbSU5GXSBQcm9jZXNzaW5nJywgJ1tMT0ddIEZhc2hpb24gYnVpbGQgY29tcGxldGUnLCAnW0VSUl0nLCAnW1dSTl0nLCBcIltJTkZdIFNlcnZlclwiLCBcIltJTkZdIFdyaXRpbmdcIiwgXCJbSU5GXSBMb2FkaW5nIEJ1aWxkXCIsIFwiW0lORl0gV2FpdGluZ1wiLCBcIltMT0ddIEZhc2hpb24gd2FpdGluZ1wiXTtcbiAgY29uc3QgREVGQVVMVF9TVUJTVFJTID0gWydbSU5GXSBMb2FkaW5nJywgJ1tJTkZdIEFwcGVuZCcsICdbSU5GXSBQcm9jZXNzaW5nJywgJ1tJTkZdIFByb2Nlc3NpbmcgQnVpbGQnLCAnW0xPR10gRmFzaGlvbiBidWlsZCBjb21wbGV0ZScsICdbRVJSXScsICdbV1JOXScsIFwiW0lORl0gU2VydmVyXCIsIFwiW0lORl0gV3JpdGluZ1wiLCBcIltJTkZdIExvYWRpbmcgQnVpbGRcIiwgXCJbSU5GXSBXYWl0aW5nXCIsIFwiW0xPR10gRmFzaGlvbiB3YWl0aW5nXCJdO1xuICB2YXIgc3Vic3RyaW5ncyA9IERFRkFVTFRfU1VCU1RSUyBcbiAgdmFyIGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuICBjb25zdCBjcm9zc1NwYXduID0gcmVxdWlyZSgnY3Jvc3Mtc3Bhd24nKVxuICBjb25zdCBsb2cgPSByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2dcbiAgbG9ndihvcHRpb25zLCAnRlVOQ1RJT04gZXhlY3V0ZUFzeW5jJylcbiAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgIGxvZ3Yob3B0aW9ucyxgY29tbWFuZCAtICR7Y29tbWFuZH1gKVxuICAgIGxvZ3Yob3B0aW9ucywgYHBhcm1zIC0gJHtwYXJtc31gKVxuICAgIGxvZ3Yob3B0aW9ucywgYG9wdHMgLSAke0pTT04uc3RyaW5naWZ5KG9wdHMpfWApXG4gICAgbGV0IGNoaWxkID0gY3Jvc3NTcGF3bihjb21tYW5kLCBwYXJtcywgb3B0cylcbiAgICBjaGlsZC5vbignY2xvc2UnLCAoY29kZSwgc2lnbmFsKSA9PiB7XG4gICAgICBsb2d2KG9wdGlvbnMsIGBvbiBjbG9zZWApIFxuICAgICAgaWYoY29kZSA9PT0gMCkgeyByZXNvbHZlKDApIH1cbiAgICAgIGVsc2UgeyBjb21waWxhdGlvbi5lcnJvcnMucHVzaCggbmV3IEVycm9yKGNvZGUpICk7IHJlc29sdmUoMCkgfVxuICAgIH0pXG4gICAgY2hpbGQub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7IFxuICAgICAgbG9ndihvcHRpb25zLCBgb24gZXJyb3JgKSBcbiAgICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKGVycm9yKVxuICAgICAgcmVzb2x2ZSgwKVxuICAgIH0pXG4gICAgY2hpbGQuc3Rkb3V0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgIHZhciBzdHIgPSBkYXRhLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxyP1xcbnxcXHIvZywgXCIgXCIpLnRyaW0oKVxuICAgICAgbG9ndihvcHRpb25zLCBgJHtzdHJ9YClcbiAgICAgIGlmIChkYXRhICYmIGRhdGEudG9TdHJpbmcoKS5tYXRjaCgvV2FpdGluZyBmb3IgY2hhbmdlc1xcLlxcLlxcLi8pKSB7XG4gICAgICAgIHJlc29sdmUoMClcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICBpZiAoc3Vic3RyaW5ncy5zb21lKGZ1bmN0aW9uKHYpIHsgcmV0dXJuIGRhdGEuaW5kZXhPZih2KSA+PSAwOyB9KSkgeyBcbiAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShcIltJTkZdXCIsIFwiXCIpXG4gICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoXCJbTE9HXVwiLCBcIlwiKVxuICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKS50cmltKClcbiAgICAgICAgICBpZiAoc3RyLmluY2x1ZGVzKFwiW0VSUl1cIikpIHtcbiAgICAgICAgICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKGFwcCArIHN0ci5yZXBsYWNlKC9eXFxbRVJSXFxdIC9naSwgJycpKTtcbiAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKFwiW0VSUl1cIiwgYCR7Y2hhbGsucmVkKFwiW0VSUl1cIil9YClcbiAgICAgICAgICB9XG4gICAgICAgICAgbG9nKGAke2FwcH0ke3N0cn1gKSBcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgY2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgIGxvZ3Yob3B0aW9ucywgYGVycm9yIG9uIGNsb3NlYCkgXG4gICAgICB2YXIgc3RyID0gZGF0YS50b1N0cmluZygpLnJlcGxhY2UoL1xccj9cXG58XFxyL2csIFwiIFwiKS50cmltKClcbiAgICAgIHZhciBzdHJKYXZhT3B0cyA9IFwiUGlja2VkIHVwIF9KQVZBX09QVElPTlNcIjtcbiAgICAgIHZhciBpbmNsdWRlcyA9IHN0ci5pbmNsdWRlcyhzdHJKYXZhT3B0cylcbiAgICAgIGlmICghaW5jbHVkZXMpIHtcbiAgICAgICAgY29uc29sZS5sb2coYCR7YXBwfSAke2NoYWxrLnJlZChcIltFUlJdXCIpfSAke3N0cn1gKVxuICAgICAgfVxuICAgIH0pXG4gIH0pXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZyhzKSB7XG4gIHJlcXVpcmUoJ3JlYWRsaW5lJykuY3Vyc29yVG8ocHJvY2Vzcy5zdGRvdXQsIDApXG4gIHRyeSB7XG4gICAgcHJvY2Vzcy5zdGRvdXQuY2xlYXJMaW5lKClcbiAgfVxuICBjYXRjaChlKSB7fVxuICBwcm9jZXNzLnN0ZG91dC53cml0ZShzKVxuICBwcm9jZXNzLnN0ZG91dC53cml0ZSgnXFxuJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ3Yob3B0aW9ucywgcykge1xuICBpZiAob3B0aW9ucy52ZXJib3NlID09ICd5ZXMnKSB7XG4gICAgcmVxdWlyZSgncmVhZGxpbmUnKS5jdXJzb3JUbyhwcm9jZXNzLnN0ZG91dCwgMClcbiAgICB0cnkge1xuICAgICAgcHJvY2Vzcy5zdGRvdXQuY2xlYXJMaW5lKClcbiAgICB9XG4gICAgY2F0Y2goZSkge31cbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShgLXZlcmJvc2U6ICR7c31gKVxuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKCdcXG4nKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfZ2V0QXBwKCkge1xuICB2YXIgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG4gIHZhciBwcmVmaXggPSBgYFxuICBjb25zdCBwbGF0Zm9ybSA9IHJlcXVpcmUoJ29zJykucGxhdGZvcm0oKVxuICBpZiAocGxhdGZvcm0gPT0gJ2RhcndpbicpIHsgcHJlZml4ID0gYOKEuSDvvaJleHTvvaM6YCB9XG4gIGVsc2UgeyBwcmVmaXggPSBgaSBbZXh0XTpgIH1cbiAgcmV0dXJuIGAke2NoYWxrLmdyZWVuKHByZWZpeCl9IGBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9nZXRWZXJzaW9ucyhhcHAsIHBsdWdpbk5hbWUsIGZyYW1ld29ya05hbWUpIHtcbiAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcblxuICB2YXIgdiA9IHt9XG4gIHZhciBwbHVnaW5QYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksJ25vZGVfbW9kdWxlcy9Ac2VuY2hhJywgcGx1Z2luTmFtZSlcbiAgdmFyIHBsdWdpblBrZyA9IChmcy5leGlzdHNTeW5jKHBsdWdpblBhdGgrJy9wYWNrYWdlLmpzb24nKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwbHVnaW5QYXRoKycvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgdi5wbHVnaW5WZXJzaW9uID0gcGx1Z2luUGtnLnZlcnNpb25cblxuICB2YXIgd2VicGFja1BhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwnbm9kZV9tb2R1bGVzL3dlYnBhY2snKVxuICB2YXIgd2VicGFja1BrZyA9IChmcy5leGlzdHNTeW5jKHdlYnBhY2tQYXRoKycvcGFja2FnZS5qc29uJykgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMod2VicGFja1BhdGgrJy9wYWNrYWdlLmpzb24nLCAndXRmLTgnKSkgfHwge30pO1xuICB2LndlYnBhY2tWZXJzaW9uID0gd2VicGFja1BrZy52ZXJzaW9uXG5cbiAgdmFyIGV4dFBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwnbm9kZV9tb2R1bGVzL0BzZW5jaGEvZXh0JylcbiAgdmFyIGV4dFBrZyA9IChmcy5leGlzdHNTeW5jKGV4dFBhdGgrJy9wYWNrYWdlLmpzb24nKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhleHRQYXRoKycvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgdi5leHRWZXJzaW9uID0gZXh0UGtnLnNlbmNoYS52ZXJzaW9uXG5cbiAgdmFyIGNtZFBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSxgbm9kZV9tb2R1bGVzL0BzZW5jaGEvJHtwbHVnaW5OYW1lfS9ub2RlX21vZHVsZXMvQHNlbmNoYS9jbWRgKVxuICB2YXIgY21kUGtnID0gKGZzLmV4aXN0c1N5bmMoY21kUGF0aCsnL3BhY2thZ2UuanNvbicpICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGNtZFBhdGgrJy9wYWNrYWdlLmpzb24nLCAndXRmLTgnKSkgfHwge30pO1xuICB2LmNtZFZlcnNpb24gPSBjbWRQa2cudmVyc2lvbl9mdWxsXG5cbiAgdmFyIGZyYW1ld29ya0luZm8gPSAnJ1xuICAgaWYgKGZyYW1ld29ya05hbWUgIT0gdW5kZWZpbmVkICYmIGZyYW1ld29ya05hbWUgIT0gJ2V4dGpzJykge1xuICAgIHZhciBmcmFtZXdvcmtQYXRoID0gJydcbiAgICBpZiAoZnJhbWV3b3JrTmFtZSA9PSAncmVhY3QnKSB7XG4gICAgICBmcmFtZXdvcmtQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksJ25vZGVfbW9kdWxlcy9yZWFjdCcpXG4gICAgfVxuICAgIGlmIChmcmFtZXdvcmtOYW1lID09ICdhbmd1bGFyJykge1xuICAgICAgZnJhbWV3b3JrUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCdub2RlX21vZHVsZXMvQGFuZ3VsYXIvY29yZScpXG4gICAgfVxuICAgIHZhciBmcmFtZXdvcmtQa2cgPSAoZnMuZXhpc3RzU3luYyhmcmFtZXdvcmtQYXRoKycvcGFja2FnZS5qc29uJykgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoZnJhbWV3b3JrUGF0aCsnL3BhY2thZ2UuanNvbicsICd1dGYtOCcpKSB8fCB7fSk7XG4gICAgdi5mcmFtZXdvcmtWZXJzaW9uID0gZnJhbWV3b3JrUGtnLnZlcnNpb25cbiAgICBmcmFtZXdvcmtJbmZvID0gJywgJyArIGZyYW1ld29ya05hbWUgKyAnIHYnICsgdi5mcmFtZXdvcmtWZXJzaW9uXG4gIH1cblxuICByZXR1cm4gYXBwICsgJ2V4dC13ZWJwYWNrLXBsdWdpbiB2JyArIHYucGx1Z2luVmVyc2lvbiArICcsIEV4dCBKUyB2JyArIHYuZXh0VmVyc2lvbiArICcsIFNlbmNoYSBDbWQgdicgKyB2LmNtZFZlcnNpb24gKyAnLCB3ZWJwYWNrIHYnICsgdi53ZWJwYWNrVmVyc2lvbiArIGZyYW1ld29ya0luZm9cbn0iXX0=