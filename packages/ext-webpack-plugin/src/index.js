const npmScope = '@sencha'
const chalk = require('chalk')
const path = require('path')
const fs = require('fs')
const validateOptions = require('schema-utils')
const uniq = require('lodash.uniq')
const isGlob = require('is-glob')
const recursiveReadSync = require('recursive-readdir-sync')

var prefix = ``
var platform = require('os').platform()
if (platform == 'darwin') {
  prefix = `ℹ ｢ext｣:`
}
else {
  prefix = `i [ext]:`
}
var app = chalk.green(prefix) + ' ext-webpack-plugin: ';

function getFileAndContextDeps(compilation, files, dirs, cwd) {
  const { fileDependencies, contextDependencies } = compilation;
  const isWebpack4 = compilation.hooks;
  let fds = isWebpack4 ? [...fileDependencies] : fileDependencies;
  let cds = isWebpack4 ? [...contextDependencies] : contextDependencies;
  
  if (files.length > 0) {
    files.forEach((pattern) => {
      let f = pattern;
      if (isGlob(pattern)) {
        f = glob.sync(pattern, {
          cwd,
          dot: true,
          absolute: true,
        });
      }
      fds = fds.concat(f);
    });
    fds = uniq(fds);
  }
  
  if (dirs.length > 0) {
    cds = uniq(cds.concat(dirs));
  }
  return {
    fileDependencies: fds,
    contextDependencies: cds,
  };
}

export default class ExtWebpackPlugin {
  // static defaults = {
  //   cwd: process.cwd(),
  //   files: [],
  //   dirs: ['./app'],
  // };

  constructor(options = {profile: 'desktop', environment: 'development', verbose: 'no'} ) {
    validateOptions(require('../options.json'), options, 'ExtraWatchWebpackPlugin'); // eslint-disable-line
    //this.options = { ...ExtWebpackPlugin.defaults, ...options };

    var defaults = {
      cwd: process.cwd(),
      files: ['./app.json'],
      dirs: ['./app','./packages'],
    }

    this.options = { ...defaults, ...options };
  }

  apply(compiler) {

    if (this.webpackVersion == undefined) {
      var pluginPath = path.resolve(__dirname,'..')
      var pluginPkg = (fs.existsSync(pluginPath+'/package.json') && JSON.parse(fs.readFileSync(pluginPath+'/package.json', 'utf-8')) || {});
      var pluginVersion = pluginPkg.version
  
      var extPath = path.resolve(pluginPath,'../ext')
      var extPkg = (fs.existsSync(extPath+'/package.json') && JSON.parse(fs.readFileSync(extPath+'/package.json', 'utf-8')) || {});
      var extVersion = extPkg.sencha.version

      var cmdPath = path.resolve(pluginPath,'../cmd')
      var cmdPkg = (fs.existsSync(cmdPath+'/package.json') && JSON.parse(fs.readFileSync(cmdPath+'/package.json', 'utf-8')) || {});
      var cmdVersion = cmdPkg.version_full

      const isWebpack4 = compiler.hooks;
      if (isWebpack4) {this.webpackVersion = 'IS webpack 4'}
      else {this.webpackVersion = 'NOT webpack 4'}
      process.stdout.cursorTo(0);console.log(app + 'v' + pluginVersion + ', Ext JS v' + extVersion + ', Sencha Cmd v' + cmdVersion + ', ' + this.webpackVersion)
    }

    let { files, dirs } = this.options;
    const { cwd } = this.options;
    files = typeof files === 'string' ? [files] : files;
    dirs = typeof dirs === 'string' ? [dirs] : dirs;

    if (compiler.hooks) {
      compiler.hooks.afterCompile.tap('ext-after-compile', (compilation) => {
        if (me.options.verbose == 'yes') {
          process.stdout.cursorTo(0);console.log(app + 'ext-after-compile')
        }
        const {
          fileDependencies,
          contextDependencies,
        } = getFileAndContextDeps(compilation, files, dirs, cwd);
        if (files.length > 0) {
          fileDependencies.forEach((file) => {
            //console.log(`${app}${path.resolve(file)} changed ${file}`)
            compilation.fileDependencies.add(path.resolve(file));
          });
        }
        if (dirs.length > 0) {
          contextDependencies.forEach((context) => {
            compilation.contextDependencies.add(context);
          });
        }
      });
    } else {
      compiler.plugin('after-compile', (compilation, cb) => {
        console.log(app + 'after-compile')
        const {
          fileDependencies,
          contextDependencies,
        } = getFileAndContextDeps(compilation, files, dirs, cwd);
        if (files.length > 0) {
          compilation.fileDependencies = fileDependencies; // eslint-disable-line
        }
        if (dirs.length > 0) {
          compilation.contextDependencies = contextDependencies; // eslint-disable-line
        }
        cb()
      });
    }

    if (compiler.hooks) {
      var me = this
      compiler.hooks.emit.tapAsync('ext-emit-async', function (compilation, cb) {
        if (me.options.verbose == 'yes') {
          process.stdout.cursorTo(0);console.log(app + 'ext-emit-async')
        }
        var watchedFiles=[]
        //try {watchedFiles = recursiveReadSync('./app')} 
        try {watchedFiles = recursiveReadSync('./app').concat(recursiveReadSync('./packages'))}
        catch(err) {if(err.errno === 34){console.log('Path does not exist');} else {throw err;}}

        var doBuild = false
        for (var file in watchedFiles) {
          if (me.lastMilliseconds < fs.statSync(watchedFiles[file]).mtimeMs) {
            if (watchedFiles[file].indexOf("scss") != -1) {doBuild=true;break;}
          }
        }

        if (me.lastMillisecondsAppJson < fs.statSync('./app.json').mtimeMs) {
          doBuild=true;
        }

        me.lastMilliseconds = (new Date).getTime()
        me.lastMillisecondsAppJson = (new Date).getTime()

        var currentNumFiles = watchedFiles.length
        var filesource = 'this file enables client reload'
        compilation.assets[currentNumFiles + 'FilesUnderAppFolder.md'] = {
          source: function() {return filesource},
          size: function() {return filesource.length}
        }

        if (currentNumFiles != me.lastNumFiles || doBuild) {
          me.lastNumFiles = currentNumFiles
          var buildAsync = require(`${npmScope}/ext-build/app/buildAsync.js`)
          var buildOptions = {parms: ['app','build',me.options.profile, me.options.environment, me.options.verbose]}
          new buildAsync(buildOptions).executeAsync().then(function() {
            cb()
          }, function(reason){
            var prefixErr = '✖ [ext]:';
            var err = chalk.red(prefixErr) + ' ext-webpack-plugin: '
            var errorString = `${err} ${chalk.red(reason.error)}`
            compilation.errors.push(new Error(errorString))
            cb()
          })
        }
        else {
          me.lastNumFiles = currentNumFiles
          console.log(app + 'call to ext-build not needed, no new files')
          cb()
        }
      })
    }
    else {
      compiler.plugin('emit', (compilation, cb) => {
        console.log(app + 'emit')
        var filelist = 'this file enables client reload'
        compilation.assets['ForReload.md'] = {
          source: function() {return filelist},
          size: function() {return filelist.length}
        }
        var refresh = require(`${npmScope}/ext-build/app/refresh.js`)
        new refresh({})

        // console.log('THIS IS IT')
        // var buildAsync = require(`${npmScope}/ext-build/app/buildAsync.js`)
        // console.log(buildAsync)
        // new buildAsync().executeAsync().then(function() {
        //   console.log('then call');
        //   cb();
        // })


        //cb()
        //this.emitStats.bind(this)



      })
    }

  }


  // emitStats(curCompiler, callback) {
  //   // Get stats.
  //   // **Note**: In future, could pass something like `{ showAssets: true }`
  //   // to the `getStats()` function for more limited object returned.
  //   let stats = curCompiler.getStats().toJson();
  
  //   // Filter to fields.
  //   if (this.opts.fields) {
  //     stats = this.opts.fields.reduce((memo, key) => {
  //       memo[key] = stats[key];
  //       return memo;
  //     }, {});
  //   }
  
  //   // Transform to string.
  //   let err;
  //   return Promise.resolve()
  
  //     // Transform.
  //     .then(() => this.opts.transform(stats, {
  //       compiler: curCompiler
  //     }))
  //     .catch((e) => { err = e; })
  
  //     // Finish up.
  //     .then((statsStr) => {
  //       // Handle errors.
  //       if (err) {
  //         curCompiler.errors.push(err);
  //         if (callback) { return void callback(err); }
  //         throw err;
  //       }
  
  //       // Add to assets.
  //       curCompiler.assets[this.opts.filename] = {
  //         source() {
  //           return statsStr;
  //         },
  //         size() {
  //           return statsStr.length;
  //         }
  //       };
  
  //       if (callback) { return void callback(); }
  //     });
  // }
  


}






  // if (files.length > 0) {
  //   files.forEach((pattern) => {
  //     let f = pattern;
  //     if (isGlob(pattern)) {
  //       f = glob.sync(pattern, {
  //         cwd,
  //         dot: true,
  //         absolute: true,
  //       });
  //     }
  //     fds = fds.concat(f);
  //   });
  //   fds = uniq(fds);
  // }


// function hook_stdout(callback) {
//   var old_write = process.stdout.write
//   console.log('in hook')
//   process.stdout.write = (function(write) {
//       return function(string, encoding, fd) {
//           write.apply(process.stdout, arguments)
//           callback(string, encoding, fd)
//       }
//   })(process.stdout.write)

//   return function() {
//       process.stdout.write = old_write
//       console.log('in unhook')
//     }
// }
    // this.unhook = hook_stdout(function(string, encoding, fd) {
    //   console.log('stdout: ' + string)
    // })

//        this.unhook()





        // var filelist = 'In this build:\n\n';

        // // Loop through all compiled assets,
        // // adding a new line item for each filename.
        // for (var filename in compilation.assets) {
        //   filelist += ('- '+ filename +'\n');
        // }
    
        // // Insert this list into the webpack build as a new file asset:
        // compilation.assets['filelist.md'] = {
        //   source: function() {
        //     return filelist;
        //   },
        //   size: function() {
        //     return filelist.length;
        //   }
        // };





        // //var d = new Date()
        // var d = 'mjg'
        // var filelist = 'In this build:\n\n' + d + '\n\n';
        // // Loop through all compiled assets,
        // // adding a new line item for each filename.
        // for (var filename in compilation.assets) {
        //   filelist += ('- '+ filename +'\n');
        // }
        // // Insert this list into the webpack build as a new file asset:
        // compilation.assets[d + '.md'] = {
        //   source: function() {
        //     return filelist;
        //   },
        //   size: function() {
        //     return filelist.length;
        //   }
        // };