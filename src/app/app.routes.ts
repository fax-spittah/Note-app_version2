import { Routes } from '@angular/router';
import { PageNotFoundComponent } from './note-app/page-not-found/page-not-found.component';
import { SignupComponent } from './auth/signup/signup.component';
import { LoginComponent } from './auth/login/login.component';
import { StartupComponent } from './startup/startup.component';
import { loggedOutGuard } from './auth/logged-out.guard';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./note-app/home/home-routing.module').then(m => m.HomeRoutingModule), 
    },
    {
        path: 'bin',
        loadChildren: () => import('./note-app/bin/bin-routing.module').then(m => m.BinRoutingModule), 
    },
    {
        path: 'notebooks',
        loadChildren: () => import('./note-app/notebooks/notebooks-routing.module').then(m => m.NotebooksRoutingModule), 
    },
    //newly added routes
    {
        path: 'login',
        loadChildren: () => import('./auth/login/login-routing.module').then(m => m.LoginRoutingModule), 
    },
    {
        path: 'signup',
        loadChildren: () => import('./auth/signup/signup-routing.module').then(m => m.SignupRoutingModule), 
    },
    {path: 'startup', component: StartupComponent},
    {
        path: 'admin',
        loadChildren: () => import('./admin/admin-routing.module').then(m => m.AdminRoutingModule),
    },
    //
    {path: '404-page', component: PageNotFoundComponent},
    {path: '**', redirectTo: '/404-page'}

];
