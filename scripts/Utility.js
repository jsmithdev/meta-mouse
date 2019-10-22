const exec = require('child_process').exec
const SFDX = require('./sfdx')

module.exports = {
    createApp,
    execute,
    restart,
    fatal
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

async function start(app){

    const username = app.get('user') 

    return username
        ? username 
        : await execute({
            cmd: 'whoami', 
            cwd: __dirname, 
            responder: stout => handleUser(stout, app)
        })
}

function handleUser(raw, app){
    
    const name = raw.replace(/'Undefined'/gi, '').replace('\\n', '')

    app.set('user', name) 

    return name
}

function fatal(e, app){

    const msg = typeof e === 'object' ? JSON.stringify(e) : e
    console.log(`🐭 fatal error, restarting \n  
            Error: ${msg}
    `)
    restart(app.user, app)
}
function restart(app){
    app.start(app.user)
}

function execute(fig){//, cwd, responder, exit

    /* 
    const fig = {
        cmd: `sfdx force:org -h`, 
        cwd: `${__dirname}`,
        responder: console.log,
        exit: console.info,
        error: console.error
    }
    */
   
    const { cmd, cwd, responder, exit, error } = fig

	//console.log('Exec on behalf of user')
    //console.log(`${cmd} ${cwd}`)
   
	const command = exec(cmd, { cwd })

	command.stdout.on('data', data => responder ? responder(data.toString()) : console.log('no responder'))
	command.stderr.on('data', data => error ? error(data.toString()) : console.log('no error catch'))

	command.on('exit', code => exit ? exit(`Process finished with exit code ${code.toString()}`) : null) // code.toString()
}