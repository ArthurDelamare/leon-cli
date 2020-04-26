'use strict'

const fs = require('fs');
const ncp = require('ncp').ncp;
const path = require('path');
const program = require('commander');
const utils = require(path.join(__dirname, 'utils.js'));

program.version('0.0.1');

/**
 * @description used to catch the language from the spoken-languages option and concatenate it to the package language list
 * @param {string} language short version of a language name (example: 'en')
 * @param {string[]} languageList list of languages
 */
function addLanguage(language, languageList) {
    return languageList.concat([language])
}

/**
 * @description check the structure of the package and return an error if it is not valid
 * @param {string[]} files a list of files path
 * @param {function} errorMessage the description of the error, displayed after the file path
 */
function checkPackageStructure() {
    // individual files check
    const packagePath = process.cwd();

    const files = [
        path.join('config', 'config.json'),
        path.join('config', 'config.sample.json'),
        'README.md',
        'version.txt'
    ];
    for (const file of files) {
        if (!fs.existsSync(path.join(packagePath, file))) {
            return console.error(`File at ${path.join(packagePath, file)} is missing.`);
        } 
    }

    // directory check
    const directories = [
        'data',
        'test',
        path.join('data', 'answers'),
        path.join('data', 'db'),
        path.join('data', 'expressions'),
    ];
    for (const directory of directories) {
        if (utils.isDirectoryEmpty(path.join(packagePath, directory))) {
            return console.error(`Directory at ${path.join(packagePath, directory)} is empty or missing.`);
        }
    }

    return console.log('Package structure is correct.');
} 

program
    .command('generate-package <name>')
    .description('generate a package and its structure')
    .option('-f, --flat', 'determine if a folder has to created', false)
    .option('-s, --spoken-languages <language>', 'list of spoken languages available in the package', addLanguage, [])
    .action(function(name, options) {
        const packagePath = options.flat ? process.cwd() : path.join(process.cwd(), name);

        const files = [
            path.join('config', 'config.json'),
            path.join('config', 'config.sample.json'),
            path.join('data', 'answers', 'en'),
            path.join('data', 'db', '.gitkeep'),
            path.join('data', 'expressions', 'en'),
            path.join('test', '.gitkeep'),
            'README.md',
            'version.txt'
        ];

        for (const language of options.spokenLanguages) {
            if (language !== 'en') {
                files.push(path.join('data', 'answers', language));
                files.push(path.join('data', 'expressions', language));
            }
        }

        for(const element of files) {
            if (fs.existsSync(path.join(packagePath, element))) {
                throw new Error(`File at ${path.join(packagePath, element)} already exists.`);
            } 
        }

        ncp.limit = 16;
        ncp(path.join(__dirname, 'template', 'package'), packagePath, function(err) {
            if (err) {
                return console.error(err);
            }

            for(const language of options.spokenLanguages) {
                if(language !== 'en') {
                    langjson = path.join(__dirname, 'template', 'data', 'language.json');
                    fs.copyFileSync(langjson,path.join(packagePath, 'data', 'answers', language + '.json'));
                    fs.copyFileSync(langjson,path.join(packagePath, 'data', 'expressions', language + '.json'));
                }
            }
        })

        

    });

program
    .command('generate-module <name>')
    .description('generate a module based on a name and its test')
    .option('-s, --skip-tests', 'when true, skip the creation of test files', false)
    .option('-p, --programming-language <language>', 'allow you to choose the programming language of the generated module', 'python')
    .action(function(name, options) {
        checkPackageStructure();

        const packagePath = process.cwd();

        // Add module to config.json and config.sample.json
        const configPath = path.join(packagePath, 'config', 'config.json');
        const configSamplePath = path.join(packagePath, 'config', 'config.sample.json');
        utils.addValueToJson(configPath, name, { options: {}});
        utils.addValueToJson(configSamplePath, name, { options: {}});

        // Modify answers files
        const answersPath = path.join(packagePath, 'data', 'answers');
        fs.readdir(answersPath, function (error, files) {
            // handling error
            if (error) {
                return console.log('Unable to scan directory: ' + error);
            } 

            // add module to each language file
            const answerValue = { 
                example: [`This is an answer generated by leon-cli for ${name}`]
            };
            files.forEach(function (file) {
                utils.addValueToJson(path.join(answersPath, file), name, answerValue);
            });
        });

        // Modify expressions files
        const expressionsPath = path.join(packagePath, 'data', 'expressions');
        fs.readdir(expressionsPath, function (error, files) {
            // handling error
            if (error) {
                return console.log('Unable to scan directory: ' + error);
            } 

            // add module to each language file
            const expressionValue = { 
                run: { 
                    expressions: [`This is an expression generated by leon-cli for ${name}`]
                }
            };
            files.forEach(function (file) {
                utils.addValueToJson(path.join(expressionsPath, file), name, expressionValue);
            });
        });

        if (!options.skipTests){
            fs.readFile(path.join(__dirname, 'template', 'test', 'module.hbs'), 'utf8', (err, data) => {
                if (err) {
                  console.error(err);
                  return;
                }
                const templateValues = {
                    module: name,
                    description: 'Test example, generated by leon-cli',
                    expression: `This is an expression generated by leon-cli for ${name}`,
                    answer: 'example'
                };
                const template = utils.getStringFromTemplate(data, templateValues);
                const testContent = new Uint8Array(Buffer.from(template));
                fs.writeFile(path.join(packagePath, 'test', `${name}.spec.js`), testContent, 'utf8', (err) => {
                    if (err) throw err;
                });
            })
        }

        if (options.programmingLanguage === 'python') {
            fs.readFile(path.join(__dirname, 'template', 'module', 'python.hbs'), 'utf8', (err, data) => {
                if (err) {
                  console.error(err);
                  return;
                }
                const templateValues = {
                    answer: 'example'
                };
                const template = utils.getStringFromTemplate(data, templateValues);
                const moduleContent = new Uint8Array(Buffer.from(template));
                fs.writeFile(path.join(packagePath, `${name}.py`), moduleContent, 'utf8', (err) => {
                    if (err) throw err;
                });

                // write the __init__ python file
                fs.closeSync(fs.openSync(path.join(packagePath, '__init__.py'), 'w'));
            })
        }
    });




program.parse(process.argv);