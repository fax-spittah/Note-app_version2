import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sorting',
  standalone: true
})

export class SortingPipe implements PipeTransform {
  transform(notes: any[], sortType: string): any[] {
    if (!notes) return [];

    if (sortType === 'alphabetically') {
      return notes.sort((a, b) => {
        const titleA = a.name.toUpperCase();
        const titleB = b.name.toUpperCase();
        return titleA < titleB ? -1 : titleA > titleB ? 1 : 0;
      });
    } 
    else if (sortType === 'date') {
      return notes.sort((a, b) => {
        const dateA = a.time.toDate();
        const dateB = b.time.toDate();
        return dateA < dateB ? -1 : dateA > dateB ? 1 : 0;
      });
    }  
    else if (sortType === 'numberNotes') {
      return notes.sort((a, b) => {
        const countA = new Date(a.notecount);
        const countB = new Date(b.notecount);
        return countA < countB ? -1 : countA > countB ? 1 : 0;
      });
    }

    return notes; 
  }
}


