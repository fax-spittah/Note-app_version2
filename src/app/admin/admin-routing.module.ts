import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { adminGuardGuard } from './admin-guard.guard';
import { deactivateGuardGuard } from './deactivate-guard.guard';

const AdminRoutes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [adminGuardGuard],
    children: [
      {
        path: 'changeNotebookImage',
        loadComponent: () => import('./change-notebook-image/change-notebook-image.component').then(m => m.ChangeNotebookImageComponent), 
        canDeactivate: [deactivateGuardGuard],
      },
      {
        path: 'changeNoteImage',
        loadComponent: () => import('./change-note-image/change-note-image.component').then(m => m.ChangeNoteImageComponent), 
        canDeactivate: [deactivateGuardGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(AdminRoutes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
