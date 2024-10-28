import { Component } from '@angular/core';
import { Notebook } from '../models/notebooks.model';
import { CommonModule } from '@angular/common';
import { BookDBServiceService } from '../services/book-dbservice.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotesDBServiceService } from '../services/notes-dbservice.service';
import { BinComponent } from '../bin/bin.component';
import { Bin } from '../bin/bin.model';
// import { HomeNotesComponent } from '../home-notes/home-notes.component';
import { Note } from '../models/note.model';
import { NotebookTitlePipe } from '../pipes/notebook-title.pipe';
import { Timestamp } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { SortingPipe } from '../pipes/sorting.pipe';
import { ImageStorageService } from '../../admin/image-storage.service';

@Component({
  selector: 'app-notebooks',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, BinComponent, NotebookTitlePipe, SortingPipe],
  templateUrl: './notebooks.component.html',
  styleUrls: ['./notebooks.component.css'],
  providers: [BookDBServiceService, NotesDBServiceService]
})
export class NotebooksComponent {
  notebooks: Notebook[] = [];
  tempNotebookArray: Notebook[] = [];
  notebookSearchContent: string = "";
  showListFlag = false;
  listPositionX: number = 0;
  listPositionY: number = 0;
  selectedNoteBookIndex: number = -1;
  editing: boolean[] = [];
  nextNoteId: number = 0;
  binProducts: Bin = new Bin();
  notes: Note[] = [];
  currentNBId: string = "";
  notesNumber: number = 0;
  notebookImageUrl: string | null = ''
  imageSubscription: Subscription | null = null;
  sortType: string = '';;

  constructor(private notebooksService: BookDBServiceService, private notesService: NotesDBServiceService, private imageService: ImageStorageService) {}

  ngOnInit() {
    this.getNoteBooks();
    this.getNotes();
    // this.getNotebookImage();

    // this.imageSubscription = this.imageService.latestImageUrl.subscribe((newImageUrl: string) => {
    //   console.log("New Image URL received:", newImageUrl);
    //   this.updateNotebooksImage(newImageUrl);
    // });
  }

  getNoteBooks(): void {
    this.notebooksService.getNotebooks().subscribe({
      next: (books: Notebook[]) => {
        this.notebooks = books;
        this.tempNotebookArray = [...this.notebooks];
        this.notebooks.forEach(notebook => this.updateNoteCount(notebook));
      },
      error: (error) => console.log('Error: ', error)
    });
  }

  updateNoteCount(notebook: Notebook): void {
    this.notesService.getNotes(notebook.id).subscribe({
      next: (notes: Note[]) => {
        notebook.notecount = notes.length;
      },
      error: (error) => console.log('Error fetching notes:', error)
    });
  }

  filterBy() {
    const searchTerm = this.notebookSearchContent.toLowerCase().trim();

    if (searchTerm) {
      this.notebooks = this.tempNotebookArray.filter(n => n.name.toLowerCase().includes(searchTerm));
    } else {
      this.notebooks = [...this.tempNotebookArray];
    }
  }

  sortNotebooks(sortType: string | null): void {
    if (sortType) {
      if (sortType === 'date') {
        this.sortNotebooksByDateCreated();
      } else if (sortType === 'alphabetical') {
        this.sortNotebooksAlphabetically();
      }
    }
  }

  sortNotebooksAlphabetically(): void {
    this.notebooks.sort((a, b) => {
      const titleA = a.name.toUpperCase();
      const titleB = b.name.toUpperCase();
      return titleA < titleB ? -1 : titleA > titleB ? 1 : 0;
    });
  }

  sortNotebooksByDateCreated(): void {
    this.notebooks.sort((a, b) => {
      const dateA = a.time.toDate();
      const dateB = b.time.toDate();
      return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
    });
  }

  setSelectedNoteBookIndex(index: number): void {
    this.selectedNoteBookIndex = index;
  }

  showList(event: MouseEvent) {
    event.preventDefault();
    this.showListFlag = true;
    this.listPositionX = event.clientX;
    this.listPositionY = event.clientY;
    console.log(this.showListFlag);
    console.log(this.listPositionX);
    console.log(this.listPositionY);
    console.log(this.selectedNoteBookIndex);
  }

  addNewNoteBook(): void {
    const newNotebook: Notebook = new Notebook();
    const existingNotebookImage = localStorage.getItem('notebookImage');
    //checking to see if there is already a set image for the notebooks by the admin in the local storage
    if(existingNotebookImage){
      console.log("Notebook image exists in local storage");
      newNotebook.img = existingNotebookImage;
    }
    // newNotebook.id = this.getNextId().toString();
    this.notebooksService.addNewNoteBook(newNotebook).subscribe({
      next: () => {
        console.log("Notebook has been added");
        this.getNoteBooks();
      },
      error: (error) => console.log('Adding notebook error', error)
    });
  }

  getNextId(): number {
    const min = 0;
    const max = 9999;
    this.nextNoteId = Math.floor(Math.random() * (max - min + 1)) + min;
    return this.nextNoteId++;
  }

  toggleEdit(index: number): void {
    setTimeout(() => {
      this.editing[index] = !this.editing[index];
      if (!this.editing[index]) {
        this.notebooksService.updateNoteBook(this.notebooks[index]).subscribe({
          next: () => console.log('Notebook updated'),
          error: (error) => console.log('Error updating notebook name', error)
        });
      }
    });
  }

  deleteNoteBook(index: number): void {
    const notebookId = this.notebooks[index].id;
    this.currentNBId = notebookId;

    this.notesService.getNotesByNotebookId(notebookId).subscribe({
      next: (notesToBeDeleted) => {
        console.log('Notes to be deleted', notesToBeDeleted);
        notesToBeDeleted.forEach((note, noteIndex) => {
          this.notes[noteIndex] = note;
          this.moveNoteToRecycleBin(noteIndex);
        });

        this.notebooksService.deleteNoteBook(notebookId).subscribe({
          next: () => {
            console.log('Notebook deleted');
            this.getNoteBooks();
          },
          error: (error) => console.log('Error deleting notebook', error)
        });
      },
      error: (error) => console.log('Error fetching notes', error)
    });
  }

  deleteNote(index: number): void{
    const noteId = this.notes[index].id.toString()
    this.notesService.deleteNote(noteId).subscribe({
      next: () => {
        console.log('Note deleted')
      },
      error: (error) => console.log('Error deleting note ', error)
    })
  }

  moveNoteToRecycleBin(index: number): void{
    const note = this.notes[index]

    this.binProducts.id = note.id
    this.binProducts.img = '/assets/images/allnotes.png'
    this.binProducts.time = Timestamp.now()
    this.binProducts.name = note.name
    this.binProducts.type = 'note'
    this.binProducts.text = this.notes[index].text

    this.notesService.moveNoteToRecycleBin(this.binProducts).subscribe({
      next: () => {
        console.log('Note moved to recycle bin')
        this.deleteNote(index)
        this.getNotes()
      },
      error: (error) => console.log('Error moving note to recycle bin ', error)
    });
  }

  getNotes(): void {
    this.notesService.getNotes(this.currentNBId).subscribe({
      next: (note: Note[]) => {
        this.notes = note;
      },
      error: (error) => console.log('DB notes fetch error:', error)
    });
  }

  deleteNoteById(noteId: string): void {
    this.notesService.deleteNote(noteId).subscribe({
      next: () => {
        console.log('Note deleted');
        this.getNotes();
      },
      error: (error) => console.log('Error deleting note', error)
    });
  }

  moveNoteBookToRecycleBin(index: number): void {
    const notebook = this.notebooks[index];

    this.binProducts.id = notebook.id;
    this.binProducts.img = '/assets/images/notebook.jpg';
    this.binProducts.time =  Timestamp.now();
    this.binProducts.name = notebook.name;
    this.binProducts.type = 'notebook';

    this.notesService.moveNoteToRecycleBin(this.binProducts).subscribe({
      next: () => {
        console.log('Notebook moved to recycle bin');
        this.deleteNoteBook(index);
      },
      error: (error) => console.log('Error moving notebook to recycle bin', error)
    });
  }

  hideList(): void {
    this.showListFlag = false;
  }

  //sorting alphabetically
  sortNotesAlphabetically(): void {
    this.notebooks.sort((a, b) => {
        const titleA = a.name.toUpperCase(); // Convert titles to uppercase
        const titleB = b.name.toUpperCase();
        if (titleA < titleB) {
            return -1; // Title A comes before title B
        }
        if (titleA > titleB) {
            return 1; // Title A comes after title B
        }
        return 0; // Titles are equal
    });
  }
  
  //sorting by date
  sortNotesByDateCreated(): void {
    this.notebooks.sort((a, b) => {
      const dateA = a.time.toDate();
      const dateB = a.time.toDate();

      if (dateA < dateB) {
          return -1; 
      }
      if (dateA > dateB) {
          return 1; 
      }
      return 0;
  });
  }

  setSortType(type: string): void{
    this.sortType = type;
  }


  handleSortChange(event: Event) {
    const sortOption = (event.target as HTMLSelectElement).value;
    console.log('Selected option:', sortOption);
    
    this.setSortType(sortOption);
  }

  // async getNotebookImage() {
  //   const filePath = '/images/background-image.jpg'; 
  //   await this.imageService.downloadImg(filePath).then((url: string) => {
  //     console.log(url)
  //     this.notebookImageUrl = url;
  //     this.updateNotebookImage();
  //   }).catch((error) => {
  //     console.error("Error downloading image:", error);
  //   });;
  // }

  // updateNotebookImage(): void {
  //   if (this.notebookImageUrl) {
  //     for (let notebook of this.notebooks) {
  //       notebook.img = this.notebookImageUrl;
  //       console.log("Updated Notebook Image:", notebook.img);
  //     }
  //   } else {
  //     console.log("No notebook image URL available.");
  //   }
  // }

  // updateNotebooksImage(imageUrl: string): void {
  //   this.notebooks.forEach(notebook => {
  //     notebook.img = imageUrl; 
  //     console.log(notebook.img);
  //   });
  //   console.log("All notebooks updated with new image URL.");
  // }

}
