// jshint esversion: 8, asi: true, laxcomma: true
const fs = require('fs')
const inquirer = require('inquirer')
const { exec } = require('child_process')

process.env.SFDX_JSON_TO_STDOUT = true

execute('whoami').then(u => start(u))

const app = {}
const init = ['deploy metadata', 'remove namespace files', 'make a pretty sheet']
const chosen = []

app.capital = s => s.charAt(0).toUpperCase() + s.slice(1)
app.cleanpath = s => Array.from(s).pop() == '/' ? s : `${s}/`

function start(user){

    app.user = app.capital(user)

    inquirer.prompt([
        {
            name: 'init',
            message: `🐭  Hey there ${app.user}!\n  What would you like to do?`,
            choices: init,
            type: 'list'
        }
    ])
    .then(router.splt)
}





function deploy(dir, user){
    
    console.log(`🐭  Hang tight ${app.user}, this might take awhile`) 

    const opts = {
        cmd: 'sfdx force:mdapi:deploy',
        user_: user,
        json__: true,
        w_: -1,
        o_: true,
        g_: true,
        d_: dir
    }
    
    execute(opts)
    .then(x => {

        const res = JSON.parse(x)
        console.log(res)

        fs.writeFileSync(`${__dirname}/testie_out.json`, res)

        console.log(`🐭  All done, have a good one ${app.user}!`) 
    })
    .catch(_catch)
}

function deploy_poll(dir, user){
    
    const opts = {
        cmd: 'sfdx force:mdapi:deploy',
        user_: user,
        json__: true,
        w_: -1,
        o_: true,
        g_: true,
        d_: dir
    }
    
    execute(opts)
    .then(x => {
        const res = JSON.parse(x)
        console.log(res)
        const id = res.result.id
        // x == {"status":0,"result":{"done":false,"id":"0Af0x00000H3u6OCAR","state":"Queued","status":"Queued","timedOut":true}}

        ///sfdx force:mdapi:retrieve:report -u timf --json -i asdf -r dir  

        // sfdx force:mdapi:retrieve:report -i 0Af0x00000H3u6OCAR -r data -u timdev --json

        console.log(`🐭  Have some info for ya but I have't finished yet ${app.user}...\n  
            Job Id: ${id},
            State: ${res.result.state},
            Status: ${res.result.status},
            Done: ${res.result.done}
        `)

        const opts = {
            cmd: 'sfdx force:mdapi:retrieve:report',
            user_: user,
            json__: true,
            i_: id,
            r_: 'data'
        }
        
        poleReport(opts)    
    })
    .catch(e => console.error(e))
}

function poleReport(opts){

    execute(opts)
    .then(x => {

        const res = JSON.parse(x)
        console.log(res)

        console.log(`🐭  All Done! \n  
            State: ${res.result.state}\n
            Status: ${res.result.status}\n
            Done: ${res.result.done}\n
        `)

        fs.writeFileSync(`${__dirname}/testie_out.json`, x)

        return 'all done '
    })
    .catch(e => {
        const msg = typeof e === 'object' ? JSON.stringify(e) : e
        console.log(`🐭  Something was caught! \n  
            No cause for alarm. The id used for polling get's deleted quickly so if it was a small payload it may have succeded already.\n
            Error: ${msg}
        `)
    })
}

function _catch(e){

    const msg = typeof e === 'object' ? JSON.stringify(e) : e
    console.log(`🐭  Something was caught! \n  
            Error: ${msg}
    `)
    _restart(app.user)
}
function _restart(u){
    start(u)
}






// itter dir files and remove if name has __
function removeFrom(dir, arr){

    const n = arr.length
    arr.map(x => fs.unlinkSync(dir+x))//?
    console.log('removed '+n)
}

function getObjectwNamespace(dir){

    const objects = fs.readdirSync(dir)

    objects.map(x => x.indexOf('__'))
    const isNamespaced = objects.filter(x => x.includes('__') && x.indexOf('__') < (x.length - 10) )

    return isNamespaced
}




function stringer(opts){
    
    let vals = ''

    for(const o in opts){
        
        const firstChar = o.substring(0, 1)
        const lastChar = o.substring(o.length-1, o.length)
        const last2 = o.substring(o.length-2, o.length)

        if(last2 == '__'){
            vals += `--${o.substring(0, o.length-2)} `
        }
        else if(lastChar == '_'){
            vals += opts[o] === true || opts[o] === false 
                ? opts[o] === true ? `-${firstChar} ` : '' // jshint ignore: line 
                : `-${firstChar} ${opts[o]} `
        }
        else {
            vals += `${opts[o]} `
        }
    }
    return vals
}


function execute(opts) {

    return new Promise((res, rej) => {
        
        const str = typeof opts == 'string' ? opts : stringer(opts)

        exec(str, (error, stdout, stderr) => error ? rej(stderr, error) : res(stdout))
    })
}








/* 
//remove namespace objects 
const mydir = `${dir}/objects/`
removeFrom(mydir, getObjectwNamespace(mydir))

*/



//const read = path => new Promise((resolve,reject) => fs.readFile(__dirname+'/jspull/test.json', 'utf8', (e, r) => e ? reject(e) : resolve(r)))

/* read(`/jspull/test.json`)
.then(data => {

    const json = JSON.parse(data)
    //console.log(data)
    const test = Object.entries(json)

    test.map(x => {
        x.map(obj => {
            delete obj.$

            obj //?
        })
    })
})
 */
/* 

remove 

<enableLicensing>false</enableLicensing>

/* sfdx cmds */
/* 

meta deploy zip

sfdx force:mdapi:deploy -w -1 -u timfull -o -g -e false -f all/unpackaged.zip

meta deploy dir

sfdx force:mdapi:deploy -w -1 -u timfull -o -g -e false -d stage

meta retrieve dir

sfdx force:mdapi:retrieve -u timfull -k allObjects/allObjects.xml -r allObjects

switch package to 43 for 

*/