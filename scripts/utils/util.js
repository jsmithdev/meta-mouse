const fuzzy = require('fuzzy')


module.exports = { 
    search,
}


async function search(answers, input, array) {

    input = input || '';

    const fuzzyResult = fuzzy.filter(input, array)

    return fuzzyResult.map(el => el.original)
}