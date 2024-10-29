import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from '@angular/fire/auth';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  token: string | null = null;
  userId: string | null = null;
  userLoggedIn = new Subject<void>();
  userLoggedOut = new Subject<void>();

  constructor(private router: Router, private auth: Auth) {
    if(localStorage.getItem('token')){
      this.token = localStorage.getItem('token');
    }

    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.userId = user.uid;
        console.log("User ID restored:", this.userId);
      } else {
        this.userId = null;
        console.log("No user is logged in");
      }
    });
  }

  // Call this method whenever a user logs in
  handleUserLogin() {
    this.userLoggedIn.next(); // Emit login event
  }

  signup(email: string, password: string): Promise<string> {
    return createUserWithEmailAndPassword(this.auth, email, password)
      .catch(error => {
        console.log(error);
        return error;
      })
      .then(() => {
        return 'success';
      });
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(() => {
        this.handleUserLogin();
        return this.auth.currentUser?.getIdToken().then((token: string) => {
          this.token = token;
          localStorage.setItem('token', token);
          console.log('token gotten');
          return true;
        });
      })
      .catch((error) => {
        console.log(error);
        return false;
      });
  }
  
  logout(): void{
    this.auth.signOut().then(() => {
      this.token = null;
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');

      this.userLoggedOut.next(); // Emit the logout event
      this.router.navigate(['/startup']); 
    }).catch(error => {
      console.error("Error during logout:", error);
    });
  }

  isLoggedIn(): boolean{
    return this.token != null;
  }

  getUserID(): string | null {
    return this.userId;
  }
}
