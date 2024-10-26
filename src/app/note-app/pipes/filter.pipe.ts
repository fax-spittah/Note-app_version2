import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
  standalone: true
})
export class FilterPipe implements PipeTransform {
  transform(notes: any[], searchTerm: string): any[] {
    if (!notes) return [];
    if (!searchTerm) return notes; 

    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

    return notes.filter(n =>
      n.name.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }
}
