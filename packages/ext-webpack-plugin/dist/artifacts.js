"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAppJson = createAppJson;
exports.createJSDOMEnvironment = createJSDOMEnvironment;
exports.createWorkspaceJson = createWorkspaceJson;
exports.buildXML = void 0;

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
  } // <x-extend-classpath>
  //   <jar path="\${cmd.dir}/sencha.jar"/>
  // </x-extend-classpath>


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

  const fs = require('fs'); // overrides: overrides.map(dir => path.resolve(dir)).concat('jsdom-environment.js'),
  // packages: {
  //   dir: packageDirs.map(dir => path.resolve(dir))
  // },


  var pathDifference = output.substring(process.cwd().length);
  var numberOfPaths = pathDifference.split("/").length - 1;
  var nodeModulePath = '';

  for (var i = 0; i < numberOfPaths; i++) {
    nodeModulePath += "../";
  }

  const config = {
    framework: "ext",
    toolkit,
    requires: packages,
    "overrides": ["overrides", "jsdom-environment.js"],
    "packages": {
      "dir": [nodeModulePath + "node_modules/@sencha", "packages"]
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
  var pathDifference = output.substring(process.cwd().length);
  var numberOfPaths = pathDifference.split("/").length - 1;
  var nodeModulePath = '';

  for (var i = 0; i < numberOfPaths; i++) {
    nodeModulePath += "../";
  }

  const config = {
    "frameworks": {
      "ext": nodeModulePath + "node_modules/@sencha/ext"
    },
    "packages": {
      "dir": ["${workspace.dir}" + nodeModulePath + "ext-" + options.framework + "/packages", "${workspace.dir}" + nodeModulePath + "node_modules/@sencha"],
      "extract": "${workspace.dir}/packages/remote"
    }
  };
  return JSON.stringify(config, null, 2);
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hcnRpZmFjdHMuanMiXSwibmFtZXMiOlsiYnVpbGRYTUwiLCJjb21wcmVzcyIsIm9wdGlvbnMiLCJvdXRwdXQiLCJsb2d2IiwicmVxdWlyZSIsImNvbXByZXNzaW9uIiwidHJpbSIsImNyZWF0ZUFwcEpzb24iLCJ0aGVtZSIsInBhY2thZ2VzIiwidG9vbGtpdCIsImZzIiwicGF0aERpZmZlcmVuY2UiLCJzdWJzdHJpbmciLCJwcm9jZXNzIiwiY3dkIiwibGVuZ3RoIiwibnVtYmVyT2ZQYXRocyIsInNwbGl0Iiwibm9kZU1vZHVsZVBhdGgiLCJpIiwiY29uZmlnIiwiZnJhbWV3b3JrIiwicmVxdWlyZXMiLCJiYXNlIiwicmVzb3VyY2VzIiwicGF0aCIsInNoYXJlZCIsImV4aXN0c1N5bmMiLCJwYWNrYWdlSW5mbyIsImNqc29uIiwibG9hZCIsImpvaW4iLCJuYW1lIiwiZGlyIiwicHVzaCIsInJlc29sdmUiLCJKU09OIiwic3RyaW5naWZ5IiwiY3JlYXRlSlNET01FbnZpcm9ubWVudCIsImNyZWF0ZVdvcmtzcGFjZUpzb24iXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBTyxNQUFNQSxRQUFRLEdBQUcsVUFBU0MsUUFBVCxFQUFtQkMsT0FBbkIsRUFBNEJDLE1BQTVCLEVBQW9DO0FBQzFELFFBQU1DLElBQUksR0FBR0MsT0FBTyxDQUFDLGNBQUQsQ0FBUCxDQUF3QkQsSUFBckM7O0FBQ0FBLEVBQUFBLElBQUksQ0FBQ0YsT0FBRCxFQUFTLG1CQUFULENBQUo7QUFFQSxNQUFJSSxXQUFXLEdBQUcsRUFBbEI7O0FBRUEsTUFBSUwsUUFBSixFQUFjO0FBQ1pLLElBQUFBLFdBQVcsR0FBSTs7Ozs7OztLQUFmO0FBUUQsR0FmeUQsQ0FpQjVEO0FBQ0E7QUFDQTs7O0FBRUksU0FBUTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7WUFtRkFMLFFBQVEsR0FBRyxXQUFILEdBQWlCLEVBQUc7OztRQUdoQ0ssV0FBWTs7Ozs7Ozs7OztrQkFVRkwsUUFBUSxHQUFHLE1BQUgsR0FBWSxPQUFROzs7Ozs7Q0FoR25DLENBc0dUTSxJQXRHUyxFQUFQO0FBdUdILENBNUhNOzs7O0FBOEhBLFNBQVNDLGFBQVQsQ0FBd0JDLEtBQXhCLEVBQStCQyxRQUEvQixFQUF5Q0MsT0FBekMsRUFBa0RULE9BQWxELEVBQTJEQyxNQUEzRCxFQUFvRTtBQUN6RSxRQUFNQyxJQUFJLEdBQUdDLE9BQU8sQ0FBQyxjQUFELENBQVAsQ0FBd0JELElBQXJDOztBQUNBQSxFQUFBQSxJQUFJLENBQUNGLE9BQUQsRUFBUyx3QkFBVCxDQUFKOztBQUVBLFFBQU1VLEVBQUUsR0FBR1AsT0FBTyxDQUFDLElBQUQsQ0FBbEIsQ0FKeUUsQ0FNekU7QUFDQTtBQUNBO0FBQ0E7OztBQUVBLE1BQUlRLGNBQWMsR0FBR1YsTUFBTSxDQUFDVyxTQUFQLENBQWlCQyxPQUFPLENBQUNDLEdBQVIsR0FBY0MsTUFBL0IsQ0FBckI7QUFDQSxNQUFJQyxhQUFhLEdBQUlMLGNBQWMsQ0FBQ00sS0FBZixDQUFxQixHQUFyQixFQUEwQkYsTUFBMUIsR0FBbUMsQ0FBeEQ7QUFDQSxNQUFJRyxjQUFjLEdBQUcsRUFBckI7O0FBQ0EsT0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHSCxhQUFwQixFQUFtQ0csQ0FBQyxFQUFwQyxFQUF3QztBQUN0Q0QsSUFBQUEsY0FBYyxJQUFJLEtBQWxCO0FBQ0Q7O0FBRUQsUUFBTUUsTUFBTSxHQUFHO0FBQ2JDLElBQUFBLFNBQVMsRUFBRSxLQURFO0FBRWJaLElBQUFBLE9BRmE7QUFHYmEsSUFBQUEsUUFBUSxFQUFFZCxRQUhHO0FBSWIsaUJBQWEsQ0FDWCxXQURXLEVBRVgsc0JBRlcsQ0FKQTtBQVFiLGdCQUFZO0FBQ1YsYUFBTyxDQUNMVSxjQUFjLEdBQUcsc0JBRFosRUFFTCxVQUZLO0FBREcsS0FSQztBQWNiakIsSUFBQUEsTUFBTSxFQUFFO0FBQ05zQixNQUFBQSxJQUFJLEVBQUUsR0FEQTtBQUVOQyxNQUFBQSxTQUFTLEVBQUU7QUFDVEMsUUFBQUEsSUFBSSxFQUFFLGFBREc7QUFFVEMsUUFBQUEsTUFBTSxFQUFFO0FBRkM7QUFGTCxLQWRLLENBdUJmOztBQXZCZSxHQUFmOztBQXdCQSxNQUFJaEIsRUFBRSxDQUFDaUIsVUFBSCxDQUFjcEIsS0FBZCxDQUFKLEVBQTBCO0FBQ3RCLFVBQU1xQixXQUFXLEdBQUdDLEtBQUssQ0FBQ0MsSUFBTixDQUFXTCxJQUFJLENBQUNNLElBQUwsQ0FBVXhCLEtBQVYsRUFBaUIsY0FBakIsQ0FBWCxDQUFwQjtBQUNBYSxJQUFBQSxNQUFNLENBQUNiLEtBQVAsR0FBZXFCLFdBQVcsQ0FBQ0ksSUFBM0I7QUFDQVosSUFBQUEsTUFBTSxDQUFDWixRQUFQLENBQWdCeUIsR0FBaEIsQ0FBb0JDLElBQXBCLENBQXlCVCxJQUFJLENBQUNVLE9BQUwsQ0FBYTVCLEtBQWIsQ0FBekI7QUFDSCxHQUpELE1BSU87QUFDSGEsSUFBQUEsTUFBTSxDQUFDYixLQUFQLEdBQWVBLEtBQWY7QUFDSDs7QUFDRCxTQUFPNkIsSUFBSSxDQUFDQyxTQUFMLENBQWVqQixNQUFmLEVBQXVCLElBQXZCLEVBQTZCLENBQTdCLENBQVA7QUFDRDs7QUFFTSxTQUFTa0Isc0JBQVQsQ0FBZ0N0QyxPQUFoQyxFQUF5Q0MsTUFBekMsRUFBaUQ7QUFDdEQsUUFBTUMsSUFBSSxHQUFHQyxPQUFPLENBQUMsY0FBRCxDQUFQLENBQXdCRCxJQUFyQzs7QUFDQUEsRUFBQUEsSUFBSSxDQUFDRixPQUFELEVBQVMsaUNBQVQsQ0FBSjtBQUVBLFNBQU8sbUJBQVA7QUFDRDs7QUFFTSxTQUFTdUMsbUJBQVQsQ0FBNkJ2QyxPQUE3QixFQUFzQ0MsTUFBdEMsRUFBOEM7QUFDbkQsUUFBTUMsSUFBSSxHQUFHQyxPQUFPLENBQUMsY0FBRCxDQUFQLENBQXdCRCxJQUFyQzs7QUFDQUEsRUFBQUEsSUFBSSxDQUFDRixPQUFELEVBQVMsOEJBQVQsQ0FBSjtBQUVBLE1BQUlXLGNBQWMsR0FBR1YsTUFBTSxDQUFDVyxTQUFQLENBQWlCQyxPQUFPLENBQUNDLEdBQVIsR0FBY0MsTUFBL0IsQ0FBckI7QUFDQSxNQUFJQyxhQUFhLEdBQUlMLGNBQWMsQ0FBQ00sS0FBZixDQUFxQixHQUFyQixFQUEwQkYsTUFBMUIsR0FBbUMsQ0FBeEQ7QUFDQSxNQUFJRyxjQUFjLEdBQUcsRUFBckI7O0FBQ0EsT0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBYixFQUFnQkEsQ0FBQyxHQUFHSCxhQUFwQixFQUFtQ0csQ0FBQyxFQUFwQyxFQUF3QztBQUN0Q0QsSUFBQUEsY0FBYyxJQUFJLEtBQWxCO0FBQ0Q7O0FBRUQsUUFBTUUsTUFBTSxHQUFHO0FBQ2Isa0JBQWM7QUFDWixhQUFPRixjQUFjLEdBQUc7QUFEWixLQUREO0FBSWIsZ0JBQVk7QUFDVixhQUFPLENBQ0wscUJBQXFCQSxjQUFyQixHQUFzQyxNQUF0QyxHQUErQ2xCLE9BQU8sQ0FBQ3FCLFNBQXZELEdBQW1FLFdBRDlELEVBRUwscUJBQXFCSCxjQUFyQixHQUFzQyxzQkFGakMsQ0FERztBQUtWLGlCQUFXO0FBTEQ7QUFKQyxHQUFmO0FBWUEsU0FBT2tCLElBQUksQ0FBQ0MsU0FBTCxDQUFlakIsTUFBZixFQUF1QixJQUF2QixFQUE2QixDQUE3QixDQUFQO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgYnVpbGRYTUwgPSBmdW5jdGlvbihjb21wcmVzcywgb3B0aW9ucywgb3V0cHV0KSB7XG4gIGNvbnN0IGxvZ3YgPSByZXF1aXJlKCcuL3BsdWdpblV0aWwnKS5sb2d2XG4gIGxvZ3Yob3B0aW9ucywnRlVOQ1RJT04gYnVpbGRYTUwnKVxuXG4gIGxldCBjb21wcmVzc2lvbiA9ICcnXG4gIFxuICBpZiAoY29tcHJlc3MpIHtcbiAgICBjb21wcmVzc2lvbiA9IGBcbiAgICAgIHRoZW4gXG4gICAgICBmcyBcbiAgICAgIG1pbmlmeSBcbiAgICAgICAgLXl1aSBcbiAgICAgICAgLWZyb209ZXh0LmpzIFxuICAgICAgICAtdG89ZXh0LmpzXG4gICAgYDtcbiAgfVxuXG4vLyA8eC1leHRlbmQtY2xhc3NwYXRoPlxuLy8gICA8amFyIHBhdGg9XCJcXCR7Y21kLmRpcn0vc2VuY2hhLmphclwiLz5cbi8vIDwveC1leHRlbmQtY2xhc3NwYXRoPlxuXG4gICAgcmV0dXJuIGA8cHJvamVjdCBuYW1lPVwic2ltcGxlLWJ1aWxkXCIgYmFzZWRpcj1cIi5cIj5cbiAgPCEtLSAgaW50ZXJuYWxseSwgd2F0Y2ggY2FsbHMgdGhlIGluaXQgdGFyZ2V0LCBzbyBuZWVkIHRvIGhhdmUgb25lIGhlcmUgLS0+XG4gIDx0YXJnZXQgbmFtZT1cImluaXRcIi8+XG4gIDx0YXJnZXQgbmFtZT1cImluaXQtY21kXCI+XG4gICAgPHRhc2tkZWYgIHJlc291cmNlPVwiY29tL3NlbmNoYS9hbnQvYW50bGliLnhtbFwiXG4gICAgICAgICAgICAgIGNsYXNzcGF0aD1cIlxcJHtjbWQuZGlyfS9zZW5jaGEuamFyXCJcbiAgICAgICAgICAgICAgbG9hZGVycmVmPVwic2VuY2hhbG9hZGVyXCIvPlxuICAgIDx4LWV4dGVuZC1jbGFzc3BhdGg+XG4gICAgICAgIDxqYXIgcGF0aD1cIlxcJHtjbWQuZGlyfS9zZW5jaGEuamFyXCIvPlxuICAgIDwveC1leHRlbmQtY2xhc3NwYXRoPlxuICAgIDx4LXNlbmNoYS1pbml0IHByZWZpeD1cIlwiLz5cbiAgICA8eC1jb21waWxlIHJlZmlkPVwidGhlQ29tcGlsZXJcIlxuICAgICAgICAgICAgICAgICAgICAgIGRpcj1cIlxcJHtiYXNlZGlyfVwiXG4gICAgICAgICAgICAgICAgICAgICAgaW5pdE9ubHk9XCJ0cnVlXCJcbiAgICAgICAgICAgICAgICAgICAgICBpbmhlcml0QWxsPVwidHJ1ZVwiPlxuICAgICAgICAgICAgICA8IVtDREFUQVtcbiAgICAgICAgICAgICAgLWNsYXNzcGF0aD1cXCR7YmFzZWRpcn0vbWFuaWZlc3QuanNcbiAgICAgICAgICAgICAgbG9hZC1hcHBcbiAgICAgICAgICAgICAgICAgIC10ZW1wPVxcJHtiYXNlZGlyfS90ZW1wXG4gICAgICAgICAgICAgICAgICAtdGFnPUFwcFxuICAgICAgICBdXT5cbiAgICAgIDwveC1jb21waWxlPlxuICA8L3RhcmdldD5cbiAgPHRhcmdldCBuYW1lPVwicmVidWlsZFwiPlxuICAgIDx4LWNvbXBpbGUgcmVmaWQ9XCJ0aGVDb21waWxlclwiXG4gICAgICAgICAgICAgIGRpcj1cIlxcJHtiYXNlZGlyfVwiXG4gICAgICAgICAgICAgIGluaGVyaXRBbGw9XCJ0cnVlXCI+XG4gICAgICA8IVtDREFUQVtcbiAgICAgIC0tZGVidWdcbiAgICAgIGV4Y2x1ZGVcbiAgICAgIC1hbGxcbiAgICAgIGFuZFxuICAgICAgaW5jbHVkZVxuICAgICAgLWY9Qm9vdC5qc1xuICAgICAgYW5kXG4gICAgICBjb25jYXRlbmF0ZVxuICAgICAgICAgIGV4dC5qc1xuICAgICAgYW5kXG4gICAgICBleGNsdWRlXG4gICAgICAtYWxsXG4gICAgICBhbmRcbiAgICAgICMgaW5jbHVkZSB0aGVtZSBvdmVycmlkZXNcbiAgICAgIGluY2x1ZGVcbiAgICAgICAgLXJcbiAgICAgICAgLXRhZz1vdmVycmlkZXNcbiAgICAgIGFuZFxuICAgICAgIyBpbmNsdWRlIGFsbCBqcyBmaWxlcyBuZWVkZWQgZm9yIG1hbmlmZXN0LmpzXG4gICAgICBpbmNsdWRlXG4gICAgICAgICAgLXJcbiAgICAgICAgICAtZj1tYW5pZmVzdC5qc1xuICAgICAgYW5kXG4gICAgICAjIGV4Y2x1ZGUgdGhlIGdlbmVyYXRlZCBtYW5pZmVzdCBmaWxlIGl0c2VsZixcbiAgICAgICMgc2luY2Ugd2UgZG9uJ3Qgd2FudCB0aGUgZ2VuZXJhdGVkIGJ1bmRsZSBmaWxlIHRvIGNyZWF0ZSBhbnkgY29tcG9uZW50c1xuICAgICAgZXhjbHVkZVxuICAgICAgLWY9bWFuaWZlc3QuanNcbiAgICAgIGFuZFxuICAgICAgY29uY2F0ZW5hdGVcbiAgICAgICthcHBlbmRcbiAgICAgICAgICBleHQuanNcbiAgICAgIGFuZFxuICAgICAgc2Nzc1xuICAgICAgICAgIC1hcHBOYW1lPUFwcFxuICAgICAgICAgIC1pbWFnZVNlYXJjaFBhdGg9cmVzb3VyY2VzXG4gICAgICAgICAgLXRoZW1lTmFtZT10cml0b25cbiAgICAgICAgICAtcmVzb3VyY2VNYXBCYXNlPS5cbiAgICAgICAgICAtb3V0cHV0PWV4dC5zY3NzXG4gICAgICBhbmRcbiAgICAgIHJlc291cmNlc1xuICAgICAgICAgIC1leGNsdWRlcz0tYWxsKi5jc3NcbiAgICAgICAgICAtb3V0PXJlc291cmNlc1xuICAgICAgYW5kXG4gICAgICByZXNvdXJjZXNcbiAgICAgICAgICAtbW9kZWw9dHJ1ZVxuICAgICAgICAgIC1vdXQ9cmVzb3VyY2VzXG4gICAgICBdXT5cbiAgICA8L3gtY29tcGlsZT5cbiAgPC90YXJnZXQ+XG4gIDx0YXJnZXQgbmFtZT1cImJ1aWxkXCIgZGVwZW5kcz1cImluaXQtY21kLHJlYnVpbGRcIj5cbiAgICA8eC1zZW5jaGEtY29tbWFuZCBkaXI9XCJcXCR7YmFzZWRpcn1cIj5cbiAgICAgIDwhW0NEQVRBW1xuICAgICAgZmFzaGlvblxuICAgICAgICAgIC1wd2Q9LlxuICAgICAgICAgIC1zcGxpdD00MDk1XG4gICAgICAgICAgJHtjb21wcmVzcyA/ICctY29tcHJlc3MnIDogJyd9XG4gICAgICAgICAgICAgIGV4dC5zY3NzXG4gICAgICAgICAgZXh0LmNzc1xuICAgICAgJHtjb21wcmVzc2lvbn1cbiAgICAgIF1dPlxuICAgIDwveC1zZW5jaGEtY29tbWFuZD5cbiAgPC90YXJnZXQ+XG4gIDx0YXJnZXQgbmFtZT1cIndhdGNoXCIgZGVwZW5kcz1cImluaXQtY21kLGJ1aWxkXCI+XG4gICAgPHgtZmFzaGlvbi13YXRjaFxuICAgICAgcmVmTmFtZT1cImZhc2hpb24td2F0Y2hcIlxuICAgICAgaW5wdXRGaWxlPVwiZXh0LnNjc3NcIlxuICAgICAgb3V0cHV0RmlsZT1cImV4dC5jc3NcIlxuICAgICAgc3BsaXQ9XCI0MDk1XCJcbiAgICAgIGNvbXByZXNzPVwiJHtjb21wcmVzcyA/ICd0cnVlJyA6ICdmYWxzZSd9XCJcbiAgICAgIGNvbmZpZ0ZpbGU9XCJhcHAuanNvblwiXG4gICAgICBmb3JrPVwidHJ1ZVwiLz5cbiAgICA8eC13YXRjaCBjb21waWxlclJlZj1cInRoZUNvbXBpbGVyXCIgdGFyZ2V0cz1cInJlYnVpbGRcIi8+XG4gIDwvdGFyZ2V0PlxuPC9wcm9qZWN0PlxuYC50cmltKClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUFwcEpzb24oIHRoZW1lLCBwYWNrYWdlcywgdG9vbGtpdCwgb3B0aW9ucywgb3V0cHV0ICkge1xuICBjb25zdCBsb2d2ID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndlxuICBsb2d2KG9wdGlvbnMsJ0ZVTkNUSU9OIGNyZWF0ZUFwcEpzb24nKVxuXG4gIGNvbnN0IGZzID0gcmVxdWlyZSgnZnMnKVxuXG4gIC8vIG92ZXJyaWRlczogb3ZlcnJpZGVzLm1hcChkaXIgPT4gcGF0aC5yZXNvbHZlKGRpcikpLmNvbmNhdCgnanNkb20tZW52aXJvbm1lbnQuanMnKSxcbiAgLy8gcGFja2FnZXM6IHtcbiAgLy8gICBkaXI6IHBhY2thZ2VEaXJzLm1hcChkaXIgPT4gcGF0aC5yZXNvbHZlKGRpcikpXG4gIC8vIH0sXG5cbiAgdmFyIHBhdGhEaWZmZXJlbmNlID0gb3V0cHV0LnN1YnN0cmluZyhwcm9jZXNzLmN3ZCgpLmxlbmd0aClcbiAgdmFyIG51bWJlck9mUGF0aHMgPSAocGF0aERpZmZlcmVuY2Uuc3BsaXQoXCIvXCIpLmxlbmd0aCAtIDEpXG4gIHZhciBub2RlTW9kdWxlUGF0aCA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbnVtYmVyT2ZQYXRoczsgaSsrKSB7IFxuICAgIG5vZGVNb2R1bGVQYXRoICs9IFwiLi4vXCJcbiAgfVxuXG4gIGNvbnN0IGNvbmZpZyA9IHtcbiAgICBmcmFtZXdvcms6IFwiZXh0XCIsXG4gICAgdG9vbGtpdCxcbiAgICByZXF1aXJlczogcGFja2FnZXMsXG4gICAgXCJvdmVycmlkZXNcIjogW1xuICAgICAgXCJvdmVycmlkZXNcIixcbiAgICAgIFwianNkb20tZW52aXJvbm1lbnQuanNcIlxuICAgIF0sXG4gICAgXCJwYWNrYWdlc1wiOiB7XG4gICAgICBcImRpclwiOiBbXG4gICAgICAgIG5vZGVNb2R1bGVQYXRoICsgXCJub2RlX21vZHVsZXMvQHNlbmNoYVwiLFxuICAgICAgICBcInBhY2thZ2VzXCJcbiAgICAgIF1cbiAgICB9LFxuICAgIG91dHB1dDoge1xuICAgICAgYmFzZTogJy4nLFxuICAgICAgcmVzb3VyY2VzOiB7XG4gICAgICAgIHBhdGg6ICcuL3Jlc291cmNlcycsXG4gICAgICAgIHNoYXJlZDogXCIuL3Jlc291cmNlc1wiXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgdGhlbWUgaXMgbG9jYWwgYWRkIGl0IGFzIGFuIGFkZGl0aW9uYWwgcGFja2FnZSBkaXJcbiAgaWYgKGZzLmV4aXN0c1N5bmModGhlbWUpKSB7XG4gICAgICBjb25zdCBwYWNrYWdlSW5mbyA9IGNqc29uLmxvYWQocGF0aC5qb2luKHRoZW1lLCAncGFja2FnZS5qc29uJykpO1xuICAgICAgY29uZmlnLnRoZW1lID0gcGFja2FnZUluZm8ubmFtZTtcbiAgICAgIGNvbmZpZy5wYWNrYWdlcy5kaXIucHVzaChwYXRoLnJlc29sdmUodGhlbWUpKTtcbiAgfSBlbHNlIHtcbiAgICAgIGNvbmZpZy50aGVtZSA9IHRoZW1lO1xuICB9XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShjb25maWcsIG51bGwsIDIpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVKU0RPTUVudmlyb25tZW50KG9wdGlvbnMsIG91dHB1dCkge1xuICBjb25zdCBsb2d2ID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndlxuICBsb2d2KG9wdGlvbnMsJ0ZVTkNUSU9OIGNyZWF0ZUpTRE9NRW52aXJvbm1lbnQnKVxuXG4gIHJldHVybiAnd2luZG93LkV4dCA9IEV4dDsnXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVXb3Jrc3BhY2VKc29uKG9wdGlvbnMsIG91dHB1dCkge1xuICBjb25zdCBsb2d2ID0gcmVxdWlyZSgnLi9wbHVnaW5VdGlsJykubG9ndlxuICBsb2d2KG9wdGlvbnMsJ0ZVTkNUSU9OIGNyZWF0ZVdvcmtzcGFjZUpzb24nKVxuXG4gIHZhciBwYXRoRGlmZmVyZW5jZSA9IG91dHB1dC5zdWJzdHJpbmcocHJvY2Vzcy5jd2QoKS5sZW5ndGgpXG4gIHZhciBudW1iZXJPZlBhdGhzID0gKHBhdGhEaWZmZXJlbmNlLnNwbGl0KFwiL1wiKS5sZW5ndGggLSAxKVxuICB2YXIgbm9kZU1vZHVsZVBhdGggPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IG51bWJlck9mUGF0aHM7IGkrKykgeyBcbiAgICBub2RlTW9kdWxlUGF0aCArPSBcIi4uL1wiXG4gIH1cblxuICBjb25zdCBjb25maWcgPSB7XG4gICAgXCJmcmFtZXdvcmtzXCI6IHtcbiAgICAgIFwiZXh0XCI6IG5vZGVNb2R1bGVQYXRoICsgXCJub2RlX21vZHVsZXMvQHNlbmNoYS9leHRcIlxuICAgIH0sXG4gICAgXCJwYWNrYWdlc1wiOiB7XG4gICAgICBcImRpclwiOiBbXG4gICAgICAgIFwiJHt3b3Jrc3BhY2UuZGlyfVwiICsgbm9kZU1vZHVsZVBhdGggKyBcImV4dC1cIiArIG9wdGlvbnMuZnJhbWV3b3JrICsgXCIvcGFja2FnZXNcIixcbiAgICAgICAgXCIke3dvcmtzcGFjZS5kaXJ9XCIgKyBub2RlTW9kdWxlUGF0aCArIFwibm9kZV9tb2R1bGVzL0BzZW5jaGFcIlxuICAgICAgXSxcbiAgICAgIFwiZXh0cmFjdFwiOiBcIiR7d29ya3NwYWNlLmRpcn0vcGFja2FnZXMvcmVtb3RlXCJcbiAgICB9XG4gIH1cbiAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KGNvbmZpZywgbnVsbCwgMilcbn0iXX0=