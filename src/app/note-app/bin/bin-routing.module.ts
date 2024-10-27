import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BinComponent } from './bin.component';
import { loggedInGuard } from '../../auth/logged-in.guard';

const BinRoutes: Routes = [
  {
    path: '',
    component: BinComponent,
    canActivate: [loggedInGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(BinRoutes)],
  exports: [RouterModule]
})
export class BinRoutingModule { }
