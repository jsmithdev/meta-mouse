
const inquirer = require('inquirer')
inquirer.registerPrompt('autocomplete', require('inquirer-autocomplete-prompt'))

const SFDX = require('./SFDX')
const Utility = require('./Utility')


module.exports = {
    init,
    main,
}


async function init(app){

    Utility.art.intro()

    main(app)
}

async function main(app){

    const answer = await inquirer.prompt( Utility.questions.main )

    /* GET USER */
    if(answer.task === 'See Cached Username'){
        
        const username = app.get('username')

        username 
            ? console.log( `\n I have ${username} cached as selected 🐭 \n `)
            : console.log( `\n I have no username cached 🐭 \n `)
    }

    /* SET USER */
    else if(answer.task === 'Select Username'){
        
        if( !Utility.checks.usernames( app.get('usernames') ) ){
            console.log(` I'll refresh the cache, one moment... \n`)        
            const usernames = await SFDX.getUsers()
            app.set('usernames', usernames)
        }
        
        const usernames = ['<- Cancel', ...app.get('usernames')]

        if(usernames.length === 1){
            console.log(`Still no users to choose from. Consider adding some using me or sfdx `)
            return main(app)
        }
        
        const answer = await inquirer.prompt( Utility.questions.select_username( usernames ) )

        if( Utility.checks.goBack( answer.username ) ) { return main( app ) }

        app.set('username', answer.username)

        console.log(` \n username ${answer.username} set & cached \n`)

    }

    /* GET USERNAMES */
    else if(answer.task === 'Refresh Usernames'){
        
        const usernames = await SFDX.getUsers()
    
        app.set('usernames', usernames)

        if(usernames.length === 0){
            console.log(`\n No usernames returned from sfdx. Please use 'Add a User' 🐭 \n`)
        }
    }

    /* ADD USER */
    else if(answer.task === 'Add Username'){

        const answer = await inquirer.prompt( Utility.questions.org_types )

        if( Utility.checks.goBack( answer.url ) ) { return main( app ) }

        const url = answer.url.includes('Test') ? 'https://test.salesforce.com' : 'https://login.salesforce.com'
        
        await SFDX.addUser(url)
    }

    /* RULE COUNT */
    else if(answer.task === 'Validation Rule Count'){

        const username = app.get('username')

        if(!username){ noUsername(app) }
    
        const answer = await inquirer.prompt( Utility.questions.objects )
        
        if(answer.type === '<- Cancel'){ 
            return main(app) 
        }
    
        const type = answer.type
            .substring(0, answer.type.indexOf(' '))
            .toLowerCase()
    
        const response = await Utility.validationRuleCount(username, type)
    
        console.log(`\n ${response} \n`)

    }

    /* Create Sheet */
    else if(answer.task === 'Generate Object Sheet'){
        
        const username = app.get('username')

        if(!username){ noUsername(app) }

        await Utility.generateSheet(username)
    }

    /* OPEN ORG */
    else if(answer.task === 'Open in Browser'){

        const username = app.get('username')

        if(!username){ noUsername(app) }

        await SFDX.openInBrowser(username)

        console.log(`\n Opened in browser \n`)
        
    }

    /* EXIT */
    else if(answer.task === 'Quit'){
        
        return Utility.art.outro()
    }

    /* TESTING */
    else if(answer.task === 'Test'){}

    main(app)
}


function noUsername(app){
    
    console.log('Please select a username first')
    return main(app)
}