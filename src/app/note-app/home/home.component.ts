import { Component, OnChanges, Output, SimpleChanges, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import Quill from 'quill';
import { RouterModule } from '@angular/router';
import { NotebookTitlePipe } from '../../pipes/notebook-title.pipe';
import { Note } from '../../models/note.model';
import { Notebook } from '../../models/notebooks.model';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BookDBServiceService } from '../../services/book-dbservice.service';
import { NotesDBServiceService } from '../../services/notes-dbservice.service';
import { HomeNotesComponent } from '../home-notes/home-notes.component';
import { HomeNotebooksComponent } from '../home-notebooks/home-notebooks.component';
import { Bin } from '../../models/bin.model';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { NoteparentTitlePipe } from '../../pipes/noteparent-title.pipe';
import { Subscription } from 'rxjs';
import { Timestamp } from '@angular/fire/firestore';
import { AuthService } from '../../auth/auth.service';
import { WordCountDirective } from '../../word-count.directive';
import { SortingPipe } from '../../pipes/sorting.pipe';
import { ImageStorageService } from '../../image-storage.service';
import { UserService } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [WordCountDirective, FormsModule, QuillModule, RouterModule, NotebookTitlePipe, CommonModule, HomeNotebooksComponent, HomeNotesComponent, NoteparentTitlePipe, SortingPipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  providers:[BookDBServiceService, NotesDBServiceService]
})


export class HomeComponent {
  notebookName: string = ""
  noteTitle: string = ""
  text: string | null = ""
  notebooks: Notebook[] = []
  notes: Note[] = []
  tempNotesArray: Note[] = []
  notesToBeDeleted: Note[] = []
  noteTextArea: Quill | null = null
  currentTime: Timestamp = Timestamp.now()
  notesParentName: string = "All notes"
  newNoteBook: Notebook = new Notebook()
  notebook: Notebook = new Notebook()
  newNote: Note = new Note()
  newNoteForEditing: Note = new Note()
  isEditing: Boolean = false
  currentNoteID: string = "0"
  currentNoteIndex: number = 0
  binProducts: Bin = new Bin()
  currentNbId: string = ""
  showListFlag = false
  listPositionX: number = 0
  listPositionY: number = 0
  notesSearchContent: string = ""
  allNotesactive: boolean = false  
  notebookActivated: boolean = false
  notebookSubscription!: Subscription;
  numberOfWords: number = 0;
  sortType: string = '';
  notebookImageUrl: string | null = null;
  wordCount: number = 0;
  currentLoggedInUser: User | undefined;

  constructor(private el: ElementRef, private authService: AuthService, private route: ActivatedRoute, private notebooksService: BookDBServiceService, private notesService: NotesDBServiceService, private imageService: ImageStorageService, private userService: UserService){}
  private nextNoteId: number = 1;
  private nextNoteBookId: number = 1;
  @ViewChild(WordCountDirective) wordCountDirective!: WordCountDirective;

  toolbarOptions = [
    [{ 'font': [] }],
    ['bold', 'italic', 'underline', 'strike'],        
    ['link'],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'header': 1 }, { 'header': 2 }],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    // [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    // [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'align': [] }],
  ]; 

  ngOnInit() {
    this.getNoteBooks();
    this.fetchCurrentNotebookId();

    //fetching the notebooks depending if an id was sent along or not
    if(this.currentNbId){
      this.fetchNotebookContentById();
    }
    else{
      this.getNotes();
    }

    console.log(this.authService.getUserID());

    //the note text area
    this.noteTextArea = new Quill('#editor', {
      modules: {
        toolbar: this.toolbarOptions
      },
      theme: 'snow'
    });

    this.noteTextArea.on('text-change', (delta, oldDelta, source) => {
      if (source === 'user') {
        console.log('Text changed by user');
        // this.handleTextChanged();
      }
    });

    this.updateText();
    this.emitWordCount();
    // this.getNotebookImage();

    //checking if a user is logged in and fetching their details directly
    // this.userService.currentUser.subscribe(user => {
    //   this.currentLoggedInUser = user;
    //   console.log('Current user:', this.currentLoggedInUser);
    // });
  }

  getText(): string | null{
    if(this.noteTextArea?.root.innerHTML){
      console.log("The text" + this.noteTextArea.root.innerHTML);
      return this.noteTextArea.root.innerHTML;
    }
    else{
      return null;
    }
  }

  updateText(): void{
    this.text = this.getText();
  }

  getNoteBooks(): void{
    this.notebookSubscription = this.notebooksService.getNotebooks().subscribe({
      next: (notebooks) => {
        this.notebooks = notebooks;
        console.log(this.notebooks);
      },
      error: (err) => {
        console.log(err);
      }
    });
  }

  addNewNoteBook(): void{
    this.newNoteBook.id = this.getNextIdNB().toString()
    // this.newNoteBook.colour = this.getRandomColour();
    this.notebooksService.addNewNoteBook(this.newNoteBook).subscribe({
      next: () => {
        console.log("Notebook has been added")
        this.getNoteBooks()
      },
      error: (error) => console.log('Adding note book error ', error)
    });
  }

  getNotes(): void{
    this.notesService.getNotes(this.currentNbId).subscribe({
      next: (note: Note[]) => {
        this.notes = note;
        // console.log("Note names: " + this.notes[0].text);
        this.tempNotesArray = [...this.notes];//copying the notes to a temporary array to be used in the search function later
        if (this.notes.length > 0) {
            this.newNoteForEditing = this.notes[0];
            this.noteTextArea?.clipboard.dangerouslyPasteHTML(this.newNoteForEditing.text);
        }
      },
      error: (error) => console.log('DB notes fetch error: ', error)
    })
  }

  addNote(): void {
    const newNote: Note = new Note(); // Create a new instance of Note
    newNote.id = this.getNextId().toString(); 
    newNote.notebookId = this.currentNbId;
    this.notesService.addNote(newNote).subscribe({
      next: () => {
        console.log('New note added');
        // this.notes.push(newNote); // Push the new instance into the array
        // this.getNotes();
      },
      error: (error) => console.log('Adding note error ', error)
    });
  }

  displayNoteText(index: number): void{
    if(this.noteTextArea){
      this.noteTextArea.clipboard.dangerouslyPasteHTML(this.notes[index].text);//to be able to read the html and not sanitize it
      this.noteTitle = this.notes[index].name
      this.currentTime = this.notes[index].time;
      this.newNoteForEditing = this.notes[index];
      this.currentNoteID = this.notes[index].id.toString();
      this.currentNoteIndex = index
    }else{
      console.error("Quill text area not initialized yet");
    }
  }

  clearNoteTextArea(): void{
    this.noteTextArea?.setText('')
    this.noteTitle = ''
    // this.currentTime = null
  }

  getAllNotes(): void {
    this.notesParentName = 'All notes'
    this.currentNbId = ""
    this.getNotes()
  }

  allNotesActive(): boolean{
    this.allNotesactive = !this.allNotesactive
    return this.allNotesactive
  }

  //show notes per notebook
  showNoteBookNotes(notebook: Notebook): void {
    this.notesParentName = notebook.name;
    this.currentNbId = notebook.id;
    this.allNotesactive = false
    this.getNotes();
  }

  editNoteTitle(): void{
    this.isEditing = true;
  }

  saveNoteTitle() {
    this.notesService.updateNote(this.newNoteForEditing).subscribe({
      next: (updatedNote) => {
        console.log('Note title updated');
        // this.newNoteForEditing = updatedNote;
        this.isEditing = false
        this.getNotes()
      },
      error: (error) => console.log('Error updating note title ', error)
    });
  }

  deleteNote(index: number): void{
    const noteId = this.notes[index].id.toString()
    this.notesService.deleteNote(noteId).subscribe({
      next: () => {
        console.log('Note deleted')
        this.getNotes()
        this.clearNoteTextArea()
      },
      error: (error) => console.log('Error deleting note ', error)
    })
  }

  moveNoteToRecycleBin(index: number): void{
    const note = this.notes[index]

    this.binProducts.id = note.id
    this.binProducts.img = '/assets/images/allnotes.png'
    this.binProducts.time =  Timestamp.now()
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

  //i decided to implement the ids in this way in order to prevent duplicates, because if i did a simple ++ to the variable, it would reset each time i reload the page
  getNextId(): number {
    const min = 0;
    const max = 9999;
    this.nextNoteId = Math.floor(Math.random() * (max - min + 1)) + min;
    return this.nextNoteId++
  }

  getNextIdNB(): number {
    const min = 0;
    const max = 9999;
    this.nextNoteBookId = Math.floor(Math.random() * (max - min + 1)) + min;
    return this.nextNoteBookId++
  }

  //call this event whenever text changes in the text input field
  handleTextChanged() {
    if (this.noteTextArea) {
      const newText = this.noteTextArea.root.innerHTML;
      console.log("Text changed:", newText);
  
      // Update the text of the current note
      this.notes[this.currentNoteIndex].text = newText;
  
      // Save the updated note text to the database
      this.notesService.updateNoteText(this.notes[this.currentNoteIndex]).subscribe({
        next: () => {
          console.log('Note text updated');
        },
        error: (error) => console.log('Error updating note text ', error)
      });
    }
  }

  updateNBName(notebook: Notebook): void{
    this.notebooksService.updateNoteBook(notebook).subscribe({
      next: () => {
        console.log('Notebook updated');
        this.getNoteBooks();
      },
      error: (error) => console.log('Error updating notebook name ', error)
    });
  }

  updateNoteName(note: Note): void{
    this.notesService.updateNote(note).subscribe({
      next: () => {
        console.log('Note name updated');
        this.getNotes();
      },
      error: (error) => console.log('Error updating notebook name ', error)
    });
  }

  deleteNoteBook(index: number): void{
    const notebookId = this.notebooks[index].id;
    this.notesService.getNotesByNotebookId(notebookId).subscribe({
      next: (notesToBeDeleted) => {
        console.log('Notes deleted', notesToBeDeleted);
        notesToBeDeleted.forEach((note, index) => {
          this.moveNoteToRecycleBin(index)
        });

        this.notebooksService.deleteNoteBook(notebookId).subscribe({
          next: () => {
            console.log('Notebook deleted');
            this.getNoteBooks();
          },
          error: (error) => console.log('Error deleting notebook ', error)
        });
      },
      error: (error) => console.log('Error deleting notes ', error)
    });
  }

  moveNoteBookToRecycleBin(index: number): void{
    const notebook = this.notebooks[index]

    this.binProducts.id = notebook.id
    this.binProducts.img = '/assets/images/notebook.jpg'
    this.binProducts.time = Timestamp.now()
    this.binProducts.name = notebook.name
    this.binProducts.type = 'notebook'

    //same service used here for the notes, could've replicated it in the notebooks service, but it'll just be redundant data
    this.notesService.moveNoteToRecycleBin(this.binProducts).subscribe({
      next: () => {
        console.log('Notebook moved to recycle bin')
        this.deleteNoteBook(index)
        this.getNoteBooks()
      },
      error: (error) => console.log('Error moving notebook to recycle bin ', error)
    });
  }

  fetchCurrentNotebookId(): void{
    const id: string = this.route.snapshot.queryParams['id'];
    
    if(id){
      this.currentNbId = id
    }
    
    // console.log("id:" + this.currentNbId)
  }

  notebookActivate(): string{
    this.fetchCurrentNotebookId()
    return this.currentNbId
  }

  fetchNotebookContentById(): void {
    if (this.currentNbId) {
      this.getNotes()
      this.notebooksService.getSingleNotebook(this.currentNbId).subscribe({
        next: (notebook: Notebook | undefined) => {
          if(notebook){
            this.notebook = notebook;
            this.notesParentName = notebook.name;
            console.log("Fetched notebook with ID:", this.currentNbId, "Data:", this.notebook);
          }
          else{
            console.log("Document not found");
          }
        },
        error: (error) => {
          console.error('Error fetching notebook:', error);
        }
      });
    } else {
      console.warn("No ID found in query parameters.");
    }
  }  

  showList(event: MouseEvent) {
    event.stopPropagation(); 
    this.showListFlag = true;
    this.listPositionX = event.clientX;
    this.listPositionY = event.clientY;
  }

  hideList() {
    this.showListFlag = false;
  }

  setSortType(type: string): void{
    this.sortType = type;
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

  emitWordCount(): void {
    const html = this.el.nativeElement.children[0].innerHTML; //accessing the innerHtml of the quill editor
    const text = this.htmlToPlainText(html); 
    const wordCount = this.countWords(text); 
  }

  private countWords(text: string): number {
    const words = text.trim().split(/\s+/);
    return text.length > 0 ? words.length : 0; 
  }

  private htmlToPlainText(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || ""; //Convert HTML to plain text
  }

  updateWordCount(count: number) {
    this.wordCount = count;
  }

  ngOnDestroy(): void{
    if(this.notebookSubscription){
      this.notebookSubscription.unsubscribe();
    }
  }
  
}
