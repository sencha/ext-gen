# ext-gen
Sencha ExtGen - Open Tools for Ext JS

## 1. Install the App Generator CLI

Install the Ext JS app generator CLI command tool ext-gen which will be used to generate the application.

```
npm install -g @sencha/ext-gen
```

## 2. Generate the Application

Generate the Ext JS application using the interactive walkthrough. Use `ext-gen app -a` to skip the interactive walkthrough.

```
ext-gen app -a
```

## Interactive Walkthrough

```
ext-gen app -a
```

Would you like to see the defaults for package.json? (y/N)

  If you select `yes`, ext-gen shows all defaults for package.json
Would you like to create a package.json file with defaults? (Y/n)

  This creates a package.json with the defaults
What would you like to name your Ext JS app? (MyApp)

  Type name of your app
What type of Ext JS template do you want? (Use arrow keys)

  ❯ make a selection from a list
    type a folder name
What Ext JS template would you like to use?

    classicdesktop
    classicdesktoplogin
    moderndesktop
    moderndesktopminimal
    universalclassicmodern
  ❯ universalmodern
Would you like to generate the Ext JS npm project with above config now? (Y/n)

## 3. Run the New Application

Start up the newly created application in the default browser with these commands.

```
cd ./<your-app-name>
npm start
```

## License

MIT © [Sencha, Inc.](https://www.sencha.com/)
