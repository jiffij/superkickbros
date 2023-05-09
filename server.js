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

    // <<<<<<<<<<<<<<<<<<<<<<< Start of Lab 6 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

    // Add a new user to the online user list
    // const user = socket.request.session.user;
    // console.log(user);
    if(socket.request.session.user != null){
        USER[socket.id] = socket.request.session.user;
    }
    // const Username = user.username;

    if(USER[socket.id] != null){
        onlineUsers[USER[socket.id].username] = {
            avatar: USER[socket.id].avatar,
            name: USER[socket.id].name,
        }
        io.emit("add user", JSON.stringify(USER[socket.id]));
        console.log(onlineUsers);
    }



    socket.on("get users", () => {
        // Send the online users to the browser
        console.log(onlineUsers);
        socket.emit("users", JSON.stringify(onlineUsers));
    });

    socket.on("get messages", () => {
        // Send the chatroom messages to the browser
        const json = JSON.parse(fs.readFileSync("./data/chatroom.json"));
        socket.emit("messages", JSON.stringify(json));
    });

    socket.on("post message", (content) => {
        // Add the message to the chatroom
        var message = {
            user: USER[socket.id],
            datetime: new Date(),
            content: content,
        }
        const json = JSON.parse(fs.readFileSync("./data/chatroom.json"));
        json.push(message);
        fs.writeFileSync("./data/chatroom.json", JSON.stringify(json));
        io.emit("add message", JSON.stringify(message));
    });

    socket.on("typing", ()=>{
        io.emit("entering", USER[socket.id].username);
    });

    // console.log(onlineUsers);
    socket.on("disconnect", () => {
        // Remove the user from the online user list
        // const user = socket.request.session.user;
        if(USER[socket.id].username in onlineUsers){
            delete onlineUsers[USER[socket.id].username]
            io.emit("remove user", JSON.stringify(USER[socket.id]))
            delete USER[socket.id]

            // Added Code
            if(num === 1){
                players = null;
                num--;
            }
            // End of added code
            console.log("disconnected");
        }
        // console.log(onlineUsers);
    });

    // <<<<<<<<<<<<<<<<<<<<<<< End of Lab 6 Code >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
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

    socket.on('fall', (who)=>{
        io.emit('fall', who);
    })

    socket.on('kickSound', ()=>{
        io.emit('kickSound');
    });

   // socket.on('disconnect', ()=>{
   //     if(num === 1){
   //         players = null;
   //         num--;
   //     }
   //
   //  })

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