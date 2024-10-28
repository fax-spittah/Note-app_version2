import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeNotesComponent } from './home-notes.component';
import { Note } from '../models/note.model';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

describe('HomeNotesComponent by Edison Kiseh', () => {
  let component: HomeNotesComponent;
  let fixture: ComponentFixture<HomeNotesComponent>;
  let debugElement: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, RouterModule, HomeNotesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeNotesComponent);
    component = fixture.componentInstance;
    debugElement = fixture.debugElement;
  });

  describe('Positive Tests', () => {
    describe('#Correct time in minutes', () => {
      it('should return correct time difference in minutes', () => {
        component.notes = [{
          id: '1',
          notebookId: 'notebook_1',
          name: 'Sample Note',
          text: 'This is a sample note.',
          img: '',
          time: Timestamp.fromDate(new Date(Date.now() - 5 * 60 * 1000)) // 5 minutes ago
        }];
        const result = component.calculateMinutes(0);
        expect(result).toContain('5 minutes ago');
      });
    });
    

    describe('#displayNoteText', () => {
      it('should emit the selected note index when displayNoteText is called', () => {
        spyOn(component.displayNoteEvent, 'emit');
        component.displayNoteText(1);
        expect(component.displayNoteEvent.emit).toHaveBeenCalledWith(1);
      });
    });

    describe('#deleteNoteReq', () => {
      it('should emit delete event with correct index', () => {
        spyOn(component.delNoteEvent, 'emit');
        component.deleteNoteReq(0);
        expect(component.delNoteEvent.emit).toHaveBeenCalledWith(0);
      });

      it('should call hideList method', () => {
        spyOn(component, 'hideList');
        component.deleteNoteReq(0);
        expect(component.hideList).toHaveBeenCalled();
      });
    });

    describe('#showList', () => {
      it('should set showListFlag to true and update position', () => {
        const event = new MouseEvent('contextmenu', { clientX: 50, clientY: 100 });
        component.showList(event);
        expect(component.showListFlag).toBeTrue();
        expect(component.listPositionX).toEqual(50);
        expect(component.listPositionY).toEqual(100);
      });
    });

    describe('#hideList', () => {
      it('should set showListFlag to false', () => {
        component.showListFlag = true;
        component.hideList();
        expect(component.showListFlag).toBeFalse();
      });
    });

    describe('#setSelectedNoteIndex', () => {
      it('should set selectedNoteIndex to provided index', () => {
        component.setSelectedNoteIndex(1);
        expect(component.selectedNoteIndex).toEqual(1);
      });
    });
  });

  describe('Negative Tests', () => {
    describe('#Empty notes', () => {
      it('should handle missing notes input gracefully', () => {
        component.notes = null as any; //missing not simulation
        fixture.detectChanges();

        //Expecting the component to handle this without throwing errors
        expect(component.notes).toBeNull();
        expect(() => fixture.detectChanges()).not.toThrow();
      });

      it('should handle empty notes array for ngFor in template without errors', () => {
        component.notes = []; 
        fixture.detectChanges();
  
        //Expecting no notes to render and no errors during template rendering
        const noteElements = debugElement.queryAll(By.css('.note'));
        expect(noteElements.length).toBe(0);
      });
  
      it('should not emit changedNotesNameEvent if toggling edit on null note', () => {
        spyOn(component.changedNotesNameEvent, 'emit');
        component.notes = [null as any]; 
  
        component.toggleEdit(0); //Attempt to toggle edit on the null note
        expect(component.changedNotesNameEvent.emit).not.toHaveBeenCalled();
      });
    });

    describe('#sortTypeForChild', () => {
      it('should handle invalid sortTypeForChild input gracefully', () => {
        component.sortTypeForChild = 'invalidType'; //Invalid sort type
        component.notes = [new Note()]; 
        fixture.detectChanges();

        expect(() => fixture.detectChanges()).not.toThrow();
      });
    });

    describe('#toggleEdit', () => {
      it('should handle null note in toggleEdit without errors', () => {
        component.notes = [null as any]; 

        //Calling toggleEdit on a null note and ensure it doesn't throw an error
        expect(() => component.toggleEdit(0)).not.toThrow();
      });

      it('should not toggle editing if index is out of bounds', () => {
        component.notes = [{ id: '345d', notebookId: '324d', name: 'Sample', text: 'Content', time: Timestamp.now(), img: '' }];
        component.editing = [false];

        component.toggleEdit(-1); //Negative index
        expect(component.editing[0]).toBe(false);

        component.toggleEdit(10000000000); //Out-of-bounds index
        expect(component.editing[0]).toBe(false);
      });
    });

  });
});
