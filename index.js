process.env.HOME_DIR = require('os').homedir()

const Store = require('data-store')
const Router = require('./scripts/Router.js')

const app = new Store({ path: process.env.HOME_DIR+'/.metamouse.json' })

Router.init(app)
