'use strict()'

const fs = require('fs')
const util = require('util')
const path = require('path');

const mkdir = util.promisify(fs.mkdir)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const readdir = util.promisify(fs.readdir)

//const spawn = require('child_process').spawn
const exec_normal = require('child_process').exec
const exec = util.promisify(exec_normal)

const ora = require('ora')

const xml2js = require('xml2js')

const { unzip_package } = require('./Utility')


module.exports = {
    getUsers,
    describeMeta,
    openInBrowser,
    validationRuleCount,
}

function ensure_directories() {

    const base = path.normalize(`${__dirname}/../tmp`)

    const dirs = [
        base,
        `${base}/object`,
        `${base}/packages`,
        `${base}/retrieved`,
        `${base}/descriptions`,
        `${base}/descriptions/objects`,
    ];

    dirs.forEach( dir => mkdir( path.normalize(dir), () => {} ))
}
ensure_directories()

async function getUsers () {

    const spinner = ora('Refreshing usernames...').start();

    const { stdout } = await exec('sfdx force:org:list')
    
    const regex = /[\w\.-]+@[\w\.-]+/g
    const usernames = stdout.match(regex)

    spinner.succeed(`${usernames.length} usernames refreshed & cached`)
    console.log('\n')

    return usernames
}

async function describeMeta () {

    const { stdout, stderr } = await exec(`sfdx force:mdapi:describemetadata -u ${username} --json `)

    if(stderr){ return console.error(stderr)}

    return stdout
}

async function openInBrowser (username) {

    try {
        
        return await exec(`sfdx force:org:open -u ${username} --json `)

    }
    catch (error) {
            
        return console.error( error )
    }
}


async function getValidationCount (username, type) {

    try {
        
        const list = await getObjectList(username, type)

        console.log(`have ${list.result.length} objects in a list`)

        const base = `${__dirname}/../tmp/descriptions/objects`

        await mkdir(`${base}/${username}`)

        console.log(list)
        
        Array.from(list.result).forEach(async object => {

            const path = `${base}/${username}/${object}.json`

            const description = await descObject(username, object)
            
            const data = JSON.parse(description)

            await writeFile(path, JSON.stringify(data, null, 4))
        })
        
        console.log(`wrote ${list.result.length} files under ${base}...`)
        
        return undefined
    }
    catch (error) {
        console.error(error)
        return undefined
    }
}








async function getObjectList (username, type) {

    try {

        const cmd = `sfdx force:schema:sobject:list  -c ${type}  -u ${username}  --json`
        
        const { stdout, stderr } = await exec( cmd )

        return JSON.parse( stdout )
    }
    catch(error){
        console.log(error)
        return undefined
    }
}

async function descObject (username, object) {

    try {

        const cmd = `sfdx force:schema:sobject:describe  -s ${object} -u ${username}  --json`
        
        const { stdout, stderr } = await exec( cmd )

        return stdout
    }
    catch(error){
        console.log(error)
        return undefined
    }
}

async function validationRuleCount(username, type){

    const dest = path.normalize(`${__dirname}/../tmp/retrieved/${username}`)

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

    const paths = (await Promise.all( zip_paths.map(unzip_package) ))
        .reduce((acc, curr) => [...acc, ...curr], [])
    

    const spinner = ora('Parsing metadata files for rules...').start()

    const locations = await Promise.all( paths.map(async dir => {

        const contents = await readdir(dir)
        
        return {
            directory: dir,
            contents: contents.filter(name => {
                return name.includes('.')
                    && !name.includes('.zip')
                    && !name.includes('.xml')
            }),
        }
    }));

    const file_paths = locations.reduce((acc, location) => {
        return [...acc, ...location.contents.map(file => `${location.directory}/${file}`)]
    }, []);

    

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

    const count_array = await Promise.all(promises)

    const count = count_array.reduce((acc, n) => acc + n, 0)

    const file_count = locations.map(l => l.contents.length).reduce((acc, n) => acc + n, 0)

    spinner.succeed( `Parsed ${file_count} object files `)


    const response = count === 0
        ? `No validation rules found. If it's not a new org, open an issue https://github.com/jsmithdev/meta-mouse/issues  🐭 `
        : `${count} validation rule${count > 1 ? 's' : ''} found in ${file_count} objects  🐭 `

    return response
}



/**
 * @description safe retrieve via multi xml packages 
 * 
 * @params {String} username
 * @params {String} xml_path
 * @params {String} dest
 */
async function retrievePackages (username, xml_paths){

    console.log('\n')
    const spinner = ora('Retrieving metadata...').start()

    const dest = path.normalize(`${__dirname}/../tmp/retrieved/${username}/`)

    mkdir( dest, () => {} )

    const promises = xml_paths.map(xml_path => {
        const path = dest+xml_path.replace('.xml', '')
        return mdapi_retrieve(username, xml_path, path)
    })
    const results = await Promise.all(promises)

    spinner.succeed(`Retrieved metadata to ${dest}`)

    return results
}



/**
 * @description sfdx mdapi retrieve 
 * 
 * @params {String} username
 * @params {String} xml_path
 * @params {String} dest
 */
function mdapi_retrieve (username, xml_path, dest){


    return new Promise(resolve => {
        
        const package_path = path.normalize(`${__dirname}/../packages/${xml_path}`)

        const cmd = `sfdx force:mdapi:retrieve -k ${package_path} -u ${username} -r ${dest} -w 10 --json `
        
        const command = exec_normal(cmd)

        //command.stdout.pipe(process.stdout)
        //command.stderr.pipe(process.stderr)
        command.on('exit', (code) => {

            resolve({
                code, 
                directories: {
                    from: package_path, 
                    to: dest
                }
            })
        })
    })
}