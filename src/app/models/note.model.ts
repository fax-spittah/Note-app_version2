import { Timestamp } from "@angular/fire/firestore";

export class Note{
    id: string;
    notebookId: string;
    name: string;
    text: string;
    time: Timestamp;
    img: string;

    constructor(){
        this.id = ''
        this.notebookId = ''
        this.name = 'New note', 
        this.text = '',
        this.time = Timestamp.now(), 
        this.img = ''
    }
}