import {createServer} from "node:http";
import {Server} from "socket.io";
const http=createServer();const io=new Server(http,{cors:{origin:"*",methods:["GET","POST"]}});
let history=[];
io.on("connection",socket=>{socket.emit("chat:history",history.slice(-100));socket.on("chat:message",value=>{if(typeof value!=="string")return;const text=value.trim().slice(0,500);if(!text)return;const message="Гравець: "+text;history.push(message);history=history.slice(-500);io.emit("chat:message",message);});});
const port=Number(process.env.PORT||3001);http.listen(port,()=>console.log("Rokytne realtime server on "+port));