const fs = require('fs');
const ncp = require('ncp').ncp;
const path = require('path');
const program = require('commander');

program.version('0.0.1');

function addLanguage(language, languageList) {
    return languageList.concat([language])
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
            path.join('data', 'answer', 'en'),
            path.join('data', 'db', '.gitkeep'),
            path.join('data', 'expression', 'en'),
            path.join('test', '.gitkeep'),
            'README.md',
            'version.txt'
        ];

        for (const language of options.spokenLanguages) {
            files.push(path.join('data', 'answer', language));
            files.push(path.join('data', 'expression', language));
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
              console.log('Template copied!');
        })


    });

program.parse(process.argv);