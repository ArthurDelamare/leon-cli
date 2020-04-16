const fs = require('fs');
const path = require('path');
const program = require('commander');


program.version('0.0.1');

program
    .command('generate-package <name>')
    .description('generate a package and its structure')
    .option('-f, --flat', 'determine if a folder has to created', false)
    .action(function(name, options) {
        const packagePath = options.flat ? __dirname : path.join(__dirname, name);

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
        for(const element of files) {
            if (fs.existsSync(path.join(packagePath, element))) {
                throw new Error(`File at ${path.join(packagePath, element)} already exists.`);
            } 
        }


    });

program.parse(process.argv);