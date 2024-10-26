import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { loggedOutGuard } from '../logged-out.guard';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
    canActivate: [loggedOutGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }
