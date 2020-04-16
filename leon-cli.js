const { program } = require('commander');
const path = require('path');

program.version('0.0.1');

program
    .command('generate-package <name>')
    .description('generate a package and its structure')
    .option('-f, --flat', 'determine if a folder has to created', false)
    .action(function(name, options) {
        packagePath = options.flat ? __dirname : path.join(__dirname, name)
        console.log(packagePath)
    })

program.parse(process.argv);