
const inquirer = require('inquirer')
const SFDX = require('./SFDX')
const Utility = require('./Utility')


module.exports = {

    init,
    main,

}


async function init(app){

    console.log(`\n /\\/\\eta /\\/\\ouse 
         _______________________________________
    🐭  < i use sfdx to preform metadata tasks 🧀 )
         ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯
    \n`);

    await Utility.createApp( app )

    await app.start(app)

    main(app)
}



async function main(app){

    const user = app.get('user')

    const choices = [
        'Select Username', 
        'See Saved Username', 
        'Refresh Usernames', 
        'Open in Browser',
        'Validation Rule Count',
        'Quit',
        //'Set FROM org', 
        //'Set to ORG', 
        //'Make package.xml',
    ];

    const question = [{
        choices,
        name: 'task',
        message: `Hey ${user}, what would you like to do? 🐭 `,
        type: 'list'
    }]


    const answer = await inquirer.prompt(question)


    if(answer.task === 'See Saved Username'){
        
        const username = app.get('username')
        console.log( `\n I have ${username} cached as selected 🐭 \n `)

    }
    else if(answer.task === 'Select Username'){

        const check = users => Utility.checks.usernames( users )
        
        if(!check(app.get('usernames'))){
            console.log(` \n no users found, i'll update sfdx username list cache... 🐭 `)        
            const usernames = await SFDX.getUsers()
            app.set('usernames', usernames)
        }
        
        const usernames = ['<- Go Back', ...app.get('usernames')]

        if(usernames.length === 1){ console.log(`Still no users to choose from. Consider adding some to sdfx  🐭 `)}
        
        const question = [{
            choices: usernames,
            name: 'username',
            message: `Select username 🐭 `,
            type: 'list'
        }]

        const answer = await inquirer.prompt(question)

        if(answer.username.includes('Go Back')){ return main(app) }

        app.set('username', answer.username)

        console.log(` \n username ${answer.username} set & cached 🐭 \n`)

    }
    else if(answer.task === 'Refresh Usernames'){
        
        const usernames = await SFDX.getUsers()
    
        app.set('usernames', usernames)

        if(usernames.length === 0){
            console.log(`
            Uh-oh! 🐭 
            No usernames returned from sfdx
            Please add a user to sfdx
            `)
        }
          
    }
    else if(answer.task === 'Validation Rule Count'){

        const response = await validationRuleCount(app)
            
        console.log('\n')
        console.log(response)
        console.log('\n')
    }
    else if(answer.task === 'Open in Browser'){

        const username = app.get('username')

        if(!username){ noUsername(app) }

        await SFDX.openInBrowser(username)

        console.log(`\n opened in browser 🐭 \n`)

    }
    else if(answer.task === 'Quit'){
        
        return console.log(`\n later 🐭 \n`)
    }

    
    main(app)
}

async function validationRuleCount(app){

    const username = app.get('username')

    if(!username){ noUsername(app) }

    const choices = [
        '<- Go Back',
        'Standard Objects',
        'Custom Objects',
        'All Objects'
    ];

    const question = [{
        choices,
        name: 'action',
        message: `What kind of objects to include? 🐭 `,
        type: 'list'
    }]

    const answer = await inquirer.prompt(question)
    
    if(answer.action === '<- Go Back'){ return main(app) }

    const type = answer.action
        .substring(0, answer.action.indexOf(' '))
        .toLowerCase()

    const response = await SFDX.validationRuleCount(username, type)

    return response
}

function noUsername(app){
    console.log('Please pick a username first 🐭 ')
    main(app)
    return
}

