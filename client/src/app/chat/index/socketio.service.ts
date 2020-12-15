import { Injectable, OnInit } from '@angular/core'
import { Observable, fromEventPattern } from 'rxjs'
import * as io from 'socket.io-client'


@Injectable({
  providedIn: 'root'
})
// Ko implement lifecycle trong sevice nhe
export class SocketioService {
  private socket:  SocketIOClient.Socket
  constructor() {
    this.socket = io.connect('http://localhost:3000') 
    this.socket.on('connect', function() {
      console.log('connected')
    })
    this.socket.on('disconnect', function() {
      console.log('disconnect')
    })
  }
  listenMessage(msg: string): Observable<any> {
    return fromEventPattern(
      (handler) => {
        this.socket.on(msg, handler)
      }
    )
  }

  getChat(): Observable<any> {    
    return fromEventPattern(
      (handler) => {
        this.socket.on('getMsg', handler)
      }
    )
  }

  getInfoChat(): Observable<any> {    
    return fromEventPattern(
      (handler) => {
        this.socket.on('getInfoChat', handler)
      }
    )
  }

  joinRoom(idUserSend, idUserRecieve){
    this.socket.emit('join-room',idUserSend,idUserRecieve)
  }
  
  SendMessage(idUserSend, idUserRecieve ,message : string){
    this.socket.emit("Client-Send-Message",idUserSend, message ,idUserRecieve )  
  }

  getIdSocket():string{
    return this.socket.id
  }

  listenFriendReq(): Observable<any> {
    return fromEventPattern(
      (handler) => {        
        this.socket.on('friendRequest', handler)
      }
    )
  }
  
  sendFriend(id, usernameReceived, msg){
    this.socket.emit('sendFriend', {id, usernameReceived, msg})
  }

  acceptFriend(id, username){
    this.socket.emit('acceptFriend', {id, username})
  }
}
