'use strict'
require('@babel/polyfill')

export default class ExtWebpackPlugin {

  constructor(options) {
    var data = require(`./pluginUtil`)._constructor(options)
    this.plugin = data.plugin
  }

  apply(compiler) {
    if (compiler.hooks) {

      if ( this.plugin.vars.framework == 'extjs') {
        compiler.hooks.afterCompile.tap('ext-after-compile', (compilation) => {
          require(`./extjsUtil`)._afterCompile(compilation, this.plugin.vars, this.plugin.options)
        })
      }
      else {


        compiler.hooks.compilation.tap(`ext-compilation`, (compilation) => {
          const log = require('./pluginUtil').log
          if (this.plugin.vars.production) {
            log(app + `ext-compilation-production`)
            compilation.hooks.succeedModule.tap(`ext-succeed-module`, (module) => {
              if (module.resource && module.resource.match(/\.(j|t)sx?$/) && !module.resource.match(/node_modules/) && !module.resource.match('/ext-react/dist/')) {
                this.plugin.vars.deps = [ 
                  ...(this.plugin.vars.deps || []), 
                  ...require(`./${this.plugin.vars.framework}Util`).extractFromSource(module._source._value) 
                ]
              }
            })
          }
          else {
            log(this.plugin.vars.app + `ext-compilation`)
          }
          compilation.hooks.htmlWebpackPluginBeforeHtmlGeneration.tap(`ext-html-generation`,(data) => {
            log(this.plugin.vars.app + `ext-html-generation`)
            const path = require('path')
            var publicPath = ''
            if (compilation.outputOptions.publicPath != undefined) {
              publicPath = compilation.outputOptions.publicPath
            }
            data.assets.js.unshift(path.join(publicPath, this.plugin.vars.output + '/ext.js'))
            data.assets.css.unshift(path.join(publicPath, this.plugin.vars.output + '/ext.css'))
          })
        })



      }

      compiler.hooks.emit.tapAsync(`ext-emit`, (compilation, callback) => {
        require(`./pluginUtil`).emit(compiler, compilation, this.plugin.vars, this.plugin.options, callback)
      })

      compiler.hooks.done.tap(`ext-done`, () => {
        require('./pluginUtil').log(this.plugin.vars.app + `ext-done`)
      })

    }
    else {console.log('not webpack 4')}
  }

}
