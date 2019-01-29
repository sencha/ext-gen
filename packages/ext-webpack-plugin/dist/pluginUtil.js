"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._constructor = _constructor;
exports._compilation = _compilation;
exports._afterCompile = _afterCompile;
exports.emit = emit;
exports._prepareForBuild = _prepareForBuild;
exports._buildExtBundle = _buildExtBundle;
exports._done = _done;
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

  const fsx = require('fs-extra');

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
  log(thisVars.app + 'Generating production data: ' + thisOptions.genProdData);
  plugin.vars = thisVars;
  plugin.options = thisOptions;

  require('./pluginUtil').logv(options, 'FUNCTION constructor (end)');

  return plugin;
} //**********


function _compilation(compiler, compilation, vars, options) {
  try {
    require('./pluginUtil').logv(options, 'FUNCTION _compilation');

    const fsx = require('fs-extra');

    const fs = require('fs');

    const mkdirp = require('mkdirp');

    const path = require('path');

    const extAngularPackage = '@sencha/ext-angular';
    const extAngularFolder = 'ext-angular-prod';
    const extAngularModule = 'ext-angular.module';
    const pathToExtAngularModern = path.resolve(process.cwd(), `src/app/${extAngularFolder}`);
    var extComponents = [];

    if (vars.production) {
      if (options.framework == 'angular' && options.genProdData) {
        const packagePath = path.resolve(process.cwd(), 'node_modules/' + extAngularPackage);
        var files = fsx.readdirSync(`${packagePath}/lib`);
        files.forEach(fileName => {
          if (fileName && fileName.substr(0, 4) == 'ext-') {
            var end = fileName.substr(4).indexOf('.component');

            if (end >= 0) {
              extComponents.push(fileName.substring(4, end + 4));
            }
          }
        });

        try {
          const appModulePath = path.resolve(process.cwd(), 'src/app/app.module.ts');
          var js = fsx.readFileSync(appModulePath).toString();
          var newJs = js.replace(`import { ExtAngularModule } from '@sencha/ext-angular'`, `import { ExtAngularModule } from './ext-angular-prod/ext-angular.module'`);
          fsx.writeFileSync(appModulePath, newJs, 'utf-8', () => {
            return;
          });
          const mainPath = path.resolve(process.cwd(), 'src/main.ts');
          var jsMain = fsx.readFileSync(mainPath).toString();
          var newJsMain = jsMain.replace(`bootstrapModule(AppModule);`, `enableProdMode();bootstrapModule( AppModule );`);
          fsx.writeFileSync(mainPath, newJsMain, 'utf-8', () => {
            return;
          }); // Create the prod folder if does not exists.

          if (!fs.existsSync(pathToExtAngularModern)) {
            mkdirp.sync(pathToExtAngularModern);

            const t = require('./artifacts').extAngularModule('', '', '');

            fsx.writeFileSync(`${pathToExtAngularModern}/${extAngularModule}.ts`, t, 'utf-8', () => {
              return;
            });
          }
        } catch (e) {
          console.log(e);
          compilation.errors.push('buildModule hook in _compilation: ' + e);
          return [];
        }
      }

      compilation.hooks.succeedModule.tap(`ext-succeed-module`, module => {
        //require('./pluginUtil').logv(options, 'HOOK succeedModule')
        if (module.resource && !module.resource.match(/node_modules/)) {
          vars.deps = [...(vars.deps || []), ...require(`./${vars.framework}Util`).extractFromSource(module, options, compilation, extComponents)];
        } // if (extComponents.length && module.resource && (module.resource.match(/\.(j|t)sx?$/) ||
        // options.framework == 'angular' && module.resource.match(/\.html$/)) &&
        // !module.resource.match(/node_modules/) && !module.resource.match(`/ext-{$options.framework}/build/`)) {
        //   vars.deps = [...(vars.deps || []), ...require(`./${vars.framework}Util`).extractFromSource(module, options, compilation, extComponents)]
        // }

      });

      if (options.framework == 'angular' && options.genProdData) {
        compilation.hooks.finishModules.tap(`ext-finish-modules`, modules => {
          require('./pluginUtil').logv(options, 'HOOK finishModules');

          const string = 'Ext.create({\"xtype\":\"';
          vars.deps.forEach(code => {
            var index = code.indexOf(string);

            if (index >= 0) {
              code = code.substring(index + string.length);
              var end = code.indexOf('\"');
              vars.usedExtComponents.push(code.substr(0, end));
            }
          });
          vars.usedExtComponents = [...new Set(vars.usedExtComponents)];
          const readFrom = path.resolve(process.cwd(), 'node_modules/' + extAngularPackage + '/src/lib');
          const writeToPath = pathToExtAngularModern;
          const baseContent = fsx.readFileSync(`${readFrom}/base.ts`).toString();
          fsx.writeFileSync(`${writeToPath}/base.ts`, baseContent, 'utf-8', () => {
            return;
          });
          var writeToPathWritten = false;
          var moduleVars = {
            imports: '',
            exports: '',
            declarations: ''
          };
          vars.usedExtComponents.forEach(xtype => {
            var capclassname = xtype.charAt(0).toUpperCase() + xtype.replace(/-/g, "_").slice(1);
            moduleVars.imports = moduleVars.imports + `import { Ext${capclassname}Component } from './ext-${xtype}.component';\n`;
            moduleVars.exports = moduleVars.exports + `    Ext${capclassname}Component,\n`;
            moduleVars.declarations = moduleVars.declarations + `    Ext${capclassname}Component,\n`;
            var classFile = `/ext-${xtype}.component.ts`;
            const contents = fsx.readFileSync(`${readFrom}${classFile}`).toString();
            fsx.writeFileSync(`${writeToPath}${classFile}`, contents, 'utf-8', () => {
              return;
            });
            writeToPathWritten = true;
          });

          if (writeToPathWritten) {
            var t = require('./artifacts').extAngularModule(moduleVars.imports, moduleVars.exports, moduleVars.declarations);

            fsx.writeFileSync(`${writeToPath}/${extAngularModule}.ts`, t, 'utf-8', () => {
              return;
            });
          }
        });
      }
    }

    if (options.framework != 'extjs' && !options.genProdData) {
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


function _afterCompile(compiler, compilation, vars, options) {
  require('./pluginUtil').logv(options, 'FUNCTION _afterCompile');
} //**********


function emit(_x, _x2, _x3, _x4, _x5) {
  return _emit.apply(this, arguments);
} //**********


function _emit() {
  _emit = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee(compiler, compilation, vars, options, callback) {
    var log, logv, app, framework, path, _buildExtBundle, outputPath, command, parms;

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
            _context.next = 29;
            break;
          }

          if (framework != 'extjs') {
            _prepareForBuild(app, vars, options, outputPath, compilation);
          } else {
            if (options.framework == 'angular' && !options.genProdData) {
              require(`./${framework}Util`)._prepareForBuild(app, vars, options, outputPath, compilation);
            } else {
              require(`./${framework}Util`)._prepareForBuild(app, vars, options, outputPath, compilation);
            }
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
          return _buildExtBundle(app, compilation, outputPath, parms, options);

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
          log(`${vars.app}FUNCTION emit not run`);
          callback();

        case 31:
          _context.next = 38;
          break;

        case 33:
          _context.prev = 33;
          _context.t0 = _context["catch"](0);

          require('./pluginUtil').logv(options, _context.t0);

          compilation.errors.push('emit: ' + _context.t0);
          callback();

        case 38:
        case "end":
          return _context.stop();
      }
    }, _callee, this, [[0, 33]]);
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

      fs.writeFileSync(path.join(output, 'build.xml'), buildXML(vars.production, options, output), 'utf8');
      fs.writeFileSync(path.join(output, 'app.json'), createAppJson(theme, packages, toolkit, options, output), 'utf8');
      fs.writeFileSync(path.join(output, 'jsdom-environment.js'), createJSDOMEnvironment(options, output), 'utf8');
      fs.writeFileSync(path.join(output, 'workspace.json'), createWorkspaceJson(options, output), 'utf8');

      if (vars.framework == 'angular') {
        //because of a problem with colorpicker
        if (fs.existsSync(path.join(process.cwd(), 'ext-angular/ux/'))) {
          var fromPath = path.join(process.cwd(), 'ext-angular/');
          var toPath = path.join(output);
          fsx.copySync(fromPath, toPath);
          log(app + 'Copying (ux) ' + fromPath.replace(process.cwd(), '') + ' to: ' + toPath.replace(process.cwd(), ''));
        }

        if (fs.existsSync(path.join(process.cwd(), 'ext-angular/packages/'))) {
          var fromPath = path.join(process.cwd(), 'ext-angular/');
          var toPath = path.join(output);
          fsx.copySync(fromPath, toPath);
          log(app + 'Copying ' + fromPath.replace(process.cwd(), '') + ' to: ' + toPath.replace(process.cwd(), ''));
        }

        if (fs.existsSync(path.join(process.cwd(), 'ext-angular/overrides/'))) {
          var fromPath = path.join(process.cwd(), 'ext-angular/');
          var toPath = path.join(output);
          fsx.copySync(fromPath, toPath);
          log(app + 'Copying ' + fromPath.replace(process.cwd(), '') + ' to: ' + toPath.replace(process.cwd(), ''));
        }
      }

      if (vars.framework == 'react') {
        if (fs.existsSync(path.join(process.cwd(), 'ext-react/packages/'))) {
          var fromPath = path.join(process.cwd(), 'ext-react/packages/');
          var toPath = path.join(output, 'packages');
          fsx.copySync(fromPath, toPath);
          log(app + 'Copying ' + fromPath.replace(process.cwd(), '') + ' to: ' + toPath.replace(process.cwd(), ''));
        }

        if (fs.existsSync(path.join(process.cwd(), 'ext-react/overrides/'))) {
          var fromPath = path.join(process.cwd(), 'ext-react/overrides/');
          var toPath = path.join(output, 'overrides');
          fsx.copySync(fromPath, toPath);
          log(app + 'Copying ' + fromPath.replace(process.cwd(), '') + ' to: ' + toPath.replace(process.cwd(), ''));
        }
      }

      if (fs.existsSync(path.join(process.cwd(), 'resources/'))) {
        var fromResources = path.join(process.cwd(), 'resources/');
        var toResources = path.join(output, '../resources');
        fsx.copySync(fromResources, toResources);
        log(app + 'Copying ' + fromResources.replace(process.cwd(), '') + ' to: ' + toResources.replace(process.cwd(), ''));
      }

      if (fs.existsSync(path.join(process.cwd(), 'packages/'))) {
        var fromPackages = path.join(process.cwd(), 'packages/');
        var toPackages = path.join(output, 'packages');
        fsx.copySync(fromPackages, toPackages);
        log(app + 'Copying ' + fromPackages.replace(process.cwd(), '') + ' to: ' + toPackages.replace(process.cwd(), ''));
      }

      if (fs.existsSync(path.join(process.cwd(), 'overrides/'))) {
        var fromPath = path.join(process.cwd(), 'overrides/');
        var toPath = path.join(output, 'overrides');
        fsx.copySync(fromPath, toPath);
        log(app + 'Copying ' + fromPath.replace(process.cwd(), '') + ' to: ' + toPath.replace(process.cwd(), ''));
      }
    }

    vars.firstTime = false;
    var js = '';

    if (vars.production) {
      if (!vars.deps.includes('Ext.require("Ext.layout.*");\n')) {
        vars.deps.push('Ext.require("Ext.layout.*");\n');
      }

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
    console.log('e');

    require('./pluginUtil').logv(options, e);

    compilation.errors.push('_buildExtBundle: ' + e);
    callback();
  }
} //**********


function _done(vars, options) {
  try {
    const log = require('./pluginUtil').log;

    const logv = require('./pluginUtil').logv;

    logv(options, 'FUNCTION _done');

    if (vars.production && !options.genProdData && options.framework == 'angular') {
      const path = require('path');

      const fsx = require('fs-extra');

      var rimraf = require("rimraf");

      rimraf.sync(path.resolve(process.cwd(), `src/app/ext-angular-prod`));

      try {
        const appModulePath = path.resolve(process.cwd(), 'src/app/app.module.ts');
        var js = fsx.readFileSync(appModulePath).toString();
        var newJs = js.replace(`import { ExtAngularModule } from './ext-angular-prod/ext-angular.module'`, `import { ExtAngularModule } from '@sencha/ext-angular'`);
        fsx.writeFileSync(appModulePath, newJs, 'utf-8', () => {
          return;
        });
        const mainPath = path.resolve(process.cwd(), 'src/main.ts');
        var jsMain = fsx.readFileSync(mainPath).toString();
        var newJsMain = jsMain.replace(`enableProdMode();bootstrapModule( AppModule );`, `bootstrapModule(AppModule);`);
        fsx.writeFileSync(mainPath, newJsMain, 'utf-8', () => {
          return;
        });
      } catch (e) {
        console.log(e); //compilation.errors.push('replace ExtAngularModule - ext-done: ' + e)

        return [];
      }
    }

    try {
      if (options.browser == true && options.watch == 'yes' && vars.production == false) {
        if (vars.browserCount == 0) {
          var url = 'http://localhost:' + options.port;

          require('./pluginUtil').log(vars.app + `Opening browser at ${url}`);

          vars.browserCount++;

          const opn = require('opn');

          opn(url);
        }
      }
    } catch (e) {
      console.log(e); //compilation.errors.push('show browser window - ext-done: ' + e)
    }
  } catch (e) {
    require('./pluginUtil').logv(options, e);
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

  return app + 'ext-webpack-plugin v' + v.pluginVersion + ', Ext JS v' + v.extVersion + ' ' + v.edition + ' Edition, Sencha Cmd v' + v.cmdVersion + ', webpack v' + v.webpackVersion + frameworkInfo;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wbHVnaW5VdGlsLmpzIl0sIm5hbWVzIjpbIl9jb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJwYXRoIiwicmVxdWlyZSIsImZzIiwiZnN4IiwidGhpc1ZhcnMiLCJ0aGlzT3B0aW9ucyIsInBsdWdpbiIsImZyYW1ld29yayIsInVuZGVmaW5lZCIsInBsdWdpbkVycm9ycyIsInB1c2giLCJ2YXJzIiwidmFsaWRhdGVPcHRpb25zIiwiZ2V0VmFsaWRhdGVPcHRpb25zIiwiZ2V0RGVmYXVsdFZhcnMiLCJwbHVnaW5OYW1lIiwiYXBwIiwiX2dldEFwcCIsImxvZ3YiLCJyYyIsImV4aXN0c1N5bmMiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJnZXREZWZhdWx0T3B0aW9ucyIsInN0cmluZ2lmeSIsImVudmlyb25tZW50IiwicHJvZHVjdGlvbiIsImxvZyIsIl9nZXRWZXJzaW9ucyIsImdlblByb2REYXRhIiwiX2NvbXBpbGF0aW9uIiwiY29tcGlsZXIiLCJjb21waWxhdGlvbiIsIm1rZGlycCIsImV4dEFuZ3VsYXJQYWNrYWdlIiwiZXh0QW5ndWxhckZvbGRlciIsImV4dEFuZ3VsYXJNb2R1bGUiLCJwYXRoVG9FeHRBbmd1bGFyTW9kZXJuIiwicmVzb2x2ZSIsInByb2Nlc3MiLCJjd2QiLCJleHRDb21wb25lbnRzIiwicGFja2FnZVBhdGgiLCJmaWxlcyIsInJlYWRkaXJTeW5jIiwiZm9yRWFjaCIsImZpbGVOYW1lIiwic3Vic3RyIiwiZW5kIiwiaW5kZXhPZiIsInN1YnN0cmluZyIsImFwcE1vZHVsZVBhdGgiLCJqcyIsInRvU3RyaW5nIiwibmV3SnMiLCJyZXBsYWNlIiwid3JpdGVGaWxlU3luYyIsIm1haW5QYXRoIiwianNNYWluIiwibmV3SnNNYWluIiwic3luYyIsInQiLCJlIiwiY29uc29sZSIsImVycm9ycyIsImhvb2tzIiwic3VjY2VlZE1vZHVsZSIsInRhcCIsIm1vZHVsZSIsInJlc291cmNlIiwibWF0Y2giLCJkZXBzIiwiZXh0cmFjdEZyb21Tb3VyY2UiLCJmaW5pc2hNb2R1bGVzIiwibW9kdWxlcyIsInN0cmluZyIsImNvZGUiLCJpbmRleCIsImxlbmd0aCIsInVzZWRFeHRDb21wb25lbnRzIiwiU2V0IiwicmVhZEZyb20iLCJ3cml0ZVRvUGF0aCIsImJhc2VDb250ZW50Iiwid3JpdGVUb1BhdGhXcml0dGVuIiwibW9kdWxlVmFycyIsImltcG9ydHMiLCJleHBvcnRzIiwiZGVjbGFyYXRpb25zIiwieHR5cGUiLCJjYXBjbGFzc25hbWUiLCJjaGFyQXQiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwiY2xhc3NGaWxlIiwiY29udGVudHMiLCJodG1sV2VicGFja1BsdWdpbkJlZm9yZUh0bWxHZW5lcmF0aW9uIiwiZGF0YSIsIm91dHB1dFBhdGgiLCJkZXZTZXJ2ZXIiLCJqb2luIiwiY29udGVudEJhc2UiLCJ0cmltIiwianNQYXRoIiwiZXh0UGF0aCIsImNzc1BhdGgiLCJhc3NldHMiLCJ1bnNoaWZ0IiwiY3NzIiwiX2FmdGVyQ29tcGlsZSIsImVtaXQiLCJjYWxsYmFjayIsIl9idWlsZEV4dEJ1bmRsZSIsIl9wcmVwYXJlRm9yQnVpbGQiLCJjb21tYW5kIiwid2F0Y2giLCJyZWJ1aWxkIiwicGFybXMiLCJwcm9maWxlIiwid2F0Y2hTdGFydGVkIiwib3V0cHV0IiwicmltcmFmIiwicGFja2FnZXMiLCJ0b29sa2l0IiwidGhlbWUiLCJmaXJzdFRpbWUiLCJidWlsZFhNTCIsImNyZWF0ZUFwcEpzb24iLCJjcmVhdGVXb3Jrc3BhY2VKc29uIiwiY3JlYXRlSlNET01FbnZpcm9ubWVudCIsImZyb21QYXRoIiwidG9QYXRoIiwiY29weVN5bmMiLCJmcm9tUmVzb3VyY2VzIiwidG9SZXNvdXJjZXMiLCJmcm9tUGFja2FnZXMiLCJ0b1BhY2thZ2VzIiwiaW5jbHVkZXMiLCJtYW5pZmVzdCIsImJ1bmRsZURpciIsInNlbmNoYSIsIlByb21pc2UiLCJyZWplY3QiLCJvbkJ1aWxkRG9uZSIsIm9wdHMiLCJzaWxlbnQiLCJzdGRpbyIsImVuY29kaW5nIiwiZXhlY3V0ZUFzeW5jIiwidGhlbiIsInJlYXNvbiIsIl9kb25lIiwiYnJvd3NlciIsImJyb3dzZXJDb3VudCIsInVybCIsInBvcnQiLCJvcG4iLCJERUZBVUxUX1NVQlNUUlMiLCJzdWJzdHJpbmdzIiwiY2hhbGsiLCJjcm9zc1NwYXduIiwiY2hpbGQiLCJvbiIsInNpZ25hbCIsIkVycm9yIiwiZXJyb3IiLCJzdGRvdXQiLCJzdHIiLCJzb21lIiwidiIsInJlZCIsInN0ZGVyciIsInN0ckphdmFPcHRzIiwicyIsImN1cnNvclRvIiwiY2xlYXJMaW5lIiwid3JpdGUiLCJ2ZXJib3NlIiwicHJlZml4IiwicGxhdGZvcm0iLCJncmVlbiIsImZyYW1ld29ya05hbWUiLCJwbHVnaW5QYXRoIiwicGx1Z2luUGtnIiwicGx1Z2luVmVyc2lvbiIsInZlcnNpb24iLCJfcmVzb2x2ZWQiLCJlZGl0aW9uIiwid2VicGFja1BhdGgiLCJ3ZWJwYWNrUGtnIiwid2VicGFja1ZlcnNpb24iLCJleHRQa2ciLCJleHRWZXJzaW9uIiwiY21kUGF0aCIsImNtZFBrZyIsImNtZFZlcnNpb24iLCJ2ZXJzaW9uX2Z1bGwiLCJmcmFtZXdvcmtJbmZvIiwiZnJhbWV3b3JrUGF0aCIsImZyYW1ld29ya1BrZyIsImZyYW1ld29ya1ZlcnNpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDTyxTQUFTQSxZQUFULENBQXNCQyxPQUF0QixFQUErQjtBQUNwQyxRQUFNQyxJQUFJLEdBQUdDLE9BQU8sQ0FBQyxNQUFELENBQXBCOztBQUNBLFFBQU1DLEVBQUUsR0FBR0QsT0FBTyxDQUFDLElBQUQsQ0FBbEI7O0FBQ0EsUUFBTUUsR0FBRyxHQUFHRixPQUFPLENBQUMsVUFBRCxDQUFuQjs7QUFFQSxNQUFJRyxRQUFRLEdBQUcsRUFBZjtBQUNBLE1BQUlDLFdBQVcsR0FBRyxFQUFsQjtBQUNBLE1BQUlDLE1BQU0sR0FBRyxFQUFiOztBQUVBLE1BQUlQLE9BQU8sQ0FBQ1EsU0FBUixJQUFxQkMs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QixFQUFnQztBQUM5QmlCLE1BQUFBLGFBQWEsR0FBR3ZNLElBQUksQ0FBQ3VDLE9BQUwsQ0FBYUMsT0FBTyxDQUFDQyxHQUFSLEVBQWIsRUFBMkIsNEJBQTNCLENBQWhCO0FBQ0Q7O0FBQ0QsUUFBSStKLFlBQVksR0FBSXRNLEVBQUUsQ0FBQ2tCLFVBQUgsQ0FBY21MLGFBQWEsR0FBQyxlQUE1QixLQUFnRGxMLElBQUksQ0FBQ0MsS0FBTCxDQUFXcEIsRUFBRSxDQUFDcUIsWUFBSCxDQUFnQmdMLGFBQWEsR0FBQyxlQUE5QixFQUErQyxPQUEvQyxDQUFYLENBQWhELElBQXVILEVBQTNJO0FBQ0E3QixJQUFBQSxDQUFDLENBQUMrQixnQkFBRixHQUFxQkQsWUFBWSxDQUFDZCxPQUFsQztBQUNBWSxJQUFBQSxhQUFhLEdBQUcsT0FBT2hCLGFBQVAsR0FBdUIsSUFBdkIsR0FBOEJaLENBQUMsQ0FBQytCLGdCQUFoRDtBQUNEOztBQUNELFNBQU96TCxHQUFHLEdBQUcsc0JBQU4sR0FBK0IwSixDQUFDLENBQUNlLGFBQWpDLEdBQWlELFlBQWpELEdBQWdFZixDQUFDLENBQUN1QixVQUFsRSxHQUErRSxHQUEvRSxHQUFxRnZCLENBQUMsQ0FBQ2tCLE9BQXZGLEdBQWlHLHdCQUFqRyxHQUE0SGxCLENBQUMsQ0FBQzBCLFVBQTlILEdBQTJJLGFBQTNJLEdBQTJKMUIsQ0FBQyxDQUFDcUIsY0FBN0osR0FBOEtPLGFBQXJMO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIvLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBfY29uc3RydWN0b3Iob3B0aW9ucykge1xuICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKVxuICBjb25zdCBmc3ggPSByZXF1aXJlKCdmcy1leHRyYScpXG5cbiAgdmFyIHRoaXNWYXJzID0ge31cbiAgdmFyIHRoaXNPcHRpb25zID0ge31cbiAgdmFyIHBsdWdpbiA9IHt9XG5cbiAgaWYgKG9wdGlvbnMuZnJhbWV3b3JrID09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNWYXJzLnBsdWdpbkVycm9ycyA9IFtdXG4gICAgdGhpc1ZhcnMucGx1Z2luRXJyb3JzLnB1c2goJ3dlYnBhY2sgY29uZmlnOiBmcmFtZXdvcmsgcGFyYW1ldGVyIG9uIGV4dC13ZWJwYWNrLXBsdWdpbiBpcyBub3QgZGVmaW5lZCAtIHZhbHVlczogcmVhY3QsIGFuZ3VsYXIsIGV4dGpzJylcbiAgICBwbHVnaW4udmFycyA9IHRoaXNWYXJzXG4gICAgcmV0dXJuIHBsdWdpblxuICB9XG5cbiAgY29uc3QgdmFsaWRhdGVPcHRpb25zID0gcmVxdWlyZSgnc2NoZW1hLXV0aWxzJylcbiAgdmFsaWRhdGVPcHRpb25zKHJlcXVpcmUoYC4vJHtvcHRpb25zLmZyYW1ld29ya31VdGlsYCkuZ2V0VmFsaWRhdGVPcHRpb25zKCksIG9wdGlvbnMsICcnKVxuICB0aGlzVmFycyA9IHJlcXVpcmUoYC4vJHtvcHRpb25zLmZyYW1ld29ya31VdGlsYCkuZ2V0RGVmYXVsdFZhcnMoKVxuICB0aGlzVmFycy5mcmFtZXdvcmsgPSBvcHRpb25zLmZyYW1ld29ya1xuICBzd2l0Y2godGhpc1ZhcnMuZnJhbWV3b3JrKSB7XG4gICAgY2FzZSAnZXh0anMnOlxuICAgICAgdGhpc1ZhcnMucGx1Z2luTmFtZSA9ICdleHQtd2VicGFjay1wbHVnaW4nXG4gICAgICBicmVhaztcbiAgICBjYXNlICdyZWFjdCc6XG4gICAgICB0aGlzVmFycy5wbHVnaW5OYW1lID0gJ2V4dC1yZWFjdC13ZWJwYWNrLXBsdWdpbidcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2FuZ3VsYXInOlxuICAgICAgdGhpc1ZhcnMucGx1Z2luTmFtZSA9ICdleHQtYW5ndWxhci13ZWJwYWNrLXBsdWdpbidcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aGlzVmFycy5wbHVnaW5OYW1lID0gJ2V4dC13ZWJwYWNrLXBsdWdpbidcbiAgfVxuXG4gIHRoaXNWYXJzLmFwcCA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLl9nZXRBcHAoKVxuICBsb2d2KG9wdGlvbnMsIGBwbHVnaW5OYW1lIC0gJHt0aGlzVmFycy5wbHVnaW5OYW1lfWApXG4gIGxvZ3Yob3B0aW9ucywgYHRoaXNWYXJzLmFwcCAtICR7dGhpc1ZhcnMuYXBwfWApXG5cbiAgY29uc3QgcmMgPSAoZnMuZXhpc3RzU3luYyhgLmV4dC0ke3RoaXNWYXJzLmZyYW1ld29ya31yY2ApICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGAuZXh0LSR7dGhpc1ZhcnMuZnJhbWV3b3JrfXJjYCwgJ3V0Zi04JykpIHx8IHt9KVxuICB0aGlzT3B0aW9ucyA9IHsgLi4ucmVxdWlyZShgLi8ke3RoaXNWYXJzLmZyYW1ld29ya31VdGlsYCkuZ2V0RGVmYXVsdE9wdGlvbnMoKSwgLi4ub3B0aW9ucywgLi4ucmMgfVxuICBsb2d2KG9wdGlvbnMsIGB0aGlzT3B0aW9ucyAtICR7SlNPTi5zdHJpbmdpZnkodGhpc09wdGlvbnMpfWApXG5cbiAgaWYgKHRoaXNPcHRpb25zLmVudmlyb25tZW50ID09ICdwcm9kdWN0aW9uJykgXG4gICAge3RoaXNWYXJzLnByb2R1Y3Rpb24gPSB0cnVlfVxuICBlbHNlIFxuICAgIHt0aGlzVmFycy5wcm9kdWN0aW9uID0gZmFsc2V9XG5cbiAgbG9nKHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLl9nZXRWZXJzaW9ucyh0aGlzVmFycy5hcHAsIHRoaXNWYXJzLnBsdWdpbk5hbWUsIHRoaXNWYXJzLmZyYW1ld29yaykpXG4gIGxvZyh0aGlzVmFycy5hcHAgKyAnQnVpbGRpbmcgZm9yICcgKyB0aGlzT3B0aW9ucy5lbnZpcm9ubWVudClcbiAgbG9nKHRoaXNWYXJzLmFwcCArICdHZW5lcmF0aW5nIHByb2R1Y3Rpb24gZGF0YTogJyArIHRoaXNPcHRpb25zLmdlblByb2REYXRhKVxuXG4gIHBsdWdpbi52YXJzID0gdGhpc1ZhcnNcbiAgcGx1Z2luLm9wdGlvbnMgPSB0aGlzT3B0aW9uc1xuICByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2d2KG9wdGlvbnMsICdGVU5DVElPTiBjb25zdHJ1Y3RvciAoZW5kKScpXG4gIHJldHVybiBwbHVnaW5cbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gX2NvbXBpbGF0aW9uKGNvbXBpbGVyLCBjb21waWxhdGlvbiwgdmFycywgb3B0aW9ucykge1xuICB0cnkge1xuICAgIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3Yob3B0aW9ucywgJ0ZVTkNUSU9OIF9jb21waWxhdGlvbicpXG5cbiAgICBjb25zdCBmc3ggPSByZXF1aXJlKCdmcy1leHRyYScpXG4gICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG4gICAgY29uc3QgbWtkaXJwID0gcmVxdWlyZSgnbWtkaXJwJylcbiAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbiAgICBjb25zdCBleHRBbmd1bGFyUGFja2FnZSA9ICdAc2VuY2hhL2V4dC1hbmd1bGFyJ1xuICAgIGNvbnN0IGV4dEFuZ3VsYXJGb2xkZXIgPSAnZXh0LWFuZ3VsYXItcHJvZCdcbiAgICBjb25zdCBleHRBbmd1bGFyTW9kdWxlID0gJ2V4dC1hbmd1bGFyLm1vZHVsZSdcbiAgICBjb25zdCBwYXRoVG9FeHRBbmd1bGFyTW9kZXJuID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIGBzcmMvYXBwLyR7ZXh0QW5ndWxhckZvbGRlcn1gKVxuICAgIHZhciBleHRDb21wb25lbnRzID0gW11cblxuICAgIGlmICh2YXJzLnByb2R1Y3Rpb24pIHtcbiAgICAgIGlmIChvcHRpb25zLmZyYW1ld29yayA9PSAnYW5ndWxhcicgJiYgb3B0aW9ucy5nZW5Qcm9kRGF0YSkge1xuICAgICAgICBjb25zdCBwYWNrYWdlUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnbm9kZV9tb2R1bGVzLycgKyBleHRBbmd1bGFyUGFja2FnZSlcbiAgICAgICAgdmFyIGZpbGVzID0gZnN4LnJlYWRkaXJTeW5jKGAke3BhY2thZ2VQYXRofS9saWJgKVxuICAgICAgICBmaWxlcy5mb3JFYWNoKChmaWxlTmFtZSkgPT4ge1xuICAgICAgICAgIGlmIChmaWxlTmFtZSAmJiBmaWxlTmFtZS5zdWJzdHIoMCwgNCkgPT0gJ2V4dC0nKSB7XG4gICAgICAgICAgICB2YXIgZW5kID0gZmlsZU5hbWUuc3Vic3RyKDQpLmluZGV4T2YoJy5jb21wb25lbnQnKVxuICAgICAgICAgICAgaWYgKGVuZCA+PSAwKSB7XG4gICAgICAgICAgICAgIGV4dENvbXBvbmVudHMucHVzaChmaWxlTmFtZS5zdWJzdHJpbmcoNCwgZW5kICsgNCkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuXG4gICAgICAgIHRyeSB7XG5cblxuICAgICAgICAgIGNvbnN0IGFwcE1vZHVsZVBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ3NyYy9hcHAvYXBwLm1vZHVsZS50cycpXG4gICAgICAgICAgdmFyIGpzID0gZnN4LnJlYWRGaWxlU3luYyhhcHBNb2R1bGVQYXRoKS50b1N0cmluZygpXG4gICAgICAgICAgdmFyIG5ld0pzID0ganMucmVwbGFjZShcbiAgICAgICAgICAgIGBpbXBvcnQgeyBFeHRBbmd1bGFyTW9kdWxlIH0gZnJvbSAnQHNlbmNoYS9leHQtYW5ndWxhcidgLFxuICAgICAgICAgICAgYGltcG9ydCB7IEV4dEFuZ3VsYXJNb2R1bGUgfSBmcm9tICcuL2V4dC1hbmd1bGFyLXByb2QvZXh0LWFuZ3VsYXIubW9kdWxlJ2BcbiAgICAgICAgICApO1xuICAgICAgICAgIGZzeC53cml0ZUZpbGVTeW5jKGFwcE1vZHVsZVBhdGgsIG5ld0pzLCAndXRmLTgnLCAoKT0+e3JldHVybn0pXG5cbiAgICAgICAgICBjb25zdCBtYWluUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnc3JjL21haW4udHMnKVxuICAgICAgICAgIHZhciBqc01haW4gPSBmc3gucmVhZEZpbGVTeW5jKG1haW5QYXRoKS50b1N0cmluZygpXG4gICAgICAgICAgdmFyIG5ld0pzTWFpbiA9IGpzTWFpbi5yZXBsYWNlKFxuICAgICAgICAgICAgYGJvb3RzdHJhcE1vZHVsZShBcHBNb2R1bGUpO2AsXG4gICAgICAgICAgICBgZW5hYmxlUHJvZE1vZGUoKTtib290c3RyYXBNb2R1bGUoIEFwcE1vZHVsZSApO2BcbiAgICAgICAgICApO1xuICAgICAgICAgIGZzeC53cml0ZUZpbGVTeW5jKG1haW5QYXRoLCBuZXdKc01haW4sICd1dGYtOCcsICgpPT57cmV0dXJufSlcblxuICAgICAgICAgIC8vIENyZWF0ZSB0aGUgcHJvZCBmb2xkZXIgaWYgZG9lcyBub3QgZXhpc3RzLlxuICAgICAgICAgIGlmICghZnMuZXhpc3RzU3luYyhwYXRoVG9FeHRBbmd1bGFyTW9kZXJuKSkge1xuICAgICAgICAgICAgbWtkaXJwLnN5bmMocGF0aFRvRXh0QW5ndWxhck1vZGVybilcbiAgICAgICAgICAgIGNvbnN0IHQgPSByZXF1aXJlKCcuL2FydGlmYWN0cycpLmV4dEFuZ3VsYXJNb2R1bGUoJycsICcnLCAnJylcbiAgICAgICAgICAgIGZzeC53cml0ZUZpbGVTeW5jKGAke3BhdGhUb0V4dEFuZ3VsYXJNb2Rlcm59LyR7ZXh0QW5ndWxhck1vZHVsZX0udHNgLCB0LCAndXRmLTgnLCAoKSA9PiB7cmV0dXJufSlcbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZSkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGUpXG4gICAgICAgICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goJ2J1aWxkTW9kdWxlIGhvb2sgaW4gX2NvbXBpbGF0aW9uOiAnICsgZSlcbiAgICAgICAgICByZXR1cm4gW11cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb21waWxhdGlvbi5ob29rcy5zdWNjZWVkTW9kdWxlLnRhcChgZXh0LXN1Y2NlZWQtbW9kdWxlYCwgbW9kdWxlID0+IHtcbiAgICAgICAgLy9yZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2d2KG9wdGlvbnMsICdIT09LIHN1Y2NlZWRNb2R1bGUnKVxuICAgICAgICBpZiAobW9kdWxlLnJlc291cmNlICYmICFtb2R1bGUucmVzb3VyY2UubWF0Y2goL25vZGVfbW9kdWxlcy8pKSB7XG4gICAgICAgICAgdmFycy5kZXBzID0gWy4uLih2YXJzLmRlcHMgfHwgW10pLCAuLi5yZXF1aXJlKGAuLyR7dmFycy5mcmFtZXdvcmt9VXRpbGApLmV4dHJhY3RGcm9tU291cmNlKG1vZHVsZSwgb3B0aW9ucywgY29tcGlsYXRpb24sIGV4dENvbXBvbmVudHMpXVxuICAgICAgICB9XG4gICAgICAgIC8vIGlmIChleHRDb21wb25lbnRzLmxlbmd0aCAmJiBtb2R1bGUucmVzb3VyY2UgJiYgKG1vZHVsZS5yZXNvdXJjZS5tYXRjaCgvXFwuKGp8dClzeD8kLykgfHxcbiAgICAgICAgLy8gb3B0aW9ucy5mcmFtZXdvcmsgPT0gJ2FuZ3VsYXInICYmIG1vZHVsZS5yZXNvdXJjZS5tYXRjaCgvXFwuaHRtbCQvKSkgJiZcbiAgICAgICAgLy8gIW1vZHVsZS5yZXNvdXJjZS5tYXRjaCgvbm9kZV9tb2R1bGVzLykgJiYgIW1vZHVsZS5yZXNvdXJjZS5tYXRjaChgL2V4dC17JG9wdGlvbnMuZnJhbWV3b3JrfS9idWlsZC9gKSkge1xuICAgICAgICAvLyAgIHZhcnMuZGVwcyA9IFsuLi4odmFycy5kZXBzIHx8IFtdKSwgLi4ucmVxdWlyZShgLi8ke3ZhcnMuZnJhbWV3b3JrfVV0aWxgKS5leHRyYWN0RnJvbVNvdXJjZShtb2R1bGUsIG9wdGlvbnMsIGNvbXBpbGF0aW9uLCBleHRDb21wb25lbnRzKV1cbiAgICAgICAgLy8gfVxuICAgICAgfSlcblxuICAgICAgaWYgKG9wdGlvbnMuZnJhbWV3b3JrID09ICdhbmd1bGFyJyAmJiBvcHRpb25zLmdlblByb2REYXRhKSB7XG5cblxuXG4gICAgICAgIGNvbXBpbGF0aW9uLmhvb2tzLmZpbmlzaE1vZHVsZXMudGFwKGBleHQtZmluaXNoLW1vZHVsZXNgLCBtb2R1bGVzID0+IHtcbiAgICAgICAgICByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2d2KG9wdGlvbnMsICdIT09LIGZpbmlzaE1vZHVsZXMnKVxuICAgICAgICAgIGNvbnN0IHN0cmluZyA9ICdFeHQuY3JlYXRlKHtcXFwieHR5cGVcXFwiOlxcXCInXG4gICAgICAgICAgdmFycy5kZXBzLmZvckVhY2goY29kZSA9PiB7XG4gICAgICAgICAgICB2YXIgaW5kZXggPSBjb2RlLmluZGV4T2Yoc3RyaW5nKVxuICAgICAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICAgICAgY29kZSA9IGNvZGUuc3Vic3RyaW5nKGluZGV4ICsgc3RyaW5nLmxlbmd0aClcbiAgICAgICAgICAgICAgdmFyIGVuZCA9IGNvZGUuaW5kZXhPZignXFxcIicpXG4gICAgICAgICAgICAgIHZhcnMudXNlZEV4dENvbXBvbmVudHMucHVzaChjb2RlLnN1YnN0cigwLCBlbmQpKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgdmFycy51c2VkRXh0Q29tcG9uZW50cyA9IFsuLi5uZXcgU2V0KHZhcnMudXNlZEV4dENvbXBvbmVudHMpXVxuICAgICAgICAgIGNvbnN0IHJlYWRGcm9tID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdub2RlX21vZHVsZXMvJyArIGV4dEFuZ3VsYXJQYWNrYWdlICsgJy9zcmMvbGliJylcbiAgICAgICAgICBjb25zdCB3cml0ZVRvUGF0aCA9IHBhdGhUb0V4dEFuZ3VsYXJNb2Rlcm5cblxuICAgICAgICAgIGNvbnN0IGJhc2VDb250ZW50ID0gZnN4LnJlYWRGaWxlU3luYyhgJHtyZWFkRnJvbX0vYmFzZS50c2ApLnRvU3RyaW5nKClcbiAgICAgICAgICBmc3gud3JpdGVGaWxlU3luYyhgJHt3cml0ZVRvUGF0aH0vYmFzZS50c2AsIGJhc2VDb250ZW50LCAndXRmLTgnLCAoKT0+e3JldHVybn0pXG4gICAgICAgICAgXG4gICAgICAgICAgdmFyIHdyaXRlVG9QYXRoV3JpdHRlbiA9IGZhbHNlXG4gICAgICAgICAgdmFyIG1vZHVsZVZhcnMgPSB7XG4gICAgICAgICAgICBpbXBvcnRzOiAnJyxcbiAgICAgICAgICAgIGV4cG9ydHM6ICcnLFxuICAgICAgICAgICAgZGVjbGFyYXRpb25zOiAnJ1xuICAgICAgICAgIH1cbiAgICAgICAgICB2YXJzLnVzZWRFeHRDb21wb25lbnRzLmZvckVhY2goeHR5cGUgPT4ge1xuICAgICAgICAgICAgdmFyIGNhcGNsYXNzbmFtZSA9IHh0eXBlLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgeHR5cGUucmVwbGFjZSgvLS9nLCBcIl9cIikuc2xpY2UoMSlcbiAgICAgICAgICAgIG1vZHVsZVZhcnMuaW1wb3J0cyA9IG1vZHVsZVZhcnMuaW1wb3J0cyArIGBpbXBvcnQgeyBFeHQke2NhcGNsYXNzbmFtZX1Db21wb25lbnQgfSBmcm9tICcuL2V4dC0ke3h0eXBlfS5jb21wb25lbnQnO1xcbmBcbiAgICAgICAgICAgIG1vZHVsZVZhcnMuZXhwb3J0cyA9IG1vZHVsZVZhcnMuZXhwb3J0cyArIGAgICAgRXh0JHtjYXBjbGFzc25hbWV9Q29tcG9uZW50LFxcbmBcbiAgICAgICAgICAgIG1vZHVsZVZhcnMuZGVjbGFyYXRpb25zID0gbW9kdWxlVmFycy5kZWNsYXJhdGlvbnMgKyBgICAgIEV4dCR7Y2FwY2xhc3NuYW1lfUNvbXBvbmVudCxcXG5gXG4gICAgICAgICAgICB2YXIgY2xhc3NGaWxlID0gYC9leHQtJHt4dHlwZX0uY29tcG9uZW50LnRzYFxuICAgICAgICAgICAgY29uc3QgY29udGVudHMgPSBmc3gucmVhZEZpbGVTeW5jKGAke3JlYWRGcm9tfSR7Y2xhc3NGaWxlfWApLnRvU3RyaW5nKClcbiAgICAgICAgICAgIGZzeC53cml0ZUZpbGVTeW5jKGAke3dyaXRlVG9QYXRofSR7Y2xhc3NGaWxlfWAsIGNvbnRlbnRzLCAndXRmLTgnLCAoKT0+e3JldHVybn0pXG4gICAgICAgICAgICB3cml0ZVRvUGF0aFdyaXR0ZW4gPSB0cnVlXG4gICAgICAgICAgfSlcbiAgICAgICAgICBpZiAod3JpdGVUb1BhdGhXcml0dGVuKSB7XG4gICAgICAgICAgICB2YXIgdCA9IHJlcXVpcmUoJy4vYXJ0aWZhY3RzJykuZXh0QW5ndWxhck1vZHVsZShcbiAgICAgICAgICAgICAgbW9kdWxlVmFycy5pbXBvcnRzLCBtb2R1bGVWYXJzLmV4cG9ydHMsIG1vZHVsZVZhcnMuZGVjbGFyYXRpb25zXG4gICAgICAgICAgICApXG4gICAgICAgICAgICBmc3gud3JpdGVGaWxlU3luYyhgJHt3cml0ZVRvUGF0aH0vJHtleHRBbmd1bGFyTW9kdWxlfS50c2AsIHQsICd1dGYtOCcsICgpPT57cmV0dXJufSlcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICB9XG5cblxuICAgIH1cblxuICAgIGlmIChvcHRpb25zLmZyYW1ld29yayAhPSAnZXh0anMnICYmICFvcHRpb25zLmdlblByb2REYXRhKSB7XG5cbiAgICAgIGNvbXBpbGF0aW9uLmhvb2tzLmh0bWxXZWJwYWNrUGx1Z2luQmVmb3JlSHRtbEdlbmVyYXRpb24udGFwKGBleHQtaHRtbC1nZW5lcmF0aW9uYCwoZGF0YSkgPT4ge1xuICAgICAgICBsb2d2KG9wdGlvbnMsJ0hPT0sgZXh0LWh0bWwtZ2VuZXJhdGlvbicpXG4gICAgICAgIGNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbiAgICAgICAgdmFyIG91dHB1dFBhdGggPSAnJ1xuICAgICAgICBpZiAoY29tcGlsZXIub3B0aW9ucy5kZXZTZXJ2ZXIpIHtcbiAgICAgICAgICBpZiAoY29tcGlsZXIub3V0cHV0UGF0aCA9PT0gJy8nKSB7XG4gICAgICAgICAgICBvdXRwdXRQYXRoID0gcGF0aC5qb2luKGNvbXBpbGVyLm9wdGlvbnMuZGV2U2VydmVyLmNvbnRlbnRCYXNlLCBvdXRwdXRQYXRoKVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGlmIChjb21waWxlci5vcHRpb25zLmRldlNlcnZlci5jb250ZW50QmFzZSA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgb3V0cHV0UGF0aCA9ICdidWlsZCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICBvdXRwdXRQYXRoID0gJydcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgb3V0cHV0UGF0aCA9ICdidWlsZCdcbiAgICAgICAgfVxuICAgICAgICBvdXRwdXRQYXRoID0gb3V0cHV0UGF0aC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKS50cmltKClcbiAgICAgICAgdmFyIGpzUGF0aCA9IHBhdGguam9pbihvdXRwdXRQYXRoLCB2YXJzLmV4dFBhdGgsICdleHQuanMnKVxuICAgICAgICB2YXIgY3NzUGF0aCA9IHBhdGguam9pbihvdXRwdXRQYXRoLCB2YXJzLmV4dFBhdGgsICdleHQuY3NzJylcbiAgICAgICAgZGF0YS5hc3NldHMuanMudW5zaGlmdChqc1BhdGgpXG4gICAgICAgIGRhdGEuYXNzZXRzLmNzcy51bnNoaWZ0KGNzc1BhdGgpXG4gICAgICAgIGxvZyh2YXJzLmFwcCArIGBBZGRpbmcgJHtqc1BhdGh9IGFuZCAke2Nzc1BhdGh9IHRvIGluZGV4Lmh0bWxgKVxuICAgICAgfSlcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBsb2d2KG9wdGlvbnMsJ3NraXBwZWQgSE9PSyBleHQtaHRtbC1nZW5lcmF0aW9uJylcbiAgICB9XG4gIH1cbiAgY2F0Y2goZSkge1xuICAgIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3Yob3B0aW9ucyxlKVxuICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKCdfY29tcGlsYXRpb246ICcgKyBlKVxuICB9XG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF9hZnRlckNvbXBpbGUoY29tcGlsZXIsIGNvbXBpbGF0aW9uLCB2YXJzLCBvcHRpb25zKSB7XG4gIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3Yob3B0aW9ucywgJ0ZVTkNUSU9OIF9hZnRlckNvbXBpbGUnKVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBlbWl0KGNvbXBpbGVyLCBjb21waWxhdGlvbiwgdmFycywgb3B0aW9ucywgY2FsbGJhY2spIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBsb2cgPSByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2dcbiAgICBjb25zdCBsb2d2ID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndlxuICAgIGxvZ3Yob3B0aW9ucywnRlVOQ1RJT04gZW1pdCcpXG4gICAgdmFyIGFwcCA9IHZhcnMuYXBwXG4gICAgdmFyIGZyYW1ld29yayA9IHZhcnMuZnJhbWV3b3JrXG4gICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuICAgIGNvbnN0IF9idWlsZEV4dEJ1bmRsZSA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLl9idWlsZEV4dEJ1bmRsZVxuICAgIGxldCBvdXRwdXRQYXRoID0gcGF0aC5qb2luKGNvbXBpbGVyLm91dHB1dFBhdGgsdmFycy5leHRQYXRoKVxuICAgIGlmIChjb21waWxlci5vdXRwdXRQYXRoID09PSAnLycgJiYgY29tcGlsZXIub3B0aW9ucy5kZXZTZXJ2ZXIpIHtcbiAgICAgIG91dHB1dFBhdGggPSBwYXRoLmpvaW4oY29tcGlsZXIub3B0aW9ucy5kZXZTZXJ2ZXIuY29udGVudEJhc2UsIG91dHB1dFBhdGgpXG4gICAgfVxuICAgIGxvZ3Yob3B0aW9ucywnb3V0cHV0UGF0aDogJyArIG91dHB1dFBhdGgpXG4gICAgbG9ndihvcHRpb25zLCdmcmFtZXdvcms6ICcgKyBmcmFtZXdvcmspXG4gICAgaWYgKG9wdGlvbnMuZW1pdCA9PSB0cnVlKSB7XG4gICAgICBpZiAoZnJhbWV3b3JrICE9ICdleHRqcycpIHtcbiAgICAgICAgX3ByZXBhcmVGb3JCdWlsZChhcHAsIHZhcnMsIG9wdGlvbnMsIG91dHB1dFBhdGgsIGNvbXBpbGF0aW9uKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGlmIChvcHRpb25zLmZyYW1ld29yayA9PSAnYW5ndWxhcicgJiYgIW9wdGlvbnMuZ2VuUHJvZERhdGEpIHtcbiAgICAgICAgICByZXF1aXJlKGAuLyR7ZnJhbWV3b3JrfVV0aWxgKS5fcHJlcGFyZUZvckJ1aWxkKGFwcCwgdmFycywgb3B0aW9ucywgb3V0cHV0UGF0aCwgY29tcGlsYXRpb24pXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgcmVxdWlyZShgLi8ke2ZyYW1ld29ya31VdGlsYCkuX3ByZXBhcmVGb3JCdWlsZChhcHAsIHZhcnMsIG9wdGlvbnMsIG91dHB1dFBhdGgsIGNvbXBpbGF0aW9uKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHZhciBjb21tYW5kID0gJydcbiAgICAgIGlmIChvcHRpb25zLndhdGNoID09ICd5ZXMnICYmIHZhcnMucHJvZHVjdGlvbiA9PSBmYWxzZSkge1xuICAgICAgICBjb21tYW5kID0gJ3dhdGNoJ1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNvbW1hbmQgPSAnYnVpbGQnXG4gICAgICB9XG5cbiAgICAgIGlmICh2YXJzLnJlYnVpbGQgPT0gdHJ1ZSkge1xuICAgICAgICB2YXIgcGFybXMgPSBbXVxuICAgICAgICBpZiAob3B0aW9ucy5wcm9maWxlID09IHVuZGVmaW5lZCB8fCBvcHRpb25zLnByb2ZpbGUgPT0gJycgfHwgb3B0aW9ucy5wcm9maWxlID09IG51bGwpIHtcbiAgICAgICAgICBpZiAoY29tbWFuZCA9PSAnYnVpbGQnKSB7XG4gICAgICAgICAgICBwYXJtcyA9IFsnYXBwJywgY29tbWFuZCwgb3B0aW9ucy5lbnZpcm9ubWVudF1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwYXJtcyA9IFsnYXBwJywgY29tbWFuZCwgJy0td2ViLXNlcnZlcicsICdmYWxzZScsIG9wdGlvbnMuZW52aXJvbm1lbnRdXG4gICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgaWYgKGNvbW1hbmQgPT0gJ2J1aWxkJykge1xuICAgICAgICAgICAgcGFybXMgPSBbJ2FwcCcsIGNvbW1hbmQsIG9wdGlvbnMucHJvZmlsZSwgb3B0aW9ucy5lbnZpcm9ubWVudF1cbiAgICAgICAgICB9XG4gICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwYXJtcyA9IFsnYXBwJywgY29tbWFuZCwgJy0td2ViLXNlcnZlcicsICdmYWxzZScsIG9wdGlvbnMucHJvZmlsZSwgb3B0aW9ucy5lbnZpcm9ubWVudF1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodmFycy53YXRjaFN0YXJ0ZWQgPT0gZmFsc2UpIHtcbiAgICAgICAgICBhd2FpdCBfYnVpbGRFeHRCdW5kbGUoYXBwLCBjb21waWxhdGlvbiwgb3V0cHV0UGF0aCwgcGFybXMsIG9wdGlvbnMpXG4gICAgICAgICAgdmFycy53YXRjaFN0YXJ0ZWQgPSB0cnVlXG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2soKVxuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrKClcbiAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBsb2coYCR7dmFycy5hcHB9RlVOQ1RJT04gZW1pdCBub3QgcnVuYClcbiAgICAgIGNhbGxiYWNrKClcbiAgICB9XG4gIH1cbiAgY2F0Y2goZSkge1xuICAgIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3Yob3B0aW9ucyxlKVxuICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKCdlbWl0OiAnICsgZSlcbiAgICBjYWxsYmFjaygpXG4gIH1cbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gX3ByZXBhcmVGb3JCdWlsZChhcHAsIHZhcnMsIG9wdGlvbnMsIG91dHB1dCwgY29tcGlsYXRpb24pIHtcbiAgdHJ5IHtcbiAgICBsb2d2KG9wdGlvbnMsJ0ZVTkNUSU9OIF9wcmVwYXJlRm9yQnVpbGQnKVxuICAgIGNvbnN0IHJpbXJhZiA9IHJlcXVpcmUoJ3JpbXJhZicpXG4gICAgY29uc3QgbWtkaXJwID0gcmVxdWlyZSgnbWtkaXJwJylcbiAgICBjb25zdCBmc3ggPSByZXF1aXJlKCdmcy1leHRyYScpXG4gICAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG4gICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuXG4gICAgdmFyIHBhY2thZ2VzID0gb3B0aW9ucy5wYWNrYWdlc1xuICAgIHZhciB0b29sa2l0ID0gb3B0aW9ucy50b29sa2l0XG4gICAgdmFyIHRoZW1lID0gb3B0aW9ucy50aGVtZVxuXG4gICAgdGhlbWUgPSB0aGVtZSB8fCAodG9vbGtpdCA9PT0gJ2NsYXNzaWMnID8gJ3RoZW1lLXRyaXRvbicgOiAndGhlbWUtbWF0ZXJpYWwnKVxuICAgIGxvZ3Yob3B0aW9ucywnZmlyc3RUaW1lOiAnICsgdmFycy5maXJzdFRpbWUpXG4gICAgaWYgKHZhcnMuZmlyc3RUaW1lKSB7XG4gICAgICByaW1yYWYuc3luYyhvdXRwdXQpXG4gICAgICBta2RpcnAuc3luYyhvdXRwdXQpXG4gICAgICBjb25zdCBidWlsZFhNTCA9IHJlcXVpcmUoJy4vYXJ0aWZhY3RzJykuYnVpbGRYTUxcbiAgICAgIGNvbnN0IGNyZWF0ZUFwcEpzb24gPSByZXF1aXJlKCcuL2FydGlmYWN0cycpLmNyZWF0ZUFwcEpzb25cbiAgICAgIGNvbnN0IGNyZWF0ZVdvcmtzcGFjZUpzb24gPSByZXF1aXJlKCcuL2FydGlmYWN0cycpLmNyZWF0ZVdvcmtzcGFjZUpzb25cbiAgICAgIGNvbnN0IGNyZWF0ZUpTRE9NRW52aXJvbm1lbnQgPSByZXF1aXJlKCcuL2FydGlmYWN0cycpLmNyZWF0ZUpTRE9NRW52aXJvbm1lbnRcblxuICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ob3V0cHV0LCAnYnVpbGQueG1sJyksIGJ1aWxkWE1MKHZhcnMucHJvZHVjdGlvbiwgb3B0aW9ucywgb3V0cHV0KSwgJ3V0ZjgnKVxuICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ob3V0cHV0LCAnYXBwLmpzb24nKSwgY3JlYXRlQXBwSnNvbih0aGVtZSwgcGFja2FnZXMsIHRvb2xraXQsIG9wdGlvbnMsIG91dHB1dCksICd1dGY4JylcbiAgICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5qb2luKG91dHB1dCwgJ2pzZG9tLWVudmlyb25tZW50LmpzJyksIGNyZWF0ZUpTRE9NRW52aXJvbm1lbnQob3B0aW9ucywgb3V0cHV0KSwgJ3V0ZjgnKVxuICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ob3V0cHV0LCAnd29ya3NwYWNlLmpzb24nKSwgY3JlYXRlV29ya3NwYWNlSnNvbihvcHRpb25zLCBvdXRwdXQpLCAndXRmOCcpXG5cbiAgICAgIGlmICh2YXJzLmZyYW1ld29yayA9PSAnYW5ndWxhcicpIHtcblxuICAgICAgICAvL2JlY2F1c2Ugb2YgYSBwcm9ibGVtIHdpdGggY29sb3JwaWNrZXJcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksJ2V4dC1hbmd1bGFyL3V4LycpKSkge1xuICAgICAgICAgIHZhciBmcm9tUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnZXh0LWFuZ3VsYXIvJylcbiAgICAgICAgICB2YXIgdG9QYXRoID0gcGF0aC5qb2luKG91dHB1dClcbiAgICAgICAgICBmc3guY29weVN5bmMoZnJvbVBhdGgsIHRvUGF0aClcbiAgICAgICAgICBsb2coYXBwICsgJ0NvcHlpbmcgKHV4KSAnICsgZnJvbVBhdGgucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykgKyAnIHRvOiAnICsgdG9QYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpKVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksJ2V4dC1hbmd1bGFyL3BhY2thZ2VzLycpKSkge1xuICAgICAgICAgIHZhciBmcm9tUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnZXh0LWFuZ3VsYXIvJylcbiAgICAgICAgICB2YXIgdG9QYXRoID0gcGF0aC5qb2luKG91dHB1dClcbiAgICAgICAgICBmc3guY29weVN5bmMoZnJvbVBhdGgsIHRvUGF0aClcbiAgICAgICAgICBsb2coYXBwICsgJ0NvcHlpbmcgJyArIGZyb21QYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpICsgJyB0bzogJyArIHRvUGF0aC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwnZXh0LWFuZ3VsYXIvb3ZlcnJpZGVzLycpKSkge1xuICAgICAgICAgIHZhciBmcm9tUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnZXh0LWFuZ3VsYXIvJylcbiAgICAgICAgICB2YXIgdG9QYXRoID0gcGF0aC5qb2luKG91dHB1dClcbiAgICAgICAgICBmc3guY29weVN5bmMoZnJvbVBhdGgsIHRvUGF0aClcbiAgICAgICAgICBsb2coYXBwICsgJ0NvcHlpbmcgJyArIGZyb21QYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpICsgJyB0bzogJyArIHRvUGF0aC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKHZhcnMuZnJhbWV3b3JrID09ICdyZWFjdCcpICB7XG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCdleHQtcmVhY3QvcGFja2FnZXMvJykpKSB7XG4gICAgICAgICAgdmFyIGZyb21QYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdleHQtcmVhY3QvcGFja2FnZXMvJylcbiAgICAgICAgICB2YXIgdG9QYXRoID0gcGF0aC5qb2luKG91dHB1dCwgJ3BhY2thZ2VzJylcbiAgICAgICAgICBmc3guY29weVN5bmMoZnJvbVBhdGgsIHRvUGF0aClcbiAgICAgICAgICBsb2coYXBwICsgJ0NvcHlpbmcgJyArIGZyb21QYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpICsgJyB0bzogJyArIHRvUGF0aC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSlcbiAgICAgICAgfVxuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwnZXh0LXJlYWN0L292ZXJyaWRlcy8nKSkpIHtcbiAgICAgICAgICB2YXIgZnJvbVBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2V4dC1yZWFjdC9vdmVycmlkZXMvJylcbiAgICAgICAgICB2YXIgdG9QYXRoID0gcGF0aC5qb2luKG91dHB1dCwgJ292ZXJyaWRlcycpXG4gICAgICAgICAgZnN4LmNvcHlTeW5jKGZyb21QYXRoLCB0b1BhdGgpXG4gICAgICAgICAgbG9nKGFwcCArICdDb3B5aW5nICcgKyBmcm9tUGF0aC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSArICcgdG86ICcgKyB0b1BhdGgucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykpXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksJ3Jlc291cmNlcy8nKSkpIHtcbiAgICAgICAgdmFyIGZyb21SZXNvdXJjZXMgPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ3Jlc291cmNlcy8nKVxuICAgICAgICB2YXIgdG9SZXNvdXJjZXMgPSBwYXRoLmpvaW4ob3V0cHV0LCAnLi4vcmVzb3VyY2VzJylcbiAgICAgICAgZnN4LmNvcHlTeW5jKGZyb21SZXNvdXJjZXMsIHRvUmVzb3VyY2VzKVxuICAgICAgICBsb2coYXBwICsgJ0NvcHlpbmcgJyArIGZyb21SZXNvdXJjZXMucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykgKyAnIHRvOiAnICsgdG9SZXNvdXJjZXMucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykpXG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCdwYWNrYWdlcy8nKSkpIHtcbiAgICAgICAgdmFyIGZyb21QYWNrYWdlcyA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncGFja2FnZXMvJylcbiAgICAgICAgdmFyIHRvUGFja2FnZXMgPSBwYXRoLmpvaW4ob3V0cHV0LCAncGFja2FnZXMnKVxuICAgICAgICBmc3guY29weVN5bmMoZnJvbVBhY2thZ2VzLCB0b1BhY2thZ2VzKVxuICAgICAgICBsb2coYXBwICsgJ0NvcHlpbmcgJyArIGZyb21QYWNrYWdlcy5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSArICcgdG86ICcgKyB0b1BhY2thZ2VzLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpKVxuICAgICAgfVxuXG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwnb3ZlcnJpZGVzLycpKSkge1xuICAgICAgICB2YXIgZnJvbVBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ292ZXJyaWRlcy8nKVxuICAgICAgICB2YXIgdG9QYXRoID0gcGF0aC5qb2luKG91dHB1dCwgJ292ZXJyaWRlcycpXG4gICAgICAgIGZzeC5jb3B5U3luYyhmcm9tUGF0aCwgdG9QYXRoKVxuICAgICAgICBsb2coYXBwICsgJ0NvcHlpbmcgJyArIGZyb21QYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpICsgJyB0bzogJyArIHRvUGF0aC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSlcbiAgICAgIH1cblxuICAgIH1cbiAgICB2YXJzLmZpcnN0VGltZSA9IGZhbHNlXG4gICAgdmFyIGpzID0gJydcbiAgICBpZiAodmFycy5wcm9kdWN0aW9uKSB7XG4gICAgICBpZiAoIXZhcnMuZGVwcy5pbmNsdWRlcygnRXh0LnJlcXVpcmUoXCJFeHQubGF5b3V0LipcIik7XFxuJykpIHtcbiAgICAgICAgdmFycy5kZXBzLnB1c2goJ0V4dC5yZXF1aXJlKFwiRXh0LmxheW91dC4qXCIpO1xcbicpXG4gICAgICB9XG4gICAgICBqcyA9IHZhcnMuZGVwcy5qb2luKCc7XFxuJyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAganMgPSAnRXh0LnJlcXVpcmUoXCJFeHQuKlwiKSdcbiAgICB9XG4gICAgaWYgKHZhcnMubWFuaWZlc3QgPT09IG51bGwgfHwganMgIT09IHZhcnMubWFuaWZlc3QpIHtcbiAgICAgIHZhcnMubWFuaWZlc3QgPSBqc1xuICAgICAgY29uc3QgbWFuaWZlc3QgPSBwYXRoLmpvaW4ob3V0cHV0LCAnbWFuaWZlc3QuanMnKVxuICAgICAgZnMud3JpdGVGaWxlU3luYyhtYW5pZmVzdCwganMsICd1dGY4JylcbiAgICAgIHZhcnMucmVidWlsZCA9IHRydWVcbiAgICAgIHZhciBidW5kbGVEaXIgPSBvdXRwdXQucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJylcbiAgICAgIGlmIChidW5kbGVEaXIudHJpbSgpID09ICcnKSB7YnVuZGxlRGlyID0gJy4vJ31cbiAgICAgIGxvZyhhcHAgKyAnQnVpbGRpbmcgRXh0IGJ1bmRsZSBhdDogJyArIGJ1bmRsZURpcilcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICB2YXJzLnJlYnVpbGQgPSBmYWxzZVxuICAgICAgbG9nKGFwcCArICdFeHQgcmVidWlsZCBOT1QgbmVlZGVkJylcbiAgICB9XG4gIH1cbiAgY2F0Y2goZSkge1xuICAgIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3Yob3B0aW9ucyxlKVxuICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKCdfcHJlcGFyZUZvckJ1aWxkOiAnICsgZSlcbiAgfVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBfYnVpbGRFeHRCdW5kbGUoYXBwLCBjb21waWxhdGlvbiwgb3V0cHV0UGF0aCwgcGFybXMsIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbiAgICBjb25zdCBsb2d2ID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndlxuICAgIGxvZ3Yob3B0aW9ucywnRlVOQ1RJT04gX2J1aWxkRXh0QnVuZGxlJylcblxuICAgIGxldCBzZW5jaGE7IHRyeSB7IHNlbmNoYSA9IHJlcXVpcmUoJ0BzZW5jaGEvY21kJykgfSBjYXRjaCAoZSkgeyBzZW5jaGEgPSAnc2VuY2hhJyB9XG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoc2VuY2hhKSkge1xuICAgICAgbG9ndihvcHRpb25zLCdzZW5jaGEgZm9sZGVyIGV4aXN0cycpXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgbG9ndihvcHRpb25zLCdzZW5jaGEgZm9sZGVyIERPRVMgTk9UIGV4aXN0JylcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3Qgb25CdWlsZERvbmUgPSAoKSA9PiB7XG4gICAgICAgIGxvZ3Yob3B0aW9ucywnb25CdWlsZERvbmUnKVxuICAgICAgICByZXNvbHZlKClcbiAgICAgIH1cblxuICAgICAgdmFyIG9wdHMgPSB7IGN3ZDogb3V0cHV0UGF0aCwgc2lsZW50OiB0cnVlLCBzdGRpbzogJ3BpcGUnLCBlbmNvZGluZzogJ3V0Zi04J31cbiAgICAgIGV4ZWN1dGVBc3luYyhhcHAsIHNlbmNoYSwgcGFybXMsIG9wdHMsIGNvbXBpbGF0aW9uLCBvcHRpb25zKS50aGVuIChcbiAgICAgICAgZnVuY3Rpb24oKSB7IG9uQnVpbGREb25lKCkgfSwgXG4gICAgICAgIGZ1bmN0aW9uKHJlYXNvbikgeyByZWplY3QocmVhc29uKSB9XG4gICAgICApXG4gICAgfSlcbiAgfVxuICBjYXRjaChlKSB7XG4gICAgY29uc29sZS5sb2coJ2UnKVxuICAgIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3Yob3B0aW9ucyxlKVxuICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKCdfYnVpbGRFeHRCdW5kbGU6ICcgKyBlKVxuICAgIGNhbGxiYWNrKClcbiAgfVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBfZG9uZSh2YXJzLCBvcHRpb25zKSB7XG4gIHRyeSB7XG4gICAgY29uc3QgbG9nID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9nXG4gICAgY29uc3QgbG9ndiA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3ZcbiAgICBsb2d2KG9wdGlvbnMsJ0ZVTkNUSU9OIF9kb25lJylcblxuICAgIGlmICh2YXJzLnByb2R1Y3Rpb24gJiYgIW9wdGlvbnMuZ2VuUHJvZERhdGEgJiYgb3B0aW9ucy5mcmFtZXdvcmsgPT0gJ2FuZ3VsYXInKSB7XG4gICAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gICAgICBjb25zdCBmc3ggPSByZXF1aXJlKCdmcy1leHRyYScpXG4gICAgICB2YXIgcmltcmFmID0gcmVxdWlyZShcInJpbXJhZlwiKTtcbiAgICAgIHJpbXJhZi5zeW5jKHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCBgc3JjL2FwcC9leHQtYW5ndWxhci1wcm9kYCkpO1xuICAgICAgdHJ5IHtcblxuXG4gICAgICAgIGNvbnN0IGFwcE1vZHVsZVBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ3NyYy9hcHAvYXBwLm1vZHVsZS50cycpXG4gICAgICAgIHZhciBqcyA9IGZzeC5yZWFkRmlsZVN5bmMoYXBwTW9kdWxlUGF0aCkudG9TdHJpbmcoKVxuICAgICAgICB2YXIgbmV3SnMgPSBqcy5yZXBsYWNlKFxuICAgICAgICAgIGBpbXBvcnQgeyBFeHRBbmd1bGFyTW9kdWxlIH0gZnJvbSAnLi9leHQtYW5ndWxhci1wcm9kL2V4dC1hbmd1bGFyLm1vZHVsZSdgLFxuICAgICAgICAgIGBpbXBvcnQgeyBFeHRBbmd1bGFyTW9kdWxlIH0gZnJvbSAnQHNlbmNoYS9leHQtYW5ndWxhcidgXG4gICAgICAgICk7XG4gICAgICAgIGZzeC53cml0ZUZpbGVTeW5jKGFwcE1vZHVsZVBhdGgsIG5ld0pzLCAndXRmLTgnLCAoKT0+e3JldHVybn0pXG5cbiAgICAgICAgY29uc3QgbWFpblBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ3NyYy9tYWluLnRzJylcbiAgICAgICAgdmFyIGpzTWFpbiA9IGZzeC5yZWFkRmlsZVN5bmMobWFpblBhdGgpLnRvU3RyaW5nKClcbiAgICAgICAgdmFyIG5ld0pzTWFpbiA9IGpzTWFpbi5yZXBsYWNlKFxuICAgICAgICAgIGBlbmFibGVQcm9kTW9kZSgpO2Jvb3RzdHJhcE1vZHVsZSggQXBwTW9kdWxlICk7YCxcbiAgICAgICAgICBgYm9vdHN0cmFwTW9kdWxlKEFwcE1vZHVsZSk7YFxuICAgICAgICApO1xuICAgICAgICBmc3gud3JpdGVGaWxlU3luYyhtYWluUGF0aCwgbmV3SnNNYWluLCAndXRmLTgnLCAoKT0+e3JldHVybn0pXG4gICAgICB9XG4gICAgICBjYXRjaCAoZSkge1xuICAgICAgICBjb25zb2xlLmxvZyhlKVxuICAgICAgICAvL2NvbXBpbGF0aW9uLmVycm9ycy5wdXNoKCdyZXBsYWNlIEV4dEFuZ3VsYXJNb2R1bGUgLSBleHQtZG9uZTogJyArIGUpXG4gICAgICAgIHJldHVybiBbXVxuICAgICAgfVxuICAgIH0gXG5cbiAgICB0cnkge1xuICAgICAgaWYob3B0aW9ucy5icm93c2VyID09IHRydWUgJiYgb3B0aW9ucy53YXRjaCA9PSAneWVzJyAmJiB2YXJzLnByb2R1Y3Rpb24gPT0gZmFsc2UpIHtcbiAgICAgICAgaWYgKHZhcnMuYnJvd3NlckNvdW50ID09IDApIHtcbiAgICAgICAgICB2YXIgdXJsID0gJ2h0dHA6Ly9sb2NhbGhvc3Q6JyArIG9wdGlvbnMucG9ydFxuICAgICAgICAgIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZyh2YXJzLmFwcCArIGBPcGVuaW5nIGJyb3dzZXIgYXQgJHt1cmx9YClcbiAgICAgICAgICB2YXJzLmJyb3dzZXJDb3VudCsrXG4gICAgICAgICAgY29uc3Qgb3BuID0gcmVxdWlyZSgnb3BuJylcbiAgICAgICAgICBvcG4odXJsKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmxvZyhlKVxuICAgICAgLy9jb21waWxhdGlvbi5lcnJvcnMucHVzaCgnc2hvdyBicm93c2VyIHdpbmRvdyAtIGV4dC1kb25lOiAnICsgZSlcbiAgICB9XG4gIH1cbiAgY2F0Y2goZSkge1xuICAgIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3Yob3B0aW9ucyxlKVxuICB9XG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVBc3luYyAoYXBwLCBjb21tYW5kLCBwYXJtcywgb3B0cywgY29tcGlsYXRpb24sIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICAvL2NvbnN0IERFRkFVTFRfU1VCU1RSUyA9IFsnW0lORl0gTG9hZGluZycsICdbSU5GXSBQcm9jZXNzaW5nJywgJ1tMT0ddIEZhc2hpb24gYnVpbGQgY29tcGxldGUnLCAnW0VSUl0nLCAnW1dSTl0nLCBcIltJTkZdIFNlcnZlclwiLCBcIltJTkZdIFdyaXRpbmdcIiwgXCJbSU5GXSBMb2FkaW5nIEJ1aWxkXCIsIFwiW0lORl0gV2FpdGluZ1wiLCBcIltMT0ddIEZhc2hpb24gd2FpdGluZ1wiXTtcbiAgICBjb25zdCBERUZBVUxUX1NVQlNUUlMgPSBbXCJbSU5GXSB4U2VydmVyXCIsICdbSU5GXSBMb2FkaW5nJywgJ1tJTkZdIEFwcGVuZCcsICdbSU5GXSBQcm9jZXNzaW5nJywgJ1tJTkZdIFByb2Nlc3NpbmcgQnVpbGQnLCAnW0xPR10gRmFzaGlvbiBidWlsZCBjb21wbGV0ZScsICdbRVJSXScsICdbV1JOXScsIFwiW0lORl0gV3JpdGluZ1wiLCBcIltJTkZdIExvYWRpbmcgQnVpbGRcIiwgXCJbSU5GXSBXYWl0aW5nXCIsIFwiW0xPR10gRmFzaGlvbiB3YWl0aW5nXCJdO1xuICAgIHZhciBzdWJzdHJpbmdzID0gREVGQVVMVF9TVUJTVFJTIFxuICAgIHZhciBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbiAgICBjb25zdCBjcm9zc1NwYXduID0gcmVxdWlyZSgnY3Jvc3Mtc3Bhd24nKVxuICAgIGNvbnN0IGxvZyA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ1xuICAgIGxvZ3Yob3B0aW9ucywgJ0ZVTkNUSU9OIGV4ZWN1dGVBc3luYycpXG4gICAgYXdhaXQgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgbG9ndihvcHRpb25zLGBjb21tYW5kIC0gJHtjb21tYW5kfWApXG4gICAgICBsb2d2KG9wdGlvbnMsIGBwYXJtcyAtICR7cGFybXN9YClcbiAgICAgIGxvZ3Yob3B0aW9ucywgYG9wdHMgLSAke0pTT04uc3RyaW5naWZ5KG9wdHMpfWApXG4gICAgICBsZXQgY2hpbGQgPSBjcm9zc1NwYXduKGNvbW1hbmQsIHBhcm1zLCBvcHRzKVxuICAgICAgY2hpbGQub24oJ2Nsb3NlJywgKGNvZGUsIHNpZ25hbCkgPT4ge1xuICAgICAgICBsb2d2KG9wdGlvbnMsIGBvbiBjbG9zZTogYCArIGNvZGUpIFxuICAgICAgICBpZihjb2RlID09PSAwKSB7IHJlc29sdmUoMCkgfVxuICAgICAgICBlbHNlIHsgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goIG5ldyBFcnJvcihjb2RlKSApOyByZXNvbHZlKDApIH1cbiAgICAgIH0pXG4gICAgICBjaGlsZC5vbignZXJyb3InLCAoZXJyb3IpID0+IHsgXG4gICAgICAgIGxvZ3Yob3B0aW9ucywgYG9uIGVycm9yYCkgXG4gICAgICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKGVycm9yKVxuICAgICAgICByZXNvbHZlKDApXG4gICAgICB9KVxuICAgICAgY2hpbGQuc3Rkb3V0Lm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgdmFyIHN0ciA9IGRhdGEudG9TdHJpbmcoKS5yZXBsYWNlKC9cXHI/XFxufFxcci9nLCBcIiBcIikudHJpbSgpXG4gICAgICAgIGxvZ3Yob3B0aW9ucywgYCR7c3RyfWApXG4gICAgICAgIGlmIChkYXRhICYmIGRhdGEudG9TdHJpbmcoKS5tYXRjaCgvd2FpdGluZyBmb3IgY2hhbmdlc1xcLlxcLlxcLi8pKSB7XG4gICAgICAgICAgcmVzb2x2ZSgwKVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGlmIChzdWJzdHJpbmdzLnNvbWUoZnVuY3Rpb24odikgeyByZXR1cm4gZGF0YS5pbmRleE9mKHYpID49IDA7IH0pKSB7IFxuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoXCJbSU5GXVwiLCBcIlwiKVxuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoXCJbTE9HXVwiLCBcIlwiKVxuICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpLnRyaW0oKVxuICAgICAgICAgICAgaWYgKHN0ci5pbmNsdWRlcyhcIltFUlJdXCIpKSB7XG4gICAgICAgICAgICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKGFwcCArIHN0ci5yZXBsYWNlKC9eXFxbRVJSXFxdIC9naSwgJycpKTtcbiAgICAgICAgICAgICAgc3RyID0gc3RyLnJlcGxhY2UoXCJbRVJSXVwiLCBgJHtjaGFsay5yZWQoXCJbRVJSXVwiKX1gKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbG9nKGAke2FwcH0ke3N0cn1gKSBcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICBjaGlsZC5zdGRlcnIub24oJ2RhdGEnLCAoZGF0YSkgPT4ge1xuICAgICAgICBsb2d2KG9wdGlvbnMsIGBlcnJvciBvbiBjbG9zZTogYCArIGRhdGEpIFxuICAgICAgICB2YXIgc3RyID0gZGF0YS50b1N0cmluZygpLnJlcGxhY2UoL1xccj9cXG58XFxyL2csIFwiIFwiKS50cmltKClcbiAgICAgICAgdmFyIHN0ckphdmFPcHRzID0gXCJQaWNrZWQgdXAgX0pBVkFfT1BUSU9OU1wiO1xuICAgICAgICB2YXIgaW5jbHVkZXMgPSBzdHIuaW5jbHVkZXMoc3RySmF2YU9wdHMpXG4gICAgICAgIGlmICghaW5jbHVkZXMpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhgJHthcHB9ICR7Y2hhbGsucmVkKFwiW0VSUl1cIil9ICR7c3RyfWApXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuICBjYXRjaChlKSB7XG4gICAgcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndihvcHRpb25zLGUpXG4gICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goJ2V4ZWN1dGVBc3luYzogJyArIGUpXG4gICAgY2FsbGJhY2soKVxuICB9IFxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9nKHMpIHtcbiAgcmVxdWlyZSgncmVhZGxpbmUnKS5jdXJzb3JUbyhwcm9jZXNzLnN0ZG91dCwgMClcbiAgdHJ5IHtcbiAgICBwcm9jZXNzLnN0ZG91dC5jbGVhckxpbmUoKVxuICB9XG4gIGNhdGNoKGUpIHt9XG4gIHByb2Nlc3Muc3Rkb3V0LndyaXRlKHMpXG4gIHByb2Nlc3Muc3Rkb3V0LndyaXRlKCdcXG4nKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9ndihvcHRpb25zLCBzKSB7XG4gIGlmIChvcHRpb25zLnZlcmJvc2UgPT0gJ3llcycpIHtcbiAgICByZXF1aXJlKCdyZWFkbGluZScpLmN1cnNvclRvKHByb2Nlc3Muc3Rkb3V0LCAwKVxuICAgIHRyeSB7XG4gICAgICBwcm9jZXNzLnN0ZG91dC5jbGVhckxpbmUoKVxuICAgIH1cbiAgICBjYXRjaChlKSB7fVxuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKGAtdmVyYm9zZTogJHtzfWApXG4gICAgcHJvY2Vzcy5zdGRvdXQud3JpdGUoJ1xcbicpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9nZXRBcHAoKSB7XG4gIHZhciBjaGFsayA9IHJlcXVpcmUoJ2NoYWxrJylcbiAgdmFyIHByZWZpeCA9IGBgXG4gIGNvbnN0IHBsYXRmb3JtID0gcmVxdWlyZSgnb3MnKS5wbGF0Zm9ybSgpXG4gIGlmIChwbGF0Zm9ybSA9PSAnZGFyd2luJykgeyBwcmVmaXggPSBg4oS5IO+9omV4dO+9ozpgIH1cbiAgZWxzZSB7IHByZWZpeCA9IGBpIFtleHRdOmAgfVxuICByZXR1cm4gYCR7Y2hhbGsuZ3JlZW4ocHJlZml4KX0gYFxufVxuXG5leHBvcnQgZnVuY3Rpb24gX2dldFZlcnNpb25zKGFwcCwgcGx1Z2luTmFtZSwgZnJhbWV3b3JrTmFtZSkge1xuICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKVxuXG4gIHZhciB2ID0ge31cbiAgdmFyIHBsdWdpblBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwnbm9kZV9tb2R1bGVzL0BzZW5jaGEnLCBwbHVnaW5OYW1lKVxuICB2YXIgcGx1Z2luUGtnID0gKGZzLmV4aXN0c1N5bmMocGx1Z2luUGF0aCsnL3BhY2thZ2UuanNvbicpICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHBsdWdpblBhdGgrJy9wYWNrYWdlLmpzb24nLCAndXRmLTgnKSkgfHwge30pO1xuICB2LnBsdWdpblZlcnNpb24gPSBwbHVnaW5Qa2cudmVyc2lvblxuICB2Ll9yZXNvbHZlZCA9IHBsdWdpblBrZy5fcmVzb2x2ZWRcbiAgaWYgKHYuX3Jlc29sdmVkID09IHVuZGVmaW5lZCkge1xuICAgIHYuZWRpdGlvbiA9IGBDb21tZXJjaWFsYFxuICB9XG4gIGVsc2Uge1xuICAgIGlmICgtMSA9PSB2Ll9yZXNvbHZlZC5pbmRleE9mKCdjb21tdW5pdHknKSkge1xuICAgICAgdi5lZGl0aW9uID0gYENvbW1lcmNpYWxgXG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgdi5lZGl0aW9uID0gYENvbW11bml0eWBcbiAgICB9XG4gIH1cblxuICB2YXIgd2VicGFja1BhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwnbm9kZV9tb2R1bGVzL3dlYnBhY2snKVxuICB2YXIgd2VicGFja1BrZyA9IChmcy5leGlzdHNTeW5jKHdlYnBhY2tQYXRoKycvcGFja2FnZS5qc29uJykgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMod2VicGFja1BhdGgrJy9wYWNrYWdlLmpzb24nLCAndXRmLTgnKSkgfHwge30pO1xuICB2LndlYnBhY2tWZXJzaW9uID0gd2VicGFja1BrZy52ZXJzaW9uXG5cbiAgdmFyIGV4dFBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwnbm9kZV9tb2R1bGVzL0BzZW5jaGEvZXh0JylcbiAgdmFyIGV4dFBrZyA9IChmcy5leGlzdHNTeW5jKGV4dFBhdGgrJy9wYWNrYWdlLmpzb24nKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhleHRQYXRoKycvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgdi5leHRWZXJzaW9uID0gZXh0UGtnLnNlbmNoYS52ZXJzaW9uXG5cbiAgdmFyIGNtZFBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSxgbm9kZV9tb2R1bGVzL0BzZW5jaGEvY21kYClcbiAgdmFyIGNtZFBrZyA9IChmcy5leGlzdHNTeW5jKGNtZFBhdGgrJy9wYWNrYWdlLmpzb24nKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhjbWRQYXRoKycvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgdi5jbWRWZXJzaW9uID0gY21kUGtnLnZlcnNpb25fZnVsbFxuXG4gIGlmICh2LmNtZFZlcnNpb24gPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIGNtZFBhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSxgbm9kZV9tb2R1bGVzL0BzZW5jaGEvJHtwbHVnaW5OYW1lfS9ub2RlX21vZHVsZXMvQHNlbmNoYS9jbWRgKVxuICAgIHZhciBjbWRQa2cgPSAoZnMuZXhpc3RzU3luYyhjbWRQYXRoKycvcGFja2FnZS5qc29uJykgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoY21kUGF0aCsnL3BhY2thZ2UuanNvbicsICd1dGYtOCcpKSB8fCB7fSk7XG4gICAgdi5jbWRWZXJzaW9uID0gY21kUGtnLnZlcnNpb25fZnVsbFxuICB9XG5cbiAgdmFyIGZyYW1ld29ya0luZm8gPSAnJ1xuICAgaWYgKGZyYW1ld29ya05hbWUgIT0gdW5kZWZpbmVkICYmIGZyYW1ld29ya05hbWUgIT0gJ2V4dGpzJykge1xuICAgIHZhciBmcmFtZXdvcmtQYXRoID0gJydcbiAgICBpZiAoZnJhbWV3b3JrTmFtZSA9PSAncmVhY3QnKSB7XG4gICAgICBmcmFtZXdvcmtQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksJ25vZGVfbW9kdWxlcy9yZWFjdCcpXG4gICAgfVxuICAgIGlmIChmcmFtZXdvcmtOYW1lID09ICdhbmd1bGFyJykge1xuICAgICAgZnJhbWV3b3JrUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCdub2RlX21vZHVsZXMvQGFuZ3VsYXIvY29yZScpXG4gICAgfVxuICAgIHZhciBmcmFtZXdvcmtQa2cgPSAoZnMuZXhpc3RzU3luYyhmcmFtZXdvcmtQYXRoKycvcGFja2FnZS5qc29uJykgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoZnJhbWV3b3JrUGF0aCsnL3BhY2thZ2UuanNvbicsICd1dGYtOCcpKSB8fCB7fSk7XG4gICAgdi5mcmFtZXdvcmtWZXJzaW9uID0gZnJhbWV3b3JrUGtnLnZlcnNpb25cbiAgICBmcmFtZXdvcmtJbmZvID0gJywgJyArIGZyYW1ld29ya05hbWUgKyAnIHYnICsgdi5mcmFtZXdvcmtWZXJzaW9uXG4gIH1cbiAgcmV0dXJuIGFwcCArICdleHQtd2VicGFjay1wbHVnaW4gdicgKyB2LnBsdWdpblZlcnNpb24gKyAnLCBFeHQgSlMgdicgKyB2LmV4dFZlcnNpb24gKyAnICcgKyB2LmVkaXRpb24gKyAnIEVkaXRpb24sIFNlbmNoYSBDbWQgdicgKyB2LmNtZFZlcnNpb24gKyAnLCB3ZWJwYWNrIHYnICsgdi53ZWJwYWNrVmVyc2lvbiArIGZyYW1ld29ya0luZm9cbiB9Il19