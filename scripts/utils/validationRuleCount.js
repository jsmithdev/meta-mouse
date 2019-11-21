

const fs = require('fs')
const util = require('util')
const path = require('path');

const ora = require('ora')

const mkdir = util.promisify(fs.mkdir)

const xml2js = require('xml2js')

const { unzip_package } = require('./storage')

const { retrievePackages } = require('../SFDX')


module.exports = { validationRuleCount }


async function validationRuleCount(username, type){

    const dest = path.normalize(`${__dirname}/../../tmp/retrieved/${username}`)

    mkdir( dest, () => {} )

    const packages = type === 'custom'
        ? ['package_objects_custom.xml']
        : type === 'standard'
            ? ['package_objects_std.xml']
            : ['package_objects_custom.xml', 'package_objects_std.xml']

    
    const retrieves = await retrievePackages(username, packages)

    const zip_paths = retrieves
        .filter(loc => loc.directories.to.includes('package_objects'))
        .map(loc => `${loc.directories.to}/unpackaged.zip`)

    const temp_paths = []
    
    // Using for loop to do sequentially, better express what's happening to user
    for(const index in zip_paths){
        temp_paths.push( await unzip_package( zip_paths[index] ) )
    }

    // flatten to single array
    const file_paths = temp_paths.reduce((acc, curr) => [...acc, ...curr], [])

    const spinner = ora('Parsing metadata files for rules...').start()

    const promises = file_paths.map(file_path => {

            return new Promise(resolve => fs.readFile(file_path, (err, data) => {
                
                const parser = new xml2js.Parser()

                parser.parseString( data, (err, result) => {

                    if(err){  return resolve(0) }

                    if(!result){  return resolve(0) }

                    const data = JSON.parse(JSON.stringify(result))

                    if(!data || !data.CustomObject || !data.CustomObject.validationRules){
                        return resolve(0)
                    }
                    
                    return resolve(data.CustomObject.validationRules.length)
                })
            }))
        })

    spinner.succeed( `Parsed ${file_paths.length} object files`)

    const count_array = await Promise.all(promises)

    const count = count_array.reduce((acc, n) => acc + n, 0)

    const response = count === 0
        ? `No validation rules found. If it's not a new org, open an issue https://github.com/jsmithdev/meta-mouse/issues  🐭 `
        : `${count} validation rule${count > 1 ? 's' : ''} found in ${file_paths.length} objects  🐭 `

    return response
}