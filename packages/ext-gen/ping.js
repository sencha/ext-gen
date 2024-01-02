async function smartFlowPing(packageJsonPath, appJsonPath) {
  const { exec } = require('child_process');
  const path = require('path');
  const fs = require('fs');

  fs.readFile(packageJsonPath, 'utf8', (errPackage, dataPackage) => {
    if (errPackage) {
      return;
    }

    const packageJson = JSON.parse(dataPackage);

    fs.readFile(appJsonPath, 'utf8', (errApp, dataApp) => {
      if (errApp) {
        return;
      }

      const appJson = JSON.parse(dataApp);
      const requiresArray = appJson.requires;// Assuming appJson.requires is an array

      // Convert the array to a string
      const modifiedString = requiresArray[0].replace(/[\[\]']+/g, '');

      const homeDirectory = process.env.HOME || process.env.USERPROFILE;

      // Specify the relative path from the home directory to your file
      const relativeFilePath = '.npmrc';

      // Combine the home directory and relative file path to get the generalized file path
      const filePath = path.join(homeDirectory, relativeFilePath);

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          console.error(`Error reading file: ${err.message}`);
          return;
        }
        const registryRegex = /@sencha:registry=(.+)/;

        // Extract the registry URL using the regular expression
        const match = data.match(registryRegex);

        // Check if a match is found
        if (match && match[1]) {
          const registryUrl = match[1];
          // Use npm-config to set the registry temporarily for the current process
          process.env.npm_config_registry = registryUrl;

          // Run the npm whoami command
          exec(`npm --registry ${registryUrl} whoami`, (error, stdout, stderr) => {
            if (error) {
              return;
            }

            const username = `${stdout.trim().replace('..', '@')}`;

            let additionalLicenseInfo = '';
              let licensedFeature = '';
              if(username!=null){
                additionalLicenseInfo = 'This version of Sencha Ext-gen is licensed commercially'
                licensedFeature = 'LEGAL'
              }else{
                additionalLicenseInfo = 'This version of Sencha Ext-gen is not licensed commercially'
                licensedFeature  = 'UNLICENSED'
              }

            const scriptType = process.env.npm_lifecycle_event;
                      const triggerevent = 'ext-gen app';
                     
            

            const licenseinfo = `"license=Commercial, framework=EXTJS, License Content Text=Sencha RapidExtJS-JavaScript Library Copyright, Sencha Inc. All rights reserved. licensing@sencha.com options:http://www.sencha.com/license license: http://www.sencha.com/legal/sencha-software-license-agreement Commercial License.-----------------------------------------------------------------------------------------Sencha RapidExtJS is licensed commercially. See http://www.sencha.com/legal/sencha-software-license-agreement for license terms.Beta License------------------------------------------------------------------------------------------ If this is a Beta version , use is permitted for internal evaluation and review purposes and not use for production purposes. See http://www.sencha.com/legal/sencha-software-license-agreement (Beta License) for license terms.  Third Party Content------------------------------------------------------------------------------------------The following third party software is distributed with RapidExtJS and is provided under other licenses and/or has source available from other locations. Library: YUI 0.6 (BSD Licensed) for drag-and-drop code. Location: http://developer.yahoo.com/yui License: http://developer.yahoo.com/yui/license.html (BSD 3-Clause License) Library: JSON parser Location: http://www.JSON.org/js.html License: http://www.json.org/license.html (MIT License) Library: flexible-js-formatting Location: http://code.google.com/p/flexible-js-formatting/ License: http://www.opensource.org/licenses/mit-license.php (MIT License) Library: sparkline.js Location: http://omnipotent.net/jquery.sparkline License  http://omnipotent.net/jquery.sparkline (BSD 3-Clause License) Library: DeftJS Location: http://deftjs.org/ License: http://www.opensource.org/licenses/mit-license.php (MIT License) Library: Open-Sans Location: http://www.fontsquirrel.com/fonts/open-sans License:  http://www.fontsquirrel.com/fonts/open-sans (Apache 2.0 License) Examples: Library: Silk Icons Location: http://www.famfamfam.com/lab/icons/silk/ License: http://www.famfamfam.com/lab/icons/silk/ (Creative Commons Attribution 2.5 License) Library: Font Awesome CSS Location: http://fontawesome.io/ License: http://fontawesome.io/3.2.1/license/ (MIT) Library: Material Design Icons Location: https://github.com/google/material-design-icons License: https://github.com/google/material-design-icons/blob/master/LICENSE (Apache) THIS SOFTWARE IS DISTRIBUTED 'AS-IS' WITHOUT ANY WARRANTIES, CONDITIONS AND REPRESENTATIONS WHETHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION THE IMPLIED WARRANTIES AND CONDITIONS OF MERCHANTABILITY, MERCHANTABLE QUALITY, FITNESS FOR A PARTICULAR PURPOSE, DURABILITY, NON-INFRINGEMENT, PERFORMANCE AND THOSE ARISING BY STATUTE OR FROM CUSTOM OR USAGE OF TRADE OR COURSE OF DEALING. , message=This version of Sencha RapidExtJS is licensed commercially "`;
             const encLic = btoa(licenseinfo)
            const jarPath = path.join(__dirname, 'resources', 'utils.jar');
            const featuresUsed = `ext-gen, ${modifiedString}`;

              const command = `java -jar ${jarPath} ` +
                 `-product ext-gen -productVersion ${packageJson.version} ` +
                 `-eventType LEGAL -trigger ${triggerevent} ` +
                 `-licensedTo ${username} ` +
                 `-custom2 isValid=true -custom3 isTrial=false -custom4 isExpired=false -mode rapid ` +
                 `-validLicenseInfo ${encLic} -featuresUsed ${featuresUsed} -licensedFeature ${licensedFeature} -piracyLicenseInfo ${additionalLicenseInfo}`;


            exec(command, (error, stdout, stderr) => {
              if (error) {
                return;
              }
              if (stderr) {
                return;
              }

            });
          });
        }
      });
    });
  });
}

module.exports = {
  smartFlowPing
}
