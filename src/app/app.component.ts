import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NotebooksComponent } from './note-app/notebooks/notebooks.component';
import { HomeComponent } from './note-app/home/home.component';
import { BinComponent } from './note-app/bin/bin.component';
import { NavigationComponent } from './note-app/navigation/navigation.component';
import { HomeNotebooksComponent } from './note-app/home-notebooks/home-notebooks.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotebooksComponent, HomeComponent, BinComponent, RouterModule, NavigationComponent, HomeNotebooksComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'note-app';
}
