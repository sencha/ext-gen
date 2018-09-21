"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.log = log;
exports.logv = logv;
exports._constructor = _constructor;
exports._getApp = _getApp;
exports._getVersions = _getVersions;
exports.emit = emit;
exports._prepareForBuild = _prepareForBuild;
exports._buildExtBundle = _buildExtBundle;
exports.executeAsync = executeAsync;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function log(s) {
  require('readline').cursorTo(process.stdout, 0);

  process.stdout.clearLine();
  process.stdout.write(s);
  process.stdout.write('\n');
}

function logv(verbose, s) {
  if (verbose == 'yes') {
    require('readline').cursorTo(process.stdout, 0);

    process.stdout.clearLine();
    process.stdout.write('-v-' + s);
    process.stdout.write('\n');
  }
}

function _constructor(options) {
  //var app = ''
  var framework = '';
  var thisVars = {};
  var thisOptions = {};
  var pluginName = '';

  const fs = require('fs');

  const validateOptions = require('schema-utils');

  validateOptions(require('../options.json'), options, '');

  if (options.framework == undefined || options.framework == 'extjs') {
    framework = 'extjs';
    pluginName = `ext-webpack-plugin`;
  } else {
    framework = options.framework;
    pluginName = `ext-${framework}-webpack-plugin`;
  }

  thisVars = require(`./${framework}Util`).getDefaultVars();
  thisVars.framework = framework;
  thisVars.app = require('./pluginUtil')._getApp(pluginName);
  logv(options.verbose, ` pluginName - ${pluginName}`);
  logv(options.verbose, ` thisVars.app - ${thisVars.app}`);
  const rc = fs.existsSync(`.ext-${thisVars.framework}rc`) && JSON.parse(fs.readFileSync(`.ext-${thisVars.framework}rc`, 'utf-8')) || {}; //const _getVersions = require('./pluginUtil')._getVersions

  thisOptions = _objectSpread({}, require(`./${thisVars.framework}Util`).getDefaultOptions(), options, rc);

  if (thisOptions.environment == 'production') {
    thisVars.production = true;
  } else {
    thisVars.production = false;
  }

  log(require('./pluginUtil')._getVersions(thisVars.app, pluginName, thisVars.framework));
  logv(thisOptions.verbose, thisVars.app + 'production: ' + thisVars.production);
  var data = {};
  data.plugin = {};
  data.plugin.app = thisVars.app;
  data.plugin.framework = thisVars.framework;
  data.plugin.vars = thisVars;
  data.plugin.options = thisOptions;
  return data;
}

function _getApp(pluginName) {
  var chalk = require('chalk');

  var prefix = ``;

  const platform = require('os').platform();

  if (platform == 'darwin') {
    prefix = `ℹ ｢ext｣:`;
  } else {
    prefix = `i [ext]:`;
  }

  return `${chalk.green(prefix)} ${pluginName}: `;
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
  var cmdPath = path.resolve(pluginPath, 'node_modules/@sencha/cmd');
  var cmdPkg = fs.existsSync(cmdPath + '/package.json') && JSON.parse(fs.readFileSync(cmdPath + '/package.json', 'utf-8')) || {};
  v.cmdVersion = cmdPkg.version_full;
  var frameworkInfo = '';

  if (frameworkName != undefined && frameworkName != 'extjs') {
    var frameworkPath = path.resolve(process.cwd(), 'node_modules', frameworkName);
    var frameworkPkg = fs.existsSync(frameworkPath + '/package.json') && JSON.parse(fs.readFileSync(frameworkPath + '/package.json', 'utf-8')) || {};
    v.frameworkVersion = frameworkPkg.version;
    frameworkInfo = ', ' + frameworkName + ' v' + v.frameworkVersion;
  }

  return app + 'v' + v.pluginVersion + ', Ext JS v' + v.extVersion + ', Sencha Cmd v' + v.cmdVersion + ', Webpack v' + v.webpackVersion + frameworkInfo;
}

function emit(_x, _x2, _x3, _x4, _x5) {
  return _emit.apply(this, arguments);
}

function _emit() {
  _emit = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(compiler, compilation, vars, options, callback) {
    var app, framework, log, path, _buildExtBundle, outputPath, parms, cmdErrors, url, opn;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          app = vars.app;
          framework = vars.framework;
          log = require('./pluginUtil').log;
          log(app + 'ext-emit');
          path = require('path');
          _buildExtBundle = require('./pluginUtil')._buildExtBundle;
          outputPath = path.join(compiler.outputPath, vars.output);

          if (compiler.outputPath === '/' && compiler.options.devServer) {
            outputPath = path.join(compiler.options.devServer.contentBase, outputPath);
          }

          if (options.verbose == 'yes') {
            log('-v-' + app + 'outputPath: ' + outputPath);
          }

          if (options.verbose == 'yes') {
            log('-v-' + app + 'framework: ' + framework);
          }

          if (framework != 'extjs') {
            require(`./pluginUtil`)._prepareForBuild(app, vars, options, outputPath, compilation);
          } else {
            require(`./${framework}Util`)._prepareForBuild(app, vars, options, outputPath, compilation);
          }

          if (!(vars.rebuild == true)) {
            _context.next = 20;
            break;
          }

          parms = ['app', 'build', options.profile, options.environment];
          cmdErrors = [];
          _context.next = 16;
          return _buildExtBundle(app, compilation, cmdErrors, outputPath, parms, options);

        case 16:
          if (vars.browserCount == 0 && cmdErrors.length == 0) {
            url = 'http://localhost:' + options.port;
            log(app + `ext-${framework}-emit - open browser at ${url}`);
            vars.browserCount++;
            opn = require('opn');
            opn(url);
          }

          callback();
          _context.next = 21;
          break;

        case 20:
          callback();

        case 21:
        case "end":
          return _context.stop();
      }
    }, _callee, this);
  }));
  return _emit.apply(this, arguments);
}

function _prepareForBuild(app, vars, options, output, compilation) {
  const log = require('./pluginUtil').log;

  const rimraf = require('rimraf');

  const mkdirp = require('mkdirp');

  const fsx = require('fs-extra');

  const fs = require('fs');

  const path = require('path');

  var packages = options.packages;
  var toolkit = options.toolkit;
  var theme = options.theme;
  theme = theme || (toolkit === 'classic' ? 'theme-triton' : 'theme-material');

  if (vars.firstTime) {
    rimraf.sync(output);
    mkdirp.sync(output);

    const buildXML = require('./artifacts').buildXML;

    const createAppJson = require('./artifacts').createAppJson;

    const createWorkspaceJson = require('./artifacts').createWorkspaceJson;

    const createJSDOMEnvironment = require('./artifacts').createJSDOMEnvironment;

    fs.writeFileSync(path.join(output, 'build.xml'), buildXML({
      compress: vars.production
    }), 'utf8');
    fs.writeFileSync(path.join(output, 'jsdom-environment.js'), createJSDOMEnvironment(), 'utf8');
    fs.writeFileSync(path.join(output, 'app.json'), createAppJson(theme, packages, toolkit), 'utf8');
    fs.writeFileSync(path.join(output, 'workspace.json'), createWorkspaceJson(), 'utf8');

    if (fs.existsSync(path.join(process.cwd(), options.output + '/packages/'))) {
      var fromPackages = path.join(process.cwd(), options.output + '/packages/');
      var toPackages = path.join(output, 'packages/');
      fsx.copySync(fromPackages, toPackages);
      log(app + 'copying ' + fromPackages.replace(process.cwd(), '') + ' to: ' + toPackages.replace(process.cwd(), ''));
    }

    if (fs.existsSync(path.join(process.cwd(), 'resources/'))) {
      var fromResources = path.join(process.cwd(), 'resources/');
      var toResources = path.join(output, '../resources');
      fsx.copySync(fromResources, toResources);
      log(app + 'copying ' + fromResources.replace(process.cwd(), '') + ' to: ' + toResources.replace(process.cwd(), ''));
    }

    if (fs.existsSync(path.join(process.cwd(), options.output + '/overrides/'))) {
      var fromOverrides = path.join(process.cwd(), options.output + '/overrides/');
      var toOverrides = path.join(output, 'overrides/');
      fsx.copySync(fromOverrides, toOverrides);
      log(app + 'copying ' + fromOverrides.replace(process.cwd(), '') + ' to: ' + toOverrides.replace(process.cwd(), ''));
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
    log(app + 'building ExtReact bundle at: ' + output.replace(process.cwd(), ''));
  } else {
    vars.rebuild = false;
    log(app + 'ExtReact rebuild NOT needed');
  }
}

function _buildExtBundle(app, compilation, cmdErrors, output, parms, options) {
  const logv = require('./pluginUtil').logv;

  logv(options.verbose, app + 'FUNCTION _buildExtBundle');
  let sencha;

  try {
    sencha = require('@sencha/cmd');
  } catch (e) {
    sencha = 'sencha';
  }

  return new Promise((resolve, reject) => {
    const onBuildDone = () => {
      logv(options.verbose, app + 'onBuildDone');

      if (cmdErrors.length) {
        reject(new Error(cmdErrors.join("")));
      } else {
        resolve();
      }
    };

    var opts = {
      cwd: output,
      silent: true,
      stdio: 'pipe',
      encoding: 'utf-8'
    };
    executeAsync(app, sencha, parms, opts, compilation, cmdErrors, options).then(function () {
      onBuildDone();
    }, function (reason) {
      resolve(reason);
    });
  });
}

function executeAsync(_x6, _x7, _x8, _x9, _x10, _x11, _x12) {
  return _executeAsync.apply(this, arguments);
}

function _executeAsync() {
  _executeAsync = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(app, command, parms, opts, compilation, cmdErrors, options) {
    var DEFAULT_SUBSTRS, substrings, chalk, crossSpawn, log;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          DEFAULT_SUBSTRS = ['[INF] Loading', '[LOG] Fashion build complete', '[ERR]', '[WRN]', '[INF] Processing', "[INF] Server", "[INF] Writing", "[INF] Loading Build", "[INF] Waiting", "[LOG] Fashion waiting"];
          substrings = DEFAULT_SUBSTRS;
          chalk = require('chalk');
          crossSpawn = require('cross-spawn');
          log = require('./pluginUtil').log;
          logv(options.verbose, app + 'FUNCTION executeAsync');
          _context2.next = 8;
          return new Promise((resolve, reject) => {
            logv(options.verbose, `${app} command - ${command}`);
            logv(options.verbose, `${app} parms - ${parms}`);
            logv(options.verbose, `${app} opts - ${JSON.stringify(opts)}`);
            let child = crossSpawn(command, parms, opts);
            child.on('close', (code, signal) => {
              //log(`-v-${app}`) 
              if (code === 0) {
                resolve(0);
              } else {
                compilation.errors.push(new Error(cmdErrors.join("")));
                reject(0);
              }
            });
            child.on('error', error => {
              //log(`-v-${app}0`) 
              cmdErrors.push(error);
              reject(error);
            });
            child.stdout.on('data', data => {
              //log(`-v-${app}1`) 
              var str = data.toString().replace(/\r?\n|\r/g, " ").trim();

              if (data && data.toString().match(/Waiting for changes\.\.\./)) {
                resolve(0);
              } else {
                if (substrings.some(function (v) {
                  return data.indexOf(v) >= 0;
                })) {
                  str = str.replace("[INF]", "");
                  str = str.replace("[LOG]", "");
                  str = str.replace(process.cwd(), '');

                  if (str.includes("[ERR]")) {
                    cmdErrors.push(app + str.replace(/^\[ERR\] /gi, ''));
                    str = str.replace("[ERR]", `${chalk.red("[ERR]")}`);
                  }

                  log(`${app}${str}`);
                }
              }
            });
            child.stderr.on('data', data => {
              //log(`-v-${app}4`) 
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wbHVnaW5VdGlsLmpzIl0sIm5hbWVzIjpbImxvZyIsInMiLCJyZXF1aXJlIiwiY3Vyc29yVG8iLCJwcm9jZXNzIiwic3Rkb3V0IiwiY2xlYXJMaW5lIiwid3JpdGUiLCJsb2d2IiwidmVyYm9zZSIsIl9jb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJmcmFtZXdvcmsiLCJ0aGlzVmFycyIsInRoaXNPcHRpb25zIiwicGx1Z2luTmFtZSIsImZzIiwidmFsaWRhdGVPcHRpb25zIiwidW5kZWZpbmVkIiwiZ2V0RGVmYXVsdFZhcnMiLCJhcHAiLCJfZ2V0QXBwIiwicmMiLCJleGlzdHNTeW5jIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwiZ2V0RGVmYXVsdE9wdGlvbnMiLCJlbnZpcm9ubWVudCIsInByb2R1Y3Rpb24iLCJfZ2V0VmVyc2lvbnMiLCJkYXRhIiwicGx1Z2luIiwidmFycyIsImNoYWxrIiwicHJlZml4IiwicGxhdGZvcm0iLCJncmVlbiIsImZyYW1ld29ya05hbWUiLCJwYXRoIiwidiIsInBsdWdpblBhdGgiLCJyZXNvbHZlIiwiY3dkIiwicGx1Z2luUGtnIiwicGx1Z2luVmVyc2lvbiIsInZlcnNpb24iLCJ3ZWJwYWNrUGF0aCIsIndlYnBhY2tQa2ciLCJ3ZWJwYWNrVmVyc2lvbiIsImV4dFBhdGgiLCJleHRQa2ciLCJleHRWZXJzaW9uIiwic2VuY2hhIiwiY21kUGF0aCIsImNtZFBrZyIsImNtZFZlcnNpb24iLCJ2ZXJzaW9uX2Z1bGwiLCJmcmFtZXdvcmtJbmZvIiwiZnJhbWV3b3JrUGF0aCIsImZyYW1ld29ya1BrZyIsImZyYW1ld29ya1ZlcnNpb24iLCJlbWl0IiwiY29tcGlsZXIiLCJjb21waWxhdGlvbiIsImNhbGxiYWNrIiwiX2J1aWxkRXh0QnVuZGxlIiwib3V0cHV0UGF0aCIsImpvaW4iLCJvdXRwdXQiLCJkZXZTZXJ2ZXIiLCJjb250ZW50QmFzZSIsIl9wcmVwYXJlRm9yQnVpbGQiLCJyZWJ1aWxkIiwicGFybXMiLCJwcm9maWxlIiwiY21kRXJyb3JzIiwiYnJvd3NlckNvdW50IiwibGVuZ3RoIiwidXJsIiwicG9ydCIsIm9wbiIsInJpbXJhZiIsIm1rZGlycCIsImZzeCIsInBhY2thZ2VzIiwidG9vbGtpdCIsInRoZW1lIiwiZmlyc3RUaW1lIiwic3luYyIsImJ1aWxkWE1MIiwiY3JlYXRlQXBwSnNvbiIsImNyZWF0ZVdvcmtzcGFjZUpzb24iLCJjcmVhdGVKU0RPTUVudmlyb25tZW50Iiwid3JpdGVGaWxlU3luYyIsImNvbXByZXNzIiwiZnJvbVBhY2thZ2VzIiwidG9QYWNrYWdlcyIsImNvcHlTeW5jIiwicmVwbGFjZSIsImZyb21SZXNvdXJjZXMiLCJ0b1Jlc291cmNlcyIsImZyb21PdmVycmlkZXMiLCJ0b092ZXJyaWRlcyIsImpzIiwiZGVwcyIsInB1c2giLCJtYW5pZmVzdCIsImUiLCJQcm9taXNlIiwicmVqZWN0Iiwib25CdWlsZERvbmUiLCJFcnJvciIsIm9wdHMiLCJzaWxlbnQiLCJzdGRpbyIsImVuY29kaW5nIiwiZXhlY3V0ZUFzeW5jIiwidGhlbiIsInJlYXNvbiIsImNvbW1hbmQiLCJERUZBVUxUX1NVQlNUUlMiLCJzdWJzdHJpbmdzIiwiY3Jvc3NTcGF3biIsInN0cmluZ2lmeSIsImNoaWxkIiwib24iLCJjb2RlIiwic2lnbmFsIiwiZXJyb3JzIiwiZXJyb3IiLCJzdHIiLCJ0b1N0cmluZyIsInRyaW0iLCJtYXRjaCIsInNvbWUiLCJpbmRleE9mIiwiaW5jbHVkZXMiLCJyZWQiLCJzdGRlcnIiLCJzdHJKYXZhT3B0cyIsImNvbnNvbGUiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQU8sU0FBU0EsR0FBVCxDQUFhQyxDQUFiLEVBQWdCO0FBQ3JCQyxFQUFBQSxPQUFPLENBQUMsVUFBRCxDQUFQLENBQW9CQyxRQUFwQixDQUE2QkMsT0FBTyxDQUFDQyxNQUFyQyxFQUE2QyxDQUE3Qzs7QUFDQUQsRUFBQUEsT0FBTyxDQUFDQyxNQUFSLENBQWVDLFNBQWY7QUFDQUYsRUFB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Q0Esa0JBQUlILFFBQVEsR0FBR04sR0FBRyxDQUFDTSxRQUFKLENBQWFHLFdBQWIsQ0FBZjs7QUFDQSxrQkFBSSxDQUFDSCxRQUFMLEVBQWU7QUFDYkksZ0JBQUFBLE9BQU8sQ0FBQzdJLEdBQVIsQ0FBYSxHQUFFb0IsR0FBSSxJQUFHYyxLQUFLLENBQUN3RyxHQUFOLENBQVUsT0FBVixDQUFtQixJQUFHUCxHQUFJLEVBQWhEO0FBQ0Q7QUFDRixhQVJEO0FBU0QsV0EzQ0ssQ0FQRDs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsRyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiBsb2cocykge1xuICByZXF1aXJlKCdyZWFkbGluZScpLmN1cnNvclRvKHByb2Nlc3Muc3Rkb3V0LCAwKVxuICBwcm9jZXNzLnN0ZG91dC5jbGVhckxpbmUoKVxuICBwcm9jZXNzLnN0ZG91dC53cml0ZShzKVxuICBwcm9jZXNzLnN0ZG91dC53cml0ZSgnXFxuJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ3YodmVyYm9zZSwgcykge1xuICBpZiAodmVyYm9zZSA9PSAneWVzJykge1xuICAgIHJlcXVpcmUoJ3JlYWRsaW5lJykuY3Vyc29yVG8ocHJvY2Vzcy5zdGRvdXQsIDApXG4gICAgcHJvY2Vzcy5zdGRvdXQuY2xlYXJMaW5lKClcbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSgnLXYtJyArIHMpXG4gICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoJ1xcbicpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9jb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gIC8vdmFyIGFwcCA9ICcnXG4gIHZhciBmcmFtZXdvcmsgPSAnJ1xuICB2YXIgdGhpc1ZhcnMgPSB7fVxuICB2YXIgdGhpc09wdGlvbnMgPSB7fVxuICB2YXIgcGx1Z2luTmFtZSA9ICcnXG4gIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKVxuICBjb25zdCB2YWxpZGF0ZU9wdGlvbnMgPSByZXF1aXJlKCdzY2hlbWEtdXRpbHMnKVxuICB2YWxpZGF0ZU9wdGlvbnMocmVxdWlyZSgnLi4vb3B0aW9ucy5qc29uJyksIG9wdGlvbnMsICcnKVxuICBpZiAob3B0aW9ucy5mcmFtZXdvcmsgPT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMuZnJhbWV3b3JrID09ICdleHRqcycpIFxuICAgIHtcbiAgICAgIGZyYW1ld29yayA9ICdleHRqcydcbiAgICAgIHBsdWdpbk5hbWUgPSBgZXh0LXdlYnBhY2stcGx1Z2luYFxuICAgIH1cbiAgZWxzZSBcbiAgICB7XG4gICAgICBmcmFtZXdvcmsgPSBvcHRpb25zLmZyYW1ld29ya1xuICAgICAgcGx1Z2luTmFtZSA9IGBleHQtJHtmcmFtZXdvcmt9LXdlYnBhY2stcGx1Z2luYFxuICAgIH1cbiAgdGhpc1ZhcnMgPSByZXF1aXJlKGAuLyR7ZnJhbWV3b3JrfVV0aWxgKS5nZXREZWZhdWx0VmFycygpXG4gIHRoaXNWYXJzLmZyYW1ld29yayA9IGZyYW1ld29ya1xuICB0aGlzVmFycy5hcHAgPSByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5fZ2V0QXBwKHBsdWdpbk5hbWUpXG4gIGxvZ3Yob3B0aW9ucy52ZXJib3NlLCBgIHBsdWdpbk5hbWUgLSAke3BsdWdpbk5hbWV9YClcbiAgbG9ndihvcHRpb25zLnZlcmJvc2UsIGAgdGhpc1ZhcnMuYXBwIC0gJHt0aGlzVmFycy5hcHB9YClcbiAgY29uc3QgcmMgPSAoZnMuZXhpc3RzU3luYyhgLmV4dC0ke3RoaXNWYXJzLmZyYW1ld29ya31yY2ApICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGAuZXh0LSR7dGhpc1ZhcnMuZnJhbWV3b3JrfXJjYCwgJ3V0Zi04JykpIHx8IHt9KVxuICAvL2NvbnN0IF9nZXRWZXJzaW9ucyA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLl9nZXRWZXJzaW9uc1xuICB0aGlzT3B0aW9ucyA9IHsgLi4ucmVxdWlyZShgLi8ke3RoaXNWYXJzLmZyYW1ld29ya31VdGlsYCkuZ2V0RGVmYXVsdE9wdGlvbnMoKSwgLi4ub3B0aW9ucywgLi4ucmMgfVxuICBpZiAodGhpc09wdGlvbnMuZW52aXJvbm1lbnQgPT0gJ3Byb2R1Y3Rpb24nKSBcbiAgICB7dGhpc1ZhcnMucHJvZHVjdGlvbiA9IHRydWV9XG4gIGVsc2UgXG4gICAge3RoaXNWYXJzLnByb2R1Y3Rpb24gPSBmYWxzZX1cbiAgbG9nKHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLl9nZXRWZXJzaW9ucyh0aGlzVmFycy5hcHAsIHBsdWdpbk5hbWUsIHRoaXNWYXJzLmZyYW1ld29yaykpXG4gIGxvZ3YodGhpc09wdGlvbnMudmVyYm9zZSwgdGhpc1ZhcnMuYXBwICsgJ3Byb2R1Y3Rpb246ICcgKyB0aGlzVmFycy5wcm9kdWN0aW9uKVxuXG4gIHZhciBkYXRhID0ge31cbiAgZGF0YS5wbHVnaW4gPSB7fVxuXG4gIGRhdGEucGx1Z2luLmFwcCA9IHRoaXNWYXJzLmFwcFxuICBkYXRhLnBsdWdpbi5mcmFtZXdvcmsgPSB0aGlzVmFycy5mcmFtZXdvcmtcbiAgZGF0YS5wbHVnaW4udmFycyA9IHRoaXNWYXJzXG4gIGRhdGEucGx1Z2luLm9wdGlvbnMgPSB0aGlzT3B0aW9uc1xuICByZXR1cm4gZGF0YVxufVxuXG5leHBvcnQgZnVuY3Rpb24gX2dldEFwcChwbHVnaW5OYW1lKSB7XG4gIHZhciBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbiAgdmFyIHByZWZpeCA9IGBgXG4gIGNvbnN0IHBsYXRmb3JtID0gcmVxdWlyZSgnb3MnKS5wbGF0Zm9ybSgpXG4gIGlmIChwbGF0Zm9ybSA9PSAnZGFyd2luJykgeyBwcmVmaXggPSBg4oS5IO+9omV4dO+9ozpgIH1cbiAgZWxzZSB7IHByZWZpeCA9IGBpIFtleHRdOmAgfVxuICByZXR1cm4gYCR7Y2hhbGsuZ3JlZW4ocHJlZml4KX0gJHtwbHVnaW5OYW1lfTogYFxufVxuXG5leHBvcnQgZnVuY3Rpb24gX2dldFZlcnNpb25zKGFwcCwgcGx1Z2luTmFtZSwgZnJhbWV3b3JrTmFtZSkge1xuICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKVxuXG4gIHZhciB2ID0ge31cbiAgdmFyIHBsdWdpblBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwnbm9kZV9tb2R1bGVzL0BzZW5jaGEnLCBwbHVnaW5OYW1lKVxuICB2YXIgcGx1Z2luUGtnID0gKGZzLmV4aXN0c1N5bmMocGx1Z2luUGF0aCsnL3BhY2thZ2UuanNvbicpICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBsdWdpblBhdGgrJy9wYWNrYWdlLmpzb24nLCAndXRmLTgnKSkgfHwge30pO1xuICB2LnBsdWdpblZlcnNpb24gPSBwbHVnaW5Qa2cudmVyc2lvblxuXG4gIHZhciB3ZWJwYWNrUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCdub2RlX21vZHVsZXMvd2VicGFjaycpXG4gIHZhciB3ZWJwYWNrUGtnID0gKGZzLmV4aXN0c1N5bmMod2VicGFja1BhdGgrJy9wYWNrYWdlLmpzb24nKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyh3ZWJwYWNrUGF0aCsnL3BhY2thZ2UuanNvbicsICd1dGYtOCcpKSB8fCB7fSk7XG4gIHYud2VicGFja1ZlcnNpb24gPSB3ZWJwYWNrUGtnLnZlcnNpb25cblxuICB2YXIgZXh0UGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCdub2RlX21vZHVsZXMvQHNlbmNoYS9leHQnKVxuICB2YXIgZXh0UGtnID0gKGZzLmV4aXN0c1N5bmMoZXh0UGF0aCsnL3BhY2thZ2UuanNvbicpICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGV4dFBhdGgrJy9wYWNrYWdlLmpzb24nLCAndXRmLTgnKSkgfHwge30pO1xuICB2LmV4dFZlcnNpb24gPSBleHRQa2cuc2VuY2hhLnZlcnNpb25cblxuICB2YXIgY21kUGF0aCA9IHBhdGgucmVzb2x2ZShwbHVnaW5QYXRoLCdub2RlX21vZHVsZXMvQHNlbmNoYS9jbWQnKVxuICB2YXIgY21kUGtnID0gKGZzLmV4aXN0c1N5bmMoY21kUGF0aCsnL3BhY2thZ2UuanNvbicpICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGNtZFBhdGgrJy9wYWNrYWdlLmpzb24nLCAndXRmLTgnKSkgfHwge30pO1xuICB2LmNtZFZlcnNpb24gPSBjbWRQa2cudmVyc2lvbl9mdWxsXG5cbiAgdmFyIGZyYW1ld29ya0luZm8gPSAnJ1xuICBpZiAoZnJhbWV3b3JrTmFtZSAhPSB1bmRlZmluZWQgJiYgZnJhbWV3b3JrTmFtZSAhPSAnZXh0anMnKSB7XG4gICAgdmFyIGZyYW1ld29ya1BhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwnbm9kZV9tb2R1bGVzJywgZnJhbWV3b3JrTmFtZSlcbiAgICB2YXIgZnJhbWV3b3JrUGtnID0gKGZzLmV4aXN0c1N5bmMoZnJhbWV3b3JrUGF0aCsnL3BhY2thZ2UuanNvbicpICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGZyYW1ld29ya1BhdGgrJy9wYWNrYWdlLmpzb24nLCAndXRmLTgnKSkgfHwge30pO1xuICAgIHYuZnJhbWV3b3JrVmVyc2lvbiA9IGZyYW1ld29ya1BrZy52ZXJzaW9uXG4gICAgZnJhbWV3b3JrSW5mbyA9ICcsICcgKyBmcmFtZXdvcmtOYW1lICsgJyB2JyArIHYuZnJhbWV3b3JrVmVyc2lvblxuICB9XG5cbiAgcmV0dXJuIGFwcCArICd2JyArIHYucGx1Z2luVmVyc2lvbiArICcsIEV4dCBKUyB2JyArIHYuZXh0VmVyc2lvbiArICcsIFNlbmNoYSBDbWQgdicgKyB2LmNtZFZlcnNpb24gKyAnLCBXZWJwYWNrIHYnICsgdi53ZWJwYWNrVmVyc2lvbiArIGZyYW1ld29ya0luZm9cbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVtaXQoY29tcGlsZXIsIGNvbXBpbGF0aW9uLCB2YXJzLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICB2YXIgYXBwID0gdmFycy5hcHBcbiAgdmFyIGZyYW1ld29yayA9IHZhcnMuZnJhbWV3b3JrXG4gIGNvbnN0IGxvZyA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ1xuICBsb2coYXBwICsgJ2V4dC1lbWl0JylcbiAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuICBjb25zdCBfYnVpbGRFeHRCdW5kbGUgPSByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5fYnVpbGRFeHRCdW5kbGVcblxuICBsZXQgb3V0cHV0UGF0aCA9IHBhdGguam9pbihjb21waWxlci5vdXRwdXRQYXRoLCB2YXJzLm91dHB1dClcbiAgaWYgKGNvbXBpbGVyLm91dHB1dFBhdGggPT09ICcvJyAmJiBjb21waWxlci5vcHRpb25zLmRldlNlcnZlcikge1xuICAgIG91dHB1dFBhdGggPSBwYXRoLmpvaW4oY29tcGlsZXIub3B0aW9ucy5kZXZTZXJ2ZXIuY29udGVudEJhc2UsIG91dHB1dFBhdGgpXG4gIH1cbiAgaWYob3B0aW9ucy52ZXJib3NlID09ICd5ZXMnKSB7bG9nKCctdi0nICsgYXBwICsgJ291dHB1dFBhdGg6ICcgKyBvdXRwdXRQYXRoKX1cbiAgaWYob3B0aW9ucy52ZXJib3NlID09ICd5ZXMnKSB7bG9nKCctdi0nICsgYXBwICsgJ2ZyYW1ld29yazogJyArIGZyYW1ld29yayl9XG5cbiAgaWYgKGZyYW1ld29yayAhPSAnZXh0anMnKSB7XG4gICAgcmVxdWlyZShgLi9wbHVnaW5VdGlsYCkuX3ByZXBhcmVGb3JCdWlsZChhcHAsIHZhcnMsIG9wdGlvbnMsIG91dHB1dFBhdGgsIGNvbXBpbGF0aW9uKVxuICB9XG4gIGVsc2Uge1xuICAgIHJlcXVpcmUoYC4vJHtmcmFtZXdvcmt9VXRpbGApLl9wcmVwYXJlRm9yQnVpbGQoYXBwLCB2YXJzLCBvcHRpb25zLCBvdXRwdXRQYXRoLCBjb21waWxhdGlvbilcbiAgfVxuICBpZiAodmFycy5yZWJ1aWxkID09IHRydWUpIHtcbiAgICB2YXIgcGFybXMgPSBbJ2FwcCcsICdidWlsZCcsIG9wdGlvbnMucHJvZmlsZSwgb3B0aW9ucy5lbnZpcm9ubWVudF1cbiAgICB2YXIgY21kRXJyb3JzID0gW11cbiAgICBhd2FpdCBfYnVpbGRFeHRCdW5kbGUoYXBwLCBjb21waWxhdGlvbiwgY21kRXJyb3JzLCBvdXRwdXRQYXRoLCBwYXJtcywgb3B0aW9ucylcbiAgICBpZiAodmFycy5icm93c2VyQ291bnQgPT0gMCAmJiBjbWRFcnJvcnMubGVuZ3RoID09IDApIHtcbiAgICAgIHZhciB1cmwgPSAnaHR0cDovL2xvY2FsaG9zdDonICsgb3B0aW9ucy5wb3J0XG4gICAgICBsb2coYXBwICsgYGV4dC0ke2ZyYW1ld29ya30tZW1pdCAtIG9wZW4gYnJvd3NlciBhdCAke3VybH1gKVxuICAgICAgdmFycy5icm93c2VyQ291bnQrK1xuICAgICAgY29uc3Qgb3BuID0gcmVxdWlyZSgnb3BuJylcbiAgICAgIG9wbih1cmwpXG4gICAgfVxuICAgIGNhbGxiYWNrKClcbiAgfVxuICBlbHNlIHtcbiAgICBjYWxsYmFjaygpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9wcmVwYXJlRm9yQnVpbGQoYXBwLCB2YXJzLCBvcHRpb25zLCBvdXRwdXQsIGNvbXBpbGF0aW9uKSB7XG4gIGNvbnN0IGxvZyA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ1xuICBjb25zdCByaW1yYWYgPSByZXF1aXJlKCdyaW1yYWYnKVxuICBjb25zdCBta2RpcnAgPSByZXF1aXJlKCdta2RpcnAnKVxuICBjb25zdCBmc3ggPSByZXF1aXJlKCdmcy1leHRyYScpXG4gIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKVxuICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbiAgdmFyIHBhY2thZ2VzID0gb3B0aW9ucy5wYWNrYWdlc1xuICB2YXIgdG9vbGtpdCA9IG9wdGlvbnMudG9vbGtpdFxuICB2YXIgdGhlbWUgPSBvcHRpb25zLnRoZW1lXG5cbiAgdGhlbWUgPSB0aGVtZSB8fCAodG9vbGtpdCA9PT0gJ2NsYXNzaWMnID8gJ3RoZW1lLXRyaXRvbicgOiAndGhlbWUtbWF0ZXJpYWwnKVxuICBpZiAodmFycy5maXJzdFRpbWUpIHtcbiAgICByaW1yYWYuc3luYyhvdXRwdXQpXG4gICAgbWtkaXJwLnN5bmMob3V0cHV0KVxuICAgIGNvbnN0IGJ1aWxkWE1MID0gcmVxdWlyZSgnLi9hcnRpZmFjdHMnKS5idWlsZFhNTFxuICAgIGNvbnN0IGNyZWF0ZUFwcEpzb24gPSByZXF1aXJlKCcuL2FydGlmYWN0cycpLmNyZWF0ZUFwcEpzb25cbiAgICBjb25zdCBjcmVhdGVXb3Jrc3BhY2VKc29uID0gcmVxdWlyZSgnLi9hcnRpZmFjdHMnKS5jcmVhdGVXb3Jrc3BhY2VKc29uXG4gICAgY29uc3QgY3JlYXRlSlNET01FbnZpcm9ubWVudCA9IHJlcXVpcmUoJy4vYXJ0aWZhY3RzJykuY3JlYXRlSlNET01FbnZpcm9ubWVudFxuICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKG91dHB1dCwgJ2J1aWxkLnhtbCcpLCBidWlsZFhNTCh7IGNvbXByZXNzOiB2YXJzLnByb2R1Y3Rpb24gfSksICd1dGY4JylcbiAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihvdXRwdXQsICdqc2RvbS1lbnZpcm9ubWVudC5qcycpLCBjcmVhdGVKU0RPTUVudmlyb25tZW50KCksICd1dGY4JylcbiAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihvdXRwdXQsICdhcHAuanNvbicpLCBjcmVhdGVBcHBKc29uKCB0aGVtZSwgcGFja2FnZXMsIHRvb2xraXQgKSwgJ3V0ZjgnKVxuICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKG91dHB1dCwgJ3dvcmtzcGFjZS5qc29uJyksIGNyZWF0ZVdvcmtzcGFjZUpzb24oKSwgJ3V0ZjgnKVxuXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIG9wdGlvbnMub3V0cHV0ICsgJy9wYWNrYWdlcy8nKSkpIHtcbiAgICAgIHZhciBmcm9tUGFja2FnZXMgPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgb3B0aW9ucy5vdXRwdXQgKyAnL3BhY2thZ2VzLycpXG4gICAgICB2YXIgdG9QYWNrYWdlcyA9IHBhdGguam9pbihvdXRwdXQsICdwYWNrYWdlcy8nKVxuICAgICAgZnN4LmNvcHlTeW5jKGZyb21QYWNrYWdlcywgdG9QYWNrYWdlcylcbiAgICAgIGxvZyhhcHAgKyAnY29weWluZyAnICsgZnJvbVBhY2thZ2VzLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpICsgJyB0bzogJyArIHRvUGFja2FnZXMucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykpXG4gICAgfVxuXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdyZXNvdXJjZXMvJykpKSB7XG4gICAgICB2YXIgZnJvbVJlc291cmNlcyA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncmVzb3VyY2VzLycpXG4gICAgICB2YXIgdG9SZXNvdXJjZXMgPSBwYXRoLmpvaW4ob3V0cHV0LCAnLi4vcmVzb3VyY2VzJylcbiAgICAgIGZzeC5jb3B5U3luYyhmcm9tUmVzb3VyY2VzLCB0b1Jlc291cmNlcylcbiAgICAgIGxvZyhhcHAgKyAnY29weWluZyAnICsgZnJvbVJlc291cmNlcy5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSArICcgdG86ICcgKyB0b1Jlc291cmNlcy5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSlcbiAgICB9XG5cbiAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgb3B0aW9ucy5vdXRwdXQgKyAnL292ZXJyaWRlcy8nKSkpIHtcbiAgICAgIHZhciBmcm9tT3ZlcnJpZGVzID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIG9wdGlvbnMub3V0cHV0ICsgJy9vdmVycmlkZXMvJylcbiAgICAgIHZhciB0b092ZXJyaWRlcyA9IHBhdGguam9pbihvdXRwdXQsICdvdmVycmlkZXMvJylcbiAgICAgIGZzeC5jb3B5U3luYyhmcm9tT3ZlcnJpZGVzLCB0b092ZXJyaWRlcylcbiAgICAgIGxvZyhhcHAgKyAnY29weWluZyAnICsgZnJvbU92ZXJyaWRlcy5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSArICcgdG86ICcgKyB0b092ZXJyaWRlcy5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSlcbiAgICB9XG4gIH1cbiAgdmFycy5maXJzdFRpbWUgPSBmYWxzZVxuICBsZXQganNcbiAgaWYgKHZhcnMucHJvZHVjdGlvbikge1xuICAgIHZhcnMuZGVwcy5wdXNoKCdFeHQucmVxdWlyZShcIkV4dC5sYXlvdXQuKlwiKTtcXG4nKVxuICAgIGpzID0gdmFycy5kZXBzLmpvaW4oJztcXG4nKTtcbiAgfVxuICBlbHNlIHtcbiAgICBqcyA9ICdFeHQucmVxdWlyZShcIkV4dC4qXCIpJ1xuICB9XG4gIGlmICh2YXJzLm1hbmlmZXN0ID09PSBudWxsIHx8IGpzICE9PSB2YXJzLm1hbmlmZXN0KSB7XG4gICAgdmFycy5tYW5pZmVzdCA9IGpzXG4gICAgY29uc3QgbWFuaWZlc3QgPSBwYXRoLmpvaW4ob3V0cHV0LCAnbWFuaWZlc3QuanMnKVxuICAgIGZzLndyaXRlRmlsZVN5bmMobWFuaWZlc3QsIGpzLCAndXRmOCcpXG4gICAgdmFycy5yZWJ1aWxkID0gdHJ1ZVxuICAgIGxvZyhhcHAgKyAnYnVpbGRpbmcgRXh0UmVhY3QgYnVuZGxlIGF0OiAnICsgb3V0cHV0LnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpKVxuICB9XG4gIGVsc2Uge1xuICAgIHZhcnMucmVidWlsZCA9IGZhbHNlXG4gICAgbG9nKGFwcCArICdFeHRSZWFjdCByZWJ1aWxkIE5PVCBuZWVkZWQnKVxuICB9XG59XG5cblxuXG5leHBvcnQgZnVuY3Rpb24gX2J1aWxkRXh0QnVuZGxlKGFwcCwgY29tcGlsYXRpb24sIGNtZEVycm9ycywgb3V0cHV0LCBwYXJtcywgb3B0aW9ucykge1xuICBjb25zdCBsb2d2ID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndlxuICBsb2d2KG9wdGlvbnMudmVyYm9zZSwgYXBwICsgJ0ZVTkNUSU9OIF9idWlsZEV4dEJ1bmRsZScpXG5cbiAgbGV0IHNlbmNoYTsgdHJ5IHsgc2VuY2hhID0gcmVxdWlyZSgnQHNlbmNoYS9jbWQnKSB9IGNhdGNoIChlKSB7IHNlbmNoYSA9ICdzZW5jaGEnIH1cblxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgY29uc3Qgb25CdWlsZERvbmUgPSAoKSA9PiB7XG4gICAgbG9ndihvcHRpb25zLnZlcmJvc2UsIGFwcCArICdvbkJ1aWxkRG9uZScpXG4gICAgaWYgKGNtZEVycm9ycy5sZW5ndGgpIHtcbiAgICAgIHJlamVjdChuZXcgRXJyb3IoY21kRXJyb3JzLmpvaW4oXCJcIikpKVxuICAgIH0gZWxzZSB7XG4gICAgICByZXNvbHZlKClcbiAgICB9XG4gICB9XG5cbiAgIHZhciBvcHRzID0geyBjd2Q6IG91dHB1dCwgc2lsZW50OiB0cnVlLCBzdGRpbzogJ3BpcGUnLCBlbmNvZGluZzogJ3V0Zi04J31cbiAgIGV4ZWN1dGVBc3luYyhhcHAsIHNlbmNoYSwgcGFybXMsIG9wdHMsIGNvbXBpbGF0aW9uLCBjbWRFcnJvcnMsIG9wdGlvbnMpLnRoZW4gKFxuICAgICBmdW5jdGlvbigpIHsgb25CdWlsZERvbmUoKSB9LCBcbiAgICAgZnVuY3Rpb24ocmVhc29uKSB7IHJlc29sdmUocmVhc29uKSB9XG4gICApXG4gfSlcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVBc3luYyAoYXBwLCBjb21tYW5kLCBwYXJtcywgb3B0cywgY29tcGlsYXRpb24sIGNtZEVycm9ycywgb3B0aW9ucykge1xuICBjb25zdCBERUZBVUxUX1NVQlNUUlMgPSBbJ1tJTkZdIExvYWRpbmcnLCAnW0xPR10gRmFzaGlvbiBidWlsZCBjb21wbGV0ZScsICdbRVJSXScsICdbV1JOXScsICdbSU5GXSBQcm9jZXNzaW5nJywgXCJbSU5GXSBTZXJ2ZXJcIiwgXCJbSU5GXSBXcml0aW5nXCIsIFwiW0lORl0gTG9hZGluZyBCdWlsZFwiLCBcIltJTkZdIFdhaXRpbmdcIiwgXCJbTE9HXSBGYXNoaW9uIHdhaXRpbmdcIl07XG4gIHZhciBzdWJzdHJpbmdzID0gREVGQVVMVF9TVUJTVFJTIFxuICB2YXIgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG4gIGNvbnN0IGNyb3NzU3Bhd24gPSByZXF1aXJlKCdjcm9zcy1zcGF3bicpXG4gIGNvbnN0IGxvZyA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ1xuICBsb2d2KG9wdGlvbnMudmVyYm9zZSwgYXBwICsgJ0ZVTkNUSU9OIGV4ZWN1dGVBc3luYycpXG4gIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICBsb2d2KG9wdGlvbnMudmVyYm9zZSwgYCR7YXBwfSBjb21tYW5kIC0gJHtjb21tYW5kfWApXG4gICAgbG9ndihvcHRpb25zLnZlcmJvc2UsIGAke2FwcH0gcGFybXMgLSAke3Bhcm1zfWApXG4gICAgbG9ndihvcHRpb25zLnZlcmJvc2UsIGAke2FwcH0gb3B0cyAtICR7SlNPTi5zdHJpbmdpZnkob3B0cyl9YClcbiAgICBsZXQgY2hpbGQgPSBjcm9zc1NwYXduKGNvbW1hbmQsIHBhcm1zLCBvcHRzKVxuICAgIGNoaWxkLm9uKCdjbG9zZScsIChjb2RlLCBzaWduYWwpID0+IHtcbiAgICAgIC8vbG9nKGAtdi0ke2FwcH1gKSBcbiAgICAgIGlmKGNvZGUgPT09IDApIHsgcmVzb2x2ZSgwKSB9XG4gICAgICBlbHNlIHsgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goIG5ldyBFcnJvcihjbWRFcnJvcnMuam9pbihcIlwiKSkgKTsgcmVqZWN0KDApIH1cbiAgICB9KVxuICAgIGNoaWxkLm9uKCdlcnJvcicsIChlcnJvcikgPT4geyBcbiAgICAgIC8vbG9nKGAtdi0ke2FwcH0wYCkgXG4gICAgICBjbWRFcnJvcnMucHVzaChlcnJvcilcbiAgICAgIHJlamVjdChlcnJvcikgXG4gICAgfSlcbiAgICBjaGlsZC5zdGRvdXQub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgLy9sb2coYC12LSR7YXBwfTFgKSBcbiAgICAgIHZhciBzdHIgPSBkYXRhLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxyP1xcbnxcXHIvZywgXCIgXCIpLnRyaW0oKVxuICAgICAgaWYgKGRhdGEgJiYgZGF0YS50b1N0cmluZygpLm1hdGNoKC9XYWl0aW5nIGZvciBjaGFuZ2VzXFwuXFwuXFwuLykpIHtcbiAgICAgICAgcmVzb2x2ZSgwKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChzdWJzdHJpbmdzLnNvbWUoZnVuY3Rpb24odikgeyByZXR1cm4gZGF0YS5pbmRleE9mKHYpID49IDA7IH0pKSB7IFxuICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKFwiW0lORl1cIiwgXCJcIilcbiAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShcIltMT0ddXCIsIFwiXCIpXG4gICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpXG4gICAgICAgICAgaWYgKHN0ci5pbmNsdWRlcyhcIltFUlJdXCIpKSB7XG4gICAgICAgICAgICBjbWRFcnJvcnMucHVzaChhcHAgKyBzdHIucmVwbGFjZSgvXlxcW0VSUlxcXSAvZ2ksICcnKSk7XG4gICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShcIltFUlJdXCIsIGAke2NoYWxrLnJlZChcIltFUlJdXCIpfWApXG4gICAgICAgICAgfVxuICAgICAgICAgIGxvZyhgJHthcHB9JHtzdHJ9YCkgXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIGNoaWxkLnN0ZGVyci5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAvL2xvZyhgLXYtJHthcHB9NGApIFxuICAgICAgdmFyIHN0ciA9IGRhdGEudG9TdHJpbmcoKS5yZXBsYWNlKC9cXHI/XFxufFxcci9nLCBcIiBcIikudHJpbSgpXG4gICAgICB2YXIgc3RySmF2YU9wdHMgPSBcIlBpY2tlZCB1cCBfSkFWQV9PUFRJT05TXCI7XG4gICAgICB2YXIgaW5jbHVkZXMgPSBzdHIuaW5jbHVkZXMoc3RySmF2YU9wdHMpXG4gICAgICBpZiAoIWluY2x1ZGVzKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGAke2FwcH0gJHtjaGFsay5yZWQoXCJbRVJSXVwiKX0gJHtzdHJ9YClcbiAgICAgIH1cbiAgICB9KVxuICB9KVxufVxuIl19