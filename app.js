
const express = require("express")
const Socket  = require("socket.io");
const http = require('http');
const app = express();
const port = process.env.PORT || 5000;
const server = http.createServer(app);
const { v4: uuidv4 }  = require("uuid")

app.set("view-engine", "ejs")
// app.use(express.urlencoded({ extended: false }))
// app.use(express.json())

 const socketServer = Socket(server, {
  path: '/socket.io'
});



socketServer.on("connection", (socket) => {
 
 
    socket.on("joining",(param)=>{
        socket.join(getRoom(socket))
        socket.to(findRoom(socket)).emit("peerId",param)

    })

    socket.on("sendMessage",(messagePackage)=>{
    
      socket.to(findRoom(socket)).emit("createMessage",messagePackage)
 
     })
  socket.on("sendToggle",(toggleOptions)=>{
  
    socket.to(findRoom(socket)).emit("toggle",toggleOptions)

        })

  socket.on("disconnecting", (reason) => {

  socket.to(findRoom(socket)).emit("leave",socket.id)



  });
  });

  
  function getRoom(socket){

    const url = (new URL(socket.handshake.headers.referer)).pathname;

    

    return url;

  }

  
  function findRoom(socket){
    
    const clientSocket  = socket.rooms.values()
 
      clientSocket.next().value
        const clientRoom = clientSocket.next().value


     return clientRoom;

  }












app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));




app.get("/",(req,res)=>{
res.sendFile(__dirname+"/public/index.html")


})


app.get("/room",(req,res)=>{
  
  res.sendFile(__dirname+"/views/generator.html")

})
app.get("/rooms",(req,res)=>{

res.redirect("/room/"+uuidv4())

})


app.get("/room/:id",(req,res)=>{


    res.status(200).render(__dirname +"/views/video.ejs")

    })



    


server.listen(port,()=>{

console.log(port+" listing")

})







  