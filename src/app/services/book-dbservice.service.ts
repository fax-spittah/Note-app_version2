import { Injectable } from '@angular/core';
import { Notebook } from '../models/notebooks.model';
import { HttpClient } from '@angular/common/http';
import { from, Observable, Subject } from 'rxjs';
import { query, collection, collectionData, CollectionReference, deleteDoc, doc, DocumentData, DocumentReference, Firestore, setDoc, updateDoc, where, docData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})

export class BookDBServiceService {

  private notebooksSubject = new Subject<Notebook[]>(); 

  constructor(private http: HttpClient, private db: Firestore) {}
  
  //adding a new notebook
  addNewNoteBook(notebook: Notebook) {
    const newID = doc(collection(this.db, 'id')).id;
    const ref = doc(this.db, 'notebooks/' + newID);

    //doing this because setDoc requires a javascript object
    const notebookData = {
      id: notebook.id,
      img: notebook.img, 
      name: notebook.name,
      noteCount: notebook.notecount,
      time: notebook.time
    };

    return from(setDoc(ref, notebookData));
  }

  updateNoteBook(notebook: Notebook) {
    const bookRef = doc(this.db, 'notebooks/' + notebook.id) as DocumentReference<Notebook>;
    
    //doing this because setDoc requires a javascript object
    const notebookData = {
      id: notebook.id,
      img: notebook.img, 
      name: notebook.name,
      noteCount: notebook.notecount? notebook.notecount: 0,
      time: notebook.time
    };
    
    return from(updateDoc(bookRef, notebookData));
  }

  deleteNoteBook(id: string) {
    const bookRef = doc(this.db, 'notebooks/' + id) as DocumentReference<Notebook>;
    return from(deleteDoc(bookRef));
  }

  deleteDeletedNoteBook(id: string) {
    const noteRef = doc(this.db, 'bin/' + id) as DocumentReference<Notebook>;
    return from(deleteDoc(noteRef));
  }

  getSingleNotebook(id: string): Observable<Notebook | undefined>{
    return docData<Notebook> (
      doc(this.db, 'notebooks/' + id) as DocumentReference<Notebook>,
      {idField: 'id'}
    )
  }

  getNotebooks(): Observable<Notebook[]> {
    return collectionData<Notebook>(
      collection(this.db, 'notebooks/') as CollectionReference<Notebook>,
      {idField: 'id'}
    )
  }
}
