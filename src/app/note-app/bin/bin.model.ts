import { Timestamp } from "@angular/fire/firestore";

export class Bin{
    id: string;
    name: string;
    time: Timestamp;
    img: string;
    type: string;
    text: string;

    constructor(){
        this.id = ''
        this.name = '', 
        this.time = Timestamp.now(), 
        this.img = '', 
        this.type = ''
        this.text = ''
    }
}