import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageStorageService } from '../image-storage.service';

@Component({
  selector: 'app-change-notebook-image',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './change-notebook-image.component.html',
  styleUrl: './change-notebook-image.component.css'
})
export class ChangeNotebookImageComponent {
  fileForNotebook: File | null = null;
  imageUrlForNotebook: string | null = null;
  imageUploaded: boolean = false;

  constructor(private imageStorage: ImageStorageService) {}

  selectNotebookImg(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.fileForNotebook = input.files[0];
    }
  }

  async uploadNotebookImg(): Promise<void> {
    if (!this.fileForNotebook) {
      console.log("No notebook image file selected.");
      return;
    }

    const path = 'images/' + this.fileForNotebook.name;
    try {
      this.imageUrlForNotebook = await this.imageStorage.uploadImage(path, this.fileForNotebook, 'notebook');
      this.imageUploaded = true;
      console.log("Uploaded Notebook Image URL:", this.imageUrlForNotebook);
      localStorage.setItem('notebookImage', this.imageUrlForNotebook);
    } catch (error) {
      console.error("Error uploading notebook image:", error);
    }
  }

  canDeactivate(): boolean {
    if (this.fileForNotebook && !this.imageUploaded) {
      return confirm('You selected a notebook image but haven\'t uploaded it. Do you want to leave without uploading?');
    }
    return true;
  }
}
