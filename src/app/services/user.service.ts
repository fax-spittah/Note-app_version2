import { Injectable } from '@angular/core';
import { collection, collectionData, CollectionReference, deleteDoc, doc, docData, DocumentReference, Firestore, setDoc } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { User } from '../models/user.model';
import { Auth } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private db: Firestore, private authService: AuthService, private auth: Auth) { }

  addUserToDb(firstName: string, lastName: string, email: string) {
    const userID = this.authService.getUserID();
    const ref = doc(this.db, 'users/' + userID);

    const userData = {
      firstName: firstName,
      lastName: lastName,
      email: email,
    };
    
    return from(setDoc(ref, userData));
  }

  fetchUsers(): Observable<User[]> {
    return collectionData<User>(
      collection(this.db, 'users/') as CollectionReference<User>,
      {idField: 'userID'}
    )
  }  

  fetchEmails(): Observable<string[]> {
    return collectionData<User>(
      collection(this.db, 'users') as CollectionReference<User>,
      { idField: 'userID' }
    ).pipe(
      map(users => users.map(user => user.email))
    );
  }

  deleteUserFromDb(userId: string) {
    const noteRef = doc(this.db, 'users/' + userId) as DocumentReference<User>;
    return from(deleteDoc(noteRef));
  }

  getAdmin(uid: string | null) {
    return docData<User>(doc(this.db, 'administrator/' + uid) as DocumentReference<User>);
  }
}
