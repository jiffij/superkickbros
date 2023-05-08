const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;
const DIST_DIR = path.join(__dirname, '/dist');
const HTML_FILE = path.join(DIST_DIR, 'index.html');
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(DIST_DIR));

app.get('/', (req, res) => {
    res.sendFile(HTML_FILE);
})

server.listen(port, function (){
    console.log("server started");
});


var players;
var num = 0;
var cat2Key;
io.on("connection", (socket)=>{
   console.log("a user connected");
   var id = socket.id;
   console.log(socket.id);
   if(num >= 2){socket.disconnect(true); return;}

   socket.on('join', ()=>{
       socket.emit('num', num++);
   })

   socket.on('update',(states)=>{
       players = states;
       // console.log(states);
   });

   socket.on('hadouken', (data)=>{
       data.who = data.who === 'cat1'? 'cat2': 'cat1';
       io.emit('hadouken', data);
   })

    socket.on('hadoukenKey', ()=>{
        io.emit('hadoukenKey');
    });

   socket.on('updateKey', (keypressed)=>{
       cat2Key = keypressed;
   })

    socket.on('cat2kick', ()=>{
        io.emit('kick');
    })

    socket.on('score', (score)=>{
        io.emit('score', score);
    })

   socket.on('disconnect', ()=>{
       if(num === 1){
           players = null;
           num--;
       }

   })

});

intervalId = setInterval(() => {
    if(num === 2){
        // console.log('update');
        io.emit('update', players);
    }
}, 10);

setInterval(() => {
    if(num === 2){
        // console.log('update');
        io.emit('updateKey', cat2Key);
    }
}, 10);