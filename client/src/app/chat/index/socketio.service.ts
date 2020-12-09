import { Injectable, OnInit } from '@angular/core';
import { Observable, fromEventPattern } from 'rxjs';
import * as io from 'socket.io-client';
import { environment_socket } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
// Ko implement lifecycle trong sevice nhe
export class SocketioService {
  private socket:  SocketIOClient.Socket;
  constructor() {
    this.socket = io.connect('http://localhost:3000') 
    //this.socket  = io('http://localhost:3000', {transports: ['websocket', 'polling', 'flashsocket']})
    this.socket.on('connect', function() {
      console.log('connected');
      
    })
    this.socket.on('disconnect', function() {
      console.log('disconnect');
      
    })
  }
  listenMessage(msg: string): Observable<any> {
    return fromEventPattern(
      (handler) => {
        this.socket.on(msg, handler);
      },
      (removeHandler) => {
        this.socket.removeEventListener(msg, removeHandler)
      }
    )
  }
 
  setupSocketConnection() {

    this.socket.on("Server-Send-Message",function(mss){
      console.log('connected');

      const element = document.createElement('li');
      element.innerHTML = mss;
      element.style.background = 'white';
      element.style.padding = '15px 30px';
      element.style.margin = '10px';
      element.style.textAlign = 'left';
      document.getElementById('message-list').appendChild(element);
  
      });
    //this.socket = io.connect('http://localhost:3000', {transports: ['websocket', 'polling', 'flashsocket']});
    // this.socket = io(environment_socket.SOCKET_ENDPOINT, {transports: ['websocket', 'polling', 'flashsocket']});
    this.socket.on('message-broadcast',function(msg){
      if(msg){
        const element = document.createElement('li');
        element.innerHTML = msg;
        element.style.background = 'white';
        element.style.padding = '15px 30px';
        element.style.margin = '10px';
        document.getElementById('message-list').appendChild(element);
      }
    });
    let me = this
    this.socket.on('disconnect', function(ee) {
      console.log('disconnect');
      me.socket.open();
    });


  }
  SendMessage(message : string){
    //this.socket.connect()
    console.log("messss"+message);
    
   // this.socket.emit('message',message);
   
   //this.socket = io(environment_socket.SOCKET_ENDPOINT, {transports: ['websocket', 'polling', 'flashsocket']}); 
   const element = document.createElement('li');
    element.innerHTML = message;
    element.style.background = 'white';
    element.style.padding = '15px 30px';
    element.style.margin = '10px';
    element.style.textAlign = 'right';
    document.getElementById('message-list').appendChild(element);
   // message = "";
  //   var roomId = "123456789";
    this.socket.emit("Client-Send-Message", { message: message } );
    
    
  }

}
