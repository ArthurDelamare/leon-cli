const fs = require('fs');
const ncp = require('ncp').ncp;
const path = require('path');
const program = require('commander');

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
 * @description return true if the directory exists and contains at least one element, return false otherwise
 * @param {string} path path of the directory to check
 */
function isDirectoryEmpty(path) {
    if (!fs.existsSync(path)) {
        return true;
    }
    return fs.readdirSync(path).length === 0;
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
    for (directory of directories) {
        if (isDirectoryEmpty(path.join(packagePath, directory))) {
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

function jsonReader(filePath, callback) {
    fs.readFile(filePath, (error, fileData) => {
        if (error) {
            return callback && callback(error)
        }
        try {
            const object = JSON.parse(fileData)
            return callback && callback(null, object)
        } catch(error) {
            return callback && callback(error)
        }
    })
}

program
    .command('generate-module <name>')
    .description('generate a module based on a name and its test')
    .option('-s, --skip-tests', 'when true, skip the creation of test files', false)
    .option('-p, --programming-language', 'allow you to choose the programming language of the generated module', 'python')
    .action(function(name, options) {
        checkPackageStructure();

        const packagePath = process.cwd();

        // Modify config.json and config.sample.json
        jsonReader(path.join(packagePath, 'config', 'config.json'), (err, config) => {
            if (err) {
                console.error('Error reading file:',err)
                return
            }
            config[name] = { options: {}}
            fs.writeFile(path.join(packagePath, 'config', 'config.json'), JSON.stringify(config, null, 4), (err) => {
                if (err) console.log('Error writing file:', err)
            })
        })
        jsonReader(path.join(packagePath, 'config', 'config.sample.json'), (err, config) => {
            if (err) {
                console.error('Error reading file:',err)
                return
            }
            config[name] = { options: {}}
            fs.writeFile(path.join(packagePath, 'config', 'config.sample.json'), JSON.stringify(config, null, 4), (err) => {
                if (err) console.log('Error writing file:', err)
            })
        })


    });




program.parse(process.argv);