# Leon-cli

## What is this project?
The purpose of this project is to create and manipulate packages of the personal assistant [Leon](https://github.com/leon-ai/leon) by using a CLI. 

For now, the development is still at an early stage.

## Prerequisites
- [Node.js](https://nodejs.org/en/) >= 10
- npm >= 5

## Installation
```bash
# Clone the repository
git clone -b master https://github.com/ArthurDelamare/leon-cli.git

# Go to the project root
cd leon-cli

# Install the dependencies
npm install
```

## Current features
### generate-package
Generate a package based on a name and options.

leon **generate-package** *\<name\>* \[*options*\]

#### Arguments
Argument | Description
------------ | -------------
name | The name of the package

#### Options
Option | Description
------------ | -------------
--flat=true\|false | When true, create the files at the top level without creating a folder.<br><br>Default: false<br><br>Alias: -f
--spoken-languages=string | Allow you to add languages for the expressions and answers. Repeat the option to add as many languages as you desire.<br><br>Default: \['en'\]<br><br>Alias: -s

### generate-module
Generate a module based on a name and options.

leon **generate-module** *\<name\>* \[*options*\]

#### Arguments
Argument | Description
------------ | -------------
name | The name of the module

#### Options
Option | Description
------------ | -------------
--skip-tests=true\|false | When true, skip the creation of test files.<br><br>Default: false<br><br>Alias: -s
--programming-language=string | Allow you to choose the programming language of the generated module.<br><br>Default: python<br><br>Alias: -p


## Incoming features
### check-package
### train-expressions
### build
### start
