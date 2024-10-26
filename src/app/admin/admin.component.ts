import { Component } from '@angular/core';
import { UserService } from '../note-app/services/user.service';
import { User } from '../note-app/models/user.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { Auth } from '@angular/fire/auth';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Observable } from 'rxjs';
import { ImageStorageService } from './image-storage.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink, RouterOutlet],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  users: User[] = [];
  file: File | null = null;
  imageUrl: string = "";
  imageUploaded: boolean = false;
  fileForNotebook: File | null = null;
  fileForNote: File | null = null;
  imageUrlForNotebook: string | null = null;
  imageUrlForNote: string | null = null;

  constructor(private userService: UserService, private authService: AuthService, private auth: Auth, private router: Router, private imageStorage: ImageStorageService){}

  ngOnInit(){
    // this.fetchUsers
  }

  // fetchUsers(){
  //   this.userService.fetchUsers().subscribe({
  //     next: (users: User[]) => {
  //       this.users = users
  //     },
  //     error: (error) => {
  //       console.error('Error fetching users', error);
  //     }
  //   });
  // }
  // deleteUser() {
  //   this.authService.deleteUser()
  //   .next((result) => {
  //     console.log(result);
  //   })
  //   .catch((error) => {
  //     console.log('Error:', error);
  //   });
  // }
  
  // onDeleteAccount(userIndex: number): void {
  //   const user = this.users[userIndex];
  //   if(user){
  //     const userId = user.userID;
      
  //     this.userService.deleteUserFromDb(userId).subscribe({
  //       next: () => {
  //         console.log("User deleted successfully");
  //         return this.authService.deleteUser();
  //       }, 
  //       error: (error) => {
  //         console.log('Error deleting the user ', error);
  //       }
  //     });
  //   } else {
  //     console.error('No user is currently signed in.');
  //   }
  // }


selectImg(event: Event, type: string): void {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const selectedFile = input.files[0];

    if (type === 'notebook') {
      this.fileForNotebook = selectedFile;
    } else if (type === 'note') {
      this.fileForNote = selectedFile;
    }
  }
}

async setFile(imageType: string): Promise<void> {
    let selectedFile: File | null = null;

    if (imageType === 'notebook') {
      selectedFile = this.fileForNotebook;
    } else if (imageType === 'note') {
      selectedFile = this.fileForNote;
    }

    if (!selectedFile) {
      console.log("No file selected.");
      return;
    }

    const path = 'images/' + selectedFile.name;
    try {
      if (imageType === 'notebook') {
        this.imageUrlForNotebook = await this.imageStorage.uploadImage(path, selectedFile, imageType);
        this.imageUrl = this.imageUrlForNotebook;
      } else if (imageType === 'note') {
        this.imageUrlForNote = await this.imageStorage.uploadImage(path, selectedFile, imageType);
        this.imageUrl = this.imageUrlForNote;
      }

      this.imageUploaded = true;
      console.log("Uploaded Image URL:", this.imageUrl);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  }


  canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
    if (this.file && !this.imageUploaded) {
      return confirm('You have selected an image but not uploaded it. Do you want to leave without uploading?');
    }
    return true;
  }
}
