const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')()

const isProduction = 'production' === process.env.NODE_ENV
const port = 1336
let serverTaskList = []

app.set('etag', isProduction)
app.use(express.static((__dirname + '/src'), { etag: isProduction, lastModified: false}))

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/src/index.html')
})

io.attach(server, {pingInterval: 1000})
io.sockets.on('connection', function (socket) {
  socket.emit('taskListFromServer', serverTaskList)
  socket.on('taskListToServer', function(taskListData) {
    serverTaskList = taskListData
    socket.broadcast.emit('taskListFromServer', serverTaskList)
  })
})

/* Launch the server */
server.listen(port, listening)

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
