# ext-gen
A generator for Ext JS applications using Open Tooling.

## Installation

### Dependencies
Install [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

### Commercial Customers: only commercially licensed customers need to authenticate with Sencha's private npm registry

- Login to Sencha's private registry using your username and passsword:
```
npm login --registry=http://npm.sencha.com --scope=@sencha
```

### Install the Open Tooling application generator
```
npm install -g @sencha/ext-gen
```

## Creating a new ext-gen App

To create a new Ext JS Open Tooling app, run one of the following commands in a terminal or console window: 

```
// Generate boilerplate app
ext-gen app -a

// Interactive mode
ext-gen app -i 
```

To see a full list of commands for `ext-gen`, simply run `ext-gen` from your termincal or console window. 


## Development

To make changes to the generator, run:

```bash
git clone git@github.com:sencha/ext-gen.git
cd ext-gen
npm install
cd packages/ext-gen
npm link
```

Now `ext-gen` will use your local copy of the generator.

## License

MIT © [Sencha, Inc.](https://www.sencha.com/)
