
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


module.exports = {
    addUser,
    getUsers,
    describeMeta,
    openInBrowser,
    retrievePackages,
}

{   // ensure paths exist once 

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

async function getUsers () {

    const spinner = ora('Refreshing usernames...').start();

    const { stdout } = await exec('sfdx force:org:list')
    
    const regex = /[\w\.-]+@[\w\.-]+/g
    const usernames = stdout.match(regex)

    spinner.succeed(`${usernames.length} usernames refreshed & cached`)
    console.log('\n')

    return usernames
}

async function describeMeta (username) {

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



/**
 * @description sfdx mdapi retrieve 
 * 
 * @params {String} url to use; login || test
 */
function addUser (url){

    return new Promise(resolve => {
        
        const cmd = `sfdx force:auth:web:login -r ${url} `
        
        const command = exec_normal(cmd)

        command.stdout.pipe(process.stdout)
        command.stderr.pipe(process.stderr)
        command.on('exit', () => {
            console.dir( '\n' )
            resolve(true)
        })
    })
}

/*

"pullData": "sfdx force:data:tree:export -u username -d trees -q ",
"pushData": "sfdx force:data:tree:import -u username -f ",

"genSOQL": "node index.js",

"pullMeta":"sfdx force:mdapi:retrieve -u username -k package.xml -r src",
"pushMeta": "sfdx force:mdapi:deploy -d src -w -1 --ignoreerrors -g -l NoTestRun -u username ",


*/