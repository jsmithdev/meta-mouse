
const Store = require('data-store')
const Router = require('./scripts/Router.js')

const app = new Store({ path: 'store.json' })

Router.init(app)
