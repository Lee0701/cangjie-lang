
const express = require('express')
const {Liquid} = require('liquidjs')

const {Cangjie, parse} = require('./dist/cangjie-lang.js')

const app = express()
const liquid = new Liquid()

app.set('view engine', 'html')
app.engine('html', liquid.express())

app.use(express.static('dist'))

app.get('/', (req, res) => {
    res.render('index.html', {})
})

app.listen(process.env.PORT || 8080)
