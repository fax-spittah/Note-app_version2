import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Bin } from '../models/bin.model';
import { EMPTY, from, Observable } from 'rxjs';
import { collection, deleteDoc, doc, DocumentReference, Firestore, setDoc, updateDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class BinService {

  constructor(private http: HttpClient, private db: Firestore){}

  emptyBin(id: string) {
    const binRef = doc(this.db, 'bin/' + id) as DocumentReference<Bin>;
    return from(deleteDoc(binRef));
  }
  
  updateStuff(stuff: Bin, type: string): Observable<any> {
    console.log("type to be updated: " + type);
    const docRef = doc(this.db, 'bin/' + stuff.id) as DocumentReference<Bin>;
  
    const updatedData = {
      id: stuff.id,
      img: stuff.img,
      name: stuff.name,
      type: stuff.type,
      text: stuff.text,
      time: stuff.time
    };
  
    if (updatedData.type === type) {
      console.log('Updated bin item for ' + type);
      return from(updateDoc(docRef, updatedData));
    } else {
      console.log("Invalid type, update not performed.");
      return EMPTY; 
    }
  }
  
  
}
