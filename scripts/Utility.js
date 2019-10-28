const util = require('util')
const exec = require('child_process').exec
const prom_exec = util.promisify( exec )

const checks = require('./utils/checks')
const { unzip_package } = require('./utils/storage')

module.exports = {
    createApp,
    execute,
    restart,
    fatal,
    checks,
    unzip_package,
}

function createApp(app){

    app.capital = s => s.charAt(0).toUpperCase() + s.slice(1)

    app.cleanpath = s => Array.from(s).pop() == '/' ? s : `${s}/`

    app.start = app => start( app )
    app.fatal = error => fatal(error, app)
    app.restart = () => restart( app )
    app.execute = execute

    return app
}

function capitalize(s){
    return `${s.charAt(0).toUpperCase()}${s.substring(1, s.length)}`
}

async function start(app){

    const username = app.get('user') 

    return username
        ? username 
        : handleUser( await prom_exec('whoami'), app )
}

function handleUser( { stdout } , app ){

    console.dir(stdout)
    
    const name = capitalize( stdout.replace('\n', '').trim() )

    app.set('user', name) 

    return name
}

function fatal(e, app){

    const msg = typeof e === 'object' ? JSON.stringify(e) : e
    console.log(`\n fatal error, restarting 🐭 \n  Error: ${msg} \n`)
    restart(app)
}
function restart(app){
    app.start(app)
}

function execute(fig){//, cwd, responder, exit
   
    const { cmd, cwd, responder, exit, error } = fig

	const command = exec(cmd, { cwd })

	command.stdout.on('data', data => responder ? responder(data.toString()) : console.log('no responder'))
	command.stderr.on('data', data => error ? error(data.toString()) : console.log('no error catch'))

	command.on('exit', code => exit ? exit(`Process finished with exit code ${code.toString()}`) : null) // code.toString()
}