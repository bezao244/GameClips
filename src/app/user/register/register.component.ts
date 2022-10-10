import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/compat/firestore';
import 'firebase/firestore';

@Component({
  selector: 'app-registro',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore
  ) { }

  showAlert: boolean = false;
  alertColor: string = 'blue';
  alertMsg: string = 'Please wait! Your account is being created.';
  inSubmission: boolean = false;

  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  email = new FormControl('', [Validators.required, Validators.email]);
  age = new FormControl('', [
    Validators.required,
    Validators.min(18),
    Validators.max(120)
  ]);
  password = new FormControl('', [Validators.required,
  Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/)]);
  confirm_password = new FormControl('', [Validators.required]);
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(13),
    Validators.maxLength(13)
  ]);

  registerForm = new FormGroup({
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirm_password: this.confirm_password,
    phoneNumber: this.phoneNumber
  });
  async register() {
    this.inSubmission = true;
    this.showAlert = true;
    this.alertMsg = 'Please wait! Your account is being created.';
    this.alertColor = 'blue';
    const { email, password } = this.registerForm.value;

    try {
      const userCred = await this.auth.createUserWithEmailAndPassword(
        email ?? "", password ?? "");
      await this.db.collection('users').add({
        name: this.name.value,
        email: this.email.value,
        age: this.age.value,
        phoneNumber: this.phoneNumber.value,
      });

    } catch (e) {
      console.log(e);
      this.alertMsg = 'An unexpected error occurred. Please try again.';
      this.alertColor = 'red';
      this.inSubmission = false;
      return;
    }


    this.alertMsg = 'Success! Your account has been successfully created.';
    this.alertColor = 'green';
    this.inSubmission = false;
  }
}
