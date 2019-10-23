
const inquirer = require('inquirer')
const Store = require('data-store')
const SFDX = require('./scripts/sfdx')
const Utility = require('./scripts/Utility')



const app = new Store({ path: 'config.json' })

init(app)

async function init(){

    console.log(`\n /\\/\\eta /\\/\\ouse 
         _______________________________________
    🐭  < i use sfdx to preform metadata tasks 🧀 )
         ¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯¯
    \n`);

    await Utility.createApp( app )

    await app.start(app)

    main()
}



async function main(){

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

    const answer = await inquirer
        .prompt([{
            choices,
            name: 'task',
            message: `Hey ${app.get('user')}, what would you like to do? 🐭 `,
            type: 'list'
        }]);

    if(answer.task === 'See Saved Username'){

        console.log( `\n 
        I have this username saved as selected 🐭 
        ----------------------------------------------
        ${app.get('username')} \n` 
        );

        return main()
    }
    else if(answer.task === 'Select Username'){

        const hasUsers = app.get('usernames')
        
        const usernames = hasUsers ? app.get('usernames') : await SFDX.getUsers()

        if(!hasUsers){
            app.set('usernames', usernames)
        }

        const answer = await inquirer
        .prompt([{
            choices: usernames,
            name: 'username',
            message: `Select username 🐭 `,
            type: 'list'
        }])

        console.log(answer.username)
        app.set('username', answer.username)

        console.log(`
        username set & cached 🐭 
        `)

        main()
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
        
        main()    
    }
    else if(answer.task === 'Validation Rule Count'){
        const response = await validationRuleCount(app)
        console.log(response)

        main()
    }
    else if(answer.task === 'Open in Browser'){

        await SFDX.openInBrowser(app.get('username'))

        console.log(`
        opened in browser 🐭 
        `)

        main()
    }
    else if(answer.task === 'Quit'){
        
        return console.log(`\n later 🐭 \n`)
    }
}

async function validationRuleCount(app){

    const choices = [
        'Standard Objects',
        'Custom Objects',
        'All Objects'
    ];

    const answer = await inquirer
    .prompt([{
        choices,
        name: 'action',
        message: `What kind of objects to include? 🐭 `,
        type: 'list'
    }])

    const type = answer.action
        .substring(0, answer.action.indexOf(' '))
        .toLowerCase()

    // const response = await SFDX.getValidationCount(app.get('username'), type)
    const response = await SFDX.retrievePackage(app.get('username'), 'objects')

    return response
}