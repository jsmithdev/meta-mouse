// jshint esversion: 8, asi: true, laxcomma: true

module.exports = {
    split: () => {

        console.log(`${app.user}  ${chosen[0]}  ${init[0]}`)
        chosen.push(answers.init)

        if(chosen[0]  == init[0]){

            const Qs = [
                {
                    name: 'path',
                    message: 'Where is the data you want to deploy?',
                    default: 'stage'
                },{
                    name: 'user',
                    message: 'What user or alias do you want to deploy with? (user determines the org)',
                    default: 'timdev'
                },
            ]                
            
            inquirer.prompt(Qs)
            .then(answers => deploy(app.cleanpath(answers.path), answers.user))
            .catch(_catch)
        }
        else if(chosen[0]  == init[1]){

            const Qs = [
                {
                    name: 'path',
                    message: 'Where do ya want to remove NS files from?',
                    default: '/'
                }
            ]
            
            inquirer.prompt(Qs)
            .then(answers => {

                const path = app.cleanpath(answers.path)
                const arr = getObjectwNamespace(path)

                removeFrom(path, arr)
                console.info(`🐭  Okay sweet, I removed ${arr.length} files from ${path} ${app.user}! Restarting myself...`)
                _restart(app.user)
            })
        }
        else if(chosen[0] == init[2]) {

            const Qs = [
                {
                    name: 'path',
                    message: 'Where do ya want to generate the spreadsheet?',
                    default: '/'
                }
            ]

            inquirer.prompt(Qs)
            .then(answers => {

                const path = app.cleanpath(answers.path)
                const arr = getObjectwNamespace(path)

                //Toolie.mkProdXls([path])
                console.info(`🐭  Okay sweet, I made a sheet in ${path} ${app.user}! Restarting myself...`)
                _restart(app.user)
            })

        }
    }
}