import { Directive, ElementRef, EventEmitter, HostListener, Input, OnChanges, OnInit, Output} from '@angular/core';

@Directive({
  selector: '[appWordCount]',
  standalone: true
})

export class WordCountDirective {
  @Output() wordCountChange = new EventEmitter<number>();

  constructor(private el: ElementRef) { }

  @HostListener('input') onInput() {
    this.emitWordCount();
  }

  emitWordCount(): void {
    const html = this.el.nativeElement.children[0].innerHTML; //accessing the innerHtml of the quill editor
    const text = this.htmlToPlainText(html); 
    const wordCount = this.countWords(text); 
    this.wordCountChange.emit(wordCount); 
  }

  private countWords(text: string): number {
    const words = text.trim().split(/\s+/);
    return text.length > 0 ? words.length : 0; 
  }

  private htmlToPlainText(html: string): string {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || ""; //Convert HTML to plain text
  }
}
