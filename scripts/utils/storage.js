
const fs = require('fs')
const util = require('util')
const path = require('path')

const mkdir = util.promisify(fs.mkdir)

const ora = require('ora')

module.exports = { 
    unzip_package
}

const DecompressZip = require('decompress-zip');

const getPackagesDir = string => {
    return path.normalize( string.replace('unpackaged.zip', '') )
}

/**
 * @description decompress zip container, resolve when drained
 * 
 * @param {String} zip_path path to unpackaged.zip
 *          Example '/home/jamie/repo/meta-mouse/tmp/retrieved/me_at_jsmith.dev/unpackaged.zip' 
 * @returns {Array} Promise resolves w/ {Array} of directories when data is out
 */
async function unzip_package(zip_path){

    return new Promise((resolve, reject) => {
        try {

            const details = {}

            const spinner = ora().start(`Decompressing package @ ${zip_path}...`)

            const unzip_path = getPackagesDir(zip_path)

            const unzip = new DecompressZip(zip_path)
        
            unzip.on('error', error => {
                spinner.warn('Caught an error')
                reject(error)
            });
        
            unzip.on('extract', log => {

                spinner.succeed(`Finished decompression of ${details.fileCount} files`)

                const results = log
                    .map(o => `${unzip_path}${Object.values(o)[0]}`)
                    .filter(name => {
                        
                        return name.includes('.')
                            && !name.includes('.zip')
                            && !name.includes('.xml')
                    })
                
                resolve(results)
            });
        
            unzip.on('progress', (fileIndex, fileCount) => {
                details.fileCount = fileCount
                spinner.text = 'Extracted file ' + (fileIndex + 1) + ' of ' + fileCount
            });
        
            unzip.extract({
                path: unzip_path,
                //filter: function (file) {
                //    return file.type !== "SymbolicLink";
                //}
            });
        }
        catch (error) {
            reject(error)
        }
    })
}