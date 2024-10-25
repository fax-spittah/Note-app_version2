import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../../services/user.service';
import { map } from 'rxjs';
import { User } from '../../models/user.model';

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

  constructor(private _authService: AuthService, private userService: UserService){}

  ngOnInit() {
    //checking if a user is logged in and fetching their details directly
    this.userService.currentUser.subscribe(user => {
      this.currentLoggedInUser = user;
      console.log('Current user:', this.currentLoggedInUser);
    });
  }

  onLogout(): void{
    this.authService.logout();
  }

  get authService() {
    return this._authService;
  }

  getUserPermissions() {
    return this.userService.getAdmin(this._authService.getUserID()).pipe(
      map(
        (admin: User | undefined) => {
          if(admin){
            console.log("Admin" + admin);
            return true;
          }
          else{
            console.log("Admin" + admin);
            return false;
          }
        }
      )
    )
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
