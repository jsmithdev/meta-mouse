
const fs = require('fs')
const util = require('util')
const path = require('path')
const ora = require('ora')
const xml2js = require('xml2js')

const mkdir = util.promisify(fs.mkdir)

const { unzip_package } = require('./storage')
const { retrievePackages } = require('../SFDX')

const { HOME_DIR } = process.env
const TITLE = 'Example: Jamie Smith (https://jsmith.dev)'


module.exports = { 
    generateSheet
}



async function generateSheet(username, type){

    const dest = path.normalize(`${__dirname}/../../tmp/retrieved/${username}`)

    mkdir( dest, () => {} )

    const packages = type === 'custom'
        ? ['package_objects_custom.xml']
        : type === 'standard'
            ? ['package_objects_std.xml']
            : ['package_objects_custom.xml', 'package_objects_std.xml']

    
    const retrieves = await retrievePackages(username, packages)

    const zip_paths = retrieves
        .filter(loc => loc.directories.to.includes('package_objects'))
        .map(loc => `${loc.directories.to}/unpackaged.zip`)

    const temp_paths = []
    
    // Using for loop to do sequentially, better express what's happening to user
    for(const index in zip_paths){
        temp_paths.push( await unzip_package( zip_paths[index] ) )
    }

    // flatten to single array
    const file_paths = temp_paths.reduce((acc, curr) => [...acc, ...curr], [])

    const spinner = ora('Parsing metadata to generate sheets...').start()
    
    
    const result = await mkProdXls( file_paths, username )

    spinner.succeed(result)
    console.log(`\n`)

    return undefined
}




//todo modernize below; use reduce, promisify reading via util await, etc
function mkProdXls (files, username) {

    return new Promise((resolve, reject) => {
        
        const filename = `Export-Present-Sheet-${username}.xls`

        const headers = [
            'label', 'fullName', 'type', 'required', 'defaultValue', 'externalId', 'referenceTo', 'relationshipName', 'aggregate', 
            'trackFeedHistory', 'trackHistory', 'type'
        ]

        const colspan = headers.length


        //todo modernize below; use reduce, etc
        
        let body = ''
        let numOfRows = 0
        let currentFile = 0

        files.map(file => 
            fs.readFile(file, 'utf8', (err, data) => {

                if(err){
                    console.error(err.message)
                    console.dir('2 FILES LENGTH', files.length)
                    return false
                }

                currentFile++;
                        
                const parser = new xml2js.Parser()

                parser.parseString( data, async (err, result) => {
                  
                    const rowName = file.replace(/^.*[\\\/]/, '')

                    // todo remove 
                    //await test(rowName, JSON.stringify(result, null, 2))

                    const { fields } = result.CustomObject

                    const mkTD = (x) => body += `<td >${x}</td>`

                    if (fields && fields[0] != null) {

                        body += `<tr bgcolor="#3FA2DE" style="text-align:center;color:#FFF;"><td colspan="${colspan}">
                            <b>${rowName.replace('.', ' ')}</b></td></tr>`

                        body += '<tr style="text-align:center;color:#FFF;" bgcolor="#3FA2DE">'
                        headers.map(x => {
                            x = x.replace(/([A-Z])/g, " $1")
                            body += `<th align="center" scope="col"> ${x.charAt(0).toUpperCase() + x.slice(1)} </th>`
                        })
                        body += '</tr>';

                        fields.map(field => {
                            numOfRows++;
                            body += '<tr class="even" valign="top">';

                            mkTD(field.label ? field.label : '')
                            mkTD(field.fullName ? field.fullName : '')
                            mkTD(field.type ? field.type : '')
                            mkTD(field.required ? field.required : '')
                            mkTD(field.defaultValue ? field.defaultValue : '')
                            mkTD(field.externalId ? field.externalId : '')
                            mkTD(field.referenceTo ? field.referenceTo : '')
                            mkTD(field.relationshipName ? field.relationshipName : '')
                            mkTD(field.aggregate ? field.aggregate : '')
                            mkTD(field.trackFeedHistory ? field.trackFeedHistory : '')
                            mkTD(field.trackHistory ? field.trackHistory : '')
                            mkTD(field.type ? field.type : '')

                            body += '</tr>';
                        });


                        body += `<tr><td bgcolor="#333" colspan="${colspan}"></td></tr>`

                        if (currentFile == files.length) {

                            const sheet = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"><html><head><META http-equiv="Content-Type" content="text/html; charset=UTF-8"></head>
                                <body>
                                <table width="100%" class="reportTable tabularReportTable" border="0" cellspacing="0" cellpadding="0">
                                <tr bgcolor="#3FA2DE" style="color:#3FA2DE;"><td colspan="${colspan}">.</td></tr>
                                <tr bgcolor="#3FA2DE" style="color:#FFF;text-align:center;">
                                    <td colspan="${colspan}"><b>${TITLE}</b></td>
                                </tr>
                                <tr bgcolor="#3FA2DE" style="color:#FFF;text-align:center;">
                                    <td colspan="${colspan}">Grand Total: <strong>${currentFile}</strong> Objects containing <strong>${numOfRows}</strong> Fields</td>
                                </tr>
                                <tr bgcolor="#3FA2DE" style="color:#3FA2DE;"><td colspan="${colspan}">.</td></tr>
                                <tr><td colspan="${colspan}"></td></tr>
                                ${body}
                                <tr bgcolor="#3FA2DE" style="color:#3FA2DE;"><td colspan="${colspan}">.</td></tr>
                                <tr bgcolor="#3FA2DE" style="color:#FFF;text-align:center;">
                                    <td colspan="${colspan}"><b>${TITLE}</b></td>
                                </tr>
                                <tr bgcolor="#3FA2DE" style="color:#FFF;text-align:center;">
                                    <td colspan="${colspan}">Grand Total: <b>${currentFile}</b> Objects containing <b>${numOfRows}</b> Fields</td>
                                </tr>
                                <tr bgcolor="#3FA2DE" style="color:#3FA2DE;"><td colspan="${colspan}">.</td></tr>
                                </table>
                                </body></html>`.trim()

                            fs.writeFile(`${HOME_DIR}/${filename}`, sheet, (error) => {
                                error ? reject(error) : resolve(`Created ${HOME_DIR}/${filename}`)
                            })
                        }
                    }
                })
            })
        )
    })
}




async function test(filename, data){

    return new Promise((resolve, reject) => 
    fs.writeFile(`${HOME_DIR}/${filename}.json`, data, (error) => {
        error ? reject(error) : resolve(`${filename}.xls Created in ${HOME_DIR}`)
    }))
}






// todo 
function mkUtilXls (files, evt) {
		

    let filename = `Export-Util-Sheet-${new Date().getTime()}`,
        body = '',
        numOfRows = 0;

    const dir = Config.saveDir
    const headers = [
        'object', 'name', 'fullName', 'deleteConstraint', 'externalId', 'label', 'referenceTo', 'relationshipLabel', 'relationshipName',
        'required', 'trackFeedHistory', 'trackHistory', 'type'
    ]
    
    const colspan = headers.length

    let currentFile = 0

    files.map(file => {
        fs.readFile(file, 'utf8', (err, data) => {

            if(err){
                //reject(err.message)
                return false
            }

            const result = JSON.parse(data)

            const rowName = file.replace(/^.*[\\\/]/, '')

            const fields = result.fields
            console.log('fields.map(x => ')
            fields.map(x => console.dir(x))

            const mkBody = (x) => body += `<td >${x}</td>`

            let header = '<tr>'
            header += headers.map(x => `<td >${x}</td>`)
            header += '</tr>'

            if (fields[0] != null) {

                fields.map(x => {
                    
                    numOfRows++;
                    body += '<tr class="even" valign="top">'

                    mkBody(rowName.substring(0, rowName.indexOf('.')))
                    mkBody(x.name ? x.name : '')
                    mkBody(x.fullName ? x.fullName : '')
                    mkBody(x.deleteConstraint ? x.deleteConstraint : '')
                    mkBody(x.externalId ? x.externalId : '')
                    mkBody(x.label ? x.label : '')
                    mkBody(x.referenceTo ? x.referenceTo : '')
                    mkBody(x.relationshipLabel ? x.relationshipLabel : '')
                    mkBody(x.relationshipName ? x.relationshipName : '')
                    mkBody(x.required ? x.required : '')
                    mkBody(x.trackFeedHistory ? x.trackFeedHistory : '')
                    mkBody(x.trackHistory ? x.trackHistory : '')
                    mkBody(x.type ? x.type : '')

                    body += '</tr>';
                });

                currentFile++;

                console.log(currentFile + ' VS ' + files.length)
                if (currentFile == files.length) {

                    const xls = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.0 Transitional//EN"><html><head><META http-equiv="Content-Type" content="text/html; charset=UTF-8"></head>
                        <body>
                        <table width="100%" class="reportTable tabularReportTable" border="0" cellspacing="0" cellpadding="0">
                        ${header}
                        ${body}
                        </table>
                        </body></html>`

                    fs.writeFile(`${dir}${filename}.xls`, xls, e => {
                        if (e) {

                            evt.sender.send('sheet-created', {
                                show: true,
                                type: `error`,
                                msg: e.message
                            })
                            
                            return false
                        }

                        evt.sender.send('sheet-created', {
                            show: true,
                            type: `success`,
                            msg: `${filename}.xls Created in ${dir}`
                        })
                    })
                }
            }
        })
    })
}
