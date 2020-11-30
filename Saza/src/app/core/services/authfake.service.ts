import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { User } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthfakeauthenticationService {
    private currentUserSubject: BehaviorSubject<User>;
    public currentUser: Observable<User>;

    constructor(private http: HttpClient) {
        this.currentUserSubject = new BehaviorSubject<User>(JSON.parse(localStorage.getItem('currentUser')));
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): User {
        return this.currentUserSubject.value;
    }

    checkLogin(){
        var token = localStorage.getItem('currentToken');
        return this.http.post('/api/checklogin', {token}).pipe(map(data => {
            return data;
        }));
    }

    login(email: string, password: string) {    
        return this.http.post('/api/login', {email, password}).pipe(map(data => {
            // login successful if there's a jwt token in the response
            var token = Object.values(data)[0];
            var user = Object.values(data)[1];
            if (token != null) {
                // store user details and jwt token in local storage to keep user logged in between page refreshes
                localStorage.setItem('currentUser', JSON.stringify(user));
                localStorage.setItem('currentToken', JSON.stringify(token));
                this.currentUserSubject.next(user);
                return data;
            }
            return null;
        }));
    }

    logout() {
       // remove user from local storage to log user out
        localStorage.removeItem('currentUser');
        localStorage.removeItem('currentToken');
        this.currentUserSubject.next(null);
    }
    
    register(username:string, password:string, fullname:string, email:string, phone:string, birthday:string) {
        return this.http.post('/api/register', {username, password, fullname, email, phone, birthday}).pipe(map(data => {         
            var token = Object.values(data)[0];
            var user = Object.values(data)[1];
            if(token != null){
                localStorage.setItem('currentUser', JSON.stringify(user));
                localStorage.setItem('currentToken', JSON.stringify(token));
                this.currentUserSubject.next(user);
                return data;
            }
            return data
        }));
    }

    FindUserbyUsername(username:string) {
        return this.http.post('/api/findbyusername', {username}).pipe(map(data => {
            return data;
        }));
    }
}
