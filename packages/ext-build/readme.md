# ext-build

Sencha Cmd functionality in Node

## Installation

Install [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g @sencha/ext-build
```


## Command line help
* ext-build
* eb

## Examples
* ext-build generate app --sdk 'Ext/ext-7.3.0' --template 'universalmodern' MyApp ./MyApp
* ext-build gen app -s 'Ext/ext-7.3.0' -t 'universalmodern' MyApp ./MyApp
* eb g a -s 'Ext/ext-7.3.0' -t 'universalmodern' MyApp ./MyApp
* ext-build generate viewpackage settings

## Commands Available
* ext-build generate app (name) (path)
* ext-build generate viewpackage (view)

## Commands Options
* generate, gen, g
* application, app, a
* viewpackage, vp

## Options Available
* --builds -b (--builds "desktop:modern,theme-material;phone:modern,theme-material;" is default)
* --debug -d (shows debug messages)
* --force (deletes application, if present, before generate app (BE CAREFUL WITH THIS!))
* --sdk -s (path to Ext JS sdk - currently required for gen app, no running from sdk folder...)
* --template -t (name of app template to use - only one currently - universalmodern)

## Comments
* Tested with Ext JS Version 7.3.0
