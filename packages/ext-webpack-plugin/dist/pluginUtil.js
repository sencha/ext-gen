"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._constructor = _constructor;
exports._thisCompilation = _thisCompilation;
exports._compilation = _compilation;
exports._afterCompile = _afterCompile;
exports._emit = _emit;
exports._done = _done;
exports._prepareForBuild = _prepareForBuild;
exports._buildExtBundle = _buildExtBundle;
exports._executeAsync = _executeAsync;
exports._toXtype = _toXtype;
exports._getApp = _getApp;
exports._getVersions = _getVersions;
exports.log = log;
exports.logh = logh;
exports.logv = logv;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

//**********
function _constructor(initialOptions) {
  const fs = require('fs');

  var vars = {};
  var options = {};

  try {
    if (initialOptions.framework == undefined) {
      vars.pluginErrors = [];
      vars.pluginErrors.push('webpack config: framework parameter on ext-webpack-plugin is not defined - values: react, angular, extjs, components');
      var o = {};
      o.vars = vars;
      return o;
    }

    var framework = initialOptions.framework;
    var treeshake = initialOptions.treeshake;
    var verbose = initialOptions.verbose;

    const validateOptions = require('schema-utils');

    validateOptions(_getValidateOptions(), initialOptions, '');
    const rc = fs.existsSync(`.ext-${framework}rc`) && JSON.parse(fs.readFileSync(`.ext-${framework}rc`, 'utf-8')) || {};
    options = _objectSpread({}, _getDefaultOptions(), initialOptions, rc);
    vars = require(`./${framework}Util`)._getDefaultVars();
    vars.pluginName = 'ext-webpack-plugin';
    vars.app = _getApp();
    var pluginName = vars.pluginName;
    var app = vars.app;
    logv(verbose, 'FUNCTION _constructor');
    logv(verbose, `pluginName - ${pluginName}`);
    logv(verbose, `app - ${app}`);

    if (options.environment == 'production') {
      vars.production = true;
      options.browser = 'no';
      options.watch = 'no';
    } else {
      vars.production = false;
    } //logv(verbose, `options:`);if (verbose == 'yes') {console.dir(options)}
    //logv(verbose, `vars:`);if (verbose == 'yes') {console.dir(vars)}


    log(app, _getVersions(pluginName, framework));

    if (framework == 'react' || framework == 'extjs') {
      if (vars.production == true) {
        vars.buildstep = '1 of 1';
        log(app, 'Starting Production Build for ' + framework);
      } else {
        vars.buildstep = '1 of 1';
        log(app, 'Starting development build for ' + framework);
      }
    } else if (vars.production == true) {
      if (treeshake == 'yes') {
        vars.buildstep = '1 of 2';
        log(app, 'Starting production build for ' + framework + ' - ' + vars.buildstep);

        require(`./${framework}Util`)._toProd(vars, options);
      } else {
        vars.buildstep = '2 of 2';
        log(app, 'Continuing production build for ' + framework + ' - ' + vars.buildstep);
      }
    } else {
      vars.buildstep = '1 of 1';
      log(app, 'Starting development build for ' + framework);
    }

    logv(verbose, 'Building for ' + options.environment + ', ' + 'Treeshake is ' + options.treeshake);
    var o = {};
    o.vars = vars;
    o.options = options;
    return o;
  } catch (e) {
    throw '_constructor: ' + e.toString();
  }
} //**********


function _thisCompilation(compiler, compilation, vars, options) {
  try {
    var app = vars.app;
    var verbose = options.verbose;
    logv(verbose, 'FUNCTION _thisCompilation');
    logv(verbose, `options.script: ${options.script}`);
    logv(verbose, `buildstep: ${vars.buildstep}`);

    if (vars.buildstep == '1 of 1' || vars.buildstep == '1 of 2') {
      if (options.script != undefined) {
        if (options.script != null) {
          if (options.script != '') {
            log(app, `Started running ${options.script}`);
            runScript(options.script, function (err) {
              if (err) throw err;
              log(app, `Finished running ${options.script}`);
            });
          }
        }
      }
    }
  } catch (e) {
    throw '_thisCompilation: ' + e.toString();
  }
} //**********


function _compilation(compiler, compilation, vars, options) {
  try {
    var app = vars.app;
    var verbose = options.verbose;
    var framework = options.framework;
    logv(verbose, 'FUNCTION _compilation'); // if (framework == 'extjs') {
    //   logv(verbose, 'FUNCTION _compilation end (extjs)')
    //   return
    // }

    if (framework != 'extjs') {
      var extComponents = [];

      if (vars.buildstep == '1 of 2') {
        extComponents = require(`./${framework}Util`)._getAllComponents(vars, options);
      }

      compilation.hooks.succeedModule.tap(`ext-succeed-module`, module => {
        if (module.resource && !module.resource.match(/node_modules/)) {
          if (module.resource.match(/\.html$/) != null) {
            if (module._source._value.toLowerCase().includes('doctype html') == false) {
              vars.deps = [...(vars.deps || []), ...require(`./${framework}Util`)._extractFromSource(module, options, compilation, extComponents)];
            }
          } else {
            vars.deps = [...(vars.deps || []), ...require(`./${framework}Util`)._extractFromSource(module, options, compilation, extComponents)];
          }
        }
      });
    }

    if (vars.buildstep == '1 of 2') {
      compilation.hooks.finishModules.tap(`ext-finish-modules`, modules => {
        require(`./${framework}Util`)._writeFilesToProdFolder(vars, options);
      });
    }

    if (vars.buildstep == '1 of 1' || vars.buildstep == '2 of 2') {
      compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tap(`ext-html-generation`, data => {
        const path = require('path');

        var jsPath = path.join(vars.extPath, 'ext.js');
        var cssPath = path.join(vars.extPath, 'ext.css');
        data.assets.js.unshift(jsPath);
        data.assets.css.unshift(cssPath);
        log(app, `Adding ${jsPath} and ${cssPath} to index.html`);
      });
    }
  } catch (e) {
    throw '_compilation: ' + e.toString(); //    logv(options.verbose,e)
    //    compilation.errors.push('_compilation: ' + e)
  }
} //**********


function _afterCompile(compiler, compilation, vars, options) {
  try {
    var app = vars.app;
    var verbose = options.verbose;
    var framework = options.framework;
    logv(verbose, 'FUNCTION _afterCompile');

    if (framework == 'extjs') {
      require(`./extjsUtil`)._afterCompile(compilation, vars, options);
    } else {
      logv(verbose, 'FUNCTION _afterCompile not run');
    }
  } catch (e) {
    throw '_afterCompile: ' + e.toString();
  }
} //**********


function _emit(_x, _x2, _x3, _x4, _x5) {
  return _emit2.apply(this, arguments);
} //**********


function _emit2() {
  _emit2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(compiler, compilation, vars, options, callback) {
    var path, app, verbose, emit, framework, outputPath, command, parms;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) switch (_context.prev = _context.next) {
        case 0:
          _context.prev = 0;
          path = require('path');
          app = vars.app;
          verbose = options.verbose;
          emit = options.emit;
          framework = options.framework;
          logv(verbose, 'FUNCTION _emit');

          if (!(emit == 'yes')) {
            _context.next = 33;
            break;
          }

          if (!(vars.buildstep == '1 of 1' || vars.buildstep == '1 of 2')) {
            _context.next = 29;
            break;
          }

          outputPath = path.join(compiler.outputPath, vars.extPath);

          if (compiler.outputPath === '/' && compiler.options.devServer) {
            outputPath = path.join(compiler.options.devServer.contentBase, outputPath);
          }

          logv(verbose, 'outputPath: ' + outputPath);
          logv(verbose, 'framework: ' + framework);

          if (framework != 'extjs') {
            _prepareForBuild(app, vars, options, outputPath, compilation);
          }

          command = '';

          if (options.watch == 'yes' && vars.production == false) {
            command = 'watch';
          } else {
            command = 'build';
          }

          if (!(vars.rebuild == true)) {
            _context.next = 26;
            break;
          }

          parms = [];

          if (options.profile == undefined || options.profile == '' || options.profile == null) {
            if (command == 'build') {
              parms = ['app', command, options.environment];
            } else {
              parms = ['app', command, '--web-server', 'false', options.environment];
            }
          } else {
            if (command == 'build') {
              parms = ['app', command, options.profile, options.environment];
            } else {
              parms = ['app', command, '--web-server', 'false', options.profile, options.environment];
            }
          }

          if (!(vars.watchStarted == false)) {
            _context.next = 23;
            break;
          }

          _context.next = 22;
          return _buildExtBundle(app, compilation, outputPath, parms, vars, options);

        case 22:
          vars.watchStarted = true;

        case 23:
          callback();
          _context.next = 27;
          break;

        case 26:
          callback();

        case 27:
          _context.next = 31;
          break;

        case 29:
          logv(verbose, 'NOT running emit');
          callback();

        case 31:
          _context.next = 35;
          break;

        case 33:
          logv(verbose, 'emit is no');
          callback();

        case 35:
          _context.next = 41;
          break;

        case 37:
          _context.prev = 37;
          _context.t0 = _context["catch"](0);
          callback();
          throw '_emit: ' + _context.t0.toString();

        case 41:
        case "end":
          return _context.stop();
      }
    }, _callee, null, [[0, 37]]);
  }));
  return _emit2.apply(this, arguments);
}

function _done(stats, vars, options) {
  try {
    var verbose = options.verbose;
    var framework = options.framework;
    logv(verbose, 'FUNCTION _done');

    if (stats.compilation.errors && stats.compilation.errors.length) // && process.argv.indexOf('--watch') == -1)
      {
        var chalk = require('chalk');

        console.log(chalk.red('******************************************'));
        console.log(stats.compilation.errors[0]);
        console.log(chalk.red('******************************************'));
        process.exit(0);
      } //mjg refactor


    if (vars.production == true && options.treeshake == 'no' && framework == 'angular') {
      require(`./${options.framework}Util`)._toDev(vars, options);
    }

    try {
      if (options.browser == 'yes' && options.watch == 'yes' && vars.production == false) {
        if (vars.browserCount == 0) {
          var url = 'http://localhost:' + options.port;

          require('./pluginUtil').log(vars.app, `Opening browser at ${url}`);

          vars.browserCount++;

          const opn = require('opn');

          opn(url);
        }
      }
    } catch (e) {
      console.log(e);
    }

    if (vars.buildstep == '1 of 1') {
      if (vars.production == true) {
        require('./pluginUtil').log(vars.app, `Ending production build`);
      } else {
        require('./pluginUtil').log(vars.app, `Ending development build`);
      }
    }

    if (vars.buildstep == '2 of 2') {
      require('./pluginUtil').log(vars.app, `Ending production build`);
    }
  } catch (e) {
    //    require('./pluginUtil').logv(options.verbose,e)
    throw '_done: ' + e.toString();
  }
} //**********


function _prepareForBuild(app, vars, options, output, compilation) {
  try {
    var verbose = options.verbose;
    var packages = options.packages;
    var toolkit = options.toolkit;
    var theme = options.theme;
    logv(verbose, 'FUNCTION _prepareForBuild');

    const rimraf = require('rimraf');

    const mkdirp = require('mkdirp');

    const fsx = require('fs-extra');

    const fs = require('fs');

    const path = require('path');

    theme = theme || (toolkit === 'classic' ? 'theme-triton' : 'theme-material');
    logv(verbose, 'firstTime: ' + vars.firstTime);

    if (vars.firstTime) {
      rimraf.sync(output);
      mkdirp.sync(output);

      const buildXML = require('./artifacts').buildXML;

      const createAppJson = require('./artifacts').createAppJson;

      const createWorkspaceJson = require('./artifacts').createWorkspaceJson;

      const createJSDOMEnvironment = require('./artifacts').createJSDOMEnvironment;

      fs.writeFileSync(path.join(output, 'build.xml'), buildXML(vars.production, options, output), 'utf8');
      fs.writeFileSync(path.join(output, 'app.json'), createAppJson(theme, packages, toolkit, options, output), 'utf8');
      fs.writeFileSync(path.join(output, 'jsdom-environment.js'), createJSDOMEnvironment(options, output), 'utf8');
      fs.writeFileSync(path.join(output, 'workspace.json'), createWorkspaceJson(options, output), 'utf8');
      var framework = vars.framework; //because of a problem with colorpicker

      if (fs.existsSync(path.join(process.cwd(), `ext-${framework}/ux/`))) {
        var fromPath = path.join(process.cwd(), `ext-${framework}/ux/`);
        var toPath = path.join(output, 'ux');
        fsx.copySync(fromPath, toPath);
        log(app, 'Copying (ux) ' + fromPath.replace(process.cwd(), '') + ' to: ' + toPath.replace(process.cwd(), ''));
      }

      if (fs.existsSync(path.join(process.cwd(), `ext-${framework}/packages/`))) {
        var fromPath = path.join(process.cwd(), `ext-${framework}/packages/`);
        var toPath = path.join(output, 'packages');
        fsx.copySync(fromPath, toPath);
        log(app, 'Copying ' + fromPath.replace(process.cwd(), '') + ' to: ' + toPath.replace(process.cwd(), ''));
      }

      if (fs.existsSync(path.join(process.cwd(), `ext-${framework}/overrides/`))) {
        var fromPath = path.join(process.cwd(), `ext-${framework}/overrides/`);
        var toPath = path.join(output, 'overrides');
        fsx.copySync(fromPath, toPath);
        log(app, 'Copying ' + fromPath.replace(process.cwd(), '') + ' to: ' + toPath.replace(process.cwd(), ''));
      }

      if (fs.existsSync(path.join(process.cwd(), 'resources/'))) {
        var fromResources = path.join(process.cwd(), 'resources/');
        var toResources = path.join(output, '../resources');
        fsx.copySync(fromResources, toResources);
        log(app, 'Copying ' + fromResources.replace(process.cwd(), '') + ' to: ' + toResources.replace(process.cwd(), ''));
      }
    }

    vars.firstTime = false;
    var js = '';

    if (vars.production) {
      js = vars.deps.join(';\n');
    } else {
      js = 'Ext.require(["Ext.*","Ext.data.TreeStore"])';
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

      log(app, 'Building Ext bundle at: ' + bundleDir);
    } else {
      vars.rebuild = false;
      log(app, 'Ext rebuild NOT needed');
    }
  } catch (e) {
    require('./pluginUtil').logv(options.verbose, e);

    compilation.errors.push('_prepareForBuild: ' + e);
  }
} //**********


function _buildExtBundle(app, compilation, outputPath, parms, vars, options) {
  //  try {
  var verbose = options.verbose;

  const fs = require('fs');

  logv(verbose, 'FUNCTION _buildExtBundle');
  let sencha;

  try {
    sencha = require('@sencha/cmd');
  } catch (e) {
    sencha = 'sencha';
  }

  if (fs.existsSync(sencha)) {
    logv(verbose, 'sencha folder exists');
  } else {
    logv(verbose, 'sencha folder DOES NOT exist');
  }

  return new Promise((resolve, reject) => {
    const onBuildDone = () => {
      logv(verbose, 'onBuildDone');
      resolve();
    };

    var opts = {
      cwd: outputPath,
      silent: true,
      stdio: 'pipe',
      encoding: 'utf-8'
    };

    _executeAsync(app, sencha, parms, opts, compilation, vars, options).then(function () {
      onBuildDone();
    }, function (reason) {
      reject(reason);
    });
  }); // }
  // catch(e) {
  //   console.log('e')
  //   require('./pluginUtil').logv(options.verbose,e)
  //   compilation.errors.push('_buildExtBundle: ' + e)
  //   callback()
  // }
} //**********


function _executeAsync(_x6, _x7, _x8, _x9, _x10, _x11, _x12) {
  return _executeAsync2.apply(this, arguments);
} //**********


function _executeAsync2() {
  _executeAsync2 = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(app, command, parms, opts, compilation, vars, options) {
    var verbose, framework, DEFAULT_SUBSTRS, substrings, chalk, crossSpawn;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) switch (_context2.prev = _context2.next) {
        case 0:
          //  try {
          verbose = options.verbose;
          framework = options.framework; //const DEFAULT_SUBSTRS = ['[INF] Loading', '[INF] Processing', '[LOG] Fashion build complete', '[ERR]', '[WRN]', "[INF] Server", "[INF] Writing", "[INF] Loading Build", "[INF] Waiting", "[LOG] Fashion waiting"];

          DEFAULT_SUBSTRS = ["[INF] xServer", '[INF] Loading', '[INF] Append', '[INF] Processing', '[INF] Processing Build', '[LOG] Fashion build complete', '[ERR]', '[WRN]', "[INF] Writing", "[INF] Loading Build", "[INF] Waiting", "[LOG] Fashion waiting"];
          substrings = DEFAULT_SUBSTRS;
          chalk = require('chalk');
          crossSpawn = require('cross-spawn');
          logv(verbose, 'FUNCTION _executeAsync');
          _context2.next = 9;
          return new Promise((resolve, reject) => {
            logv(verbose, `command - ${command}`);
            logv(verbose, `parms - ${parms}`);
            logv(verbose, `opts - ${JSON.stringify(opts)}`);
            let child = crossSpawn(command, parms, opts);
            child.on('close', (code, signal) => {
              logv(verbose, `on close: ` + code);

              if (code === 0) {
                resolve(0);
              } else {
                compilation.errors.push(new Error(code));
                resolve(0);
              }
            });
            child.on('error', error => {
              logv(verbose, `on error`);
              compilation.errors.push(error);
              resolve(0);
            });
            child.stdout.on('data', data => {
              var str = data.toString().replace(/\r?\n|\r/g, " ").trim();
              logv(verbose, `${str}`);

              if (data && data.toString().match(/Fashion waiting for changes\.\.\./)) {
                const fs = require('fs');

                var filename = process.cwd() + vars.touchFile;

                try {
                  var d = new Date().toLocaleString();
                  var data = fs.readFileSync(filename);
                  fs.writeFileSync(filename, '//' + d, 'utf8');
                  logv(app, `touching ${filename}`);
                } catch (e) {
                  logv(app, `NOT touching ${filename}`);
                }

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

                  log(app, str);
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
        case "end":
          return _context2.stop();
      }
    }, _callee2);
  }));
  return _executeAsync2.apply(this, arguments);
}

function runScript(scriptPath, callback) {
  var childProcess = require('child_process'); // keep track of whether callback has been invoked to prevent multiple invocations


  var invoked = false;
  var process = childProcess.fork(scriptPath); // listen for errors as they may prevent the exit event from firing

  process.on('error', function (err) {
    if (invoked) return;
    invoked = true;
    callback(err);
  }); // execute the callback once the process has finished running

  process.on('exit', function (code) {
    if (invoked) return;
    invoked = true;
    var err = code === 0 ? null : new Error('exit code ' + code);
    callback(err);
  });
} //**********


function _toXtype(str) {
  return str.toLowerCase().replace(/_/g, '-');
} //**********


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
} //**********


function _getVersions(pluginName, frameworkName) {
  const path = require('path');

  const fs = require('fs');

  var v = {};
  var pluginPath = path.resolve(process.cwd(), 'node_modules/@sencha', pluginName);
  var pluginPkg = fs.existsSync(pluginPath + '/package.json') && JSON.parse(fs.readFileSync(pluginPath + '/package.json', 'utf-8')) || {};
  v.pluginVersion = pluginPkg.version;
  v._resolved = pluginPkg._resolved;

  if (v._resolved == undefined) {
    v.edition = `Commercial`;
  } else {
    if (-1 == v._resolved.indexOf('community')) {
      v.edition = `Commercial`;
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

  return 'ext-webpack-plugin v' + v.pluginVersion + ', Ext JS v' + v.extVersion + ' ' + v.edition + ' Edition, Sencha Cmd v' + v.cmdVersion + ', webpack v' + v.webpackVersion + frameworkInfo;
} //**********


function log(app, message) {
  var s = app + message;

  require('readline').cursorTo(process.stdout, 0);

  try {
    process.stdout.clearLine();
  } catch (e) {}

  process.stdout.write(s);
  process.stdout.write('\n');
} //**********


function logh(app, message) {
  var h = false;
  var s = app + message;

  if (h == true) {
    require('readline').cursorTo(process.stdout, 0);

    try {
      process.stdout.clearLine();
    } catch (e) {}

    process.stdout.write(s);
    process.stdout.write('\n');
  }
} //**********


function logv(verbose, s) {
  if (verbose == 'yes') {
    require('readline').cursorTo(process.stdout, 0);

    try {
      process.stdout.clearLine();
    } catch (e) {}

    process.stdout.write(`-verbose: ${s}`);
    process.stdout.write('\n');
  }
}

function _getValidateOptions() {
  return {
    "type": "object",
    "properties": {
      "framework": {
        "type": ["string"]
      },
      "toolkit": {
        "type": ["string"]
      },
      "theme": {
        "type": ["string"]
      },
      "emit": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "script": {
        "type": ["string"]
      },
      "port": {
        "type": ["integer"]
      },
      "packages": {
        "type": ["string", "array"]
      },
      "profile": {
        "type": ["string"]
      },
      "environment": {
        "errorMessage": "should be 'development' or 'production' string value",
        "type": ["string"]
      },
      "treeshake": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "browser": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "watch": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      },
      "verbose": {
        "errorMessage": "should be 'yes' or 'no' string value (NOT true or false)",
        "type": ["string"]
      }
    },
    "additionalProperties": false
  };
}

function _getDefaultOptions() {
  return {
    framework: 'extjs',
    toolkit: 'modern',
    theme: 'theme-material',
    emit: 'yes',
    script: null,
    port: 1962,
    packages: [],
    profile: '',
    environment: 'development',
    treeshake: 'no',
    browser: 'yes',
    watch: 'yes',
    verbose: 'no'
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wbHVnaW5VdGlsLmpzIl0sIm5hbWVzIjpbIl9jb25zdHJ1Y3RvciIsImluaXRpYWxPcHRpb25zIiwiZnMiLCJyZXF1aXJlIiwidmFycyIsIm9wdGlvbnMiLCJmcmFtZXdvcmsiLCJ1bmRlZmluZWQiLCJwbHVnaW5FcnJvcnMiLCJwdXNoIiwibyIsInRyZWVzaGFrZSIsInZlcmJvc2UiLCJ2YWxpZGF0ZU9wdGlvbnMiLCJfZ2V0VmFsaWRhdGVPcHRpb25zIiwicmMiLCJleGlzdHNTeW5jIiwiSlNPTiIsInBhcnNlIiwicmVhZEZpbGVTeW5jIiwiX2dldERlZmF1bHRPcHRpb25zIiwiX2dldERlZmF1bHRWYXJzIiwicGx1Z2luTmFtZSIsImFwcCIsIl9nZXRBcHAiLCJsb2d2IiwiZW52aXJvbm1lbnQiLCJwcm9kdWN0aW9uIiwiYnJvd3NlciIsIndhdGNoIiwibG9nIiwiX2dldFZlcnNpb25zIiwiYnVpbGRzdGVwIiwiX3RvUHJvZCIsImUiLCJ0b1N0cmluZyIsIl90aGlzQ29tcGlsYXRpb24iLCJjb21waWxlciIsImNvbXBpbGF0aW9uIiwic2NyaXB0IiwicnVuU2NyaXB0IiwiZXJyIiwiX2NvbXBpbGF0aW9uIiwiZXh0Q29tcG9uZW50cyIsIl9nZXRBbGxDb21wb25lbnRzIiwiaG9va3MiLCJzdWNjZWVkTW9kdWxlIiwidGFwIiwibW9kdWxlIiwicmVzb3VyY2UiLCJtYXRjaCIsIl9zb3VyY2UiLCJfdmFsdWUiLCJ0b0xvd2VyQ2FzZSIsImluY2x1ZGVzIiwiZGVwcyIsIl9leHRyYWN0RnJvbVNvdXJjZSIsImZpbmlzaE1vZHVsZXMiLCJtb2R1bGVzIiwiX3dyaXRlRmlsZXNUb1Byb2RGb2xkZXIiLCJodG1sV2VicGFja1BsdWdpbkJlZm9yZUh0bWxHZW5lcmF0aW9uIiwiZGF0YSIsInBhdGgiLCJqc1BhdGgiLCJqb2luIiwiZXh0UGF0aCIsImNzc1BhdGgiLCJhc3NldHMiLCJqcyIsInVuc2hpZnQiLCJjc3MiLCJfYWZ0ZXJDb21waWxlIiwiX2VtaXQiLCJjYWxsYmFjayIsImVtaXQiLCJvdXRwdXRQYXRoIiwiZGV2U2VydmVyIiwiY29udGVudEJhc2UiLCJfcHJlcGFyZUZvckJ1aWxkIiwiY29tbWFuZCIsInJlYnVpbGQiLCJwYXJtcyIsInByb2ZpbGUiLCJ3YXRjaFN0YXJ0ZWQiLCJfYnVpbGRFeHRCdW5kbGUiLCJfZG9uZSIsInN0YXRzIiwiZXJyb3JzIiwibGVuZ3RoIiwiY2hhbGsiLCJjb25zb2xlIiwicmVkIiwicHJvY2VzcyIsImV4aXQiLCJfdG9EZXYiLCJicm93c2VyQ291bnQiLCJ1cmwiLCJwb3J0Iiwib3BuIiwib3V0cHV0IiwicGFja2FnZXMiLCJ0b29sa2l0IiwidGhlbWUiLCJyaW1yYWYiLCJta2RpcnAiLCJmc3giLCJmaXJzdFRpbWUiLCJzeW5jIiwiYnVpbGRYTUwiLCJjcmVhdGVBcHBKc29uIiwiY3JlYXRlV29ya3NwYWNlSnNvbiIsImNyZWF0ZUpTRE9NRW52aXJvbm1lbnQiLCJ3cml0ZUZpbGVTeW5jIiwiY3dkIiwiZnJvbVBhdGgiLCJ0b1BhdGgiLCJjb3B5U3luYyIsInJlcGxhY2UiLCJmcm9tUmVzb3VyY2VzIiwidG9SZXNvdXJjZXMiLCJtYW5pZmVzdCIsImJ1bmRsZURpciIsInRyaW0iLCJzZW5jaGEiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsIm9uQnVpbGREb25lIiwib3B0cyIsInNpbGVudCIsInN0ZGlvIiwiZW5jb2RpbmciLCJfZXhlY3V0ZUFzeW5jIiwidGhlbiIsInJlYXNvbiIsIkRFRkFVTFRfU1VCU1RSUyIsInN1YnN0cmluZ3MiLCJjcm9zc1NwYXduIiwic3RyaW5naWZ5IiwiY2hpbGQiLCJvbiIsImNvZGUiLCJzaWduYWwiLCJFcnJvciIsImVycm9yIiwic3Rkb3V0Iiwic3RyIiwiZmlsZW5hbWUiLCJ0b3VjaEZpbGUiLCJkIiwiRGF0ZSIsInRvTG9jYWxlU3RyaW5nIiwic29tZSIsInYiLCJpbmRleE9mIiwic3RkZXJyIiwic3RySmF2YU9wdHMiLCJzY3JpcHRQYXRoIiwiY2hpbGRQcm9jZXNzIiwiaW52b2tlZCIsImZvcmsiLCJfdG9YdHlwZSIsInByZWZpeCIsInBsYXRmb3JtIiwiZ3JlZW4iLCJmcmFtZXdvcmtOYW1lIiwicGx1Z2luUGF0aCIsInBsdWdpblBrZyIsInBsdWdpblZlcnNpb24iLCJ2ZXJzaW9uIiwiX3Jlc29sdmVkIiwiZWRpdGlvbiIsIndlYnBhY2tQYXRoIiwid2VicGFja1BrZyIsIndlYnBhY2tWZXJzaW9uIiwiZXh0UGtnIiwiZXh0VmVyc2lvbiIsImNtZFBhdGgiLCJjbWRQa2ciLCJjbWRWZXJzaW9uIiwidmVyc2lvbl9mdWxsIiwiZnJhbWV3b3JrSW5mbyIsImZyYW1ld29ya1BhdGgiLCJmcmFtZXdvcmtQa2ciLCJmcmFtZXdvcmtWZXJzaW9uIiwibWVzc2FnZSIsInMiLCJjdXJzb3JUbyIsImNsZWFyTGluZSIsIndyaXRlIiwibG9naCIsImgiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDTyxTQUFTQSxZQUFULENBQXNCQyxjQUF0QixFQUFzQztBQUMzQyxRQUFNQyxFQUFFLEdBQUdDLE9BQU8sQ0FBQyxJQUFELENBQWxCOztBQUNBLE1BQUlDLElBQUksR0FBRyxFQUFYO0FBQ0EsTUFBSUMsT0FBTyxHQUFHLEVBQWQ7O0FBQ0EsTUFBSTtBQUNGLFFBQUlKLGNBQWMsQ0FBQ0ssU0FBZixJQUE0QkMsU0FBaEMsRUFBMkM7QUFDekNILE1BQUFBLElBQUksQ0FBQ0ksWUFBTCxHQUFvQixFQUFwQjtBQUNBSixNQUFBQSxJQUFJLENBQUNJLFlBQUwsQ0FBa0JDLElBQWxCLENBQXVCLHNIQUF2QjtBQUNBLFVBQUlDLENBQUMsR0FBRyxFQUFSO0FBQ0FBLE1BQUFBLENBQUMsQ0FBQ04sSUFBRixHQUFTQSxJQUFUO0FBQ0EsYUFBT00sQ0FBUDtBQUNEOztBQUNELFFBQUlKLFNBQVMsR0FBR0wsY0FBYyxDQUFDSyxTQUEvQjtBQUNBLFFBQUlLLFNBQVMsR0FBR1YsY0FBYyxDQUFDVSxTQUEvQjtBQUNBLFFBQUlDLE9BQU8s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QkFBUSxDQUFDLFFBQUQ7QUFGRCxPQXRDRztBQTBDWixpQkFBVztBQUNULHdCQUFnQiwwREFEUDtBQUVULGdCQUFRLENBQUMsUUFBRDtBQUZDO0FBMUNDLEtBRlQ7QUFpREwsNEJBQXdCO0FBakRuQixHQUFQO0FBbUREOztBQUdELFNBQVNNLGtCQUFULEdBQThCO0FBQzVCLFNBQU87QUFDTGQsSUFBQUEsU0FBUyxFQUFFLE9BRE47QUFFTCtGLElBQUFBLE9BQU8sRUFBRSxRQUZKO0FBR0xDLElBQUFBLEtBQUssRUFBRSxnQkFIRjtBQUlMNUIsSUFBQUEsSUFBSSxFQUFFLEtBSkQ7QUFLTG5DLElBQUFBLE1BQU0sRUFBRSxJQUxIO0FBTUwwRCxJQUFBQSxJQUFJLEVBQUUsSUFORDtBQU9MRyxJQUFBQSxRQUFRLEVBQUUsRUFQTDtBQVNMbEIsSUFBQUEsT0FBTyxFQUFFLEVBVEo7QUFVTHhELElBQUFBLFdBQVcsRUFBRSxhQVZSO0FBV0xmLElBQUFBLFNBQVMsRUFBRSxJQVhOO0FBWUxpQixJQUFBQSxPQUFPLEVBQUUsS0FaSjtBQWFMQyxJQUFBQSxLQUFLLEVBQUUsS0FiRjtBQWNMakIsSUFBQUEsT0FBTyxFQUFFO0FBZEosR0FBUDtBQWdCRCIsInNvdXJjZXNDb250ZW50IjpbIi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF9jb25zdHJ1Y3Rvcihpbml0aWFsT3B0aW9ucykge1xuICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbiAgdmFyIHZhcnMgPSB7fVxuICB2YXIgb3B0aW9ucyA9IHt9XG4gIHRyeSB7XG4gICAgaWYgKGluaXRpYWxPcHRpb25zLmZyYW1ld29yayA9PSB1bmRlZmluZWQpIHtcbiAgICAgIHZhcnMucGx1Z2luRXJyb3JzID0gW11cbiAgICAgIHZhcnMucGx1Z2luRXJyb3JzLnB1c2goJ3dlYnBhY2sgY29uZmlnOiBmcmFtZXdvcmsgcGFyYW1ldGVyIG9uIGV4dC13ZWJwYWNrLXBsdWdpbiBpcyBub3QgZGVmaW5lZCAtIHZhbHVlczogcmVhY3QsIGFuZ3VsYXIsIGV4dGpzLCBjb21wb25lbnRzJylcbiAgICAgIHZhciBvID0ge31cbiAgICAgIG8udmFycyA9IHZhcnNcbiAgICAgIHJldHVybiBvXG4gICAgfVxuICAgIHZhciBmcmFtZXdvcmsgPSBpbml0aWFsT3B0aW9ucy5mcmFtZXdvcmtcbiAgICB2YXIgdHJlZXNoYWtlID0gaW5pdGlhbE9wdGlvbnMudHJlZXNoYWtlXG4gICAgdmFyIHZlcmJvc2UgPSBpbml0aWFsT3B0aW9ucy52ZXJib3NlXG5cbiAgICBjb25zdCB2YWxpZGF0ZU9wdGlvbnMgPSByZXF1aXJlKCdzY2hlbWEtdXRpbHMnKVxuICAgIHZhbGlkYXRlT3B0aW9ucyhfZ2V0VmFsaWRhdGVPcHRpb25zKCksIGluaXRpYWxPcHRpb25zLCAnJylcblxuICAgIGNvbnN0IHJjID0gKGZzLmV4aXN0c1N5bmMoYC5leHQtJHtmcmFtZXdvcmt9cmNgKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhgLmV4dC0ke2ZyYW1ld29ya31yY2AsICd1dGYtOCcpKSB8fCB7fSlcbiAgICBvcHRpb25zID0geyAuLi5fZ2V0RGVmYXVsdE9wdGlvbnMoKSwgLi4uaW5pdGlhbE9wdGlvbnMsIC4uLnJjIH1cblxuICAgIHZhcnMgPSByZXF1aXJlKGAuLyR7ZnJhbWV3b3JrfVV0aWxgKS5fZ2V0RGVmYXVsdFZhcnMoKVxuICAgIHZhcnMucGx1Z2luTmFtZSA9ICdleHQtd2VicGFjay1wbHVnaW4nXG4gICAgdmFycy5hcHAgPSBfZ2V0QXBwKClcbiAgICB2YXIgcGx1Z2luTmFtZSA9IHZhcnMucGx1Z2luTmFtZVxuICAgIHZhciBhcHAgPSB2YXJzLmFwcFxuXG4gICAgbG9ndih2ZXJib3NlLCAnRlVOQ1RJT04gX2NvbnN0cnVjdG9yJylcbiAgICBsb2d2KHZlcmJvc2UsIGBwbHVnaW5OYW1lIC0gJHtwbHVnaW5OYW1lfWApXG4gICAgbG9ndih2ZXJib3NlLCBgYXBwIC0gJHthcHB9YClcblxuICAgIGlmIChvcHRpb25zLmVudmlyb25tZW50ID09ICdwcm9kdWN0aW9uJykge1xuICAgICAgdmFycy5wcm9kdWN0aW9uID0gdHJ1ZVxuICAgICAgb3B0aW9ucy5icm93c2VyID0gJ25vJ1xuICAgICAgb3B0aW9ucy53YXRjaCA9ICdubydcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2YXJzLnByb2R1Y3Rpb24gPSBmYWxzZVxuICAgIH1cbiAgICBcbiAgICAvL2xvZ3YodmVyYm9zZSwgYG9wdGlvbnM6YCk7aWYgKHZlcmJvc2UgPT0gJ3llcycpIHtjb25zb2xlLmRpcihvcHRpb25zKX1cbiAgICAvL2xvZ3YodmVyYm9zZSwgYHZhcnM6YCk7aWYgKHZlcmJvc2UgPT0gJ3llcycpIHtjb25zb2xlLmRpcih2YXJzKX1cbiAgICBcbiAgICBsb2coYXBwLCBfZ2V0VmVyc2lvbnMocGx1Z2luTmFtZSwgZnJhbWV3b3JrKSlcblxuICAgIGlmIChmcmFtZXdvcmsgPT0gJ3JlYWN0JyB8fCBmcmFtZXdvcmsgPT0gJ2V4dGpzJykge1xuICAgICAgaWYgKHZhcnMucHJvZHVjdGlvbiA9PSB0cnVlKSB7XG4gICAgICAgIHZhcnMuYnVpbGRzdGVwID0gJzEgb2YgMSdcbiAgICAgICAgbG9nKGFwcCwgJ1N0YXJ0aW5nIFByb2R1Y3Rpb24gQnVpbGQgZm9yICcgKyBmcmFtZXdvcmspXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFycy5idWlsZHN0ZXAgPSAnMSBvZiAxJ1xuICAgICAgICBsb2coYXBwLCAnU3RhcnRpbmcgZGV2ZWxvcG1lbnQgYnVpbGQgZm9yICcgKyBmcmFtZXdvcmspXG4gICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHZhcnMucHJvZHVjdGlvbiA9PSB0cnVlKSB7XG4gICAgICBpZiAodHJlZXNoYWtlID09ICd5ZXMnKSB7XG4gICAgICAgIHZhcnMuYnVpbGRzdGVwID0gJzEgb2YgMidcbiAgICAgICAgbG9nKGFwcCwgJ1N0YXJ0aW5nIHByb2R1Y3Rpb24gYnVpbGQgZm9yICcgKyBmcmFtZXdvcmsgKyAnIC0gJyArIHZhcnMuYnVpbGRzdGVwKVxuICAgICAgICByZXF1aXJlKGAuLyR7ZnJhbWV3b3JrfVV0aWxgKS5fdG9Qcm9kKHZhcnMsIG9wdGlvbnMpXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdmFycy5idWlsZHN0ZXAgPSAnMiBvZiAyJ1xuICAgICAgICBsb2coYXBwLCAnQ29udGludWluZyBwcm9kdWN0aW9uIGJ1aWxkIGZvciAnICsgZnJhbWV3b3JrICsgJyAtICcgKyB2YXJzLmJ1aWxkc3RlcClcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2YXJzLmJ1aWxkc3RlcCA9ICcxIG9mIDEnXG4gICAgICBsb2coYXBwLCAnU3RhcnRpbmcgZGV2ZWxvcG1lbnQgYnVpbGQgZm9yICcgKyBmcmFtZXdvcmspXG4gICAgfVxuICAgIGxvZ3YodmVyYm9zZSwgJ0J1aWxkaW5nIGZvciAnICsgb3B0aW9ucy5lbnZpcm9ubWVudCArICcsICcgKyAnVHJlZXNoYWtlIGlzICcgKyBvcHRpb25zLnRyZWVzaGFrZSlcblxuICAgIHZhciBvID0ge31cbiAgICBvLnZhcnMgPSB2YXJzXG4gICAgby5vcHRpb25zID0gb3B0aW9uc1xuICAgIHJldHVybiBvXG4gIH1cbiAgY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyAnX2NvbnN0cnVjdG9yOiAnICsgZS50b1N0cmluZygpXG4gIH1cbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gX3RoaXNDb21waWxhdGlvbihjb21waWxlciwgY29tcGlsYXRpb24sIHZhcnMsIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICB2YXIgYXBwID0gdmFycy5hcHBcbiAgICB2YXIgdmVyYm9zZSA9IG9wdGlvbnMudmVyYm9zZVxuICAgIGxvZ3YodmVyYm9zZSwgJ0ZVTkNUSU9OIF90aGlzQ29tcGlsYXRpb24nKVxuICAgIGxvZ3YodmVyYm9zZSwgYG9wdGlvbnMuc2NyaXB0OiAke29wdGlvbnMuc2NyaXB0IH1gKVxuICAgIGxvZ3YodmVyYm9zZSwgYGJ1aWxkc3RlcDogJHt2YXJzLmJ1aWxkc3RlcH1gKVxuXG4gICAgaWYgKHZhcnMuYnVpbGRzdGVwID09ICcxIG9mIDEnIHx8IHZhcnMuYnVpbGRzdGVwID09ICcxIG9mIDInKSB7XG4gICAgICBpZiAob3B0aW9ucy5zY3JpcHQgIT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgaWYgKG9wdGlvbnMuc2NyaXB0ICE9IG51bGwpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNjcmlwdCAhPSAnJykge1xuICAgICAgICAgICAgbG9nKGFwcCwgYFN0YXJ0ZWQgcnVubmluZyAke29wdGlvbnMuc2NyaXB0fWApXG4gICAgICAgICAgICBydW5TY3JpcHQob3B0aW9ucy5zY3JpcHQsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgaWYgKGVycikgdGhyb3cgZXJyO1xuICAgICAgICAgICAgICBsb2coYXBwLCBgRmluaXNoZWQgcnVubmluZyAke29wdGlvbnMuc2NyaXB0fWApXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIGNhdGNoKGUpIHtcbiAgICB0aHJvdyAnX3RoaXNDb21waWxhdGlvbjogJyArIGUudG9TdHJpbmcoKVxuICB9XG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF9jb21waWxhdGlvbihjb21waWxlciwgY29tcGlsYXRpb24sIHZhcnMsIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICB2YXIgYXBwID0gdmFycy5hcHBcbiAgICB2YXIgdmVyYm9zZSA9IG9wdGlvbnMudmVyYm9zZVxuICAgIHZhciBmcmFtZXdvcmsgPSBvcHRpb25zLmZyYW1ld29ya1xuICAgIGxvZ3YodmVyYm9zZSwgJ0ZVTkNUSU9OIF9jb21waWxhdGlvbicpXG4gICAgXG4gICAgLy8gaWYgKGZyYW1ld29yayA9PSAnZXh0anMnKSB7XG4gICAgLy8gICBsb2d2KHZlcmJvc2UsICdGVU5DVElPTiBfY29tcGlsYXRpb24gZW5kIChleHRqcyknKVxuICAgIC8vICAgcmV0dXJuXG4gICAgLy8gfVxuXG4gICAgaWYgKGZyYW1ld29yayAhPSAnZXh0anMnKSB7XG4gICAgICB2YXIgZXh0Q29tcG9uZW50cyA9IFtdXG4gICAgICBpZiAodmFycy5idWlsZHN0ZXAgPT0gJzEgb2YgMicpIHtcbiAgICAgICAgZXh0Q29tcG9uZW50cyA9IHJlcXVpcmUoYC4vJHtmcmFtZXdvcmt9VXRpbGApLl9nZXRBbGxDb21wb25lbnRzKHZhcnMsIG9wdGlvbnMpXG4gICAgICB9XG4gICAgICBjb21waWxhdGlvbi5ob29rcy5zdWNjZWVkTW9kdWxlLnRhcChgZXh0LXN1Y2NlZWQtbW9kdWxlYCwgbW9kdWxlID0+IHtcbiAgICAgICAgaWYgKG1vZHVsZS5yZXNvdXJjZSAmJiAhbW9kdWxlLnJlc291cmNlLm1hdGNoKC9ub2RlX21vZHVsZXMvKSkge1xuICAgICAgICAgIGlmKG1vZHVsZS5yZXNvdXJjZS5tYXRjaCgvXFwuaHRtbCQvKSAhPSBudWxsKSB7XG4gICAgICAgICAgICBpZihtb2R1bGUuX3NvdXJjZS5fdmFsdWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnZG9jdHlwZSBodG1sJykgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgdmFycy5kZXBzID0gW1xuICAgICAgICAgICAgICAgIC4uLih2YXJzLmRlcHMgfHwgW10pLFxuICAgICAgICAgICAgICAgIC4uLnJlcXVpcmUoYC4vJHtmcmFtZXdvcmt9VXRpbGApLl9leHRyYWN0RnJvbVNvdXJjZShtb2R1bGUsIG9wdGlvbnMsIGNvbXBpbGF0aW9uLCBleHRDb21wb25lbnRzKV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2YXJzLmRlcHMgPSBbXG4gICAgICAgICAgICAgIC4uLih2YXJzLmRlcHMgfHwgW10pLFxuICAgICAgICAgICAgICAuLi5yZXF1aXJlKGAuLyR7ZnJhbWV3b3JrfVV0aWxgKS5fZXh0cmFjdEZyb21Tb3VyY2UobW9kdWxlLCBvcHRpb25zLCBjb21waWxhdGlvbiwgZXh0Q29tcG9uZW50cyldXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH1cblxuICAgIGlmICh2YXJzLmJ1aWxkc3RlcCA9PSAnMSBvZiAyJykge1xuICAgICAgY29tcGlsYXRpb24uaG9va3MuZmluaXNoTW9kdWxlcy50YXAoYGV4dC1maW5pc2gtbW9kdWxlc2AsIG1vZHVsZXMgPT4ge1xuICAgICAgICByZXF1aXJlKGAuLyR7ZnJhbWV3b3JrfVV0aWxgKS5fd3JpdGVGaWxlc1RvUHJvZEZvbGRlcih2YXJzLCBvcHRpb25zKVxuICAgICAgfSlcbiAgICB9XG4gICAgaWYgKHZhcnMuYnVpbGRzdGVwID09ICcxIG9mIDEnIHx8IHZhcnMuYnVpbGRzdGVwID09ICcyIG9mIDInKSB7XG4gICAgICBjb21waWxhdGlvbi5ob29rcy5odG1sV2VicGFja1BsdWdpbkJlZm9yZUh0bWxHZW5lcmF0aW9uLnRhcChgZXh0LWh0bWwtZ2VuZXJhdGlvbmAsKGRhdGEpID0+IHtcbiAgICAgICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuICAgICAgICB2YXIganNQYXRoID0gcGF0aC5qb2luKHZhcnMuZXh0UGF0aCwgJ2V4dC5qcycpXG4gICAgICAgIHZhciBjc3NQYXRoID0gcGF0aC5qb2luKHZhcnMuZXh0UGF0aCwgJ2V4dC5jc3MnKVxuICAgICAgICBkYXRhLmFzc2V0cy5qcy51bnNoaWZ0KGpzUGF0aClcbiAgICAgICAgZGF0YS5hc3NldHMuY3NzLnVuc2hpZnQoY3NzUGF0aClcbiAgICAgICAgbG9nKGFwcCwgYEFkZGluZyAke2pzUGF0aH0gYW5kICR7Y3NzUGF0aH0gdG8gaW5kZXguaHRtbGApXG4gICAgICB9KVxuICAgIH1cbiAgfVxuICBjYXRjaChlKSB7XG4gICAgdGhyb3cgJ19jb21waWxhdGlvbjogJyArIGUudG9TdHJpbmcoKVxuLy8gICAgbG9ndihvcHRpb25zLnZlcmJvc2UsZSlcbi8vICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKCdfY29tcGlsYXRpb246ICcgKyBlKVxuICB9XG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF9hZnRlckNvbXBpbGUoY29tcGlsZXIsIGNvbXBpbGF0aW9uLCB2YXJzLCBvcHRpb25zKSB7XG4gIHRyeSB7XG4gICAgdmFyIGFwcCA9IHZhcnMuYXBwXG4gICAgdmFyIHZlcmJvc2UgPSBvcHRpb25zLnZlcmJvc2VcbiAgICB2YXIgZnJhbWV3b3JrID0gb3B0aW9ucy5mcmFtZXdvcmtcbiAgICBsb2d2KHZlcmJvc2UsICdGVU5DVElPTiBfYWZ0ZXJDb21waWxlJylcbiAgICBpZiAoZnJhbWV3b3JrID09ICdleHRqcycpIHtcbiAgICAgIHJlcXVpcmUoYC4vZXh0anNVdGlsYCkuX2FmdGVyQ29tcGlsZShjb21waWxhdGlvbiwgdmFycywgb3B0aW9ucylcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBsb2d2KHZlcmJvc2UsICdGVU5DVElPTiBfYWZ0ZXJDb21waWxlIG5vdCBydW4nKVxuICAgIH1cbiAgfVxuICBjYXRjaChlKSB7XG4gICAgdGhyb3cgJ19hZnRlckNvbXBpbGU6ICcgKyBlLnRvU3RyaW5nKClcbiAgfVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfZW1pdChjb21waWxlciwgY29tcGlsYXRpb24sIHZhcnMsIG9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuICAgIHZhciBhcHAgPSB2YXJzLmFwcFxuICAgIHZhciB2ZXJib3NlID0gb3B0aW9ucy52ZXJib3NlXG4gICAgdmFyIGVtaXQgPSBvcHRpb25zLmVtaXRcbiAgICB2YXIgZnJhbWV3b3JrID0gb3B0aW9ucy5mcmFtZXdvcmtcbiAgICBsb2d2KHZlcmJvc2UsJ0ZVTkNUSU9OIF9lbWl0JylcbiAgICBpZiAoZW1pdCA9PSAneWVzJykge1xuICAgICAgaWYgKHZhcnMuYnVpbGRzdGVwID09ICcxIG9mIDEnIHx8IHZhcnMuYnVpbGRzdGVwID09ICcxIG9mIDInKSB7XG4gICAgICAgIGxldCBvdXRwdXRQYXRoID0gcGF0aC5qb2luKGNvbXBpbGVyLm91dHB1dFBhdGgsdmFycy5leHRQYXRoKVxuICAgICAgICBpZiAoY29tcGlsZXIub3V0cHV0UGF0aCA9PT0gJy8nICYmIGNvbXBpbGVyLm9wdGlvbnMuZGV2U2VydmVyKSB7XG4gICAgICAgICAgb3V0cHV0UGF0aCA9IHBhdGguam9pbihjb21waWxlci5vcHRpb25zLmRldlNlcnZlci5jb250ZW50QmFzZSwgb3V0cHV0UGF0aClcbiAgICAgICAgfVxuICAgICAgICBsb2d2KHZlcmJvc2UsJ291dHB1dFBhdGg6ICcgKyBvdXRwdXRQYXRoKVxuICAgICAgICBsb2d2KHZlcmJvc2UsJ2ZyYW1ld29yazogJyArIGZyYW1ld29yaylcbiAgICAgICAgaWYgKGZyYW1ld29yayAhPSAnZXh0anMnKSB7XG4gICAgICAgICAgX3ByZXBhcmVGb3JCdWlsZChhcHAsIHZhcnMsIG9wdGlvbnMsIG91dHB1dFBhdGgsIGNvbXBpbGF0aW9uKVxuICAgICAgICB9XG4gICAgICAgIHZhciBjb21tYW5kID0gJydcbiAgICAgICAgaWYgKG9wdGlvbnMud2F0Y2ggPT0gJ3llcycgJiYgdmFycy5wcm9kdWN0aW9uID09IGZhbHNlKVxuICAgICAgICAgIHtjb21tYW5kID0gJ3dhdGNoJ31cbiAgICAgICAgZWxzZSBcbiAgICAgICAgICB7Y29tbWFuZCA9ICdidWlsZCd9XG4gICAgICAgIGlmICh2YXJzLnJlYnVpbGQgPT0gdHJ1ZSkge1xuICAgICAgICAgIHZhciBwYXJtcyA9IFtdXG4gICAgICAgICAgaWYgKG9wdGlvbnMucHJvZmlsZSA9PSB1bmRlZmluZWQgfHwgb3B0aW9ucy5wcm9maWxlID09ICcnIHx8IG9wdGlvbnMucHJvZmlsZSA9PSBudWxsKSB7XG4gICAgICAgICAgICBpZiAoY29tbWFuZCA9PSAnYnVpbGQnKVxuICAgICAgICAgICAgICB7IHBhcm1zID0gWydhcHAnLCBjb21tYW5kLCBvcHRpb25zLmVudmlyb25tZW50XSB9XG4gICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICB7IHBhcm1zID0gWydhcHAnLCBjb21tYW5kLCAnLS13ZWItc2VydmVyJywgJ2ZhbHNlJywgb3B0aW9ucy5lbnZpcm9ubWVudF0gfVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjb21tYW5kID09ICdidWlsZCcpIFxuICAgICAgICAgICAgICB7cGFybXMgPSBbJ2FwcCcsIGNvbW1hbmQsIG9wdGlvbnMucHJvZmlsZSwgb3B0aW9ucy5lbnZpcm9ubWVudF19XG4gICAgICAgICAgICBlbHNlIFxuICAgICAgICAgICAgICB7cGFybXMgPSBbJ2FwcCcsIGNvbW1hbmQsICctLXdlYi1zZXJ2ZXInLCAnZmFsc2UnLCBvcHRpb25zLnByb2ZpbGUsIG9wdGlvbnMuZW52aXJvbm1lbnRdfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodmFycy53YXRjaFN0YXJ0ZWQgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIGF3YWl0IF9idWlsZEV4dEJ1bmRsZShhcHAsIGNvbXBpbGF0aW9uLCBvdXRwdXRQYXRoLCBwYXJtcywgdmFycywgb3B0aW9ucylcbiAgICAgICAgICAgIHZhcnMud2F0Y2hTdGFydGVkID0gdHJ1ZVxuICAgICAgICAgIH1cbiAgICAgICAgICBjYWxsYmFjaygpXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgY2FsbGJhY2soKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgbG9ndih2ZXJib3NlLCdOT1QgcnVubmluZyBlbWl0JylcbiAgICAgICAgY2FsbGJhY2soKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxvZ3YodmVyYm9zZSwnZW1pdCBpcyBubycpXG4gICAgICBjYWxsYmFjaygpXG4gICAgfVxuICB9XG4gIGNhdGNoKGUpIHtcbiAgICBjYWxsYmFjaygpXG4gICAgdGhyb3cgJ19lbWl0OiAnICsgZS50b1N0cmluZygpXG4gICAgLy8gbG9ndihvcHRpb25zLnZlcmJvc2UsZSlcbiAgICAvLyBjb21waWxhdGlvbi5lcnJvcnMucHVzaCgnX2VtaXQ6ICcgKyBlKVxuICAgIC8vIGNhbGxiYWNrKClcbiAgfVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBfZG9uZShzdGF0cywgdmFycywgb3B0aW9ucykge1xuICB0cnkge1xuICAgIHZhciB2ZXJib3NlID0gb3B0aW9ucy52ZXJib3NlXG4gICAgdmFyIGZyYW1ld29yayA9IG9wdGlvbnMuZnJhbWV3b3JrXG4gICAgbG9ndih2ZXJib3NlLCdGVU5DVElPTiBfZG9uZScpXG4gICAgaWYgKHN0YXRzLmNvbXBpbGF0aW9uLmVycm9ycyAmJiBzdGF0cy5jb21waWxhdGlvbi5lcnJvcnMubGVuZ3RoKSAvLyAmJiBwcm9jZXNzLmFyZ3YuaW5kZXhPZignLS13YXRjaCcpID09IC0xKVxuICAgIHtcbiAgICAgIHZhciBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJyk7XG4gICAgICBjb25zb2xlLmxvZyhjaGFsay5yZWQoJyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKicpKTtcbiAgICAgIGNvbnNvbGUubG9nKHN0YXRzLmNvbXBpbGF0aW9uLmVycm9yc1swXSk7XG4gICAgICBjb25zb2xlLmxvZyhjaGFsay5yZWQoJyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKicpKTtcbiAgICAgIHByb2Nlc3MuZXhpdCgwKTtcbiAgICB9XG5cbiAgICAvL21qZyByZWZhY3RvclxuICAgIGlmICh2YXJzLnByb2R1Y3Rpb24gPT0gdHJ1ZSAmJiBvcHRpb25zLnRyZWVzaGFrZSA9PSAnbm8nICYmIGZyYW1ld29yayA9PSAnYW5ndWxhcicpIHtcbiAgICAgIHJlcXVpcmUoYC4vJHtvcHRpb25zLmZyYW1ld29ya31VdGlsYCkuX3RvRGV2KHZhcnMsIG9wdGlvbnMpXG4gICAgfVxuICAgIHRyeSB7XG4gICAgICBpZihvcHRpb25zLmJyb3dzZXIgPT0gJ3llcycgJiYgb3B0aW9ucy53YXRjaCA9PSAneWVzJyAmJiB2YXJzLnByb2R1Y3Rpb24gPT0gZmFsc2UpIHtcbiAgICAgICAgaWYgKHZhcnMuYnJvd3NlckNvdW50ID09IDApIHtcbiAgICAgICAgICB2YXIgdXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6JyArIG9wdGlvbnMucG9ydFxuICAgICAgICAgIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZyh2YXJzLmFwcCwgYE9wZW5pbmcgYnJvd3NlciBhdCAke3VybH1gKVxuICAgICAgICAgIHZhcnMuYnJvd3NlckNvdW50KytcbiAgICAgICAgICBjb25zdCBvcG4gPSByZXF1aXJlKCdvcG4nKVxuICAgICAgICAgIG9wbih1cmwpXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgfVxuICAgIGlmICh2YXJzLmJ1aWxkc3RlcCA9PSAnMSBvZiAxJykge1xuICAgICAgaWYgKHZhcnMucHJvZHVjdGlvbiA9PSB0cnVlKSB7XG4gICAgICAgIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZyh2YXJzLmFwcCwgYEVuZGluZyBwcm9kdWN0aW9uIGJ1aWxkYClcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2codmFycy5hcHAsIGBFbmRpbmcgZGV2ZWxvcG1lbnQgYnVpbGRgKVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAodmFycy5idWlsZHN0ZXAgPT0gJzIgb2YgMicpIHtcbiAgICAgIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZyh2YXJzLmFwcCwgYEVuZGluZyBwcm9kdWN0aW9uIGJ1aWxkYClcbiAgICB9XG4gIH1cbiAgY2F0Y2goZSkge1xuLy8gICAgcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndihvcHRpb25zLnZlcmJvc2UsZSlcbiAgICB0aHJvdyAnX2RvbmU6ICcgKyBlLnRvU3RyaW5nKClcbiAgfVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBfcHJlcGFyZUZvckJ1aWxkKGFwcCwgdmFycywgb3B0aW9ucywgb3V0cHV0LCBjb21waWxhdGlvbikge1xuICB0cnkge1xuICAgIHZhciB2ZXJib3NlID0gb3B0aW9ucy52ZXJib3NlXG4gICAgdmFyIHBhY2thZ2VzID0gb3B0aW9ucy5wYWNrYWdlc1xuICAgIHZhciB0b29sa2l0ID0gb3B0aW9ucy50b29sa2l0XG4gICAgdmFyIHRoZW1lID0gb3B0aW9ucy50aGVtZVxuICAgIGxvZ3YodmVyYm9zZSwnRlVOQ1RJT04gX3ByZXBhcmVGb3JCdWlsZCcpXG4gICAgY29uc3QgcmltcmFmID0gcmVxdWlyZSgncmltcmFmJylcbiAgICBjb25zdCBta2RpcnAgPSByZXF1aXJlKCdta2RpcnAnKVxuICAgIGNvbnN0IGZzeCA9IHJlcXVpcmUoJ2ZzLWV4dHJhJylcbiAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbiAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gICAgdGhlbWUgPSB0aGVtZSB8fCAodG9vbGtpdCA9PT0gJ2NsYXNzaWMnID8gJ3RoZW1lLXRyaXRvbicgOiAndGhlbWUtbWF0ZXJpYWwnKVxuICAgIGxvZ3YodmVyYm9zZSwnZmlyc3RUaW1lOiAnICsgdmFycy5maXJzdFRpbWUpXG4gICAgaWYgKHZhcnMuZmlyc3RUaW1lKSB7XG4gICAgICByaW1yYWYuc3luYyhvdXRwdXQpXG4gICAgICBta2RpcnAuc3luYyhvdXRwdXQpXG4gICAgICBjb25zdCBidWlsZFhNTCA9IHJlcXVpcmUoJy4vYXJ0aWZhY3RzJykuYnVpbGRYTUxcbiAgICAgIGNvbnN0IGNyZWF0ZUFwcEpzb24gPSByZXF1aXJlKCcuL2FydGlmYWN0cycpLmNyZWF0ZUFwcEpzb25cbiAgICAgIGNvbnN0IGNyZWF0ZVdvcmtzcGFjZUpzb24gPSByZXF1aXJlKCcuL2FydGlmYWN0cycpLmNyZWF0ZVdvcmtzcGFjZUpzb25cbiAgICAgIGNvbnN0IGNyZWF0ZUpTRE9NRW52aXJvbm1lbnQgPSByZXF1aXJlKCcuL2FydGlmYWN0cycpLmNyZWF0ZUpTRE9NRW52aXJvbm1lbnRcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKG91dHB1dCwgJ2J1aWxkLnhtbCcpLCBidWlsZFhNTCh2YXJzLnByb2R1Y3Rpb24sIG9wdGlvbnMsIG91dHB1dCksICd1dGY4JylcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKG91dHB1dCwgJ2FwcC5qc29uJyksIGNyZWF0ZUFwcEpzb24odGhlbWUsIHBhY2thZ2VzLCB0b29sa2l0LCBvcHRpb25zLCBvdXRwdXQpLCAndXRmOCcpXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihvdXRwdXQsICdqc2RvbS1lbnZpcm9ubWVudC5qcycpLCBjcmVhdGVKU0RPTUVudmlyb25tZW50KG9wdGlvbnMsIG91dHB1dCksICd1dGY4JylcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKG91dHB1dCwgJ3dvcmtzcGFjZS5qc29uJyksIGNyZWF0ZVdvcmtzcGFjZUpzb24ob3B0aW9ucywgb3V0cHV0KSwgJ3V0ZjgnKVxuICAgICAgdmFyIGZyYW1ld29yayA9IHZhcnMuZnJhbWV3b3JrO1xuICAgICAgLy9iZWNhdXNlIG9mIGEgcHJvYmxlbSB3aXRoIGNvbG9ycGlja2VyXG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSxgZXh0LSR7ZnJhbWV3b3JrfS91eC9gKSkpIHtcbiAgICAgICAgdmFyIGZyb21QYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksIGBleHQtJHtmcmFtZXdvcmt9L3V4L2ApXG4gICAgICAgIHZhciB0b1BhdGggPSBwYXRoLmpvaW4ob3V0cHV0LCAndXgnKVxuICAgICAgICBmc3guY29weVN5bmMoZnJvbVBhdGgsIHRvUGF0aClcbiAgICAgICAgbG9nKGFwcCwgJ0NvcHlpbmcgKHV4KSAnICsgZnJvbVBhdGgucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykgKyAnIHRvOiAnICsgdG9QYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpKVxuICAgICAgfVxuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksYGV4dC0ke2ZyYW1ld29ya30vcGFja2FnZXMvYCkpKSB7XG4gICAgICAgIHZhciBmcm9tUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBgZXh0LSR7ZnJhbWV3b3JrfS9wYWNrYWdlcy9gKVxuICAgICAgICB2YXIgdG9QYXRoID0gcGF0aC5qb2luKG91dHB1dCwgJ3BhY2thZ2VzJylcbiAgICAgICAgZnN4LmNvcHlTeW5jKGZyb21QYXRoLCB0b1BhdGgpXG4gICAgICAgIGxvZyhhcHAsICdDb3B5aW5nICcgKyBmcm9tUGF0aC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSArICcgdG86ICcgKyB0b1BhdGgucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykpXG4gICAgICB9XG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSxgZXh0LSR7ZnJhbWV3b3JrfS9vdmVycmlkZXMvYCkpKSB7XG4gICAgICAgIHZhciBmcm9tUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCBgZXh0LSR7ZnJhbWV3b3JrfS9vdmVycmlkZXMvYClcbiAgICAgICAgdmFyIHRvUGF0aCA9IHBhdGguam9pbihvdXRwdXQsICdvdmVycmlkZXMnKVxuICAgICAgICBmc3guY29weVN5bmMoZnJvbVBhdGgsIHRvUGF0aClcbiAgICAgICAgbG9nKGFwcCwgJ0NvcHlpbmcgJyArIGZyb21QYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpICsgJyB0bzogJyArIHRvUGF0aC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSlcbiAgICAgIH1cbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCdyZXNvdXJjZXMvJykpKSB7XG4gICAgICAgIHZhciBmcm9tUmVzb3VyY2VzID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdyZXNvdXJjZXMvJylcbiAgICAgICAgdmFyIHRvUmVzb3VyY2VzID0gcGF0aC5qb2luKG91dHB1dCwgJy4uL3Jlc291cmNlcycpXG4gICAgICAgIGZzeC5jb3B5U3luYyhmcm9tUmVzb3VyY2VzLCB0b1Jlc291cmNlcylcbiAgICAgICAgbG9nKGFwcCwgJ0NvcHlpbmcgJyArIGZyb21SZXNvdXJjZXMucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykgKyAnIHRvOiAnICsgdG9SZXNvdXJjZXMucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykpXG4gICAgICB9XG4gICAgfVxuICAgIHZhcnMuZmlyc3RUaW1lID0gZmFsc2VcbiAgICB2YXIganMgPSAnJ1xuICAgIGlmICh2YXJzLnByb2R1Y3Rpb24pIHtcbiAgICAgIGpzID0gdmFycy5kZXBzLmpvaW4oJztcXG4nKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBqcyA9ICdFeHQucmVxdWlyZShbXCJFeHQuKlwiLFwiRXh0LmRhdGEuVHJlZVN0b3JlXCJdKSdcbiAgICB9XG4gICAgaWYgKHZhcnMubWFuaWZlc3QgPT09IG51bGwgfHwganMgIT09IHZhcnMubWFuaWZlc3QpIHtcbiAgICAgIHZhcnMubWFuaWZlc3QgPSBqc1xuICAgICAgY29uc3QgbWFuaWZlc3QgPSBwYXRoLmpvaW4ob3V0cHV0LCAnbWFuaWZlc3QuanMnKVxuICAgICAgZnMud3JpdGVGaWxlU3luYyhtYW5pZmVzdCwganMsICd1dGY4JylcbiAgICAgIHZhcnMucmVidWlsZCA9IHRydWVcbiAgICAgIHZhciBidW5kbGVEaXIgPSBvdXRwdXQucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJylcbiAgICAgIGlmIChidW5kbGVEaXIudHJpbSgpID09ICcnKSB7YnVuZGxlRGlyID0gJy4vJ31cbiAgICAgIGxvZyhhcHAsICdCdWlsZGluZyBFeHQgYnVuZGxlIGF0OiAnICsgYnVuZGxlRGlyKVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZhcnMucmVidWlsZCA9IGZhbHNlXG4gICAgICBsb2coYXBwLCAnRXh0IHJlYnVpbGQgTk9UIG5lZWRlZCcpXG4gICAgfVxuICB9XG4gIGNhdGNoKGUpIHtcbiAgICByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2d2KG9wdGlvbnMudmVyYm9zZSxlKVxuICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKCdfcHJlcGFyZUZvckJ1aWxkOiAnICsgZSlcbiAgfVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBfYnVpbGRFeHRCdW5kbGUoYXBwLCBjb21waWxhdGlvbiwgb3V0cHV0UGF0aCwgcGFybXMsIHZhcnMsIG9wdGlvbnMpIHtcbi8vICB0cnkge1xuICAgIHZhciB2ZXJib3NlID0gb3B0aW9ucy52ZXJib3NlXG4gICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG4gICAgbG9ndih2ZXJib3NlLCdGVU5DVElPTiBfYnVpbGRFeHRCdW5kbGUnKVxuICAgIGxldCBzZW5jaGE7IHRyeSB7IHNlbmNoYSA9IHJlcXVpcmUoJ0BzZW5jaGEvY21kJykgfSBjYXRjaCAoZSkgeyBzZW5jaGEgPSAnc2VuY2hhJyB9XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoc2VuY2hhKSkge1xuICAgICAgbG9ndih2ZXJib3NlLCdzZW5jaGEgZm9sZGVyIGV4aXN0cycpXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbG9ndih2ZXJib3NlLCdzZW5jaGEgZm9sZGVyIERPRVMgTk9UIGV4aXN0JylcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IG9uQnVpbGREb25lID0gKCkgPT4ge1xuICAgICAgICBsb2d2KHZlcmJvc2UsJ29uQnVpbGREb25lJylcbiAgICAgICAgcmVzb2x2ZSgpXG4gICAgICB9XG4gICAgICB2YXIgb3B0cyA9IHsgY3dkOiBvdXRwdXRQYXRoLCBzaWxlbnQ6IHRydWUsIHN0ZGlvOiAncGlwZScsIGVuY29kaW5nOiAndXRmLTgnfVxuICAgICAgX2V4ZWN1dGVBc3luYyhhcHAsIHNlbmNoYSwgcGFybXMsIG9wdHMsIGNvbXBpbGF0aW9uLCB2YXJzLCBvcHRpb25zKS50aGVuIChcbiAgICAgICAgZnVuY3Rpb24oKSB7IG9uQnVpbGREb25lKCkgfSwgXG4gICAgICAgIGZ1bmN0aW9uKHJlYXNvbikgeyByZWplY3QocmVhc29uKSB9XG4gICAgICApXG4gICAgfSlcbiAgLy8gfVxuICAvLyBjYXRjaChlKSB7XG4gIC8vICAgY29uc29sZS5sb2coJ2UnKVxuICAvLyAgIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3Yob3B0aW9ucy52ZXJib3NlLGUpXG4gIC8vICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goJ19idWlsZEV4dEJ1bmRsZTogJyArIGUpXG4gIC8vICAgY2FsbGJhY2soKVxuICAvLyB9XG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIF9leGVjdXRlQXN5bmMgKGFwcCwgY29tbWFuZCwgcGFybXMsIG9wdHMsIGNvbXBpbGF0aW9uLCB2YXJzLCBvcHRpb25zKSB7XG4vLyAgdHJ5IHtcbiAgICB2YXIgdmVyYm9zZSA9IG9wdGlvbnMudmVyYm9zZVxuICAgIHZhciBmcmFtZXdvcmsgPSBvcHRpb25zLmZyYW1ld29ya1xuICAgIC8vY29uc3QgREVGQVVMVF9TVUJTVFJTID0gWydbSU5GXSBMb2FkaW5nJywgJ1tJTkZdIFByb2Nlc3NpbmcnLCAnW0xPR10gRmFzaGlvbiBidWlsZCBjb21wbGV0ZScsICdbRVJSXScsICdbV1JOXScsIFwiW0lORl0gU2VydmVyXCIsIFwiW0lORl0gV3JpdGluZ1wiLCBcIltJTkZdIExvYWRpbmcgQnVpbGRcIiwgXCJbSU5GXSBXYWl0aW5nXCIsIFwiW0xPR10gRmFzaGlvbiB3YWl0aW5nXCJdO1xuICAgIGNvbnN0IERFRkFVTFRfU1VCU1RSUyA9IFtcIltJTkZdIHhTZXJ2ZXJcIiwgJ1tJTkZdIExvYWRpbmcnLCAnW0lORl0gQXBwZW5kJywgJ1tJTkZdIFByb2Nlc3NpbmcnLCAnW0lORl0gUHJvY2Vzc2luZyBCdWlsZCcsICdbTE9HXSBGYXNoaW9uIGJ1aWxkIGNvbXBsZXRlJywgJ1tFUlJdJywgJ1tXUk5dJywgXCJbSU5GXSBXcml0aW5nXCIsIFwiW0lORl0gTG9hZGluZyBCdWlsZFwiLCBcIltJTkZdIFdhaXRpbmdcIiwgXCJbTE9HXSBGYXNoaW9uIHdhaXRpbmdcIl07XG4gICAgdmFyIHN1YnN0cmluZ3MgPSBERUZBVUxUX1NVQlNUUlMgXG4gICAgdmFyIGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuICAgIGNvbnN0IGNyb3NzU3Bhd24gPSByZXF1aXJlKCdjcm9zcy1zcGF3bicpXG4gICAgbG9ndih2ZXJib3NlLCAnRlVOQ1RJT04gX2V4ZWN1dGVBc3luYycpXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbG9ndih2ZXJib3NlLGBjb21tYW5kIC0gJHtjb21tYW5kfWApXG4gICAgICBsb2d2KHZlcmJvc2UsIGBwYXJtcyAtICR7cGFybXN9YClcbiAgICAgIGxvZ3YodmVyYm9zZSwgYG9wdHMgLSAke0pTT04uc3RyaW5naWZ5KG9wdHMpfWApXG4gICAgICBsZXQgY2hpbGQgPSBjcm9zc1NwYXduKGNvbW1hbmQsIHBhcm1zLCBvcHRzKVxuICAgICAgY2hpbGQub24oJ2Nsb3NlJywgKGNvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgICBsb2d2KHZlcmJvc2UsIGBvbiBjbG9zZTogYCArIGNvZGUpIFxuICAgICAgICBpZihjb2RlID09PSAwKSB7IHJlc29sdmUoMCkgfVxuICAgICAgICBlbHNlIHsgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goIG5ldyBFcnJvcihjb2RlKSApOyByZXNvbHZlKDApIH1cbiAgICAgIH0pXG4gICAgICBjaGlsZC5vbignZXJyb3InLCAoZXJyb3IpID0+IHsgXG4gICAgICAgIGxvZ3YodmVyYm9zZSwgYG9uIGVycm9yYCkgXG4gICAgICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKGVycm9yKVxuICAgICAgICByZXNvbHZlKDApXG4gICAgICB9KVxuICAgICAgY2hpbGQuc3Rkb3V0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgdmFyIHN0ciA9IGRhdGEudG9TdHJpbmcoKS5yZXBsYWNlKC9cXHI/XFxufFxcci9nLCBcIiBcIikudHJpbSgpXG4gICAgICAgIGxvZ3YodmVyYm9zZSwgYCR7c3RyfWApXG4gICAgICAgIGlmIChkYXRhICYmIGRhdGEudG9TdHJpbmcoKS5tYXRjaCgvRmFzaGlvbiB3YWl0aW5nIGZvciBjaGFuZ2VzXFwuXFwuXFwuLykpIHtcblxuICAgICAgICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKTtcbiAgICAgICAgICB2YXIgZmlsZW5hbWUgPSBwcm9jZXNzLmN3ZCgpICsgdmFycy50b3VjaEZpbGU7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciBkID0gbmV3IERhdGUoKS50b0xvY2FsZVN0cmluZygpXG4gICAgICAgICAgICB2YXIgZGF0YSA9IGZzLnJlYWRGaWxlU3luYyhmaWxlbmFtZSk7XG4gICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKGZpbGVuYW1lLCAnLy8nICsgZCwgJ3V0ZjgnKTtcbiAgICAgICAgICAgIGxvZ3YoYXBwLCBgdG91Y2hpbmcgJHtmaWxlbmFtZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY2F0Y2goZSkge1xuICAgICAgICAgICAgbG9ndihhcHAsIGBOT1QgdG91Y2hpbmcgJHtmaWxlbmFtZX1gKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXNvbHZlKDApXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKHN1YnN0cmluZ3Muc29tZShmdW5jdGlvbih2KSB7IHJldHVybiBkYXRhLmluZGV4T2YodikgPj0gMDsgfSkpIHsgXG4gICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShcIltJTkZdXCIsIFwiXCIpXG4gICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShcIltMT0ddXCIsIFwiXCIpXG4gICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykudHJpbSgpXG4gICAgICAgICAgICBpZiAoc3RyLmluY2x1ZGVzKFwiW0VSUl1cIikpIHtcbiAgICAgICAgICAgICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goYXBwICsgc3RyLnJlcGxhY2UoL15cXFtFUlJcXF0gL2dpLCAnJykpO1xuICAgICAgICAgICAgICBzdHIgPSBzdHIucmVwbGFjZShcIltFUlJdXCIsIGAke2NoYWxrLnJlZChcIltFUlJdXCIpfWApXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2coYXBwLCBzdHIpIFxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIGNoaWxkLnN0ZGVyci5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgIGxvZ3Yob3B0aW9ucywgYGVycm9yIG9uIGNsb3NlOiBgICsgZGF0YSkgXG4gICAgICAgIHZhciBzdHIgPSBkYXRhLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxyP1xcbnxcXHIvZywgXCIgXCIpLnRyaW0oKVxuICAgICAgICB2YXIgc3RySmF2YU9wdHMgPSBcIlBpY2tlZCB1cCBfSkFWQV9PUFRJT05TXCI7XG4gICAgICAgIHZhciBpbmNsdWRlcyA9IHN0ci5pbmNsdWRlcyhzdHJKYXZhT3B0cylcbiAgICAgICAgaWYgKCFpbmNsdWRlcykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGAke2FwcH0gJHtjaGFsay5yZWQoXCJbRVJSXVwiKX0gJHtzdHJ9YClcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9KVxuICAvLyB9XG4gIC8vIGNhdGNoKGUpIHtcbiAgLy8gICBsb2d2KG9wdGlvbnMsZSlcbiAgLy8gICBjb21waWxhdGlvbi5lcnJvcnMucHVzaCgnX2V4ZWN1dGVBc3luYzogJyArIGUpXG4gIC8vICAgY2FsbGJhY2soKVxuICAvLyB9IFxufVxuXG4vLyoqKioqKioqKipcbmZ1bmN0aW9uIHJ1blNjcmlwdChzY3JpcHRQYXRoLCBjYWxsYmFjaykge1xuICB2YXIgY2hpbGRQcm9jZXNzID0gcmVxdWlyZSgnY2hpbGRfcHJvY2VzcycpO1xuICAvLyBrZWVwIHRyYWNrIG9mIHdoZXRoZXIgY2FsbGJhY2sgaGFzIGJlZW4gaW52b2tlZCB0byBwcmV2ZW50IG11bHRpcGxlIGludm9jYXRpb25zXG4gIHZhciBpbnZva2VkID0gZmFsc2U7XG4gIHZhciBwcm9jZXNzID0gY2hpbGRQcm9jZXNzLmZvcmsoc2NyaXB0UGF0aCk7XG4gIC8vIGxpc3RlbiBmb3IgZXJyb3JzIGFzIHRoZXkgbWF5IHByZXZlbnQgdGhlIGV4aXQgZXZlbnQgZnJvbSBmaXJpbmdcbiAgcHJvY2Vzcy5vbignZXJyb3InLCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgaWYgKGludm9rZWQpIHJldHVybjtcbiAgICBpbnZva2VkID0gdHJ1ZTtcbiAgICBjYWxsYmFjayhlcnIpO1xuICB9KTtcbiAgLy8gZXhlY3V0ZSB0aGUgY2FsbGJhY2sgb25jZSB0aGUgcHJvY2VzcyBoYXMgZmluaXNoZWQgcnVubmluZ1xuICBwcm9jZXNzLm9uKCdleGl0JywgZnVuY3Rpb24gKGNvZGUpIHtcbiAgICBpZiAoaW52b2tlZCkgcmV0dXJuO1xuICAgIGludm9rZWQgPSB0cnVlO1xuICAgIHZhciBlcnIgPSBjb2RlID09PSAwID8gbnVsbCA6IG5ldyBFcnJvcignZXhpdCBjb2RlICcgKyBjb2RlKTtcbiAgICBjYWxsYmFjayhlcnIpO1xuICB9KTtcbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gX3RvWHR5cGUoc3RyKSB7XG4gIHJldHVybiBzdHIudG9Mb3dlckNhc2UoKS5yZXBsYWNlKC9fL2csICctJylcbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gX2dldEFwcCgpIHtcbiAgdmFyIGNoYWxrID0gcmVxdWlyZSgnY2hhbGsnKVxuICB2YXIgcHJlZml4ID0gYGBcbiAgY29uc3QgcGxhdGZvcm0gPSByZXF1aXJlKCdvcycpLnBsYXRmb3JtKClcbiAgaWYgKHBsYXRmb3JtID09ICdkYXJ3aW4nKSB7IHByZWZpeCA9IGDihLkg772iZXh0772jOmAgfVxuICBlbHNlIHsgcHJlZml4ID0gYGkgW2V4dF06YCB9XG4gIHJldHVybiBgJHtjaGFsay5ncmVlbihwcmVmaXgpfSBgXG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF9nZXRWZXJzaW9ucyhwbHVnaW5OYW1lLCBmcmFtZXdvcmtOYW1lKSB7XG4gIGNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbiAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG4gIHZhciB2ID0ge31cbiAgdmFyIHBsdWdpblBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwnbm9kZV9tb2R1bGVzL0BzZW5jaGEnLCBwbHVnaW5OYW1lKVxuICB2YXIgcGx1Z2luUGtnID0gKGZzLmV4aXN0c1N5bmMocGx1Z2luUGF0aCsnL3BhY2thZ2UuanNvbicpICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBsdWdpblBhdGgrJy9wYWNrYWdlLmpzb24nLCAndXRmLTgnKSkgfHwge30pO1xuICB2LnBsdWdpblZlcnNpb24gPSBwbHVnaW5Qa2cudmVyc2lvblxuICB2Ll9yZXNvbHZlZCA9IHBsdWdpblBrZy5fcmVzb2x2ZWRcbiAgaWYgKHYuX3Jlc29sdmVkID09IHVuZGVmaW5lZCkge1xuICAgIHYuZWRpdGlvbiA9IGBDb21tZXJjaWFsYFxuICB9XG4gIGVsc2Uge1xuICAgIGlmICgtMSA9PSB2Ll9yZXNvbHZlZC5pbmRleE9mKCdjb21tdW5pdHknKSkge1xuICAgICAgdi5lZGl0aW9uID0gYENvbW1lcmNpYWxgXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdi5lZGl0aW9uID0gYENvbW11bml0eWBcbiAgICB9XG4gIH1cbiAgdmFyIHdlYnBhY2tQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksJ25vZGVfbW9kdWxlcy93ZWJwYWNrJylcbiAgdmFyIHdlYnBhY2tQa2cgPSAoZnMuZXhpc3RzU3luYyh3ZWJwYWNrUGF0aCsnL3BhY2thZ2UuanNvbicpICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHdlYnBhY2tQYXRoKycvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgdi53ZWJwYWNrVmVyc2lvbiA9IHdlYnBhY2tQa2cudmVyc2lvblxuICB2YXIgZXh0UGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCdub2RlX21vZHVsZXMvQHNlbmNoYS9leHQnKVxuICB2YXIgZXh0UGtnID0gKGZzLmV4aXN0c1N5bmMoZXh0UGF0aCsnL3BhY2thZ2UuanNvbicpICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGV4dFBhdGgrJy9wYWNrYWdlLmpzb24nLCAndXRmLTgnKSkgfHwge30pO1xuICB2LmV4dFZlcnNpb24gPSBleHRQa2cuc2VuY2hhLnZlcnNpb25cbiAgdmFyIGNtZFBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSxgbm9kZV9tb2R1bGVzL0BzZW5jaGEvY21kYClcbiAgdmFyIGNtZFBrZyA9IChmcy5leGlzdHNTeW5jKGNtZFBhdGgrJy9wYWNrYWdlLmpzb24nKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhjbWRQYXRoKycvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgdi5jbWRWZXJzaW9uID0gY21kUGtnLnZlcnNpb25fZnVsbFxuICBpZiAodi5jbWRWZXJzaW9uID09IHVuZGVmaW5lZCkge1xuICAgIHZhciBjbWRQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksYG5vZGVfbW9kdWxlcy9Ac2VuY2hhLyR7cGx1Z2luTmFtZX0vbm9kZV9tb2R1bGVzL0BzZW5jaGEvY21kYClcbiAgICB2YXIgY21kUGtnID0gKGZzLmV4aXN0c1N5bmMoY21kUGF0aCsnL3BhY2thZ2UuanNvbicpICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGNtZFBhdGgrJy9wYWNrYWdlLmpzb24nLCAndXRmLTgnKSkgfHwge30pO1xuICAgIHYuY21kVmVyc2lvbiA9IGNtZFBrZy52ZXJzaW9uX2Z1bGxcbiAgfVxuICB2YXIgZnJhbWV3b3JrSW5mbyA9ICcnXG4gICBpZiAoZnJhbWV3b3JrTmFtZSAhPSB1bmRlZmluZWQgJiYgZnJhbWV3b3JrTmFtZSAhPSAnZXh0anMnKSB7XG4gICAgdmFyIGZyYW1ld29ya1BhdGggPSAnJ1xuICAgIGlmIChmcmFtZXdvcmtOYW1lID09ICdyZWFjdCcpIHtcbiAgICAgIGZyYW1ld29ya1BhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwnbm9kZV9tb2R1bGVzL3JlYWN0JylcbiAgICB9XG4gICAgaWYgKGZyYW1ld29ya05hbWUgPT0gJ2FuZ3VsYXInKSB7XG4gICAgICBmcmFtZXdvcmtQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksJ25vZGVfbW9kdWxlcy9AYW5ndWxhci9jb3JlJylcbiAgICB9XG4gICAgdmFyIGZyYW1ld29ya1BrZyA9IChmcy5leGlzdHNTeW5jKGZyYW1ld29ya1BhdGgrJy9wYWNrYWdlLmpzb24nKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhmcmFtZXdvcmtQYXRoKycvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgICB2LmZyYW1ld29ya1ZlcnNpb24gPSBmcmFtZXdvcmtQa2cudmVyc2lvblxuICAgIGZyYW1ld29ya0luZm8gPSAnLCAnICsgZnJhbWV3b3JrTmFtZSArICcgdicgKyB2LmZyYW1ld29ya1ZlcnNpb25cbiAgfVxuICByZXR1cm4gJ2V4dC13ZWJwYWNrLXBsdWdpbiB2JyArIHYucGx1Z2luVmVyc2lvbiArICcsIEV4dCBKUyB2JyArIHYuZXh0VmVyc2lvbiArICcgJyArIHYuZWRpdGlvbiArICcgRWRpdGlvbiwgU2VuY2hhIENtZCB2JyArIHYuY21kVmVyc2lvbiArICcsIHdlYnBhY2sgdicgKyB2LndlYnBhY2tWZXJzaW9uICsgZnJhbWV3b3JrSW5mb1xuIH1cblxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gbG9nKGFwcCxtZXNzYWdlKSB7XG4gIHZhciBzID0gYXBwICsgbWVzc2FnZSBcbiAgcmVxdWlyZSgncmVhZGxpbmUnKS5jdXJzb3JUbyhwcm9jZXNzLnN0ZG91dCwgMClcbiAgdHJ5IHtwcm9jZXNzLnN0ZG91dC5jbGVhckxpbmUoKX1jYXRjaChlKSB7fVxuICBwcm9jZXNzLnN0ZG91dC53cml0ZShzKTtwcm9jZXNzLnN0ZG91dC53cml0ZSgnXFxuJylcbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gbG9naChhcHAsbWVzc2FnZSkge1xuICB2YXIgaCA9IGZhbHNlXG4gIHZhciBzID0gYXBwICsgbWVzc2FnZSBcbiAgaWYgKGggPT0gdHJ1ZSkge1xuICAgIHJlcXVpcmUoJ3JlYWRsaW5lJykuY3Vyc29yVG8ocHJvY2Vzcy5zdGRvdXQsIDApXG4gICAgdHJ5IHtcbiAgICAgIHByb2Nlc3Muc3Rkb3V0LmNsZWFyTGluZSgpXG4gICAgfVxuICAgIGNhdGNoKGUpIHt9XG4gICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUocylcbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZSgnXFxuJylcbiAgfVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBsb2d2KHZlcmJvc2UsIHMpIHtcbiAgaWYgKHZlcmJvc2UgPT0gJ3llcycpIHtcbiAgICByZXF1aXJlKCdyZWFkbGluZScpLmN1cnNvclRvKHByb2Nlc3Muc3Rkb3V0LCAwKVxuICAgIHRyeSB7XG4gICAgICBwcm9jZXNzLnN0ZG91dC5jbGVhckxpbmUoKVxuICAgIH1cbiAgICBjYXRjaChlKSB7fVxuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGAtdmVyYm9zZTogJHtzfWApXG4gICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoJ1xcbicpXG4gIH1cbn1cblxuZnVuY3Rpb24gX2dldFZhbGlkYXRlT3B0aW9ucygpIHtcbiAgcmV0dXJuIHtcbiAgICBcInR5cGVcIjogXCJvYmplY3RcIixcbiAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgXCJmcmFtZXdvcmtcIjoge1xuICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCJdXG4gICAgICB9LFxuICAgICAgXCJ0b29sa2l0XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFtcInN0cmluZ1wiXVxuICAgICAgfSxcbiAgICAgIFwidGhlbWVcIjoge1xuICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCJdXG4gICAgICB9LFxuICAgICAgXCJlbWl0XCI6IHtcbiAgICAgICAgXCJlcnJvck1lc3NhZ2VcIjogXCJzaG91bGQgYmUgJ3llcycgb3IgJ25vJyBzdHJpbmcgdmFsdWUgKE5PVCB0cnVlIG9yIGZhbHNlKVwiLFxuICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCJdXG4gICAgICB9LFxuICAgICAgXCJzY3JpcHRcIjoge1xuICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCJdXG4gICAgICB9LFxuICAgICAgXCJwb3J0XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFtcImludGVnZXJcIl1cbiAgICAgIH0sXG4gICAgICBcInBhY2thZ2VzXCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFtcInN0cmluZ1wiLCBcImFycmF5XCJdXG4gICAgICB9LFxuICAgICAgXCJwcm9maWxlXCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFtcInN0cmluZ1wiXVxuICAgICAgfSxcbiAgICAgIFwiZW52aXJvbm1lbnRcIjoge1xuICAgICAgICBcImVycm9yTWVzc2FnZVwiOiBcInNob3VsZCBiZSAnZGV2ZWxvcG1lbnQnIG9yICdwcm9kdWN0aW9uJyBzdHJpbmcgdmFsdWVcIixcbiAgICAgICAgXCJ0eXBlXCI6IFtcInN0cmluZ1wiXVxuICAgICAgfSxcbiAgICAgIFwidHJlZXNoYWtlXCI6IHtcbiAgICAgICAgXCJlcnJvck1lc3NhZ2VcIjogXCJzaG91bGQgYmUgJ3llcycgb3IgJ25vJyBzdHJpbmcgdmFsdWUgKE5PVCB0cnVlIG9yIGZhbHNlKVwiLFxuICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCJdXG4gICAgICB9LFxuICAgICAgXCJicm93c2VyXCI6IHtcbiAgICAgICAgXCJlcnJvck1lc3NhZ2VcIjogXCJzaG91bGQgYmUgJ3llcycgb3IgJ25vJyBzdHJpbmcgdmFsdWUgKE5PVCB0cnVlIG9yIGZhbHNlKVwiLFxuICAgICAgICBcInR5cGVcIjogW1wic3RyaW5nXCJdXG4gICAgICB9LFxuICAgICAgXCJ3YXRjaFwiOiB7XG4gICAgICAgIFwiZXJyb3JNZXNzYWdlXCI6IFwic2hvdWxkIGJlICd5ZXMnIG9yICdubycgc3RyaW5nIHZhbHVlIChOT1QgdHJ1ZSBvciBmYWxzZSlcIixcbiAgICAgICAgXCJ0eXBlXCI6IFtcInN0cmluZ1wiXVxuICAgICAgfSxcbiAgICAgIFwidmVyYm9zZVwiOiB7XG4gICAgICAgIFwiZXJyb3JNZXNzYWdlXCI6IFwic2hvdWxkIGJlICd5ZXMnIG9yICdubycgc3RyaW5nIHZhbHVlIChOT1QgdHJ1ZSBvciBmYWxzZSlcIixcbiAgICAgICAgXCJ0eXBlXCI6IFtcInN0cmluZ1wiXVxuICAgICAgfVxuICAgIH0sXG4gICAgXCJhZGRpdGlvbmFsUHJvcGVydGllc1wiOiBmYWxzZVxuICB9O1xufVxuXG5cbmZ1bmN0aW9uIF9nZXREZWZhdWx0T3B0aW9ucygpIHtcbiAgcmV0dXJuIHtcbiAgICBmcmFtZXdvcms6ICdleHRqcycsXG4gICAgdG9vbGtpdDogJ21vZGVybicsXG4gICAgdGhlbWU6ICd0aGVtZS1tYXRlcmlhbCcsXG4gICAgZW1pdDogJ3llcycsXG4gICAgc2NyaXB0OiBudWxsLFxuICAgIHBvcnQ6IDE5NjIsXG4gICAgcGFja2FnZXM6IFtdLFxuXG4gICAgcHJvZmlsZTogJycsIFxuICAgIGVudmlyb25tZW50OiAnZGV2ZWxvcG1lbnQnLCBcbiAgICB0cmVlc2hha2U6ICdubycsXG4gICAgYnJvd3NlcjogJ3llcycsXG4gICAgd2F0Y2g6ICd5ZXMnLFxuICAgIHZlcmJvc2U6ICdubydcbiAgfVxufVxuXG5cbiJdfQ==