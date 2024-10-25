import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { getDownloadURL, ref, Storage, uploadBytesResumable } from '@angular/fire/storage';
import { doc, Firestore } from '@angular/fire/firestore';
import { Notebook } from './models/notebooks.model';
import { BookDBServiceService } from './services/book-dbservice.service';
import { BinService } from './services/bin.service';
import { Bin } from './models/bin.model';
import { NotesDBServiceService } from './services/notes-dbservice.service';
import { Note } from './models/note.model';

@Injectable({
  providedIn: 'root'
})
export class ImageStorageService {
  latestImageUrl: Subject<string> = new Subject<string>();
  notebooks: Notebook[] = [];
  bin: Bin = new Bin;
  deletedStuff: Bin[] = [];
  notes: Note[] = [];
  typeToBeUpdated: string = "";

  constructor(private noteService: NotesDBServiceService, private storage: Storage, private db: Firestore, private notebooksService: BookDBServiceService, private binService: BinService) {}

  async downloadImg(path: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    const url = await getDownloadURL(storageRef); 
    return url; 
  }

  async getNotebookImage(filePath: string, itemsToUpdate: any[]): Promise<void> {
    try {
      const url = await this.downloadImg(filePath); 
      console.log(url);
      this.updateImage(url, itemsToUpdate);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  }

  private updateImage(url: string, itemsToUpdate: any[]): void {
    if (url) {
      for (let stuff of itemsToUpdate) {
        if (stuff.type === 'notebook') {
          stuff.img = url;
        } else if (stuff.type === 'note') {
          stuff.img = url;
        }
      }
    } else {
      console.log("No image URL available.");
    }
  }

  async uploadImage(path: string, file: File, imageType: string): Promise<string> {
    const storageRef = ref(this.storage, path);
    const task = uploadBytesResumable(storageRef, file);
    await task;
    const url = await getDownloadURL(storageRef);
    this.updateNotebookImages(url, imageType);
    this.latestImageUrl.next(url); 
    return url;
  }

  updateNotebookImages(url: string, imageType: string) {
    // Fetching all notebooks
    const subscriptions = this.notebooksService.getNotebooks().subscribe({
      next: (books: Notebook[]) => {
        this.notebooks = books;
        subscriptions.unsubscribe();

        // Use map to create an array of promises
        if(imageType === 'notebook'){
          const updatePromises = this.notebooks.map((notebook) => {
            notebook.img = url;
            this.typeToBeUpdated = 'notebook'
            // this.setupBinItem(notebook);
  
            this.notebooksService.updateNoteBook(notebook); 
          });

          try {
            // Waiting for all updates to complete
            Promise.all(updatePromises);
            console.log('All notebooks updated successfully with the new image URL:', url);
          } catch (error) {
            console.error('Error updating notebooks:', error); 
          }
        }
        else{
          const updatePromises = this.notes.map((note) => {
            note.img = url;
            this.typeToBeUpdated = 'note'
            // this.setupBinItem(notebook);
  
            this.noteService.updateNote(note);
          });

          try {
            // Waiting for all updates to complete
            Promise.all(updatePromises);
            console.log('All notebooks updated successfully with the new image URL:', url);
          } catch (error) {
            console.error('Error updating notebooks:', error); 
          }
        }
      },
      error: (error) => console.log('Error fetching notebooks: ', error)
    });

    if(imageType === 'notebook'){
      this.typeToBeUpdated = 'notebook'
    }else{
      this.typeToBeUpdated = 'note'
    }
    
    console.log()

    this.updateDeletedStuff(url, this.typeToBeUpdated);
  }

  updateDeletedStuff(url: string, type: string) {
    const subscription = this.noteService.getDeletedNotes().subscribe({
      next: (stuff: Bin[]) => {
        this.deletedStuff = stuff;
        subscription.unsubscribe();
        // Use map to create an array of promises
        const updatePromises = this.deletedStuff.map((del) => {
          del.img = url;

          this.binService.updateStuff(del, type);
        });

        try {
          // Waiting for all updates to complete
          Promise.all(updatePromises);
          console.log('Everything in the bin updated successfully with the new image URL:', url);
        } catch (error) {
          console.error('Error updating bin items:', error); 
        }
      },
      error: (error) => console.log('Error fetching bin items: ', error)
    })
  }
}
