const express = require('express')
const morgan = require('morgan')
const cookieSession = require('cookie-session')
const bodyParser = require('body-parser')
const urlencodedParser = bodyParser.urlencoded({extended: false})

const isProduction = 'production' === process.env.NODE_ENV
const port = 1336
const app = express()

/* Server Config */
app.set('etag', isProduction)
app.set('views', './src')
app.set('view engine', 'ejs')

/* On log les appels serveurs */
app.use(morgan('tiny'))

/* On sert le css situé dans views/ */
app.use(express.static((__dirname + '/src'), { etag: isProduction, lastModified: false}))

/* On utilise les sessions */
app.use(cookieSession({
  secret: 'todotopsecret',
  maxAge: 360 * 24 * 60 * 60 * 1000
}))

/* On récupère la valeur de 'taskList'
   depuis la session ou bien on l'initialise */
app.use(function (req, res, next) {
    taskList = req.session.taskList = req.session.taskList || []
    next()
})

/* Gestion des routes */
app.get('/', function (req, res) {
  res.render('todo', {taskList: taskList})
})

app.post('/ajouter', urlencodedParser, function(req, res) {
  taskList.push(req.body.addtask)
  res.redirect('/')
})

app.get('/supprimer/:id', function(req, res) {
  taskList.splice(req.params.id, 1)
  res.redirect('/')
})

/* Gestion des mauvaises urls */
app.use(function(req, res) {
  res.setHeader('Content-Type', 'text/html')
  res.status(404).send('<h1>Page introuvable !</h1>')
})

/* Launch the server */
app.listen(port, listening())

function listening () {
  console.log(`Demo server available on http://localhost:${port}`)
  if(!isProduction) {
    const browserSync = require('browser-sync').create()
    // https://ponyfoo.com/articles/a-browsersync-primer#inside-a-node-application
    browserSync.init({
      files: ['./**/*.{html,js,css,ejs}'],
      online: false,
      open: false,
      port: port + 1,
      proxy: 'localhost:' + port,
      ui: false,
      notify: false,
      ghostMode: false
    })
  }
}
