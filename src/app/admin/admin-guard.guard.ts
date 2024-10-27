import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../note-app/services/user.service';
import { AuthService } from '../auth/auth.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';
import { User } from '../note-app/models/user.model';

export const adminGuardGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const userService = inject(UserService);
  const router = inject(Router);

  console.log(authService.getUserID());

  return userService.getAdmin(authService.getUserID()).pipe(
    map(
      (admin: User | undefined) => {
        if(admin){
          return true;
        }
        else{
          router.navigate(['/']);
          console.log(admin);
          return false;
        }
      }
    )
  )
};
