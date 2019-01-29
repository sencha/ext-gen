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
      require(`./${framework}Util`)._done(vars, options); // const path = require('path')
      // const fsx = require('fs-extra')
      // var rimraf = require("rimraf");
      // rimraf.sync(path.resolve(process.cwd(), `src/app/ext-angular-prod`));
      // try {
      //   const appModulePath = path.resolve(process.cwd(), 'src/app/app.module.ts')
      //   var js = fsx.readFileSync(appModulePath).toString()
      //   var newJs = js.replace(
      //     `import { ExtAngularModule } from './ext-angular-prod/ext-angular.module'`,
      //     `import { ExtAngularModule } from '@sencha/ext-angular'`
      //   );
      //   fsx.writeFileSync(appModulePath, newJs, 'utf-8', ()=>{return})
      //   const mainPath = path.resolve(process.cwd(), 'src/main.ts')
      //   var jsMain = fsx.readFileSync(mainPath).toString()
      //   var newJsMain = jsMain.replace(
      //     `enableProdMode();bootstrapModule( AppModule );`,
      //     `bootstrapModule(AppModule);`
      //   );
      //   fsx.writeFileSync(mainPath, newJsMain, 'utf-8', ()=>{return})
      // }
      // catch (e) {
      //   console.log(e)
      //   //compilation.errors.push('replace ExtAngularModule - ext-done: ' + e)
      //   return []
      // }

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wbHVnaW5VdGlsLmpzIl0sIm5hbWVzIjpbIl9jb25zdHJ1Y3RvciIsIm9wdGlvbnMiLCJwYXRoIiwicmVxdWlyZSIsImZzIiwiZnN4IiwidGhpc1ZhcnMiLCJ0aGlzT3B0aW9ucyIsInBsdWdpbiIsImZyYW1ld29yayIsInVuZGVmaW5lZCIsInBsdWdpbkVycm9ycyIsInB1c2giLCJ2YXJzIiwidmFsaWRhdGVPcHRpb25zIiwiZ2V0VmFsaWRhdGVPcHRpb25zIiwiZ2V0RGVmYXVsdFZhcnMiLCJwbHVnaW5OYW1lIiwiYXBwIiwiX2dldEFwcCIsImxvZ3YiLCJyYyIsImV4aXN0c1N5bmMiLCJKU09OIiwicGFyc2UiLCJyZWFkRmlsZVN5bmMiLCJnZXREZWZhdWx0T3B0aW9ucyIsInN0cmluZ2lmeSIsImVudmlyb25tZW50IiwicHJvZHVjdGlvbiIsImxvZyIsIl9nZXRWZXJzaW9ucyIsImdlblByb2REYXRhIiwiX2NvbXBpbGF0aW9uIiwiY29tcGlsZXIiLCJjb21waWxhdGlvbiIsIm1rZGlycCIsImV4dEFuZ3VsYXJQYWNrYWdlIiwiZXh0QW5ndWxhckZvbGRlciIsImV4dEFuZ3VsYXJNb2R1bGUiLCJwYXRoVG9FeHRBbmd1bGFyTW9kZXJuIiwicmVzb2x2ZSIsInByb2Nlc3MiLCJjd2QiLCJleHRDb21wb25lbnRzIiwicGFja2FnZVBhdGgiLCJmaWxlcyIsInJlYWRkaXJTeW5jIiwiZm9yRWFjaCIsImZpbGVOYW1lIiwic3Vic3RyIiwiZW5kIiwiaW5kZXhPZiIsInN1YnN0cmluZyIsImFwcE1vZHVsZVBhdGgiLCJqcyIsInRvU3RyaW5nIiwibmV3SnMiLCJyZXBsYWNlIiwid3JpdGVGaWxlU3luYyIsIm1haW5QYXRoIiwianNNYWluIiwibmV3SnNNYWluIiwic3luYyIsInQiLCJlIiwiY29uc29sZSIsImVycm9ycyIsImhvb2tzIiwic3VjY2VlZE1vZHVsZSIsInRhcCIsIm1vZHVsZSIsInJlc291cmNlIiwibWF0Y2giLCJkZXBzIiwiZXh0cmFjdEZyb21Tb3VyY2UiLCJmaW5pc2hNb2R1bGVzIiwibW9kdWxlcyIsInN0cmluZyIsImNvZGUiLCJpbmRleCIsImxlbmd0aCIsInVzZWRFeHRDb21wb25lbnRzIiwiU2V0IiwicmVhZEZyb20iLCJ3cml0ZVRvUGF0aCIsImJhc2VDb250ZW50Iiwid3JpdGVUb1BhdGhXcml0dGVuIiwibW9kdWxlVmFycyIsImltcG9ydHMiLCJleHBvcnRzIiwiZGVjbGFyYXRpb25zIiwieHR5cGUiLCJjYXBjbGFzc25hbWUiLCJjaGFyQXQiLCJ0b1VwcGVyQ2FzZSIsInNsaWNlIiwiY2xhc3NGaWxlIiwiY29udGVudHMiLCJodG1sV2VicGFja1BsdWdpbkJlZm9yZUh0bWxHZW5lcmF0aW9uIiwiZGF0YSIsIm91dHB1dFBhdGgiLCJkZXZTZXJ2ZXIiLCJqb2luIiwiY29udGVudEJhc2UiLCJ0cmltIiwianNQYXRoIiwiZXh0UGF0aCIsImNzc1BhdGgiLCJhc3NldHMiLCJ1bnNoaWZ0IiwiY3NzIiwiX2FmdGVyQ29tcGlsZSIsImVtaXQiLCJjYWxsYmFjayIsIl9idWlsZEV4dEJ1bmRsZSIsIl9wcmVwYXJlRm9yQnVpbGQiLCJjb21tYW5kIiwid2F0Y2giLCJyZWJ1aWxkIiwicGFybXMiLCJwcm9maWxlIiwid2F0Y2hTdGFydGVkIiwib3V0cHV0IiwicmltcmFmIiwicGFja2FnZXMiLCJ0b29sa2l0IiwidGhlbWUiLCJmaXJzdFRpbWUiLCJidWlsZFhNTCIsImNyZWF0ZUFwcEpzb24iLCJjcmVhdGVXb3Jrc3BhY2VKc29uIiwiY3JlYXRlSlNET01FbnZpcm9ubWVudCIsImZyb21QYXRoIiwidG9QYXRoIiwiY29weVN5bmMiLCJmcm9tUmVzb3VyY2VzIiwidG9SZXNvdXJjZXMiLCJmcm9tUGFja2FnZXMiLCJ0b1BhY2thZ2VzIiwiaW5jbHVkZXMiLCJtYW5pZmVzdCIsImJ1bmRsZURpciIsInNlbmNoYSIsIlByb21pc2UiLCJyZWplY3QiLCJvbkJ1aWxkRG9uZSIsIm9wdHMiLCJzaWxlbnQiLCJzdGRpbyIsImVuY29kaW5nIiwiZXhlY3V0ZUFzeW5jIiwidGhlbiIsInJlYXNvbiIsIl9kb25lIiwiYnJvd3NlciIsImJyb3dzZXJDb3VudCIsInVybCIsInBvcnQiLCJvcG4iLCJERUZBVUxUX1NVQlNUUlMiLCJzdWJzdHJpbmdzIiwiY2hhbGsiLCJjcm9zc1NwYXduIiwiY2hpbGQiLCJvbiIsInNpZ25hbCIsIkVycm9yIiwiZXJyb3IiLCJzdGRvdXQiLCJzdHIiLCJzb21lIiwidiIsInJlZCIsInN0ZGVyciIsInN0ckphdmFPcHRzIiwicyIsImN1cnNvclRvIiwiY2xlYXJMaW5lIiwid3JpdGUiLCJ2ZXJib3NlIiwicHJlZml4IiwicGxhdGZvcm0iLCJncmVlbiIsImZyYW1ld29ya05hbWUiLCJwbHVnaW5QYXRoIiwicGx1Z2luUGtnIiwicGx1Z2luVmVyc2lvbiIsInZlcnNpb24iLCJfcmVzb2x2ZWQiLCJlZGl0aW9uIiwid2VicGFja1BhdGgiLCJ3ZWJwYWNrUGtnIiwid2VicGFja1ZlcnNpb24iLCJleHRQa2ciLCJleHRWZXJzaW9uIiwiY21kUGF0aCIsImNtZFBrZyIsImNtZFZlcnNpb24iLCJ2ZXJzaW9uX2Z1bGwiLCJmcmFtZXdvcmtJbmZvIiwiZnJhbWV3b3JrUGF0aCIsImZyYW1ld29ya1BrZyIsImZyYW1ld29ya1ZlcnNpb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFDTyxTQUFTQSxZQUFULENBQXNCQyxPQUF0QixFQUErQjtBQUNwQyxRQUFNQyxJQUFJLEdBQUdDLE9BQU8sQ0FBQyxNQUFELENBQXBCOztBQUNBLFFBQU1DLEVBQUUsR0FBR0QsT0FBTyxDQUFDLElBQUQsQ0FBbEI7O0FBQ0EsUUFBTUUsR0FBRyxHQUFHRixPQUFPLENBQUMsVUFBRCxDQUFuQjs7QUFFQSxNQUFJRyxRQUFRLEdBQUcsRUFBZjtBQUNBLE1BQUlDLFdBQVcsR0FBRyxFQUFsQjtBQUNBLE1BQUlDLE1BQU0sR0FBRyxFQUFiOztBQUVBLE1BQUlQLE9BQU8sQ0FBQ1EsU0FBUixJQUFxQkMs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QXJCLEVBQThCO0FBQzVCaUIsTUFBQUEsYUFBYSxHQUFHdk0sSUFBSSxDQUFDdUMsT0FBTCxDQUFhQyxPQUFPLENBQUNDLEdBQVIsRUFBYixFQUEyQixvQkFBM0IsQ0FBaEI7QUFDRDs7QUFDRCxRQUFJNkksYUFBYSxJQUFJLFNBQXJCLEVBQWdDO0FBQzlCaUIsTUFBQUEsYUFBYSxHQUFHdk0sSUFBSSxDQUFDdUMsT0FBTCxDQUFhQyxPQUFPLENBQUNDLEdBQVIsRUFBYixFQUEyQiw0QkFBM0IsQ0FBaEI7QUFDRDs7QUFDRCxRQUFJK0osWUFBWSxHQUFJdE0sRUFBRSxDQUFDa0IsVUFBSCxDQUFjbUwsYUFBYSxHQUFDLGVBQTVCLEtBQWdEbEwsSUFBSSxDQUFDQyxLQUFMLENBQVdwQixFQUFFLENBQUNxQixZQUFILENBQWdCZ0wsYUFBYSxHQUFDLGVBQTlCLEVBQStDLE9BQS9DLENBQVgsQ0FBaEQsSUFBdUgsRUFBM0k7QUFDQTdCLElBQUFBLENBQUMsQ0FBQytCLGdCQUFGLEdBQXFCRCxZQUFZLENBQUNkLE9BQWxDO0FBQ0FZLElBQUFBLGFBQWEsR0FBRyxPQUFPaEIsYUFBUCxHQUF1QixJQUF2QixHQUE4QlosQ0FBQyxDQUFDK0IsZ0JBQWhEO0FBQ0Q7O0FBQ0QsU0FBT3pMLEdBQUcsR0FBRyxzQkFBTixHQUErQjBKLENBQUMsQ0FBQ2UsYUFBakMsR0FBaUQsWUFBakQsR0FBZ0VmLENBQUMsQ0FBQ3VCLFVBQWxFLEdBQStFLEdBQS9FLEdBQXFGdkIsQ0FBQyxDQUFDa0IsT0FBdkYsR0FBaUcsd0JBQWpHLEdBQTRIbEIsQ0FBQyxDQUFDMEIsVUFBOUgsR0FBMkksYUFBM0ksR0FBMkoxQixDQUFDLENBQUNxQixjQUE3SixHQUE4S08sYUFBckw7QUFDQSIsInNvdXJjZXNDb250ZW50IjpbIi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF9jb25zdHJ1Y3RvcihvcHRpb25zKSB7XG4gIGNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbiAgY29uc3QgZnMgPSByZXF1aXJlKCdmcycpXG4gIGNvbnN0IGZzeCA9IHJlcXVpcmUoJ2ZzLWV4dHJhJylcblxuICB2YXIgdGhpc1ZhcnMgPSB7fVxuICB2YXIgdGhpc09wdGlvbnMgPSB7fVxuICB2YXIgcGx1Z2luID0ge31cblxuICBpZiAob3B0aW9ucy5mcmFtZXdvcmsgPT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc1ZhcnMucGx1Z2luRXJyb3JzID0gW11cbiAgICB0aGlzVmFycy5wbHVnaW5FcnJvcnMucHVzaCgnd2VicGFjayBjb25maWc6IGZyYW1ld29yayBwYXJhbWV0ZXIgb24gZXh0LXdlYnBhY2stcGx1Z2luIGlzIG5vdCBkZWZpbmVkIC0gdmFsdWVzOiByZWFjdCwgYW5ndWxhciwgZXh0anMnKVxuICAgIHBsdWdpbi52YXJzID0gdGhpc1ZhcnNcbiAgICByZXR1cm4gcGx1Z2luXG4gIH1cblxuICBjb25zdCB2YWxpZGF0ZU9wdGlvbnMgPSByZXF1aXJlKCdzY2hlbWEtdXRpbHMnKVxuICB2YWxpZGF0ZU9wdGlvbnMocmVxdWlyZShgLi8ke29wdGlvbnMuZnJhbWV3b3JrfVV0aWxgKS5nZXRWYWxpZGF0ZU9wdGlvbnMoKSwgb3B0aW9ucywgJycpXG4gIHRoaXNWYXJzID0gcmVxdWlyZShgLi8ke29wdGlvbnMuZnJhbWV3b3JrfVV0aWxgKS5nZXREZWZhdWx0VmFycygpXG4gIHRoaXNWYXJzLmZyYW1ld29yayA9IG9wdGlvbnMuZnJhbWV3b3JrXG4gIHN3aXRjaCh0aGlzVmFycy5mcmFtZXdvcmspIHtcbiAgICBjYXNlICdleHRqcyc6XG4gICAgICB0aGlzVmFycy5wbHVnaW5OYW1lID0gJ2V4dC13ZWJwYWNrLXBsdWdpbidcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JlYWN0JzpcbiAgICAgIHRoaXNWYXJzLnBsdWdpbk5hbWUgPSAnZXh0LXJlYWN0LXdlYnBhY2stcGx1Z2luJ1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnYW5ndWxhcic6XG4gICAgICB0aGlzVmFycy5wbHVnaW5OYW1lID0gJ2V4dC1hbmd1bGFyLXdlYnBhY2stcGx1Z2luJ1xuICAgICAgYnJlYWs7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRoaXNWYXJzLnBsdWdpbk5hbWUgPSAnZXh0LXdlYnBhY2stcGx1Z2luJ1xuICB9XG5cbiAgdGhpc1ZhcnMuYXBwID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykuX2dldEFwcCgpXG4gIGxvZ3Yob3B0aW9ucywgYHBsdWdpbk5hbWUgLSAke3RoaXNWYXJzLnBsdWdpbk5hbWV9YClcbiAgbG9ndihvcHRpb25zLCBgdGhpc1ZhcnMuYXBwIC0gJHt0aGlzVmFycy5hcHB9YClcblxuICBjb25zdCByYyA9IChmcy5leGlzdHNTeW5jKGAuZXh0LSR7dGhpc1ZhcnMuZnJhbWV3b3JrfXJjYCkgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoYC5leHQtJHt0aGlzVmFycy5mcmFtZXdvcmt9cmNgLCAndXRmLTgnKSkgfHwge30pXG4gIHRoaXNPcHRpb25zID0geyAuLi5yZXF1aXJlKGAuLyR7dGhpc1ZhcnMuZnJhbWV3b3JrfVV0aWxgKS5nZXREZWZhdWx0T3B0aW9ucygpLCAuLi5vcHRpb25zLCAuLi5yYyB9XG4gIGxvZ3Yob3B0aW9ucywgYHRoaXNPcHRpb25zIC0gJHtKU09OLnN0cmluZ2lmeSh0aGlzT3B0aW9ucyl9YClcblxuICBpZiAodGhpc09wdGlvbnMuZW52aXJvbm1lbnQgPT0gJ3Byb2R1Y3Rpb24nKSBcbiAgICB7dGhpc1ZhcnMucHJvZHVjdGlvbiA9IHRydWV9XG4gIGVsc2UgXG4gICAge3RoaXNWYXJzLnByb2R1Y3Rpb24gPSBmYWxzZX1cblxuICBsb2cocmVxdWlyZSgnLi9wbHVnaW5VdGlsJykuX2dldFZlcnNpb25zKHRoaXNWYXJzLmFwcCwgdGhpc1ZhcnMucGx1Z2luTmFtZSwgdGhpc1ZhcnMuZnJhbWV3b3JrKSlcbiAgbG9nKHRoaXNWYXJzLmFwcCArICdCdWlsZGluZyBmb3IgJyArIHRoaXNPcHRpb25zLmVudmlyb25tZW50KVxuICBsb2codGhpc1ZhcnMuYXBwICsgJ0dlbmVyYXRpbmcgcHJvZHVjdGlvbiBkYXRhOiAnICsgdGhpc09wdGlvbnMuZ2VuUHJvZERhdGEpXG5cbiAgcGx1Z2luLnZhcnMgPSB0aGlzVmFyc1xuICBwbHVnaW4ub3B0aW9ucyA9IHRoaXNPcHRpb25zXG4gIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3Yob3B0aW9ucywgJ0ZVTkNUSU9OIGNvbnN0cnVjdG9yIChlbmQpJylcbiAgcmV0dXJuIHBsdWdpblxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBfY29tcGlsYXRpb24oY29tcGlsZXIsIGNvbXBpbGF0aW9uLCB2YXJzLCBvcHRpb25zKSB7XG4gIHRyeSB7XG4gICAgcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndihvcHRpb25zLCAnRlVOQ1RJT04gX2NvbXBpbGF0aW9uJylcblxuICAgIGNvbnN0IGZzeCA9IHJlcXVpcmUoJ2ZzLWV4dHJhJylcbiAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbiAgICBjb25zdCBta2RpcnAgPSByZXF1aXJlKCdta2RpcnAnKVxuICAgIGNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcblxuICAgIGNvbnN0IGV4dEFuZ3VsYXJQYWNrYWdlID0gJ0BzZW5jaGEvZXh0LWFuZ3VsYXInXG4gICAgY29uc3QgZXh0QW5ndWxhckZvbGRlciA9ICdleHQtYW5ndWxhci1wcm9kJ1xuICAgIGNvbnN0IGV4dEFuZ3VsYXJNb2R1bGUgPSAnZXh0LWFuZ3VsYXIubW9kdWxlJ1xuICAgIGNvbnN0IHBhdGhUb0V4dEFuZ3VsYXJNb2Rlcm4gPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgYHNyYy9hcHAvJHtleHRBbmd1bGFyRm9sZGVyfWApXG4gICAgdmFyIGV4dENvbXBvbmVudHMgPSBbXVxuXG4gICAgaWYgKHZhcnMucHJvZHVjdGlvbikge1xuICAgICAgaWYgKG9wdGlvbnMuZnJhbWV3b3JrID09ICdhbmd1bGFyJyAmJiBvcHRpb25zLmdlblByb2REYXRhKSB7XG4gICAgICAgIGNvbnN0IHBhY2thZ2VQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdub2RlX21vZHVsZXMvJyArIGV4dEFuZ3VsYXJQYWNrYWdlKVxuICAgICAgICB2YXIgZmlsZXMgPSBmc3gucmVhZGRpclN5bmMoYCR7cGFja2FnZVBhdGh9L2xpYmApXG4gICAgICAgIGZpbGVzLmZvckVhY2goKGZpbGVOYW1lKSA9PiB7XG4gICAgICAgICAgaWYgKGZpbGVOYW1lICYmIGZpbGVOYW1lLnN1YnN0cigwLCA0KSA9PSAnZXh0LScpIHtcbiAgICAgICAgICAgIHZhciBlbmQgPSBmaWxlTmFtZS5zdWJzdHIoNCkuaW5kZXhPZignLmNvbXBvbmVudCcpXG4gICAgICAgICAgICBpZiAoZW5kID49IDApIHtcbiAgICAgICAgICAgICAgZXh0Q29tcG9uZW50cy5wdXNoKGZpbGVOYW1lLnN1YnN0cmluZyg0LCBlbmQgKyA0KSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0pXG5cbiAgICAgICAgdHJ5IHtcblxuXG4gICAgICAgICAgY29uc3QgYXBwTW9kdWxlUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnc3JjL2FwcC9hcHAubW9kdWxlLnRzJylcbiAgICAgICAgICB2YXIganMgPSBmc3gucmVhZEZpbGVTeW5jKGFwcE1vZHVsZVBhdGgpLnRvU3RyaW5nKClcbiAgICAgICAgICB2YXIgbmV3SnMgPSBqcy5yZXBsYWNlKFxuICAgICAgICAgICAgYGltcG9ydCB7IEV4dEFuZ3VsYXJNb2R1bGUgfSBmcm9tICdAc2VuY2hhL2V4dC1hbmd1bGFyJ2AsXG4gICAgICAgICAgICBgaW1wb3J0IHsgRXh0QW5ndWxhck1vZHVsZSB9IGZyb20gJy4vZXh0LWFuZ3VsYXItcHJvZC9leHQtYW5ndWxhci5tb2R1bGUnYFxuICAgICAgICAgICk7XG4gICAgICAgICAgZnN4LndyaXRlRmlsZVN5bmMoYXBwTW9kdWxlUGF0aCwgbmV3SnMsICd1dGYtOCcsICgpPT57cmV0dXJufSlcblxuICAgICAgICAgIGNvbnN0IG1haW5QYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdzcmMvbWFpbi50cycpXG4gICAgICAgICAgdmFyIGpzTWFpbiA9IGZzeC5yZWFkRmlsZVN5bmMobWFpblBhdGgpLnRvU3RyaW5nKClcbiAgICAgICAgICB2YXIgbmV3SnNNYWluID0ganNNYWluLnJlcGxhY2UoXG4gICAgICAgICAgICBgYm9vdHN0cmFwTW9kdWxlKEFwcE1vZHVsZSk7YCxcbiAgICAgICAgICAgIGBlbmFibGVQcm9kTW9kZSgpO2Jvb3RzdHJhcE1vZHVsZSggQXBwTW9kdWxlICk7YFxuICAgICAgICAgICk7XG4gICAgICAgICAgZnN4LndyaXRlRmlsZVN5bmMobWFpblBhdGgsIG5ld0pzTWFpbiwgJ3V0Zi04JywgKCk9PntyZXR1cm59KVxuXG4gICAgICAgICAgLy8gQ3JlYXRlIHRoZSBwcm9kIGZvbGRlciBpZiBkb2VzIG5vdCBleGlzdHMuXG4gICAgICAgICAgaWYgKCFmcy5leGlzdHNTeW5jKHBhdGhUb0V4dEFuZ3VsYXJNb2Rlcm4pKSB7XG4gICAgICAgICAgICBta2RpcnAuc3luYyhwYXRoVG9FeHRBbmd1bGFyTW9kZXJuKVxuICAgICAgICAgICAgY29uc3QgdCA9IHJlcXVpcmUoJy4vYXJ0aWZhY3RzJykuZXh0QW5ndWxhck1vZHVsZSgnJywgJycsICcnKVxuICAgICAgICAgICAgZnN4LndyaXRlRmlsZVN5bmMoYCR7cGF0aFRvRXh0QW5ndWxhck1vZGVybn0vJHtleHRBbmd1bGFyTW9kdWxlfS50c2AsIHQsICd1dGYtOCcsICgpID0+IHtyZXR1cm59KVxuICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coZSlcbiAgICAgICAgICBjb21waWxhdGlvbi5lcnJvcnMucHVzaCgnYnVpbGRNb2R1bGUgaG9vayBpbiBfY29tcGlsYXRpb246ICcgKyBlKVxuICAgICAgICAgIHJldHVybiBbXVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNvbXBpbGF0aW9uLmhvb2tzLnN1Y2NlZWRNb2R1bGUudGFwKGBleHQtc3VjY2VlZC1tb2R1bGVgLCBtb2R1bGUgPT4ge1xuICAgICAgICAvL3JlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3Yob3B0aW9ucywgJ0hPT0sgc3VjY2VlZE1vZHVsZScpXG4gICAgICAgIGlmIChtb2R1bGUucmVzb3VyY2UgJiYgIW1vZHVsZS5yZXNvdXJjZS5tYXRjaCgvbm9kZV9tb2R1bGVzLykpIHtcbiAgICAgICAgICB2YXJzLmRlcHMgPSBbLi4uKHZhcnMuZGVwcyB8fCBbXSksIC4uLnJlcXVpcmUoYC4vJHt2YXJzLmZyYW1ld29ya31VdGlsYCkuZXh0cmFjdEZyb21Tb3VyY2UobW9kdWxlLCBvcHRpb25zLCBjb21waWxhdGlvbiwgZXh0Q29tcG9uZW50cyldXG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgKGV4dENvbXBvbmVudHMubGVuZ3RoICYmIG1vZHVsZS5yZXNvdXJjZSAmJiAobW9kdWxlLnJlc291cmNlLm1hdGNoKC9cXC4oanx0KXN4PyQvKSB8fFxuICAgICAgICAvLyBvcHRpb25zLmZyYW1ld29yayA9PSAnYW5ndWxhcicgJiYgbW9kdWxlLnJlc291cmNlLm1hdGNoKC9cXC5odG1sJC8pKSAmJlxuICAgICAgICAvLyAhbW9kdWxlLnJlc291cmNlLm1hdGNoKC9ub2RlX21vZHVsZXMvKSAmJiAhbW9kdWxlLnJlc291cmNlLm1hdGNoKGAvZXh0LXskb3B0aW9ucy5mcmFtZXdvcmt9L2J1aWxkL2ApKSB7XG4gICAgICAgIC8vICAgdmFycy5kZXBzID0gWy4uLih2YXJzLmRlcHMgfHwgW10pLCAuLi5yZXF1aXJlKGAuLyR7dmFycy5mcmFtZXdvcmt9VXRpbGApLmV4dHJhY3RGcm9tU291cmNlKG1vZHVsZSwgb3B0aW9ucywgY29tcGlsYXRpb24sIGV4dENvbXBvbmVudHMpXVxuICAgICAgICAvLyB9XG4gICAgICB9KVxuXG4gICAgICBpZiAob3B0aW9ucy5mcmFtZXdvcmsgPT0gJ2FuZ3VsYXInICYmIG9wdGlvbnMuZ2VuUHJvZERhdGEpIHtcblxuXG5cbiAgICAgICAgY29tcGlsYXRpb24uaG9va3MuZmluaXNoTW9kdWxlcy50YXAoYGV4dC1maW5pc2gtbW9kdWxlc2AsIG1vZHVsZXMgPT4ge1xuICAgICAgICAgIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3Yob3B0aW9ucywgJ0hPT0sgZmluaXNoTW9kdWxlcycpXG4gICAgICAgICAgY29uc3Qgc3RyaW5nID0gJ0V4dC5jcmVhdGUoe1xcXCJ4dHlwZVxcXCI6XFxcIidcbiAgICAgICAgICB2YXJzLmRlcHMuZm9yRWFjaChjb2RlID0+IHtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGNvZGUuaW5kZXhPZihzdHJpbmcpXG4gICAgICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgICAgICBjb2RlID0gY29kZS5zdWJzdHJpbmcoaW5kZXggKyBzdHJpbmcubGVuZ3RoKVxuICAgICAgICAgICAgICB2YXIgZW5kID0gY29kZS5pbmRleE9mKCdcXFwiJylcbiAgICAgICAgICAgICAgdmFycy51c2VkRXh0Q29tcG9uZW50cy5wdXNoKGNvZGUuc3Vic3RyKDAsIGVuZCkpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICB2YXJzLnVzZWRFeHRDb21wb25lbnRzID0gWy4uLm5ldyBTZXQodmFycy51c2VkRXh0Q29tcG9uZW50cyldXG4gICAgICAgICAgY29uc3QgcmVhZEZyb20gPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ25vZGVfbW9kdWxlcy8nICsgZXh0QW5ndWxhclBhY2thZ2UgKyAnL3NyYy9saWInKVxuICAgICAgICAgIGNvbnN0IHdyaXRlVG9QYXRoID0gcGF0aFRvRXh0QW5ndWxhck1vZGVyblxuXG4gICAgICAgICAgY29uc3QgYmFzZUNvbnRlbnQgPSBmc3gucmVhZEZpbGVTeW5jKGAke3JlYWRGcm9tfS9iYXNlLnRzYCkudG9TdHJpbmcoKVxuICAgICAgICAgIGZzeC53cml0ZUZpbGVTeW5jKGAke3dyaXRlVG9QYXRofS9iYXNlLnRzYCwgYmFzZUNvbnRlbnQsICd1dGYtOCcsICgpPT57cmV0dXJufSlcbiAgICAgICAgICBcbiAgICAgICAgICB2YXIgd3JpdGVUb1BhdGhXcml0dGVuID0gZmFsc2VcbiAgICAgICAgICB2YXIgbW9kdWxlVmFycyA9IHtcbiAgICAgICAgICAgIGltcG9ydHM6ICcnLFxuICAgICAgICAgICAgZXhwb3J0czogJycsXG4gICAgICAgICAgICBkZWNsYXJhdGlvbnM6ICcnXG4gICAgICAgICAgfVxuICAgICAgICAgIHZhcnMudXNlZEV4dENvbXBvbmVudHMuZm9yRWFjaCh4dHlwZSA9PiB7XG4gICAgICAgICAgICB2YXIgY2FwY2xhc3NuYW1lID0geHR5cGUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB4dHlwZS5yZXBsYWNlKC8tL2csIFwiX1wiKS5zbGljZSgxKVxuICAgICAgICAgICAgbW9kdWxlVmFycy5pbXBvcnRzID0gbW9kdWxlVmFycy5pbXBvcnRzICsgYGltcG9ydCB7IEV4dCR7Y2FwY2xhc3NuYW1lfUNvbXBvbmVudCB9IGZyb20gJy4vZXh0LSR7eHR5cGV9LmNvbXBvbmVudCc7XFxuYFxuICAgICAgICAgICAgbW9kdWxlVmFycy5leHBvcnRzID0gbW9kdWxlVmFycy5leHBvcnRzICsgYCAgICBFeHQke2NhcGNsYXNzbmFtZX1Db21wb25lbnQsXFxuYFxuICAgICAgICAgICAgbW9kdWxlVmFycy5kZWNsYXJhdGlvbnMgPSBtb2R1bGVWYXJzLmRlY2xhcmF0aW9ucyArIGAgICAgRXh0JHtjYXBjbGFzc25hbWV9Q29tcG9uZW50LFxcbmBcbiAgICAgICAgICAgIHZhciBjbGFzc0ZpbGUgPSBgL2V4dC0ke3h0eXBlfS5jb21wb25lbnQudHNgXG4gICAgICAgICAgICBjb25zdCBjb250ZW50cyA9IGZzeC5yZWFkRmlsZVN5bmMoYCR7cmVhZEZyb219JHtjbGFzc0ZpbGV9YCkudG9TdHJpbmcoKVxuICAgICAgICAgICAgZnN4LndyaXRlRmlsZVN5bmMoYCR7d3JpdGVUb1BhdGh9JHtjbGFzc0ZpbGV9YCwgY29udGVudHMsICd1dGYtOCcsICgpPT57cmV0dXJufSlcbiAgICAgICAgICAgIHdyaXRlVG9QYXRoV3JpdHRlbiA9IHRydWVcbiAgICAgICAgICB9KVxuICAgICAgICAgIGlmICh3cml0ZVRvUGF0aFdyaXR0ZW4pIHtcbiAgICAgICAgICAgIHZhciB0ID0gcmVxdWlyZSgnLi9hcnRpZmFjdHMnKS5leHRBbmd1bGFyTW9kdWxlKFxuICAgICAgICAgICAgICBtb2R1bGVWYXJzLmltcG9ydHMsIG1vZHVsZVZhcnMuZXhwb3J0cywgbW9kdWxlVmFycy5kZWNsYXJhdGlvbnNcbiAgICAgICAgICAgIClcbiAgICAgICAgICAgIGZzeC53cml0ZUZpbGVTeW5jKGAke3dyaXRlVG9QYXRofS8ke2V4dEFuZ3VsYXJNb2R1bGV9LnRzYCwgdCwgJ3V0Zi04JywgKCk9PntyZXR1cm59KVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH1cblxuXG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnMuZnJhbWV3b3JrICE9ICdleHRqcycgJiYgIW9wdGlvbnMuZ2VuUHJvZERhdGEpIHtcblxuICAgICAgY29tcGlsYXRpb24uaG9va3MuaHRtbFdlYnBhY2tQbHVnaW5CZWZvcmVIdG1sR2VuZXJhdGlvbi50YXAoYGV4dC1odG1sLWdlbmVyYXRpb25gLChkYXRhKSA9PiB7XG4gICAgICAgIGxvZ3Yob3B0aW9ucywnSE9PSyBleHQtaHRtbC1nZW5lcmF0aW9uJylcbiAgICAgICAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuICAgICAgICB2YXIgb3V0cHV0UGF0aCA9ICcnXG4gICAgICAgIGlmIChjb21waWxlci5vcHRpb25zLmRldlNlcnZlcikge1xuICAgICAgICAgIGlmIChjb21waWxlci5vdXRwdXRQYXRoID09PSAnLycpIHtcbiAgICAgICAgICAgIG91dHB1dFBhdGggPSBwYXRoLmpvaW4oY29tcGlsZXIub3B0aW9ucy5kZXZTZXJ2ZXIuY29udGVudEJhc2UsIG91dHB1dFBhdGgpXG4gICAgICAgICAgfVxuICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgaWYgKGNvbXBpbGVyLm9wdGlvbnMuZGV2U2VydmVyLmNvbnRlbnRCYXNlID09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICBvdXRwdXRQYXRoID0gJ2J1aWxkJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgIG91dHB1dFBhdGggPSAnJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBvdXRwdXRQYXRoID0gJ2J1aWxkJ1xuICAgICAgICB9XG4gICAgICAgIG91dHB1dFBhdGggPSBvdXRwdXRQYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpLnRyaW0oKVxuICAgICAgICB2YXIganNQYXRoID0gcGF0aC5qb2luKG91dHB1dFBhdGgsIHZhcnMuZXh0UGF0aCwgJ2V4dC5qcycpXG4gICAgICAgIHZhciBjc3NQYXRoID0gcGF0aC5qb2luKG91dHB1dFBhdGgsIHZhcnMuZXh0UGF0aCwgJ2V4dC5jc3MnKVxuICAgICAgICBkYXRhLmFzc2V0cy5qcy51bnNoaWZ0KGpzUGF0aClcbiAgICAgICAgZGF0YS5hc3NldHMuY3NzLnVuc2hpZnQoY3NzUGF0aClcbiAgICAgICAgbG9nKHZhcnMuYXBwICsgYEFkZGluZyAke2pzUGF0aH0gYW5kICR7Y3NzUGF0aH0gdG8gaW5kZXguaHRtbGApXG4gICAgICB9KVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxvZ3Yob3B0aW9ucywnc2tpcHBlZCBIT09LIGV4dC1odG1sLWdlbmVyYXRpb24nKVxuICAgIH1cbiAgfVxuICBjYXRjaChlKSB7XG4gICAgcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndihvcHRpb25zLGUpXG4gICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goJ19jb21waWxhdGlvbjogJyArIGUpXG4gIH1cbn1cblxuLy8qKioqKioqKioqXG5leHBvcnQgZnVuY3Rpb24gX2FmdGVyQ29tcGlsZShjb21waWxlciwgY29tcGlsYXRpb24sIHZhcnMsIG9wdGlvbnMpIHtcbiAgcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndihvcHRpb25zLCAnRlVOQ1RJT04gX2FmdGVyQ29tcGlsZScpXG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGVtaXQoY29tcGlsZXIsIGNvbXBpbGF0aW9uLCB2YXJzLCBvcHRpb25zLCBjYWxsYmFjaykge1xuICB0cnkge1xuICAgIGNvbnN0IGxvZyA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ1xuICAgIGNvbnN0IGxvZ3YgPSByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2d2XG4gICAgbG9ndihvcHRpb25zLCdGVU5DVElPTiBlbWl0JylcbiAgICB2YXIgYXBwID0gdmFycy5hcHBcbiAgICB2YXIgZnJhbWV3b3JrID0gdmFycy5mcmFtZXdvcmtcbiAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gICAgY29uc3QgX2J1aWxkRXh0QnVuZGxlID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykuX2J1aWxkRXh0QnVuZGxlXG4gICAgbGV0IG91dHB1dFBhdGggPSBwYXRoLmpvaW4oY29tcGlsZXIub3V0cHV0UGF0aCx2YXJzLmV4dFBhdGgpXG4gICAgaWYgKGNvbXBpbGVyLm91dHB1dFBhdGggPT09ICcvJyAmJiBjb21waWxlci5vcHRpb25zLmRldlNlcnZlcikge1xuICAgICAgb3V0cHV0UGF0aCA9IHBhdGguam9pbihjb21waWxlci5vcHRpb25zLmRldlNlcnZlci5jb250ZW50QmFzZSwgb3V0cHV0UGF0aClcbiAgICB9XG4gICAgbG9ndihvcHRpb25zLCdvdXRwdXRQYXRoOiAnICsgb3V0cHV0UGF0aClcbiAgICBsb2d2KG9wdGlvbnMsJ2ZyYW1ld29yazogJyArIGZyYW1ld29yaylcbiAgICBpZiAob3B0aW9ucy5lbWl0ID09IHRydWUpIHtcbiAgICAgIGlmIChmcmFtZXdvcmsgIT0gJ2V4dGpzJykge1xuICAgICAgICBfcHJlcGFyZUZvckJ1aWxkKGFwcCwgdmFycywgb3B0aW9ucywgb3V0cHV0UGF0aCwgY29tcGlsYXRpb24pXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgaWYgKG9wdGlvbnMuZnJhbWV3b3JrID09ICdhbmd1bGFyJyAmJiAhb3B0aW9ucy5nZW5Qcm9kRGF0YSkge1xuICAgICAgICAgIHJlcXVpcmUoYC4vJHtmcmFtZXdvcmt9VXRpbGApLl9wcmVwYXJlRm9yQnVpbGQoYXBwLCB2YXJzLCBvcHRpb25zLCBvdXRwdXRQYXRoLCBjb21waWxhdGlvbilcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICByZXF1aXJlKGAuLyR7ZnJhbWV3b3JrfVV0aWxgKS5fcHJlcGFyZUZvckJ1aWxkKGFwcCwgdmFycywgb3B0aW9ucywgb3V0cHV0UGF0aCwgY29tcGlsYXRpb24pXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgdmFyIGNvbW1hbmQgPSAnJ1xuICAgICAgaWYgKG9wdGlvbnMud2F0Y2ggPT0gJ3llcycgJiYgdmFycy5wcm9kdWN0aW9uID09IGZhbHNlKSB7XG4gICAgICAgIGNvbW1hbmQgPSAnd2F0Y2gnXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY29tbWFuZCA9ICdidWlsZCdcbiAgICAgIH1cblxuICAgICAgaWYgKHZhcnMucmVidWlsZCA9PSB0cnVlKSB7XG4gICAgICAgIHZhciBwYXJtcyA9IFtdXG4gICAgICAgIGlmIChvcHRpb25zLnByb2ZpbGUgPT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMucHJvZmlsZSA9PSAnJyB8fCBvcHRpb25zLnByb2ZpbGUgPT0gbnVsbCkge1xuICAgICAgICAgIGlmIChjb21tYW5kID09ICdidWlsZCcpIHtcbiAgICAgICAgICAgIHBhcm1zID0gWydhcHAnLCBjb21tYW5kLCBvcHRpb25zLmVudmlyb25tZW50XVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHBhcm1zID0gWydhcHAnLCBjb21tYW5kLCAnLS13ZWItc2VydmVyJywgJ2ZhbHNlJywgb3B0aW9ucy5lbnZpcm9ubWVudF1cbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoY29tbWFuZCA9PSAnYnVpbGQnKSB7XG4gICAgICAgICAgICBwYXJtcyA9IFsnYXBwJywgY29tbWFuZCwgb3B0aW9ucy5wcm9maWxlLCBvcHRpb25zLmVudmlyb25tZW50XVxuICAgICAgICAgIH1cbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHBhcm1zID0gWydhcHAnLCBjb21tYW5kLCAnLS13ZWItc2VydmVyJywgJ2ZhbHNlJywgb3B0aW9ucy5wcm9maWxlLCBvcHRpb25zLmVudmlyb25tZW50XVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YXJzLndhdGNoU3RhcnRlZCA9PSBmYWxzZSkge1xuICAgICAgICAgIGF3YWl0IF9idWlsZEV4dEJ1bmRsZShhcHAsIGNvbXBpbGF0aW9uLCBvdXRwdXRQYXRoLCBwYXJtcywgb3B0aW9ucylcbiAgICAgICAgICB2YXJzLndhdGNoU3RhcnRlZCA9IHRydWVcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjaygpXG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY2FsbGJhY2soKVxuICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIGxvZyhgJHt2YXJzLmFwcH1GVU5DVElPTiBlbWl0IG5vdCBydW5gKVxuICAgICAgY2FsbGJhY2soKVxuICAgIH1cbiAgfVxuICBjYXRjaChlKSB7XG4gICAgcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndihvcHRpb25zLGUpXG4gICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goJ2VtaXQ6ICcgKyBlKVxuICAgIGNhbGxiYWNrKClcbiAgfVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBmdW5jdGlvbiBfcHJlcGFyZUZvckJ1aWxkKGFwcCwgdmFycywgb3B0aW9ucywgb3V0cHV0LCBjb21waWxhdGlvbikge1xuICB0cnkge1xuICAgIGxvZ3Yob3B0aW9ucywnRlVOQ1RJT04gX3ByZXBhcmVGb3JCdWlsZCcpXG4gICAgY29uc3QgcmltcmFmID0gcmVxdWlyZSgncmltcmFmJylcbiAgICBjb25zdCBta2RpcnAgPSByZXF1aXJlKCdta2RpcnAnKVxuICAgIGNvbnN0IGZzeCA9IHJlcXVpcmUoJ2ZzLWV4dHJhJylcbiAgICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcbiAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG5cbiAgICB2YXIgcGFja2FnZXMgPSBvcHRpb25zLnBhY2thZ2VzXG4gICAgdmFyIHRvb2xraXQgPSBvcHRpb25zLnRvb2xraXRcbiAgICB2YXIgdGhlbWUgPSBvcHRpb25zLnRoZW1lXG5cbiAgICB0aGVtZSA9IHRoZW1lIHx8ICh0b29sa2l0ID09PSAnY2xhc3NpYycgPyAndGhlbWUtdHJpdG9uJyA6ICd0aGVtZS1tYXRlcmlhbCcpXG4gICAgbG9ndihvcHRpb25zLCdmaXJzdFRpbWU6ICcgKyB2YXJzLmZpcnN0VGltZSlcbiAgICBpZiAodmFycy5maXJzdFRpbWUpIHtcbiAgICAgIHJpbXJhZi5zeW5jKG91dHB1dClcbiAgICAgIG1rZGlycC5zeW5jKG91dHB1dClcbiAgICAgIGNvbnN0IGJ1aWxkWE1MID0gcmVxdWlyZSgnLi9hcnRpZmFjdHMnKS5idWlsZFhNTFxuICAgICAgY29uc3QgY3JlYXRlQXBwSnNvbiA9IHJlcXVpcmUoJy4vYXJ0aWZhY3RzJykuY3JlYXRlQXBwSnNvblxuICAgICAgY29uc3QgY3JlYXRlV29ya3NwYWNlSnNvbiA9IHJlcXVpcmUoJy4vYXJ0aWZhY3RzJykuY3JlYXRlV29ya3NwYWNlSnNvblxuICAgICAgY29uc3QgY3JlYXRlSlNET01FbnZpcm9ubWVudCA9IHJlcXVpcmUoJy4vYXJ0aWZhY3RzJykuY3JlYXRlSlNET01FbnZpcm9ubWVudFxuXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihvdXRwdXQsICdidWlsZC54bWwnKSwgYnVpbGRYTUwodmFycy5wcm9kdWN0aW9uLCBvcHRpb25zLCBvdXRwdXQpLCAndXRmOCcpXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihvdXRwdXQsICdhcHAuanNvbicpLCBjcmVhdGVBcHBKc29uKHRoZW1lLCBwYWNrYWdlcywgdG9vbGtpdCwgb3B0aW9ucywgb3V0cHV0KSwgJ3V0ZjgnKVxuICAgICAgZnMud3JpdGVGaWxlU3luYyhwYXRoLmpvaW4ob3V0cHV0LCAnanNkb20tZW52aXJvbm1lbnQuanMnKSwgY3JlYXRlSlNET01FbnZpcm9ubWVudChvcHRpb25zLCBvdXRwdXQpLCAndXRmOCcpXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKHBhdGguam9pbihvdXRwdXQsICd3b3Jrc3BhY2UuanNvbicpLCBjcmVhdGVXb3Jrc3BhY2VKc29uKG9wdGlvbnMsIG91dHB1dCksICd1dGY4JylcblxuICAgICAgaWYgKHZhcnMuZnJhbWV3b3JrID09ICdhbmd1bGFyJykge1xuXG4gICAgICAgIC8vYmVjYXVzZSBvZiBhIHByb2JsZW0gd2l0aCBjb2xvcnBpY2tlclxuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwnZXh0LWFuZ3VsYXIvdXgvJykpKSB7XG4gICAgICAgICAgdmFyIGZyb21QYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdleHQtYW5ndWxhci8nKVxuICAgICAgICAgIHZhciB0b1BhdGggPSBwYXRoLmpvaW4ob3V0cHV0KVxuICAgICAgICAgIGZzeC5jb3B5U3luYyhmcm9tUGF0aCwgdG9QYXRoKVxuICAgICAgICAgIGxvZyhhcHAgKyAnQ29weWluZyAodXgpICcgKyBmcm9tUGF0aC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSArICcgdG86ICcgKyB0b1BhdGgucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykpXG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwnZXh0LWFuZ3VsYXIvcGFja2FnZXMvJykpKSB7XG4gICAgICAgICAgdmFyIGZyb21QYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdleHQtYW5ndWxhci8nKVxuICAgICAgICAgIHZhciB0b1BhdGggPSBwYXRoLmpvaW4ob3V0cHV0KVxuICAgICAgICAgIGZzeC5jb3B5U3luYyhmcm9tUGF0aCwgdG9QYXRoKVxuICAgICAgICAgIGxvZyhhcHAgKyAnQ29weWluZyAnICsgZnJvbVBhdGgucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykgKyAnIHRvOiAnICsgdG9QYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpKVxuICAgICAgICB9XG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCdleHQtYW5ndWxhci9vdmVycmlkZXMvJykpKSB7XG4gICAgICAgICAgdmFyIGZyb21QYXRoID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdleHQtYW5ndWxhci8nKVxuICAgICAgICAgIHZhciB0b1BhdGggPSBwYXRoLmpvaW4ob3V0cHV0KVxuICAgICAgICAgIGZzeC5jb3B5U3luYyhmcm9tUGF0aCwgdG9QYXRoKVxuICAgICAgICAgIGxvZyhhcHAgKyAnQ29weWluZyAnICsgZnJvbVBhdGgucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykgKyAnIHRvOiAnICsgdG9QYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpKVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodmFycy5mcmFtZXdvcmsgPT0gJ3JlYWN0JykgIHtcbiAgICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksJ2V4dC1yZWFjdC9wYWNrYWdlcy8nKSkpIHtcbiAgICAgICAgICB2YXIgZnJvbVBhdGggPSBwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwgJ2V4dC1yZWFjdC9wYWNrYWdlcy8nKVxuICAgICAgICAgIHZhciB0b1BhdGggPSBwYXRoLmpvaW4ob3V0cHV0LCAncGFja2FnZXMnKVxuICAgICAgICAgIGZzeC5jb3B5U3luYyhmcm9tUGF0aCwgdG9QYXRoKVxuICAgICAgICAgIGxvZyhhcHAgKyAnQ29weWluZyAnICsgZnJvbVBhdGgucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykgKyAnIHRvOiAnICsgdG9QYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpKVxuICAgICAgICB9XG4gICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCdleHQtcmVhY3Qvb3ZlcnJpZGVzLycpKSkge1xuICAgICAgICAgIHZhciBmcm9tUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnZXh0LXJlYWN0L292ZXJyaWRlcy8nKVxuICAgICAgICAgIHZhciB0b1BhdGggPSBwYXRoLmpvaW4ob3V0cHV0LCAnb3ZlcnJpZGVzJylcbiAgICAgICAgICBmc3guY29weVN5bmMoZnJvbVBhdGgsIHRvUGF0aClcbiAgICAgICAgICBsb2coYXBwICsgJ0NvcHlpbmcgJyArIGZyb21QYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpICsgJyB0bzogJyArIHRvUGF0aC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoZnMuZXhpc3RzU3luYyhwYXRoLmpvaW4ocHJvY2Vzcy5jd2QoKSwncmVzb3VyY2VzLycpKSkge1xuICAgICAgICB2YXIgZnJvbVJlc291cmNlcyA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAncmVzb3VyY2VzLycpXG4gICAgICAgIHZhciB0b1Jlc291cmNlcyA9IHBhdGguam9pbihvdXRwdXQsICcuLi9yZXNvdXJjZXMnKVxuICAgICAgICBmc3guY29weVN5bmMoZnJvbVJlc291cmNlcywgdG9SZXNvdXJjZXMpXG4gICAgICAgIGxvZyhhcHAgKyAnQ29weWluZyAnICsgZnJvbVJlc291cmNlcy5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSArICcgdG86ICcgKyB0b1Jlc291cmNlcy5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKSlcbiAgICAgIH1cbiAgICAgIFxuICAgICAgaWYgKGZzLmV4aXN0c1N5bmMocGF0aC5qb2luKHByb2Nlc3MuY3dkKCksJ3BhY2thZ2VzLycpKSkge1xuICAgICAgICB2YXIgZnJvbVBhY2thZ2VzID0gcGF0aC5qb2luKHByb2Nlc3MuY3dkKCksICdwYWNrYWdlcy8nKVxuICAgICAgICB2YXIgdG9QYWNrYWdlcyA9IHBhdGguam9pbihvdXRwdXQsICdwYWNrYWdlcycpXG4gICAgICAgIGZzeC5jb3B5U3luYyhmcm9tUGFja2FnZXMsIHRvUGFja2FnZXMpXG4gICAgICAgIGxvZyhhcHAgKyAnQ29weWluZyAnICsgZnJvbVBhY2thZ2VzLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpICsgJyB0bzogJyArIHRvUGFja2FnZXMucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykpXG4gICAgICB9XG5cbiAgICAgIGlmIChmcy5leGlzdHNTeW5jKHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCdvdmVycmlkZXMvJykpKSB7XG4gICAgICAgIHZhciBmcm9tUGF0aCA9IHBhdGguam9pbihwcm9jZXNzLmN3ZCgpLCAnb3ZlcnJpZGVzLycpXG4gICAgICAgIHZhciB0b1BhdGggPSBwYXRoLmpvaW4ob3V0cHV0LCAnb3ZlcnJpZGVzJylcbiAgICAgICAgZnN4LmNvcHlTeW5jKGZyb21QYXRoLCB0b1BhdGgpXG4gICAgICAgIGxvZyhhcHAgKyAnQ29weWluZyAnICsgZnJvbVBhdGgucmVwbGFjZShwcm9jZXNzLmN3ZCgpLCAnJykgKyAnIHRvOiAnICsgdG9QYXRoLnJlcGxhY2UocHJvY2Vzcy5jd2QoKSwgJycpKVxuICAgICAgfVxuXG4gICAgfVxuICAgIHZhcnMuZmlyc3RUaW1lID0gZmFsc2VcbiAgICB2YXIganMgPSAnJ1xuICAgIGlmICh2YXJzLnByb2R1Y3Rpb24pIHtcbiAgICAgIGlmICghdmFycy5kZXBzLmluY2x1ZGVzKCdFeHQucmVxdWlyZShcIkV4dC5sYXlvdXQuKlwiKTtcXG4nKSkge1xuICAgICAgICB2YXJzLmRlcHMucHVzaCgnRXh0LnJlcXVpcmUoXCJFeHQubGF5b3V0LipcIik7XFxuJylcbiAgICAgIH1cbiAgICAgIGpzID0gdmFycy5kZXBzLmpvaW4oJztcXG4nKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBqcyA9ICdFeHQucmVxdWlyZShcIkV4dC4qXCIpJ1xuICAgIH1cbiAgICBpZiAodmFycy5tYW5pZmVzdCA9PT0gbnVsbCB8fCBqcyAhPT0gdmFycy5tYW5pZmVzdCkge1xuICAgICAgdmFycy5tYW5pZmVzdCA9IGpzXG4gICAgICBjb25zdCBtYW5pZmVzdCA9IHBhdGguam9pbihvdXRwdXQsICdtYW5pZmVzdC5qcycpXG4gICAgICBmcy53cml0ZUZpbGVTeW5jKG1hbmlmZXN0LCBqcywgJ3V0ZjgnKVxuICAgICAgdmFycy5yZWJ1aWxkID0gdHJ1ZVxuICAgICAgdmFyIGJ1bmRsZURpciA9IG91dHB1dC5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKVxuICAgICAgaWYgKGJ1bmRsZURpci50cmltKCkgPT0gJycpIHtidW5kbGVEaXIgPSAnLi8nfVxuICAgICAgbG9nKGFwcCArICdCdWlsZGluZyBFeHQgYnVuZGxlIGF0OiAnICsgYnVuZGxlRGlyKVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHZhcnMucmVidWlsZCA9IGZhbHNlXG4gICAgICBsb2coYXBwICsgJ0V4dCByZWJ1aWxkIE5PVCBuZWVkZWQnKVxuICAgIH1cbiAgfVxuICBjYXRjaChlKSB7XG4gICAgcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndihvcHRpb25zLGUpXG4gICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goJ19wcmVwYXJlRm9yQnVpbGQ6ICcgKyBlKVxuICB9XG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF9idWlsZEV4dEJ1bmRsZShhcHAsIGNvbXBpbGF0aW9uLCBvdXRwdXRQYXRoLCBwYXJtcywgb3B0aW9ucykge1xuICB0cnkge1xuICAgIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKVxuICAgIGNvbnN0IGxvZ3YgPSByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2d2XG4gICAgbG9ndihvcHRpb25zLCdGVU5DVElPTiBfYnVpbGRFeHRCdW5kbGUnKVxuXG4gICAgbGV0IHNlbmNoYTsgdHJ5IHsgc2VuY2hhID0gcmVxdWlyZSgnQHNlbmNoYS9jbWQnKSB9IGNhdGNoIChlKSB7IHNlbmNoYSA9ICdzZW5jaGEnIH1cbiAgICBpZiAoZnMuZXhpc3RzU3luYyhzZW5jaGEpKSB7XG4gICAgICBsb2d2KG9wdGlvbnMsJ3NlbmNoYSBmb2xkZXIgZXhpc3RzJylcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICBsb2d2KG9wdGlvbnMsJ3NlbmNoYSBmb2xkZXIgRE9FUyBOT1QgZXhpc3QnKVxuICAgIH1cblxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBvbkJ1aWxkRG9uZSA9ICgpID0+IHtcbiAgICAgICAgbG9ndihvcHRpb25zLCdvbkJ1aWxkRG9uZScpXG4gICAgICAgIHJlc29sdmUoKVxuICAgICAgfVxuXG4gICAgICB2YXIgb3B0cyA9IHsgY3dkOiBvdXRwdXRQYXRoLCBzaWxlbnQ6IHRydWUsIHN0ZGlvOiAncGlwZScsIGVuY29kaW5nOiAndXRmLTgnfVxuICAgICAgZXhlY3V0ZUFzeW5jKGFwcCwgc2VuY2hhLCBwYXJtcywgb3B0cywgY29tcGlsYXRpb24sIG9wdGlvbnMpLnRoZW4gKFxuICAgICAgICBmdW5jdGlvbigpIHsgb25CdWlsZERvbmUoKSB9LCBcbiAgICAgICAgZnVuY3Rpb24ocmVhc29uKSB7IHJlamVjdChyZWFzb24pIH1cbiAgICAgIClcbiAgICB9KVxuICB9XG4gIGNhdGNoKGUpIHtcbiAgICBjb25zb2xlLmxvZygnZScpXG4gICAgcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndihvcHRpb25zLGUpXG4gICAgY29tcGlsYXRpb24uZXJyb3JzLnB1c2goJ19idWlsZEV4dEJ1bmRsZTogJyArIGUpXG4gICAgY2FsbGJhY2soKVxuICB9XG59XG5cbi8vKioqKioqKioqKlxuZXhwb3J0IGZ1bmN0aW9uIF9kb25lKHZhcnMsIG9wdGlvbnMpIHtcbiAgdHJ5IHtcbiAgICBjb25zdCBsb2cgPSByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2dcbiAgICBjb25zdCBsb2d2ID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndlxuICAgIGxvZ3Yob3B0aW9ucywnRlVOQ1RJT04gX2RvbmUnKVxuXG4gICAgaWYgKHZhcnMucHJvZHVjdGlvbiAmJiAhb3B0aW9ucy5nZW5Qcm9kRGF0YSAmJiBvcHRpb25zLmZyYW1ld29yayA9PSAnYW5ndWxhcicpIHtcbiAgICAgIHJlcXVpcmUoYC4vJHtmcmFtZXdvcmt9VXRpbGApLl9kb25lKHZhcnMsIG9wdGlvbnMpXG5cbiAgICAgIC8vIGNvbnN0IHBhdGggPSByZXF1aXJlKCdwYXRoJylcbiAgICAgIC8vIGNvbnN0IGZzeCA9IHJlcXVpcmUoJ2ZzLWV4dHJhJylcbiAgICAgIC8vIHZhciByaW1yYWYgPSByZXF1aXJlKFwicmltcmFmXCIpO1xuICAgICAgLy8gcmltcmFmLnN5bmMocGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksIGBzcmMvYXBwL2V4dC1hbmd1bGFyLXByb2RgKSk7XG4gICAgICAvLyB0cnkge1xuICAgICAgLy8gICBjb25zdCBhcHBNb2R1bGVQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdzcmMvYXBwL2FwcC5tb2R1bGUudHMnKVxuICAgICAgLy8gICB2YXIganMgPSBmc3gucmVhZEZpbGVTeW5jKGFwcE1vZHVsZVBhdGgpLnRvU3RyaW5nKClcbiAgICAgIC8vICAgdmFyIG5ld0pzID0ganMucmVwbGFjZShcbiAgICAgIC8vICAgICBgaW1wb3J0IHsgRXh0QW5ndWxhck1vZHVsZSB9IGZyb20gJy4vZXh0LWFuZ3VsYXItcHJvZC9leHQtYW5ndWxhci5tb2R1bGUnYCxcbiAgICAgIC8vICAgICBgaW1wb3J0IHsgRXh0QW5ndWxhck1vZHVsZSB9IGZyb20gJ0BzZW5jaGEvZXh0LWFuZ3VsYXInYFxuICAgICAgLy8gICApO1xuICAgICAgLy8gICBmc3gud3JpdGVGaWxlU3luYyhhcHBNb2R1bGVQYXRoLCBuZXdKcywgJ3V0Zi04JywgKCk9PntyZXR1cm59KVxuXG4gICAgICAvLyAgIGNvbnN0IG1haW5QYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdzcmMvbWFpbi50cycpXG4gICAgICAvLyAgIHZhciBqc01haW4gPSBmc3gucmVhZEZpbGVTeW5jKG1haW5QYXRoKS50b1N0cmluZygpXG4gICAgICAvLyAgIHZhciBuZXdKc01haW4gPSBqc01haW4ucmVwbGFjZShcbiAgICAgIC8vICAgICBgZW5hYmxlUHJvZE1vZGUoKTtib290c3RyYXBNb2R1bGUoIEFwcE1vZHVsZSApO2AsXG4gICAgICAvLyAgICAgYGJvb3RzdHJhcE1vZHVsZShBcHBNb2R1bGUpO2BcbiAgICAgIC8vICAgKTtcbiAgICAgIC8vICAgZnN4LndyaXRlRmlsZVN5bmMobWFpblBhdGgsIG5ld0pzTWFpbiwgJ3V0Zi04JywgKCk9PntyZXR1cm59KVxuICAgICAgLy8gfVxuICAgICAgLy8gY2F0Y2ggKGUpIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coZSlcbiAgICAgIC8vICAgLy9jb21waWxhdGlvbi5lcnJvcnMucHVzaCgncmVwbGFjZSBFeHRBbmd1bGFyTW9kdWxlIC0gZXh0LWRvbmU6ICcgKyBlKVxuICAgICAgLy8gICByZXR1cm4gW11cbiAgICAgIC8vIH1cbiAgICB9IFxuXG4gICAgdHJ5IHtcbiAgICAgIGlmKG9wdGlvbnMuYnJvd3NlciA9PSB0cnVlICYmIG9wdGlvbnMud2F0Y2ggPT0gJ3llcycgJiYgdmFycy5wcm9kdWN0aW9uID09IGZhbHNlKSB7XG4gICAgICAgIGlmICh2YXJzLmJyb3dzZXJDb3VudCA9PSAwKSB7XG4gICAgICAgICAgdmFyIHVybCA9ICdodHRwOi8vbG9jYWxob3N0OicgKyBvcHRpb25zLnBvcnRcbiAgICAgICAgICByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2codmFycy5hcHAgKyBgT3BlbmluZyBicm93c2VyIGF0ICR7dXJsfWApXG4gICAgICAgICAgdmFycy5icm93c2VyQ291bnQrK1xuICAgICAgICAgIGNvbnN0IG9wbiA9IHJlcXVpcmUoJ29wbicpXG4gICAgICAgICAgb3BuKHVybClcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgY29uc29sZS5sb2coZSlcbiAgICAgIC8vY29tcGlsYXRpb24uZXJyb3JzLnB1c2goJ3Nob3cgYnJvd3NlciB3aW5kb3cgLSBleHQtZG9uZTogJyArIGUpXG4gICAgfVxuICB9XG4gIGNhdGNoKGUpIHtcbiAgICByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2d2KG9wdGlvbnMsZSlcbiAgfVxufVxuXG4vLyoqKioqKioqKipcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBleGVjdXRlQXN5bmMgKGFwcCwgY29tbWFuZCwgcGFybXMsIG9wdHMsIGNvbXBpbGF0aW9uLCBvcHRpb25zKSB7XG4gIHRyeSB7XG4gICAgLy9jb25zdCBERUZBVUxUX1NVQlNUUlMgPSBbJ1tJTkZdIExvYWRpbmcnLCAnW0lORl0gUHJvY2Vzc2luZycsICdbTE9HXSBGYXNoaW9uIGJ1aWxkIGNvbXBsZXRlJywgJ1tFUlJdJywgJ1tXUk5dJywgXCJbSU5GXSBTZXJ2ZXJcIiwgXCJbSU5GXSBXcml0aW5nXCIsIFwiW0lORl0gTG9hZGluZyBCdWlsZFwiLCBcIltJTkZdIFdhaXRpbmdcIiwgXCJbTE9HXSBGYXNoaW9uIHdhaXRpbmdcIl07XG4gICAgY29uc3QgREVGQVVMVF9TVUJTVFJTID0gW1wiW0lORl0geFNlcnZlclwiLCAnW0lORl0gTG9hZGluZycsICdbSU5GXSBBcHBlbmQnLCAnW0lORl0gUHJvY2Vzc2luZycsICdbSU5GXSBQcm9jZXNzaW5nIEJ1aWxkJywgJ1tMT0ddIEZhc2hpb24gYnVpbGQgY29tcGxldGUnLCAnW0VSUl0nLCAnW1dSTl0nLCBcIltJTkZdIFdyaXRpbmdcIiwgXCJbSU5GXSBMb2FkaW5nIEJ1aWxkXCIsIFwiW0lORl0gV2FpdGluZ1wiLCBcIltMT0ddIEZhc2hpb24gd2FpdGluZ1wiXTtcbiAgICB2YXIgc3Vic3RyaW5ncyA9IERFRkFVTFRfU1VCU1RSUyBcbiAgICB2YXIgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG4gICAgY29uc3QgY3Jvc3NTcGF3biA9IHJlcXVpcmUoJ2Nyb3NzLXNwYXduJylcbiAgICBjb25zdCBsb2cgPSByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2dcbiAgICBsb2d2KG9wdGlvbnMsICdGVU5DVElPTiBleGVjdXRlQXN5bmMnKVxuICAgIGF3YWl0IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGxvZ3Yob3B0aW9ucyxgY29tbWFuZCAtICR7Y29tbWFuZH1gKVxuICAgICAgbG9ndihvcHRpb25zLCBgcGFybXMgLSAke3Bhcm1zfWApXG4gICAgICBsb2d2KG9wdGlvbnMsIGBvcHRzIC0gJHtKU09OLnN0cmluZ2lmeShvcHRzKX1gKVxuICAgICAgbGV0IGNoaWxkID0gY3Jvc3NTcGF3bihjb21tYW5kLCBwYXJtcywgb3B0cylcbiAgICAgIGNoaWxkLm9uKCdjbG9zZScsIChjb2RlLCBzaWduYWwpID0+IHtcbiAgICAgICAgbG9ndihvcHRpb25zLCBgb24gY2xvc2U6IGAgKyBjb2RlKSBcbiAgICAgICAgaWYoY29kZSA9PT0gMCkgeyByZXNvbHZlKDApIH1cbiAgICAgICAgZWxzZSB7IGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKCBuZXcgRXJyb3IoY29kZSkgKTsgcmVzb2x2ZSgwKSB9XG4gICAgICB9KVxuICAgICAgY2hpbGQub24oJ2Vycm9yJywgKGVycm9yKSA9PiB7IFxuICAgICAgICBsb2d2KG9wdGlvbnMsIGBvbiBlcnJvcmApIFxuICAgICAgICBjb21waWxhdGlvbi5lcnJvcnMucHVzaChlcnJvcilcbiAgICAgICAgcmVzb2x2ZSgwKVxuICAgICAgfSlcbiAgICAgIGNoaWxkLnN0ZG91dC5vbignZGF0YScsIChkYXRhKSA9PiB7XG4gICAgICAgIHZhciBzdHIgPSBkYXRhLnRvU3RyaW5nKCkucmVwbGFjZSgvXFxyP1xcbnxcXHIvZywgXCIgXCIpLnRyaW0oKVxuICAgICAgICBsb2d2KG9wdGlvbnMsIGAke3N0cn1gKVxuICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLnRvU3RyaW5nKCkubWF0Y2goL3dhaXRpbmcgZm9yIGNoYW5nZXNcXC5cXC5cXC4vKSkge1xuICAgICAgICAgIHJlc29sdmUoMClcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBpZiAoc3Vic3RyaW5ncy5zb21lKGZ1bmN0aW9uKHYpIHsgcmV0dXJuIGRhdGEuaW5kZXhPZih2KSA+PSAwOyB9KSkgeyBcbiAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKFwiW0lORl1cIiwgXCJcIilcbiAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKFwiW0xPR11cIiwgXCJcIilcbiAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKHByb2Nlc3MuY3dkKCksICcnKS50cmltKClcbiAgICAgICAgICAgIGlmIChzdHIuaW5jbHVkZXMoXCJbRVJSXVwiKSkge1xuICAgICAgICAgICAgICBjb21waWxhdGlvbi5lcnJvcnMucHVzaChhcHAgKyBzdHIucmVwbGFjZSgvXlxcW0VSUlxcXSAvZ2ksICcnKSk7XG4gICAgICAgICAgICAgIHN0ciA9IHN0ci5yZXBsYWNlKFwiW0VSUl1cIiwgYCR7Y2hhbGsucmVkKFwiW0VSUl1cIil9YClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxvZyhgJHthcHB9JHtzdHJ9YCkgXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgY2hpbGQuc3RkZXJyLm9uKCdkYXRhJywgKGRhdGEpID0+IHtcbiAgICAgICAgbG9ndihvcHRpb25zLCBgZXJyb3Igb24gY2xvc2U6IGAgKyBkYXRhKSBcbiAgICAgICAgdmFyIHN0ciA9IGRhdGEudG9TdHJpbmcoKS5yZXBsYWNlKC9cXHI/XFxufFxcci9nLCBcIiBcIikudHJpbSgpXG4gICAgICAgIHZhciBzdHJKYXZhT3B0cyA9IFwiUGlja2VkIHVwIF9KQVZBX09QVElPTlNcIjtcbiAgICAgICAgdmFyIGluY2x1ZGVzID0gc3RyLmluY2x1ZGVzKHN0ckphdmFPcHRzKVxuICAgICAgICBpZiAoIWluY2x1ZGVzKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coYCR7YXBwfSAke2NoYWxrLnJlZChcIltFUlJdXCIpfSAke3N0cn1gKVxuICAgICAgICB9XG4gICAgICB9KVxuICAgIH0pXG4gIH1cbiAgY2F0Y2goZSkge1xuICAgIHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3Yob3B0aW9ucyxlKVxuICAgIGNvbXBpbGF0aW9uLmVycm9ycy5wdXNoKCdleGVjdXRlQXN5bmM6ICcgKyBlKVxuICAgIGNhbGxiYWNrKClcbiAgfSBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZyhzKSB7XG4gIHJlcXVpcmUoJ3JlYWRsaW5lJykuY3Vyc29yVG8ocHJvY2Vzcy5zdGRvdXQsIDApXG4gIHRyeSB7XG4gICAgcHJvY2Vzcy5zdGRvdXQuY2xlYXJMaW5lKClcbiAgfVxuICBjYXRjaChlKSB7fVxuICBwcm9jZXNzLnN0ZG91dC53cml0ZShzKVxuICBwcm9jZXNzLnN0ZG91dC53cml0ZSgnXFxuJylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ3Yob3B0aW9ucywgcykge1xuICBpZiAob3B0aW9ucy52ZXJib3NlID09ICd5ZXMnKSB7XG4gICAgcmVxdWlyZSgncmVhZGxpbmUnKS5jdXJzb3JUbyhwcm9jZXNzLnN0ZG91dCwgMClcbiAgICB0cnkge1xuICAgICAgcHJvY2Vzcy5zdGRvdXQuY2xlYXJMaW5lKClcbiAgICB9XG4gICAgY2F0Y2goZSkge31cbiAgICBwcm9jZXNzLnN0ZG91dC53cml0ZShgLXZlcmJvc2U6ICR7c31gKVxuICAgIHByb2Nlc3Muc3Rkb3V0LndyaXRlKCdcXG4nKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBfZ2V0QXBwKCkge1xuICB2YXIgY2hhbGsgPSByZXF1aXJlKCdjaGFsaycpXG4gIHZhciBwcmVmaXggPSBgYFxuICBjb25zdCBwbGF0Zm9ybSA9IHJlcXVpcmUoJ29zJykucGxhdGZvcm0oKVxuICBpZiAocGxhdGZvcm0gPT0gJ2RhcndpbicpIHsgcHJlZml4ID0gYOKEuSDvvaJleHTvvaM6YCB9XG4gIGVsc2UgeyBwcmVmaXggPSBgaSBbZXh0XTpgIH1cbiAgcmV0dXJuIGAke2NoYWxrLmdyZWVuKHByZWZpeCl9IGBcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIF9nZXRWZXJzaW9ucyhhcHAsIHBsdWdpbk5hbWUsIGZyYW1ld29ya05hbWUpIHtcbiAgY29uc3QgcGF0aCA9IHJlcXVpcmUoJ3BhdGgnKVxuICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcblxuICB2YXIgdiA9IHt9XG4gIHZhciBwbHVnaW5QYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksJ25vZGVfbW9kdWxlcy9Ac2VuY2hhJywgcGx1Z2luTmFtZSlcbiAgdmFyIHBsdWdpblBrZyA9IChmcy5leGlzdHNTeW5jKHBsdWdpblBhdGgrJy9wYWNrYWdlLmpzb24nKSAmJiBKU09OLnBhcnNlKGZzLnJlYWRGaWxlU3luYyhwbHVnaW5QYXRoKycvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgdi5wbHVnaW5WZXJzaW9uID0gcGx1Z2luUGtnLnZlcnNpb25cbiAgdi5fcmVzb2x2ZWQgPSBwbHVnaW5Qa2cuX3Jlc29sdmVkXG4gIGlmICh2Ll9yZXNvbHZlZCA9PSB1bmRlZmluZWQpIHtcbiAgICB2LmVkaXRpb24gPSBgQ29tbWVyY2lhbGBcbiAgfVxuICBlbHNlIHtcbiAgICBpZiAoLTEgPT0gdi5fcmVzb2x2ZWQuaW5kZXhPZignY29tbXVuaXR5JykpIHtcbiAgICAgIHYuZWRpdGlvbiA9IGBDb21tZXJjaWFsYFxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHYuZWRpdGlvbiA9IGBDb21tdW5pdHlgXG4gICAgfVxuICB9XG5cbiAgdmFyIHdlYnBhY2tQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksJ25vZGVfbW9kdWxlcy93ZWJwYWNrJylcbiAgdmFyIHdlYnBhY2tQa2cgPSAoZnMuZXhpc3RzU3luYyh3ZWJwYWNrUGF0aCsnL3BhY2thZ2UuanNvbicpICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKHdlYnBhY2tQYXRoKycvcGFja2FnZS5qc29uJywgJ3V0Zi04JykpIHx8IHt9KTtcbiAgdi53ZWJwYWNrVmVyc2lvbiA9IHdlYnBhY2tQa2cudmVyc2lvblxuXG4gIHZhciBleHRQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksJ25vZGVfbW9kdWxlcy9Ac2VuY2hhL2V4dCcpXG4gIHZhciBleHRQa2cgPSAoZnMuZXhpc3RzU3luYyhleHRQYXRoKycvcGFja2FnZS5qc29uJykgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoZXh0UGF0aCsnL3BhY2thZ2UuanNvbicsICd1dGYtOCcpKSB8fCB7fSk7XG4gIHYuZXh0VmVyc2lvbiA9IGV4dFBrZy5zZW5jaGEudmVyc2lvblxuXG4gIHZhciBjbWRQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksYG5vZGVfbW9kdWxlcy9Ac2VuY2hhL2NtZGApXG4gIHZhciBjbWRQa2cgPSAoZnMuZXhpc3RzU3luYyhjbWRQYXRoKycvcGFja2FnZS5qc29uJykgJiYgSlNPTi5wYXJzZShmcy5yZWFkRmlsZVN5bmMoY21kUGF0aCsnL3BhY2thZ2UuanNvbicsICd1dGYtOCcpKSB8fCB7fSk7XG4gIHYuY21kVmVyc2lvbiA9IGNtZFBrZy52ZXJzaW9uX2Z1bGxcblxuICBpZiAodi5jbWRWZXJzaW9uID09IHVuZGVmaW5lZCkge1xuICAgIHZhciBjbWRQYXRoID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksYG5vZGVfbW9kdWxlcy9Ac2VuY2hhLyR7cGx1Z2luTmFtZX0vbm9kZV9tb2R1bGVzL0BzZW5jaGEvY21kYClcbiAgICB2YXIgY21kUGtnID0gKGZzLmV4aXN0c1N5bmMoY21kUGF0aCsnL3BhY2thZ2UuanNvbicpICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGNtZFBhdGgrJy9wYWNrYWdlLmpzb24nLCAndXRmLTgnKSkgfHwge30pO1xuICAgIHYuY21kVmVyc2lvbiA9IGNtZFBrZy52ZXJzaW9uX2Z1bGxcbiAgfVxuXG4gIHZhciBmcmFtZXdvcmtJbmZvID0gJydcbiAgIGlmIChmcmFtZXdvcmtOYW1lICE9IHVuZGVmaW5lZCAmJiBmcmFtZXdvcmtOYW1lICE9ICdleHRqcycpIHtcbiAgICB2YXIgZnJhbWV3b3JrUGF0aCA9ICcnXG4gICAgaWYgKGZyYW1ld29ya05hbWUgPT0gJ3JlYWN0Jykge1xuICAgICAgZnJhbWV3b3JrUGF0aCA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCdub2RlX21vZHVsZXMvcmVhY3QnKVxuICAgIH1cbiAgICBpZiAoZnJhbWV3b3JrTmFtZSA9PSAnYW5ndWxhcicpIHtcbiAgICAgIGZyYW1ld29ya1BhdGggPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwnbm9kZV9tb2R1bGVzL0Bhbmd1bGFyL2NvcmUnKVxuICAgIH1cbiAgICB2YXIgZnJhbWV3b3JrUGtnID0gKGZzLmV4aXN0c1N5bmMoZnJhbWV3b3JrUGF0aCsnL3BhY2thZ2UuanNvbicpICYmIEpTT04ucGFyc2UoZnMucmVhZEZpbGVTeW5jKGZyYW1ld29ya1BhdGgrJy9wYWNrYWdlLmpzb24nLCAndXRmLTgnKSkgfHwge30pO1xuICAgIHYuZnJhbWV3b3JrVmVyc2lvbiA9IGZyYW1ld29ya1BrZy52ZXJzaW9uXG4gICAgZnJhbWV3b3JrSW5mbyA9ICcsICcgKyBmcmFtZXdvcmtOYW1lICsgJyB2JyArIHYuZnJhbWV3b3JrVmVyc2lvblxuICB9XG4gIHJldHVybiBhcHAgKyAnZXh0LXdlYnBhY2stcGx1Z2luIHYnICsgdi5wbHVnaW5WZXJzaW9uICsgJywgRXh0IEpTIHYnICsgdi5leHRWZXJzaW9uICsgJyAnICsgdi5lZGl0aW9uICsgJyBFZGl0aW9uLCBTZW5jaGEgQ21kIHYnICsgdi5jbWRWZXJzaW9uICsgJywgd2VicGFjayB2JyArIHYud2VicGFja1ZlcnNpb24gKyBmcmFtZXdvcmtJbmZvXG4gfSJdfQ==