'use strict()'

const fs = require('fs')
const util = require('util')
const path = require('path');

const mkdir = util.promisify(fs.mkdir)
const writeFile = util.promisify(fs.writeFile)

const spawn = require('child_process').spawn
const exec_normal = require('child_process').exec
const exec = util.promisify(exec_normal)

module.exports = {
    getUsers,
    describeMeta,
    openInBrowser,
    retrievePackage,
    getValidationCount,
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

    dirs.forEach(async dir => await mkdir( path.normalize(dir), () => {} ))
}
ensure_directories()

async function getUsers () {

    const { stdout, stderr } = await exec('sfdx force:org:list')
    //console.log('stdout:', stdout)
    //console.log('stderr:', stderr)
    console.log(stdout)
    const regex = /[\w\.-]+@[\w\.-]+/g
    const usernames = stdout.match(regex)

    return usernames
}

async function describeMeta () {
    console.log(`testing test with ===> ${username}`)

    const { stdout, stderr } = await exec(`sfdx force:mdapi:describemetadata -u ${username} --json `)

    return stdout
}

async function openInBrowser (username) {

    await exec(`sfdx force:org:open -u ${username} --json `)

    return undefined
}


async function getValidationCount (username, type) {

    try {
            
        console.log(`testing test with => ${type} - ${username}`)

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

        //if(stderr){ return console.error(stderr)}

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

        //if(stderr){ return console.error(stderr)}

        return stdout
    }
    catch(error){
        console.log(error)
        return undefined
    }
}



async function retrievePackage (username, type){

    const dest = path.normalize(`${__dirname}/../tmp/retrieved/${username}`)

    mkdir( dest, () => {} )

    mdapi_retrieve(username, type, dest)
}
function mdapi_retrieve (username, type, dest){

    // sfdx force:mdapi:retrieve -u timdev -k package.xml -r src
    
    console.log(`testing retrievePackage with ===> ${username} ${type} `)

    const package = path.normalize(`${__dirname}/../packages/package_${type}.xml`)

    const cmd = `sfdx force:mdapi:retrieve -k ${package} -u ${username} -r ${dest} -w 5 --json `
    
    const finish = result => {
        //EXIT_CONDITION = true
        console.log( `Process finished with exit code ${result.toString()}` )
        doCount()
    }

    const command = exec_normal(cmd)

    command.stdout.pipe(process.stdout);
    
    command.stderr.pipe(process.stderr);
    
    command.on('exit', function (code) {
        console.log('child process exited with code ' + code.toString());
    });

}

function doCount(){
    console.dir( 'DO COUNT HIT => ' )
}
function logger(data){
    console.log('logger =>')
    console.error( data )
}
function errors(error){
    console.log('error =>')
    console.error( error )
}


/* 

sfdx force:mdapi:deploy -d src -w -1 --ignoreerrors -g -l NoTestRun -u timcctest


    let EXIT_CONDITION = false

    (function wait () {
        console.log('runs')
        if (!EXIT_CONDITION) setTimeout(wait, 1000);
    })();


"pulldata": "sfdx force:data:tree:export -u timdev -d trees -q ",
"pushdata": "sfdx force:data:tree:import -u timtest -f ",

"gensoql": "node index.js",

"pullmeta":"sfdx force:mdapi:retrieve -u timdev -k package.xml -r src",
"pushmeta": "sfdx force:mdapi:deploy -d src -w -1 --ignoreerrors -g -l NoTestRun -u timtest ",





RESOURCES & ROAD MAP FOR CLONE ATTEMPT UNO

get package.xml created from vs code => later use describe metadata perhaps 

create directory structure for clean cloning enviorment --v

user-named project folder
|
|-- FROM_META <= this is where to dump metadata from org1
|
|-- STAGE_META <= this will be where the metadata gets staged -> so limbo between FROM_META and HOT_META
|
|-- HOT_META <= this is where metadata will be deploy from, copied to, edited massivly perhaps, deleted without warning, etc.


https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference_force_mdapi.htm#mdapi:retrieve

https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_retrieve_pack_xml.htm

function execute(cmd){//, cwd, responder, exit

    
    //const fig = {
    //    cmd: `sfdx force:org -h`, 
    //    cwd: `${__dirname}`,
    //    responder: console.log,
    //    exit: console.info,
    //    error: console.error
    //}
    
   
    const { cmd, cwd, responder, exit, error } = fig

	//console.log('Exec on behalf of user')
    //console.log(`${cmd} ${cwd}`)
   
	const command = exec_normal(cmd, { cwd })

	command.stdout.on('data', data => responder ? responder(data.toString()) : console.log('no responder'))
	command.stderr.on('data', data => error ? error(data.toString()) : console.log('no error catch'))

	command.on('exit', code => exit ? exit(`Process finished with exit code ${code.toString()}`) : null) // code.toString()
}
*/