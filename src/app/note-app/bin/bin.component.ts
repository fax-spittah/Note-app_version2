import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Bin } from './bin.model';
import { NotesDBServiceService } from '../services/notes-dbservice.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BinService } from './bin.service';
import { BookDBServiceService } from '../services/book-dbservice.service';
import { Note } from '../models/note.model';
import { Notebook } from '../models/notebooks.model';
import { FormsModule } from '@angular/forms';
import { NotebookTitlePipe } from '../pipes/notebook-title.pipe';
import { Timestamp } from '@angular/fire/firestore';
import { ImageStorageService } from '../../admin/image-storage.service';
import { SortingPipe } from '../pipes/sorting.pipe';
import { FilterPipe } from '../pipes/filter.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule, NotebookTitlePipe, SortingPipe, FilterPipe],
  templateUrl: './bin.component.html',
  styleUrl: './bin.component.css',
  providers:[NotesDBServiceService, BinService, BookDBServiceService, Note]
})
export class BinComponent {
  showListFlag = false;
  listPositionX: number = 0;
  listPositionY: number = 0;
  selectedNoteBookIndex: number = -1
  deletedStuff: Bin[] = []
  tempDeletedStuff: Bin[] = []
  note: Note = new Note()
  binSearchContent: string = ""
  notebookImageUrl: string = ''; 
  noteImageUrl: string = '';
  sortType: string = '';

  constructor(private notesService: NotesDBServiceService, private notebooksService: BookDBServiceService, private http: HttpClient, private binService: BinService, private imageService: ImageStorageService){}

  ngOnInit(): void {
    this.getDeletedNotes();
  }

  getDeletedNotes(): void{
    this.notesService.getDeletedNotes().subscribe({
      next: (notes: Bin[]) => {
        this.deletedStuff = notes;
        this.tempDeletedStuff = [...this.deletedStuff];
      },
      error: (error) => console.log('DB notes fetch error: ', error)
    })
  }

  emptyBin(): void{
    this.deletedStuff.forEach((bin) => {
      this.binService.emptyBin(bin.id).subscribe({
        next: () => {
          console.log('Item deleted')
          this.getDeletedNotes()
        },
        error: (error) => console.log('Error emptying bin ', error)
      })
    });

    console.log('Bin emptied')
  }

  showList(event: MouseEvent) {
    event.preventDefault(); // Prevent the default right-click context menu
    this.showListFlag = true;
    this.listPositionX = event.clientX;
    this.listPositionY = event.clientY;
  }
  
  deleteNoteOrNotebook(index: number): void{
    const noteId = this.deletedStuff[index].id.toString()
    const noteType = this.deletedStuff[index].type

    if(noteType == 'note'){
      this.notesService.deleteDeletedNotes(noteId).subscribe({
        next: () => {
          console.log('Note deleted')
          this.getDeletedNotes()
        },
        error: (error) => console.log('Error deleting note ', error)
      })
    }else{
      this.notebooksService.deleteDeletedNoteBook(noteId).subscribe({
        next: () => {
          console.log('Notebook deleted')
          this.getDeletedNotes()
        },
        error: (error) => console.log('Error deleting notebook ', error)
      })
    }
  }

  restoreNoteOrNotebook(index: number): void{
    const noteId = this.deletedStuff[index].id.toString()
    const noteType = this.deletedStuff[index].type

    if(noteType == 'note'){
      const restoreNote = new Note()

      restoreNote.id = noteId
      restoreNote.img = 'src/assets/images/allnotes.png'
      restoreNote.text = this.deletedStuff[index].text
      restoreNote.time = Timestamp.now()
      restoreNote.name= this.deletedStuff[index].name

      this.notesService.addNote(restoreNote).subscribe({
        next: () => {
          console.log('Note restored')
          this.deleteNoteOrNotebook(index)
          this.getDeletedNotes()
        },
        error: (error) => console.log('Error restoring note ', error)
      })
    }else{
      const restoreNotebook = new Notebook()

      restoreNotebook.id = noteId
      restoreNotebook.img = '../../assets/images/notebook.jpg'
      restoreNotebook.name = this.deletedStuff[index].name

      this.notebooksService.addNewNoteBook(restoreNotebook).subscribe({
        next: () => {
          console.log('Notebook restored')
          this.deleteNoteOrNotebook(index)
          this.getDeletedNotes()
        },
        error: (error) => console.log('Error restoring notebook ', error)
      })
    }
  }

  setSelectedNoteBookIndex(index: number): void{
    this.selectedNoteBookIndex = index
  }

  hideList() {
    this.showListFlag = false;
  }

  handleSortChange(event: Event) {
    const sortOption = (event.target as HTMLSelectElement).value;
    console.log('Selected option:', sortOption);
    
    if(sortOption == "alphabetically"){
      this.sortType = "alphabetically";
    }
    else if(sortOption == "dateDeleted"){
      this.sortType = "date";
    }
  }

  //fetching the images of either the note or the notebook
  async getNotebookImage(notebookFilePath: string, noteFilePath: string) {
    await this.imageService.downloadImg(notebookFilePath).then((url: string) => {
      console.log("Notebook Image URL:", url);
      this.notebookImageUrl = url;
    }).catch((error) => {
      console.error("Error downloading notebook image:", error);
    });
  
    await this.imageService.downloadImg(noteFilePath).then((url: string) => {
      console.log("Note Image URL:", url);
      this.noteImageUrl = url; 
    }).catch((error) => {
      console.error("Error downloading note image:", error);
    });
  
    this.updateNotebookImage();
  }
  
  updateNotebookImage(): void {
    if (this.notebookImageUrl || this.noteImageUrl) {
      for (let stuff of this.deletedStuff) {
        if (stuff.type === 'notebook') {
          stuff.img = this.notebookImageUrl;
          console.log("Updated Notebook Image:", stuff.img);
        } else if (stuff.type === 'note') {
          stuff.img = this.noteImageUrl; 
          console.log("Updated Note Image:", stuff.img);
        }
      }
    } else {
      console.log("No image URLs available.");
    }
  }
}
