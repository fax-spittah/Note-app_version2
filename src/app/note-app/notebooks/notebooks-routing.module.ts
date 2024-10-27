import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotebooksComponent } from './notebooks.component';
import { loggedInGuard } from '../../auth/logged-in.guard';

const NotebookRoutes: Routes = [
  {
    path: '',
    component: NotebooksComponent,
    canActivate: [loggedInGuard],
  }
];

@NgModule({
  imports: [RouterModule.forChild(NotebookRoutes)],
  exports: [RouterModule]
})
export class NotebooksRoutingModule { }
