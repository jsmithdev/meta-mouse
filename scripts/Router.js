
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

    main(app)
}



async function main(app){

    const question = Utility.questions.main

    const answer = await inquirer.prompt(question)

    if(answer.task === 'See Cached Username'){
        
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

        if(usernames.length === 1){ console.log(`Still no users to choose from. Consider adding some to SFDX  🐭 `)}
        
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
            console.log(`\n No usernames returned from sfdx. Please use 'Add a User' 🐭 \n`)
        }
    }
    else if(answer.task === 'Add Username'){

        const question = [{
            choices: ['Test Org', 'Prod or Dev Org'],
            name: 'url',
            message: `What type of org do you want to add 🐭 `,
            type: 'list'
        }]

        const answer = await inquirer.prompt(question)

        const url = answer.url.includes('Test') ? 'https://test.salesforce.com' : 'https://login.salesforce.com'
        
        await SFDX.addUser(url)

        console.dir( '\n' )
        
    }
    else if(answer.task === 'Validation Rule Count'){

        await validationRuleCount(app)
            
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

    console.log('\n')
    console.log(response)
    console.log('\n')
    
    return response
}

function noUsername(app){
    console.log('Please pick a username first 🐭 ')
    main(app)
    return
}

