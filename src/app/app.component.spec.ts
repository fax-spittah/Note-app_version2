// import { TestBed } from '@angular/core/testing';
// import { AppComponent } from './app.component';
// import { provideRouter } from '@angular/router';
// import { routes } from './app.routes';
// import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
// import { environment } from '../environments/environment';
// import { getFirestore, provideFirestore } from '@angular/fire/firestore';
// import { getAuth, provideAuth } from '@angular/fire/auth';
// import { getStorage, provideStorage } from '@angular/fire/storage';

// describe('AppComponent', () => {
//   class MockRouter {}

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [AppComponent],
//       providers: [
//         provideRouter(routes),
//         //{provide: Router, useValue: MockRoute}
//         provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
//         provideFirestore(() => getFirestore()),
//         provideAuth(() => getAuth()),
//         provideStorage(() => getStorage())
//       ]
//     }).compileComponents();
//   });

//   it('should create the app', () => {
//     const fixture = TestBed.createComponent(AppComponent);
//     const app = fixture.componentInstance;
//     expect(app).toBeTruthy();
//   });

//   // it(`should have the 'note-app' title`, () => {
//   //   const fixture = TestBed.createComponent(AppComponent);
//   //   const app = fixture.componentInstance;
//   //   expect(app.title).toEqual('note-app');
//   // });

//   // it('should render title', () => {
//   //   const fixture = TestBed.createComponent(AppComponent);
//   //   fixture.detectChanges();
//   //   const compiled = fixture.nativeElement as HTMLElement;
//   //   expect(compiled.querySelector('h1')?.textContent).toContain('Hello, note-app');
//   // });
// });
