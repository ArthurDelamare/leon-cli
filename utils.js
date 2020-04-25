'use strict'

const fs = require('fs');
const handlebars = require("handlebars");
const path = require('path');

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

function getStringFromTemplate(templateFile, values) {
    const template = handlebars.compile(templateFile);
    return template(values);
}

exports.jsonReader = jsonReader;
exports.addValueToJson = addValueToJson
exports.getStringFromTemplate = getStringFromTemplate