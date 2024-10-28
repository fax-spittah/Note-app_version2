import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { map } from 'rxjs';
import { User } from '../models/user.model';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.css'
})
export class NavigationComponent {
  userPermissions: string = '';
  currentLoggedInUser: User | undefined;
  isAdmin: boolean = false;

  constructor(private _authService: AuthService, private userService: UserService){}

  ngOnInit() {
    // checking if a user is logged in and fetching their details directly
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentLoggedInUser = JSON.parse(storedUser);
      console.log('User loaded from localStorage:', this.currentLoggedInUser);
    }

    // Listening for updates in currentUser
    this.userService.currentUser.subscribe(user => {
      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.currentLoggedInUser = user;
      }
      console.log('Current user:', this.currentLoggedInUser);
    });

    setTimeout(() => {
      this.checkPermissions();
    }, 1000);
  }

  onLogout(): void{
    this.authService.logout();
  }

  get authService() {
    return this._authService;
  }

  getUserPermissions() {
    console.log("User's id: " + this._authService.getUserID());
    return this.userService.getAdmin(this._authService.getUserID()).pipe(
      map(
        (admin: User | undefined) => {
          if(admin){
            console.log("Admin " + admin);
            return true;
          }
          else{
            console.log("User " + admin);
            return false;
          }
        }
      )
    )
  }

  checkPermissions() {
    this.getUserPermissions().subscribe(isAdmin => {
      if (isAdmin) {
        console.log("User has admin permissions.");
        this.isAdmin = true;
      } else {
        console.log("User does not have admin permissions.");
        this.isAdmin = false;
      }
    });
  }

  
  // getUserPermissions() {
  //   this.userService.getAdmin(this._authService.getUserID()).subscribe({
  //     next: (permission: any) => {
  //       if(permission){
  //         this.userPermissions = permission
  //       }
  //     },
  //     error: (error) => console.log('Error: ', error)
  //   })
  // }
}
