import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';
import { UserService } from '../../note-app/services/user.service';
import { deleteDoc, doc, DocumentReference, Firestore } from '@angular/fire/firestore';
import { User } from '../../note-app/models/user.model';
import { from, Observable } from 'rxjs';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  form!: FormGroup;
  validators!: Validators;
  passwordPattern: RegExp = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  userNamePattern: RegExp = /^[A-Za-z\d]{4,}$/;
  validEmailPattern: RegExp = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  emails: string[] = [];
  userExists: boolean = false;

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router, private userService: UserService, private db: Firestore){}

  ngOnInit(): void{
    this.form = this.fb.group({
      'firstName': [null, { validators: [Validators.required, this.validName.bind(this)] }],
      'lastName': [null, { validators: [Validators.required, this.validName.bind(this)] }],
      'email': [null, { validators: [Validators.required, Validators.email, this.validEmail.bind(this)],
        asyncValidators: [this.emailExists.bind(this)], 
        updateOn: 'change'
      }], 
                        
      'password': [null, { validators: [Validators.required, this.validPassword.bind(this)] }], 
    })

    this.fetchUserEmails();
  }

  onSignUp(): void {
    const email = this.form.value.email;
    const password = this.form.value.password;
    const firstName = this.form.value.firstName;
    const lastName = this.form.value.lastName;
  
    this.authService.signup(email, password)
      .then((res) => {
        if (res === 'success') {
          return this.userService.addUserToDb(firstName, lastName, email).toPromise();
        } else {
          throw new Error(res);
        }
      })
      .then(() => {
        // After adding the user to the database, log the user in
        return this.authService.login(email, password);
      })
      .then((loginRes) => {
        if (loginRes) {
          this.router.navigate(['/']);
        } else {
          alert(loginRes);
        }
      })
      .catch((error) => {
        console.error("Signup/Login Error:", error);
        alert("An error occurred: " + error.message);
      });

    this.form.statusChanges.subscribe(
      (state) => console.log("Form Status:", state)
    );
  }
  

  emailExists(control: FormControl): Promise<any> | Observable<any> {
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        // Check if emails array is populated
        if (!this.emails || this.emails.length === 0) {
          resolve(null);
          return;
        }
        
        this.userExists = false;

        // Checking if the control value exists in the emails array
        this.emails.forEach(email => {
          if (control.value === email) {
            console.log(`The email ${email} has been taken`);
            this.userExists = true;
          }
        });

        if (this.userExists) {
          resolve({ 'emailTaken': true });
        } else {
          resolve(null);
        }
      }, 1500);
    });
  }

  validEmail(control: FormControl): {[s:string]: boolean} | null {
    if(!control.value){
      return null;
    }
    if(!this.validEmailPattern.test(control.value)){
      return {'invalidFormat': true};
    }
    return null;
  }

  validName(control: FormControl): {[s:string]: boolean} | null {
    if(!control.value){
      return null;
    }
    if(!this.userNamePattern.test(control.value)){
      return {'invalidFormat': true};
    }
    return null;
  }

  validPassword(control: FormControl): {[s:string]: boolean} | null {
    if(!control.value){
      return null;
    }
    if(!this.passwordPattern.test(control.value)){
      return {'invalidFormat': true};
    }
    return null;
  }

  fetchUserEmails(): void{
    this.userService.fetchEmails().subscribe(emails => {
      this.emails = emails;
      console.log(this.emails); 
    });
  }

  get firstName(){
    return this.form.controls['firstName'];
  }

  get lastName(){
    return this.form.controls['lastName'];
  }

  get email(){
    return this.form.controls['email'];
  }

  get password(){
    return this.form.controls['password'];
  }
}
