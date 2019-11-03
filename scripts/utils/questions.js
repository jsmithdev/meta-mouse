const choices = require('./choices')

const { search } = require('./util')

module.exports = {
    
    main: [{
        name: 'task',
        message: `What would you like to do  🐭 `,
        type: 'autocomplete',
        pageSize: 15,
        source: (answers, input) => search(answers, input, choices.main)
    }],

    org_types: [{
        choices: ['Test Org', 'Prod or Dev Org'],
        name: 'url',
        message: `What type of org do you want to add 🐭 `,
        type: 'list'
    }],
    
    objects: [{
        name: 'type',
        message: `What kind of objects to include? 🐭 `,
        type: 'autocomplete',
        pageSize: 15,
        source: (answers, input) => search( answers, input, choices.objects )
    }],
}
