const choices = require('./choices')

module.exports = {
    
    main: [{
        choices: choices.main,
        name: 'task',
        message: `What would you like to do  🐭 `,
        type: 'list'
    }],

    org_types: [{
        choices: ['Test Org', 'Prod or Dev Org'],
        name: 'url',
        message: `What type of org do you want to add 🐭 `,
        type: 'list'
    }],

}