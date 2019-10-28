
const fs = require('fs')
const util = require('util')
const path = require('path')

const unzip = require('unzip')
const mkdir = util.promisify(fs.mkdir)

const ora = require('ora')

module.exports = { 
    unzip_package
}


const getPackagesDir = s => {
    const d = s
    return path.normalize( d.replace('unpackaged.zip', '') )
}

/**
 * @description decompress zip container, resolve when drained
 * 
 * @param {String} zip_path path to unpackaged.zip
 *          Example '/home/jamie/repo/meta-mouse/tmp/retrieved/me_at_jsmith.dev/unpackaged.zip' 
 * @returns {Array} Promise resolves w/ {Array} of directories when data is out
 */
async function unzip_package(zip_path){

    const spinner = ora(`Decompressing package @ ${zip_path}...`).start()

    return new Promise(resolve => {

        const unzip_path = getPackagesDir(zip_path)

        const dirs = []
        
        fs.createReadStream(zip_path)
        .pipe(unzip.Parse())
        .on('entry', async function (entry) {
            
            const fileName = entry.path;
            const type = entry.type; // 'Directory' or 'File'
            //const size = entry.size;

            if (type === 'File' && fileName !== 'package.xml') {

                const path = unzip_path + entry.path.replace('unpackaged/', '')
                const dir = path.substring(0, path.lastIndexOf('/'))

                mkdir(dir, () => {
                    
                    if(!dirs.includes(dir)){ dirs.push(dir) }

                    entry.pipe(fs.createWriteStream( path ))
                })
            }
            else {
                entry.autodrain()
            }
        })
        .on('close', () => {
            spinner.succeed(`Decompressed package to ${zip_path}`)
            resolve(dirs)
        })
    })
}

