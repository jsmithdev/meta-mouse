const choices = require('./choices')

//const { icon } = require('./art')
const { search } = require('./util')

module.exports = {
    
    main: [{
        name: 'task',
        message: `What would you like to do?`,
        type: 'autocomplete',
        pageSize: 10,
        source: (answers, input) => search(answers, input, choices.main)
    }],

    org_types: [{
        name: 'url',
        message: `What type of org do you want to add?`,
        type: 'autocomplete',
        pageSize: 10,
        source: (answers, input) => search( answers, input, choices.org_types )
    }],
    
    objects: [{
        name: 'type',
        message: `What kind of objects to include?`,
        type: 'autocomplete',
        pageSize: 10,
        source: (answers, input) => search( answers, input, choices.objects )
    }],

    select_username: usernames => [{
        name: 'username',
        message: 'Select username',
        type: 'autocomplete',
        pageSize: 10,
        source: (answers, input) => search(answers, input, usernames)
    }]
}
