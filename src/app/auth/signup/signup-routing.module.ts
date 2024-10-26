import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './signup.component';
import { loggedOutGuard } from '../logged-out.guard';

const routes: Routes = [
  {
    path: '',
    component: SignupComponent,
    canActivate: [loggedOutGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignupRoutingModule { }
