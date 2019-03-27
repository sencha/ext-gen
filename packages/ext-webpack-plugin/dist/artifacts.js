"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAppJson = createAppJson;
exports.createJSDOMEnvironment = createJSDOMEnvironment;
exports.createWorkspaceJson = createWorkspaceJson;
exports.extAngularModule = exports.buildXML = void 0;

const buildXML = function (compress, options, output) {
  const logv = require('./pluginUtil').logv;

  logv(options, 'FUNCTION buildXML');
  let compression = '';

  if (compress) {
    compression = `
      then 
      fs 
      minify 
        -yui 
        -from=ext.js 
        -to=ext.js
    `;
  }

  return `<project name="simple-build" basedir=".">
  <!--  internally, watch calls the init target, so need to have one here -->
  <target name="init"/>
  <target name="init-cmd">
    <taskdef  resource="com/sencha/ant/antlib.xml"
              classpath="\${cmd.dir}/sencha.jar"
              loaderref="senchaloader"/>
    <x-extend-classpath>
        <jar path="\${cmd.dir}/sencha.jar"/>
    </x-extend-classpath>
    <x-sencha-init prefix=""/>
    <x-compile refid="theCompiler"
                      dir="\${basedir}"
                      initOnly="true"
                      inheritAll="true">
              <![CDATA[
              -classpath=\${basedir}/manifest.js
              load-app
                  -temp=\${basedir}/temp
                  -tag=App
        ]]>
      </x-compile>
  </target>
  <target name="rebuild">
    <x-compile refid="theCompiler"
              dir="\${basedir}"
              inheritAll="true">
      <![CDATA[
      --debug
      exclude
      -all
      and
      include
      -f=Boot.js
      and
      concatenate
          ext.js
      and
      exclude
      -all
      and
      # include theme overrides
      include
        -r
        -tag=overrides
      and
      # include all js files needed for manifest.js
      include
          -r
          -f=manifest.js
      and
      # exclude the generated manifest file itself,
      # since we don't want the generated bundle file to create any components
      exclude
      -f=manifest.js
      and
      concatenate
      +append
          ext.js
      and
      scss
          -appName=App
          -imageSearchPath=resources
          -themeName=triton
          -resourceMapBase=.
          -output=ext.scss
      and
      resources
          -excludes=-all*.css
          -out=resources
      and
      resources
          -model=true
          -out=resources
      ]]>
    </x-compile>
  </target>
  <target name="build" depends="init-cmd,rebuild">
    <x-sencha-command dir="\${basedir}">
      <![CDATA[
      fashion
          -pwd=.
          -split=4095
          ${compress ? '-compress' : ''}
              ext.scss
          ext.css
      ${compression}
      ]]>
    </x-sencha-command>
  </target>
  <target name="watch" depends="init-cmd,build">
    <x-fashion-watch
      refName="fashion-watch"
      inputFile="ext.scss"
      outputFile="ext.css"
      split="4095"
      compress="${compress ? 'true' : 'false'}"
      configFile="app.json"
      fork="true"/>
    <x-watch compilerRef="theCompiler" targets="rebuild"/>
  </target>
</project>
`.trim();
};

exports.buildXML = buildXML;

function createAppJson(theme, packages, toolkit, options, output) {
  const logv = require('./pluginUtil').logv;

  logv(options, 'FUNCTION createAppJson');

  const fs = require('fs');

  var isWindows = typeof process != 'undefined' && typeof process.platform != 'undefined' && !!process.platform.match(/^win/);
  var pathDifference = output.substring(process.cwd().length);
  var numberOfPaths = pathDifference.split(isWindows ? "\\" : "/").length - 1;
  var nodeModulePath = '';

  for (var i = 0; i < numberOfPaths; i++) {
    nodeModulePath += "../";
  }

  const config = {
    framework: "ext",
    toolkit,
    requires: packages,
    "overrides": ["overrides", "jsdom-environment.js"],
    // "language": {
    //   "js": {
    //     "output": "ES5"
    //   }
    // },
    "packages": {
      "dir": [nodeModulePath + "node_modules/@sencha", nodeModulePath + toolkit + "/packages"]
    },
    output: {
      base: '.',
      resources: {
        path: './resources',
        shared: "./resources"
      }
    } // if theme is local add it as an additional package dir

  };

  if (fs.existsSync(theme)) {
    const path = require('path');

    const cjson = require('cjson');

    const packageInfo = cjson.load(path.join(theme, 'package.json'));
    config.theme = packageInfo.name;
    config.packages.dir.push(path.resolve(theme));
  } else {
    config.theme = theme;
  }

  return JSON.stringify(config, null, 2);
}

function createJSDOMEnvironment(options, output) {
  const logv = require('./pluginUtil').logv;

  logv(options, 'FUNCTION createJSDOMEnvironment');
  return 'window.Ext = Ext;';
}

function createWorkspaceJson(options, output) {
  const logv = require('./pluginUtil').logv;

  logv(options, 'FUNCTION createWorkspaceJson');
  var isWindows = typeof process != 'undefined' && typeof process.platform != 'undefined' && !!process.platform.match(/^win/);
  var pathDifference = output.substring(process.cwd().length);
  var numberOfPaths = pathDifference.split(isWindows ? "\\" : "/").length - 1;
  var nodeModulePath = '';

  for (var i = 0; i < numberOfPaths; i++) {
    nodeModulePath += "../";
  }

  logv(options, 'isWindows: ' + isWindows);
  logv(options, 'output: ' + output);
  logv(options, 'pathDifference: ' + pathDifference);
  logv(options, 'numberOfPaths: ' + numberOfPaths);
  logv(options, 'nodeModulePath: ' + nodeModulePath);
  const config = {
    "frameworks": {
      "ext": nodeModulePath + "node_modules/@sencha/ext"
    },
    "build": {
      "dir": "${workspace.dir}/" + nodeModulePath + "build"
    },
    "packages": {
      "dir": ["${workspace.dir}/" + nodeModulePath + "ext-" + options.framework + "/packages/local", "${workspace.dir}/" + nodeModulePath + "ext-" + options.framework + "/packages", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-font-ios", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-${toolkit.name}-theme-base", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-${toolkit.name}-theme-base", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-${toolkit.name}-theme-ios", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-${toolkit.name}-theme-material", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-${toolkit.name}-theme-aria", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-${toolkit.name}-theme-neutral", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-${toolkit.name}-theme-classic", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-${toolkit.name}-theme-gray", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-${toolkit.name}-theme-crisp", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-${toolkit.name}-theme-crisp-touch", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-${toolkit.name}-theme-neptune", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-${toolkit.name}-theme-neptune-touch", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-${toolkit.name}-theme-triton", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-${toolkit.name}-theme-graphite", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-calendar", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-charts", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-d3", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-exporter", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-pivot", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-pivot-d3", "${workspace.dir}/" + nodeModulePath + "node_modules/@sencha/ext-ux"],
      "extract": "${workspace.dir}/" + nodeModulePath + "packages/remote"
    }
  };
  return JSON.stringify(config, null, 2);
}

const extAngularModule = function (imports, exports, declarations) {
  return `
  import { NgModule } from '@angular/core';
  ${imports}
  @NgModule({
    imports: [
    ],
    declarations: [
  ${declarations}  ],
    exports: [
  ${exports}  ]
  })
  export class ExtAngularModule { }
  `;
};

exports.extAngularModule = extAngularModule;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hcnRpZmFjdHMuanMiXSwibmFtZXMiOlsiYnVpbGRYTUwiLCJjb21wcmVzcyIsIm9wdGlvbnMiLCJvdXRwdXQiLCJsb2d2IiwicmVxdWlyZSIsImNvbXByZXNzaW9uIiwidHJpbSIsImNyZWF0ZUFwcEpzb24iLCJ0aGVtZSIsInBhY2thZ2VzIiwidG9vbGtpdCIsImZzIiwiaXNXaW5kb3dzIiwicHJvY2VzcyIsInBsYXRmb3JtIiwibWF0Y2giLCJwYXRoRGlmZmVyZW5jZSIsInN1YnN0cmluZyIsImN3ZCIsImxlbmd0aCIsIm51bWJlck9mUGF0aHMiLCJzcGxpdCIsIm5vZGVNb2R1bGVQYXRoIiwiaSIsImNvbmZpZyIsImZyYW1ld29yayIsInJlcXVpcmVzIiwiYmFzZSIsInJlc291cmNlcyIsInBhdGgiLCJzaGFyZWQiLCJleGlzdHNTeW5jIiwiY2pzb24iLCJwYWNrYWdlSW5mbyIsImxvYWQiLCJqb2luIiwibmFtZSIsImRpciIsInB1c2giLCJyZXNvbHZlIiwiSlNPTiIsInN0cmluZ2lmeSIsImNyZWF0ZUpTRE9NRW52aXJvbm1lbnQiLCJjcmVhdGVXb3Jrc3BhY2VKc29uIiwiZXh0QW5ndWxhck1vZHVsZSIsImltcG9ydHMiLCJleHBvcnRzIiwiZGVjbGFyYXRpb25zIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQU8sTUFBTUEsUUFBUSxHQUFHLFVBQVNDLFFBQVQsRUFBbUJDLE9BQW5CLEVBQTRCQyxNQUE1QixFQUFvQztBQUMxRCxRQUFNQyxJQUFJLEdBQUdDLE9BQU8sQ0FBQyxjQUFELENBQVAsQ0FBd0JELElBQXJDOztBQUNBQSxFQUFBQSxJQUFJLENBQUNGLE9BQUQsRUFBUyxtQkFBVCxDQUFKO0FBRUEsTUFBSUksV0FBVyxHQUFHLEVBQWxCOztBQUVBLE1BQUlMLFFBQUosRUFBYztBQUNaSyxJQUFBQSxXQUFXLEdBQUk7Ozs7Ozs7S0FBZjtBQVFEOztBQUVDLFNBQVE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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QkEsY0FBdEIsR0FBdUMsdURBakJsQyxFQWtCTCxzQkFBc0JBLGNBQXRCLEdBQXVDLHlEQWxCbEMsRUFtQkwsc0JBQXNCQSxjQUF0QixHQUF1QyxtQ0FuQmxDLEVBb0JMLHNCQUFzQkEsY0FBdEIsR0FBdUMsaUNBcEJsQyxFQXFCTCxzQkFBc0JBLGNBQXRCLEdBQXVDLDZCQXJCbEMsRUFzQkwsc0JBQXNCQSxjQUF0QixHQUF1QyxtQ0F0QmxDLEVBdUJMLHNCQUFzQkEsY0FBdEIsR0FBdUMsZ0NBdkJsQyxFQXdCTCxzQkFBc0JBLGNBQXRCLEdBQXVDLG1DQXhCbEMsRUF5Qkwsc0JBQXNCQSxjQUF0QixHQUF1Qyw2QkF6QmxDLENBREc7QUE0QlYsaUJBQVcsc0JBQXNCQSxjQUF0QixHQUF1QztBQTVCeEM7QUFQQyxHQUFmO0FBc0NBLFNBQU9rQixJQUFJLENBQUNDLFNBQUwsQ0FBZWpCLE1BQWYsRUFBdUIsSUFBdkIsRUFBNkIsQ0FBN0IsQ0FBUDtBQUNEOztBQUVNLE1BQU1vQixnQkFBZ0IsR0FBRyxVQUFTQyxPQUFULEVBQWtCQyxPQUFsQixFQUEyQkMsWUFBM0IsRUFBeUM7QUFDdkUsU0FBUTs7SUFFTkYsT0FBUTs7Ozs7SUFLUkUsWUFBYTs7SUFFYkQsT0FBUTs7O0dBVFY7QUFhRCxDQWRNIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGNvbnN0IGJ1aWxkWE1MID0gZnVuY3Rpb24oY29tcHJlc3MsIG9wdGlvbnMsIG91dHB1dCkge1xuICBjb25zdCBsb2d2ID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndlxuICBsb2d2KG9wdGlvbnMsJ0ZVTkNUSU9OIGJ1aWxkWE1MJylcbiAgXG4gIGxldCBjb21wcmVzc2lvbiA9ICcnXG5cbiAgaWYgKGNvbXByZXNzKSB7XG4gICAgY29tcHJlc3Npb24gPSBgXG4gICAgICB0aGVuIFxuICAgICAgZnMgXG4gICAgICBtaW5pZnkgXG4gICAgICAgIC15dWkgXG4gICAgICAgIC1mcm9tPWV4dC5qcyBcbiAgICAgICAgLXRvPWV4dC5qc1xuICAgIGA7XG4gIH1cblxuICAgIHJldHVybiBgPHByb2plY3QgbmFtZT1cInNpbXBsZS1idWlsZFwiIGJhc2VkaXI9XCIuXCI+XG4gIDwhLS0gIGludGVybmFsbHksIHdhdGNoIGNhbGxzIHRoZSBpbml0IHRhcmdldCwgc28gbmVlZCB0byBoYXZlIG9uZSBoZXJlIC0tPlxuICA8dGFyZ2V0IG5hbWU9XCJpbml0XCIvPlxuICA8dGFyZ2V0IG5hbWU9XCJpbml0LWNtZFwiPlxuICAgIDx0YXNrZGVmICByZXNvdXJjZT1cImNvbS9zZW5jaGEvYW50L2FudGxpYi54bWxcIlxuICAgICAgICAgICAgICBjbGFzc3BhdGg9XCJcXCR7Y21kLmRpcn0vc2VuY2hhLmphclwiXG4gICAgICAgICAgICAgIGxvYWRlcnJlZj1cInNlbmNoYWxvYWRlclwiLz5cbiAgICA8eC1leHRlbmQtY2xhc3NwYXRoPlxuICAgICAgICA8amFyIHBhdGg9XCJcXCR7Y21kLmRpcn0vc2VuY2hhLmphclwiLz5cbiAgICA8L3gtZXh0ZW5kLWNsYXNzcGF0aD5cbiAgICA8eC1zZW5jaGEtaW5pdCBwcmVmaXg9XCJcIi8+XG4gICAgPHgtY29tcGlsZSByZWZpZD1cInRoZUNvbXBpbGVyXCJcbiAgICAgICAgICAgICAgICAgICAgICBkaXI9XCJcXCR7YmFzZWRpcn1cIlxuICAgICAgICAgICAgICAgICAgICAgIGluaXRPbmx5PVwidHJ1ZVwiXG4gICAgICAgICAgICAgICAgICAgICAgaW5oZXJpdEFsbD1cInRydWVcIj5cbiAgICAgICAgICAgICAgPCFbQ0RBVEFbXG4gICAgICAgICAgICAgIC1jbGFzc3BhdGg9XFwke2Jhc2VkaXJ9L21hbmlmZXN0LmpzXG4gICAgICAgICAgICAgIGxvYWQtYXBwXG4gICAgICAgICAgICAgICAgICAtdGVtcD1cXCR7YmFzZWRpcn0vdGVtcFxuICAgICAgICAgICAgICAgICAgLXRhZz1BcHBcbiAgICAgICAgXV0+XG4gICAgICA8L3gtY29tcGlsZT5cbiAgPC90YXJnZXQ+XG4gIDx0YXJnZXQgbmFtZT1cInJlYnVpbGRcIj5cbiAgICA8eC1jb21waWxlIHJlZmlkPVwidGhlQ29tcGlsZXJcIlxuICAgICAgICAgICAgICBkaXI9XCJcXCR7YmFzZWRpcn1cIlxuICAgICAgICAgICAgICBpbmhlcml0QWxsPVwidHJ1ZVwiPlxuICAgICAgPCFbQ0RBVEFbXG4gICAgICAtLWRlYnVnXG4gICAgICBleGNsdWRlXG4gICAgICAtYWxsXG4gICAgICBhbmRcbiAgICAgIGluY2x1ZGVcbiAgICAgIC1mPUJvb3QuanNcbiAgICAgIGFuZFxuICAgICAgY29uY2F0ZW5hdGVcbiAgICAgICAgICBleHQuanNcbiAgICAgIGFuZFxuICAgICAgZXhjbHVkZVxuICAgICAgLWFsbFxuICAgICAgYW5kXG4gICAgICAjIGluY2x1ZGUgdGhlbWUgb3ZlcnJpZGVzXG4gICAgICBpbmNsdWRlXG4gICAgICAgIC1yXG4gICAgICAgIC10YWc9b3ZlcnJpZGVzXG4gICAgICBhbmRcbiAgICAgICMgaW5jbHVkZSBhbGwganMgZmlsZXMgbmVlZGVkIGZvciBtYW5pZmVzdC5qc1xuICAgICAgaW5jbHVkZVxuICAgICAgICAgIC1yXG4gICAgICAgICAgLWY9bWFuaWZlc3QuanNcbiAgICAgIGFuZFxuICAgICAgIyBleGNsdWRlIHRoZSBnZW5lcmF0ZWQgbWFuaWZlc3QgZmlsZSBpdHNlbGYsXG4gICAgICAjIHNpbmNlIHdlIGRvbid0IHdhbnQgdGhlIGdlbmVyYXRlZCBidW5kbGUgZmlsZSB0byBjcmVhdGUgYW55IGNvbXBvbmVudHNcbiAgICAgIGV4Y2x1ZGVcbiAgICAgIC1mPW1hbmlmZXN0LmpzXG4gICAgICBhbmRcbiAgICAgIGNvbmNhdGVuYXRlXG4gICAgICArYXBwZW5kXG4gICAgICAgICAgZXh0LmpzXG4gICAgICBhbmRcbiAgICAgIHNjc3NcbiAgICAgICAgICAtYXBwTmFtZT1BcHBcbiAgICAgICAgICAtaW1hZ2VTZWFyY2hQYXRoPXJlc291cmNlc1xuICAgICAgICAgIC10aGVtZU5hbWU9dHJpdG9uXG4gICAgICAgICAgLXJlc291cmNlTWFwQmFzZT0uXG4gICAgICAgICAgLW91dHB1dD1leHQuc2Nzc1xuICAgICAgYW5kXG4gICAgICByZXNvdXJjZXNcbiAgICAgICAgICAtZXhjbHVkZXM9LWFsbCouY3NzXG4gICAgICAgICAgLW91dD1yZXNvdXJjZXNcbiAgICAgIGFuZFxuICAgICAgcmVzb3VyY2VzXG4gICAgICAgICAgLW1vZGVsPXRydWVcbiAgICAgICAgICAtb3V0PXJlc291cmNlc1xuICAgICAgXV0+XG4gICAgPC94LWNvbXBpbGU+XG4gIDwvdGFyZ2V0PlxuICA8dGFyZ2V0IG5hbWU9XCJidWlsZFwiIGRlcGVuZHM9XCJpbml0LWNtZCxyZWJ1aWxkXCI+XG4gICAgPHgtc2VuY2hhLWNvbW1hbmQgZGlyPVwiXFwke2Jhc2VkaXJ9XCI+XG4gICAgICA8IVtDREFUQVtcbiAgICAgIGZhc2hpb25cbiAgICAgICAgICAtcHdkPS5cbiAgICAgICAgICAtc3BsaXQ9NDA5NVxuICAgICAgICAgICR7Y29tcHJlc3MgPyAnLWNvbXByZXNzJyA6ICcnfVxuICAgICAgICAgICAgICBleHQuc2Nzc1xuICAgICAgICAgIGV4dC5jc3NcbiAgICAgICR7Y29tcHJlc3Npb259XG4gICAgICBdXT5cbiAgICA8L3gtc2VuY2hhLWNvbW1hbmQ+XG4gIDwvdGFyZ2V0PlxuICA8dGFyZ2V0IG5hbWU9XCJ3YXRjaFwiIGRlcGVuZHM9XCJpbml0LWNtZCxidWlsZFwiPlxuICAgIDx4LWZhc2hpb24td2F0Y2hcbiAgICAgIHJlZk5hbWU9XCJmYXNoaW9uLXdhdGNoXCJcbiAgICAgIGlucHV0RmlsZT1cImV4dC5zY3NzXCJcbiAgICAgIG91dHB1dEZpbGU9XCJleHQuY3NzXCJcbiAgICAgIHNwbGl0PVwiNDA5NVwiXG4gICAgICBjb21wcmVzcz1cIiR7Y29tcHJlc3MgPyAndHJ1ZScgOiAnZmFsc2UnfVwiXG4gICAgICBjb25maWdGaWxlPVwiYXBwLmpzb25cIlxuICAgICAgZm9yaz1cInRydWVcIi8+XG4gICAgPHgtd2F0Y2ggY29tcGlsZXJSZWY9XCJ0aGVDb21waWxlclwiIHRhcmdldHM9XCJyZWJ1aWxkXCIvPlxuICA8L3RhcmdldD5cbjwvcHJvamVjdD5cbmAudHJpbSgpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVBcHBKc29uKCB0aGVtZSwgcGFja2FnZXMsIHRvb2xraXQsIG9wdGlvbnMsIG91dHB1dCApIHtcbiAgY29uc3QgbG9ndiA9IHJlcXVpcmUoJy4vcGx1Z2luVXRpbCcpLmxvZ3ZcbiAgbG9ndihvcHRpb25zLCdGVU5DVElPTiBjcmVhdGVBcHBKc29uJylcblxuICBjb25zdCBmcyA9IHJlcXVpcmUoJ2ZzJylcblxuICB2YXIgaXNXaW5kb3dzID0gdHlwZW9mIHByb2Nlc3MgIT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIHByb2Nlc3MucGxhdGZvcm0gIT0gJ3VuZGVmaW5lZCcgJiYgISFwcm9jZXNzLnBsYXRmb3JtLm1hdGNoKC9ed2luLyk7XG4gIHZhciBwYXRoRGlmZmVyZW5jZSA9IG91dHB1dC5zdWJzdHJpbmcocHJvY2Vzcy5jd2QoKS5sZW5ndGgpXG4gIHZhciBudW1iZXJPZlBhdGhzID0gcGF0aERpZmZlcmVuY2Uuc3BsaXQoaXNXaW5kb3dzID8gXCJcXFxcXCIgOiBcIi9cIikubGVuZ3RoIC0gMTtcbiAgdmFyIG5vZGVNb2R1bGVQYXRoID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBudW1iZXJPZlBhdGhzOyBpKyspIHsgXG4gICAgbm9kZU1vZHVsZVBhdGggKz0gXCIuLi9cIlxuICB9XG5cbiAgY29uc3QgY29uZmlnID0ge1xuICAgIGZyYW1ld29yazogXCJleHRcIixcbiAgICB0b29sa2l0LFxuICAgIHJlcXVpcmVzOiBwYWNrYWdlcyxcbiAgICBcIm92ZXJyaWRlc1wiOiBbXG4gICAgICBcIm92ZXJyaWRlc1wiLFxuICAgICAgXCJqc2RvbS1lbnZpcm9ubWVudC5qc1wiXG4gICAgXSxcbiAgICAvLyBcImxhbmd1YWdlXCI6IHtcbiAgICAvLyAgIFwianNcIjoge1xuICAgIC8vICAgICBcIm91dHB1dFwiOiBcIkVTNVwiXG4gICAgLy8gICB9XG4gICAgLy8gfSxcbiAgICBcInBhY2thZ2VzXCI6IHtcbiAgICAgIFwiZGlyXCI6IFtcbiAgICAgICAgbm9kZU1vZHVsZVBhdGggKyBcIm5vZGVfbW9kdWxlcy9Ac2VuY2hhXCIsXG4gICAgICAgIG5vZGVNb2R1bGVQYXRoICsgdG9vbGtpdCArIFwiL3BhY2thZ2VzXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIG91dHB1dDoge1xuICAgICAgYmFzZTogJy4nLFxuICAgICAgcmVzb3VyY2VzOiB7XG4gICAgICAgIHBhdGg6ICcuL3Jlc291cmNlcycsXG4gICAgICAgIHNoYXJlZDogXCIuL3Jlc291cmNlc1wiXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlbWUgaXMgbG9jYWwgYWRkIGl0IGFzIGFuIGFkZGl0aW9uYWwgcGFja2FnZSBkaXJcbiAgaWYgKGZzLmV4aXN0c1N5bmModGhlbWUpKSB7XG4gICAgICBjb25zdCBwYXRoID0gcmVxdWlyZSgncGF0aCcpXG4gICAgICBjb25zdCBjanNvbiA9IHJlcXVpcmUoJ2Nqc29uJylcbiAgICAgIGNvbnN0IHBhY2thZ2VJbmZvID0gY2pzb24ubG9hZChwYXRoLmpvaW4odGhlbWUsICdwYWNrYWdlLmpzb24nKSk7XG4gICAgICBjb25maWcudGhlbWUgPSBwYWNrYWdlSW5mby5uYW1lO1xuICAgICAgY29uZmlnLnBhY2thZ2VzLmRpci5wdXNoKHBhdGgucmVzb2x2ZSh0aGVtZSkpO1xuICB9IGVsc2Uge1xuICAgICAgY29uZmlnLnRoZW1lID0gdGhlbWU7XG4gIH1cbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGNvbmZpZywgbnVsbCwgMilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUpTRE9NRW52aXJvbm1lbnQob3B0aW9ucywgb3V0cHV0KSB7XG4gIGNvbnN0IGxvZ3YgPSByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2d2XG4gIGxvZ3Yob3B0aW9ucywnRlVOQ1RJT04gY3JlYXRlSlNET01FbnZpcm9ubWVudCcpXG5cbiAgcmV0dXJuICd3aW5kb3cuRXh0ID0gRXh0Oydcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVdvcmtzcGFjZUpzb24ob3B0aW9ucywgb3V0cHV0KSB7XG4gIGNvbnN0IGxvZ3YgPSByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2d2XG4gIGxvZ3Yob3B0aW9ucywnRlVOQ1RJT04gY3JlYXRlV29ya3NwYWNlSnNvbicpXG5cbiAgdmFyIGlzV2luZG93cyA9IHR5cGVvZiBwcm9jZXNzICE9ICd1bmRlZmluZWQnICYmIHR5cGVvZiBwcm9jZXNzLnBsYXRmb3JtICE9ICd1bmRlZmluZWQnICYmICEhcHJvY2Vzcy5wbGF0Zm9ybS5tYXRjaCgvXndpbi8pO1xuICB2YXIgcGF0aERpZmZlcmVuY2UgPSBvdXRwdXQuc3Vic3RyaW5nKHByb2Nlc3MuY3dkKCkubGVuZ3RoKVxuICB2YXIgbnVtYmVyT2ZQYXRocyA9IHBhdGhEaWZmZXJlbmNlLnNwbGl0KGlzV2luZG93cyA/IFwiXFxcXFwiIDogXCIvXCIpLmxlbmd0aCAtIDE7XG4gIHZhciBub2RlTW9kdWxlUGF0aCA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtYmVyT2ZQYXRoczsgaSsrKSB7IFxuICAgIG5vZGVNb2R1bGVQYXRoICs9IFwiLi4vXCJcbiAgfVxuXG4gIGxvZ3Yob3B0aW9ucywnaXNXaW5kb3dzOiAnICsgaXNXaW5kb3dzKVxuICBsb2d2KG9wdGlvbnMsJ291dHB1dDogJyArIG91dHB1dClcbiAgbG9ndihvcHRpb25zLCdwYXRoRGlmZmVyZW5jZTogJyArIHBhdGhEaWZmZXJlbmNlKVxuICBsb2d2KG9wdGlvbnMsJ251bWJlck9mUGF0aHM6ICcgKyBudW1iZXJPZlBhdGhzKVxuICBsb2d2KG9wdGlvbnMsJ25vZGVNb2R1bGVQYXRoOiAnICsgbm9kZU1vZHVsZVBhdGgpXG5cblxuXG4gIGNvbnN0IGNvbmZpZyA9IHtcbiAgICBcImZyYW1ld29ya3NcIjoge1xuICAgICAgXCJleHRcIjogbm9kZU1vZHVsZVBhdGggKyBcIm5vZGVfbW9kdWxlcy9Ac2VuY2hhL2V4dFwiXG4gICAgfSxcbiAgICBcImJ1aWxkXCI6IHtcbiAgICAgIFwiZGlyXCI6IFwiJHt3b3Jrc3BhY2UuZGlyfS9cIiArIG5vZGVNb2R1bGVQYXRoICsgXCJidWlsZFwiXG4gICAgfSxcbiAgICBcInBhY2thZ2VzXCI6IHtcbiAgICAgIFwiZGlyXCI6IFtcbiAgICAgICAgXCIke3dvcmtzcGFjZS5kaXJ9L1wiICsgbm9kZU1vZHVsZVBhdGggKyBcImV4dC1cIiArIG9wdGlvbnMuZnJhbWV3b3JrICsgXCIvcGFja2FnZXMvbG9jYWxcIixcbiAgICAgICAgXCIke3dvcmtzcGFjZS5kaXJ9L1wiICsgbm9kZU1vZHVsZVBhdGggKyBcImV4dC1cIiArIG9wdGlvbnMuZnJhbWV3b3JrICsgXCIvcGFja2FnZXNcIixcbiAgICAgICAgXCIke3dvcmtzcGFjZS5kaXJ9L1wiICsgbm9kZU1vZHVsZVBhdGggKyBcIm5vZGVfbW9kdWxlcy9Ac2VuY2hhXCIsXG4gICAgICAgIFwiJHt3b3Jrc3BhY2UuZGlyfS9cIiArIG5vZGVNb2R1bGVQYXRoICsgXCJub2RlX21vZHVsZXMvQHNlbmNoYS9leHQtZm9udC1pb3NcIixcbiAgICAgICAgXCIke3dvcmtzcGFjZS5kaXJ9L1wiICsgbm9kZU1vZHVsZVBhdGggKyBcIm5vZGVfbW9kdWxlcy9Ac2VuY2hhL2V4dC0ke3Rvb2xraXQubmFtZX0tdGhlbWUtYmFzZVwiLFxuICAgICAgICBcIiR7d29ya3NwYWNlLmRpcn0vXCIgKyBub2RlTW9kdWxlUGF0aCArIFwibm9kZV9tb2R1bGVzL0BzZW5jaGEvZXh0LSR7dG9vbGtpdC5uYW1lfS10aGVtZS1iYXNlXCIsXG4gICAgICAgIFwiJHt3b3Jrc3BhY2UuZGlyfS9cIiArIG5vZGVNb2R1bGVQYXRoICsgXCJub2RlX21vZHVsZXMvQHNlbmNoYS9leHQtJHt0b29sa2l0Lm5hbWV9LXRoZW1lLWlvc1wiLFxuICAgICAgICBcIiR7d29ya3NwYWNlLmRpcn0vXCIgKyBub2RlTW9kdWxlUGF0aCArIFwibm9kZV9tb2R1bGVzL0BzZW5jaGEvZXh0LSR7dG9vbGtpdC5uYW1lfS10aGVtZS1tYXRlcmlhbFwiLFxuICAgICAgICBcIiR7d29ya3NwYWNlLmRpcn0vXCIgKyBub2RlTW9kdWxlUGF0aCArIFwibm9kZV9tb2R1bGVzL0BzZW5jaGEvZXh0LSR7dG9vbGtpdC5uYW1lfS10aGVtZS1hcmlhXCIsXG4gICAgICAgIFwiJHt3b3Jrc3BhY2UuZGlyfS9cIiArIG5vZGVNb2R1bGVQYXRoICsgXCJub2RlX21vZHVsZXMvQHNlbmNoYS9leHQtJHt0b29sa2l0Lm5hbWV9LXRoZW1lLW5ldXRyYWxcIixcbiAgICAgICAgXCIke3dvcmtzcGFjZS5kaXJ9L1wiICsgbm9kZU1vZHVsZVBhdGggKyBcIm5vZGVfbW9kdWxlcy9Ac2VuY2hhL2V4dC0ke3Rvb2xraXQubmFtZX0tdGhlbWUtY2xhc3NpY1wiLFxuICAgICAgICBcIiR7d29ya3NwYWNlLmRpcn0vXCIgKyBub2RlTW9kdWxlUGF0aCArIFwibm9kZV9tb2R1bGVzL0BzZW5jaGEvZXh0LSR7dG9vbGtpdC5uYW1lfS10aGVtZS1ncmF5XCIsXG4gICAgICAgIFwiJHt3b3Jrc3BhY2UuZGlyfS9cIiArIG5vZGVNb2R1bGVQYXRoICsgXCJub2RlX21vZHVsZXMvQHNlbmNoYS9leHQtJHt0b29sa2l0Lm5hbWV9LXRoZW1lLWNyaXNwXCIsXG4gICAgICAgIFwiJHt3b3Jrc3BhY2UuZGlyfS9cIiArIG5vZGVNb2R1bGVQYXRoICsgXCJub2RlX21vZHVsZXMvQHNlbmNoYS9leHQtJHt0b29sa2l0Lm5hbWV9LXRoZW1lLWNyaXNwLXRvdWNoXCIsXG4gICAgICAgIFwiJHt3b3Jrc3BhY2UuZGlyfS9cIiArIG5vZGVNb2R1bGVQYXRoICsgXCJub2RlX21vZHVsZXMvQHNlbmNoYS9leHQtJHt0b29sa2l0Lm5hbWV9LXRoZW1lLW5lcHR1bmVcIixcbiAgICAgICAgXCIke3dvcmtzcGFjZS5kaXJ9L1wiICsgbm9kZU1vZHVsZVBhdGggKyBcIm5vZGVfbW9kdWxlcy9Ac2VuY2hhL2V4dC0ke3Rvb2xraXQubmFtZX0tdGhlbWUtbmVwdHVuZS10b3VjaFwiLFxuICAgICAgICBcIiR7d29ya3NwYWNlLmRpcn0vXCIgKyBub2RlTW9kdWxlUGF0aCArIFwibm9kZV9tb2R1bGVzL0BzZW5jaGEvZXh0LSR7dG9vbGtpdC5uYW1lfS10aGVtZS10cml0b25cIixcbiAgICAgICAgXCIke3dvcmtzcGFjZS5kaXJ9L1wiICsgbm9kZU1vZHVsZVBhdGggKyBcIm5vZGVfbW9kdWxlcy9Ac2VuY2hhL2V4dC0ke3Rvb2xraXQubmFtZX0tdGhlbWUtZ3JhcGhpdGVcIixcbiAgICAgICAgXCIke3dvcmtzcGFjZS5kaXJ9L1wiICsgbm9kZU1vZHVsZVBhdGggKyBcIm5vZGVfbW9kdWxlcy9Ac2VuY2hhL2V4dC1jYWxlbmRhclwiLFxuICAgICAgICBcIiR7d29ya3NwYWNlLmRpcn0vXCIgKyBub2RlTW9kdWxlUGF0aCArIFwibm9kZV9tb2R1bGVzL0BzZW5jaGEvZXh0LWNoYXJ0c1wiLFxuICAgICAgICBcIiR7d29ya3NwYWNlLmRpcn0vXCIgKyBub2RlTW9kdWxlUGF0aCArIFwibm9kZV9tb2R1bGVzL0BzZW5jaGEvZXh0LWQzXCIsXG4gICAgICAgIFwiJHt3b3Jrc3BhY2UuZGlyfS9cIiArIG5vZGVNb2R1bGVQYXRoICsgXCJub2RlX21vZHVsZXMvQHNlbmNoYS9leHQtZXhwb3J0ZXJcIixcbiAgICAgICAgXCIke3dvcmtzcGFjZS5kaXJ9L1wiICsgbm9kZU1vZHVsZVBhdGggKyBcIm5vZGVfbW9kdWxlcy9Ac2VuY2hhL2V4dC1waXZvdFwiLFxuICAgICAgICBcIiR7d29ya3NwYWNlLmRpcn0vXCIgKyBub2RlTW9kdWxlUGF0aCArIFwibm9kZV9tb2R1bGVzL0BzZW5jaGEvZXh0LXBpdm90LWQzXCIsXG4gICAgICAgIFwiJHt3b3Jrc3BhY2UuZGlyfS9cIiArIG5vZGVNb2R1bGVQYXRoICsgXCJub2RlX21vZHVsZXMvQHNlbmNoYS9leHQtdXhcIixcbiAgICAgIF0sXG4gICAgICBcImV4dHJhY3RcIjogXCIke3dvcmtzcGFjZS5kaXJ9L1wiICsgbm9kZU1vZHVsZVBhdGggKyBcInBhY2thZ2VzL3JlbW90ZVwiXG4gICAgfVxuICB9XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShjb25maWcsIG51bGwsIDIpXG59XG5cbmV4cG9ydCBjb25zdCBleHRBbmd1bGFyTW9kdWxlID0gZnVuY3Rpb24oaW1wb3J0cywgZXhwb3J0cywgZGVjbGFyYXRpb25zKSB7XG4gIHJldHVybiBgXG4gIGltcG9ydCB7IE5nTW9kdWxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG4gICR7aW1wb3J0c31cbiAgQE5nTW9kdWxlKHtcbiAgICBpbXBvcnRzOiBbXG4gICAgXSxcbiAgICBkZWNsYXJhdGlvbnM6IFtcbiAgJHtkZWNsYXJhdGlvbnN9ICBdLFxuICAgIGV4cG9ydHM6IFtcbiAgJHtleHBvcnRzfSAgXVxuICB9KVxuICBleHBvcnQgY2xhc3MgRXh0QW5ndWxhck1vZHVsZSB7IH1cbiAgYFxufVxuIl19