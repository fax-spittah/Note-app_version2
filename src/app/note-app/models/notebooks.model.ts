import { Timestamp } from "@angular/fire/firestore";

export class Notebook {
    id: string;
    name: string;
    img: string;
    time: Timestamp;
    notecount: number;
  
    constructor() {
      this.id = "";
      this.name = "New notebook";
      this.img = '/assets/images/notebook.jpg';
      this.time = Timestamp.now(), 
      this.notecount = 0;
    }
  }