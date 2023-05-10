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
const fs = require('fs');

const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(DIST_DIR));

app.get('/getRank', (req, res) => {
    const rank = fs.readFileSync("./data/rank.json");
    res.send(rank);
})

app.post("/updateRank", (req, res) => {

    const { username } = req.body;
    const rank = JSON.parse(fs.readFileSync("./data/rank.json"));

    const existingRecordIndex = rank.findIndex((record) => record.username === username);

    var existwin = 0;
    if (existingRecordIndex !== -1) {
        // If the user already has a score in the rank, compare it to the new score
        const existingRecord = rank[existingRecordIndex];
        existwin = existingRecord.wins;
        // Otherwise, remove the existing score
        rank.splice(existingRecordIndex, 1);
    }

    // Add the new record to the rank
    rank.push({ username: username, wins: existwin+1 });

    // Sort the rank by wins in descending order
    rank.sort((a, b) => b.wins - a.wins);
    for (var i = 0; i < rank.length; i++) {
        rank[i]["rank"] = i + 1;
    }
    fs.writeFileSync("./data/rank.json", JSON.stringify(rank));
    res.json(rank);
    //console.log(res);
   
});

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
    // if(socket.request.session.user != null){
    //     USER[socket.id] = socket.request.session.user;
    // }
    // // const Username = user.username;

    // if(USER[socket.id] != null){
    //     onlineUsers[USER[socket.id].username] = {
    //         avatar: USER[socket.id].avatar,    
    //         name: USER[socket.id].name,
    //     }
    //     io.emit("add user", JSON.stringify(USER[socket.id]));
    //     console.log(onlineUsers);
    // }



    // socket.on("get users", () => {
    //     // Send the online users to the browser
    //     console.log(onlineUsers);
    //     socket.emit("users", JSON.stringify(onlineUsers));
    // });

    // socket.on("get messages", () => {
    //     // Send the chatroom messages to the browser
    //     const json = JSON.parse(fs.readFileSync("./data/chatroom.json"));
    //     socket.emit("messages", JSON.stringify(json));
    // });

    // socket.on("post message", (content) => {
    //     // Add the message to the chatroom
    //     var message = {
    //         user: USER[socket.id],
    //         datetime: new Date(),
    //         content: content,
    //     }
    //     const json = JSON.parse(fs.readFileSync("./data/chatroom.json"));
    //     json.push(message);
    //     fs.writeFileSync("./data/chatroom.json", JSON.stringify(json));
    //     io.emit("add message", JSON.stringify(message));
    // });

    // socket.on("typing", ()=>{
    //     io.emit("entering", USER[socket.id].username);
    // });

    // // console.log(onlineUsers);
    // socket.on("disconnect", () => {
    //     // Remove the user from the online user list
    //     // const user = socket.request.session.user;
    //     if(USER[socket.id].username in onlineUsers){
    //         delete onlineUsers[USER[socket.id].username]
    //         io.emit("remove user", JSON.stringify(USER[socket.id]))
    //         delete USER[socket.id]

    //         // Added Code
    //         if(num === 1){
    //             players = null;
    //             num--;
    //         }
    //         // End of added code
    //         console.log("disconnected");
    //     }
    //     // console.log(onlineUsers);
    // });

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

//    socket.on('disconnect', ()=>{
//        if(num === 1){
//            players = null;
//            num--;
//        }

//    })

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

// <<<<<<<<<<<<<<<<<<<<<<< Start of Lab 6 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

// const bcrypt = require("bcrypt");
// const session = require("express-session");


// const onlineUsers = {};
// const USER = {};

// // Use the 'public' folder to serve static files
// app.use(express.static("public"));

// // Use the json middleware to parse JSON data
// app.use(express.json());

// // Use the session middleware to maintain sessions
// const chatSession = session({
//     secret: "game",
//     resave: false,
//     saveUninitialized: false,
//     rolling: true,
//     cookie: { maxAge: 300000 }
// });
// app.use(chatSession);

// // This helper function checks whether the text only contains word characters
// function containWordCharsOnly(text) {
//     return /^\w+$/.test(text);
// }

// // Handle the /register endpoint
// app.post("/register", (req, res) => {
//     // Get the JSON data from the body
//     const { username, avatar, name, password } = req.body;

//     //
//     // D. Reading the users.json file
//     //
//     const json = JSON.parse(fs.readFileSync("./data/users.json"));
//      console.log(json);

//     //
//     // E. Checking for the user data correctness
//     //
//     if(username == "" || avatar == "" || name == "" || password == ""){
//         console.log("Some information is missing.");
//         return res.json({ status: "error", error: "Some information is missing." });
//     }
//     if(!containWordCharsOnly(username)){
//         console.log("Username contains invalid character(s).");
//         return res.json({ status: "error", error: "Username contains invalid character(s)." });
//     }
//     if((username in json)){
//         console.log("Username already exists.");
//         return res.json({ status: "error", error: "Username already exists." });
//     }

//     //
//     // G. Adding the new user account
//     //
//     const hash = bcrypt.hashSync(password, 10);

//     json[username] = {
//         "avatar": avatar,
//         "name": name,
//         "password": hash,
//     }
    


//     //
//     // H. Saving the users.json file
//     //
//     fs.writeFileSync("./data/users.json", JSON.stringify(json));
//     //
//     // I. Sending a success response to the browser
//     //
//     res.json({ status: "success" });
//     // Delete when appropriate
   
// });

// // Handle the /signin endpoint
// app.post("/signin", (req, res) => {
//     // Get the JSON data from the body
//     const { username, password } = req.body;

//     //
//     // D. Reading the users.json file
//     //
//     const json = JSON.parse(fs.readFileSync("./data/users.json"));

//     //
//     // E. Checking for username/password
//     //
//     if(!(username in json)){
//         return res.json({ status: "error", error: "The username doesn't exist." });
//     }

//     const hashedPassword = json[username].password;
    
//     if(!bcrypt.compareSync(password, hashedPassword)){
//         return res.json({ status: "error", error: "The password is wrong." });
//     }

//     //
//     // G. Sending a success response with the user account
//     //
//     req.session.user = {username: username, avatar: json[username].avatar, name: json[username].name};

//     res.json({ status: "success", user: {username: username, avatar: json[username].avatar, name: json[username].name}});
//     // Delete when appropriate
    
// });

// // Handle the /validate endpoint
// app.get("/validate", (req, res) => {

//     //
//     // B. Getting req.session.user
//     //
//     const usersession = req.session.user
//     if(usersession == null){
//         return res.json({ status: "error", error: "No user session." });
//     }

//     //
//     // D. Sending a success response with the user account
//     //
//     res.json({ status: "success", user: usersession});
 
//     // Delete when appropriate
    
// });

// // Handle the /signout endpoint
// app.get("/signout", (req, res) => {

//     //
//     // Deleting req.session.user
//     //
//     req.session.destroy((err) => {
//         if (err) {
//             return res.json({ status: "error"});
//         } else {
//             return res.json({ status: "success"});
//         }
//       });

//     //
//     // Sending a success response
//     //
 
//     // Delete when appropriate
    
// });


// //
// // ***** Please insert your Lab 6 code here *****
// //

// const { on } = require("events");



// //socket.request.session.user
// io.use((socket, next) => {
//     chatSession(socket.request, {}, next);
// });

// io.on("connection", (socket) => {
//     // Add a new user to the online user list
//     // const user = socket.request.session.user;
//     // console.log(user);
//     if(socket.request.session.user != null){
//         USER[socket.id] = socket.request.session.user;
//     }
//     // const Username = user.username;
    
//     if(USER[socket.id] != null){
//         onlineUsers[USER[socket.id].username] = {
//             avatar: USER[socket.id].avatar,    
//             name: USER[socket.id].name,
//         }
//         io.emit("add user", JSON.stringify(USER[socket.id]));
//         console.log(onlineUsers);
//     }

    

//     socket.on("get users", () => {
//         // Send the online users to the browser
//         console.log(onlineUsers);
//         socket.emit("users", JSON.stringify(onlineUsers));
//     });

//     socket.on("get messages", () => {
//         // Send the chatroom messages to the browser
//         const json = JSON.parse(fs.readFileSync("./data/chatroom.json"));
//         socket.emit("messages", JSON.stringify(json));
//     });

//     socket.on("post message", (content) => {
//         // Add the message to the chatroom
//         var message = {
//             user: USER[socket.id],
//             datetime: new Date(),
//             content: content,
//         }
//         const json = JSON.parse(fs.readFileSync("./data/chatroom.json"));
//         json.push(message);
//         fs.writeFileSync("./data/chatroom.json", JSON.stringify(json));
//         io.emit("add message", JSON.stringify(message));
//     });

//     socket.on("typing", ()=>{
//         io.emit("entering", USER[socket.id].username);
//     });
    
//     // console.log(onlineUsers);
//     socket.on("disconnect", () => {
//         // Remove the user from the online user list
//         // const user = socket.request.session.user;
//         if(USER[socket.id].username in onlineUsers){
//             delete onlineUsers[USER[socket.id].username]
//             io.emit("remove user", JSON.stringify(USER[socket.id]))
//             delete USER[socket.id]
//             console.log("disconnected");
//         }
//         // console.log(onlineUsers);
//     });
// });


// Use a web server to listen at port 8000
// httpServer.listen(8000, () => {
//     console.log("The chat server has started...");
// });

// <<<<<<<<<<<<<<<<<<<<<<< End of Lab 6 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>