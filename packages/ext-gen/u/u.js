"use strict";

main()
async function main() {
  try {
  stepStart()
  }
  catch (e) {
    console.log(e)
  }
}

function stepStart() {
  upgrade()
}

async function upgrade()
{
 console.log('Upgrade started'); 
  var upgrade = require('./upgrade')
  var appUpgrade = new upgrade()
  await appUpgrade.upgradeApp()
  console.log('Upgrade done . Please run npm install and then npm run all');
}