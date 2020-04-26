'use strict'

const fs = require('fs');
const handlebars = require("handlebars");
const path = require('path');

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
 * @description read a json and execute a callback taking the error and the data as parameters
 * @param {string} filePath path of the json to read
 * @param {function} callback call the callback function
 */
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

/**
 * 
 * @param {string} filepath path of the json to update
 * @param {string} key key to use to add the value
 * @param {any} value value to add to the json
 */
function addValueToJson(filepath, key, value) {
    jsonReader((filepath), (error, data) => {
        if (error) {
            console.error(`Error reading file at ${filepath} : ${error}`);
            return;
        }
        data[key] = value;
        fs.writeFile(path.join(filepath), JSON.stringify(data, null, 4), (error) => {
            if (error) console.log('Error writing file:', error)
        })
    })
} 

/**
 * @description compile a template with the values to change, then return the content as a string
 * @param {string} templateFile content of a handlebars template file as a string
 * @param {object} values object containing the values to change in the handlebars template file
 */
function getStringFromTemplate(templateFile, values) {
    const template = handlebars.compile(templateFile);
    return template(values);
}

exports.jsonReader = jsonReader;
exports.addValueToJson = addValueToJson
exports.getStringFromTemplate = getStringFromTemplate
exports.isDirectoryEmpty = isDirectoryEmpty