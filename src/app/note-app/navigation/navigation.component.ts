import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { map, Subject, take, takeUntil } from 'rxjs';
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
  private unsubscribe = new Subject<void>();

  constructor(private _authService: AuthService, private userService: UserService){}

  ngOnInit() {
    // checking if a user is logged in and fetching their details directly
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentLoggedInUser = JSON.parse(storedUser);
      console.log('User loaded from localStorage:', this.currentLoggedInUser);
    }

    // Listening for updates in currentUser
    this.userService.currentUser.pipe(takeUntil(this.unsubscribe)).subscribe(user => {
      if (user) {
        this.currentLoggedInUser = user;
      } else {
        this.currentLoggedInUser = undefined;
      }

      console.log("Current user: " + this.currentLoggedInUser);
    });

    // this.checkPermissions();
    this._authService.isAuthenticated$.pipe(takeUntil(this.unsubscribe)).subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.checkPermissions();
      }
    });

    this.loadAdminStatus();
    
  }

  onLogout(): void{
    this.authService.logout();
    this.currentLoggedInUser = undefined;
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
            localStorage.setItem('admin', 'true');
            return true;
          }
          else{
            console.log("User " + admin);
            localStorage.removeItem('admin');
            return false;
          }
        }
      )
    )
  }

  checkPermissions() {
    this.getUserPermissions().pipe(take(1), takeUntil(this.unsubscribe)).subscribe(isAdmin => {
      this.isAdmin = isAdmin;
      console.log(`User ${isAdmin ? 'has' : 'does not have'} admin permissions.`);
    });
  }

  
  loadAdminStatus(): void {
    const storedAdminStatus = localStorage.getItem('admin');
    if (storedAdminStatus) {
      this.isAdmin = true;
    } else {
      this.checkPermissions(); // Initial check if no stored status
    }
  }

  ngOnDestroy() {
    // Emits a value and completes the subject to terminate all subscriptions
    this.unsubscribe.next();
    this.unsubscribe.complete();
  }
}
