import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ImageStorageService } from '../image-storage.service';

@Component({
  selector: 'app-change-note-image',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './change-note-image.component.html',
  styleUrl: './change-note-image.component.css'
})
export class ChangeNoteImageComponent {
  fileForNote: File | null = null;
  imageUrlForNote: string | null = null;
  imageUploaded: boolean = false;

  constructor(private imageStorage: ImageStorageService) {}

  selectNoteImg(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileForNote = input.files[0];
    }
  }

  async uploadNoteImg(): Promise<void> {
    if (!this.fileForNote) {
      console.log("No note image file selected.");
      return;
    }

    const path = 'images/' + this.fileForNote.name;
    try {
      this.imageUrlForNote = await this.imageStorage.uploadImage(path, this.fileForNote, 'note');
      this.imageUploaded = true;
      console.log("Uploaded Note Image URL:", this.imageUrlForNote);
    } catch (error) {
      console.error("Error uploading note image:", error);
    }
  }

  canDeactivate(): boolean {
    if (this.fileForNote && !this.imageUploaded) {
      return confirm('You selected a note image but haven\'t uploaded it. Do you want to leave without uploading?');
    }
    return true;
  }
}
