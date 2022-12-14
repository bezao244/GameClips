import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreModule } from '@angular/fire/compat/firestore';
import 'firebase/firestore';
import { AuthService } from '../../services/auth.service';
import { RegisterValidators } from '../validators/register-validators';
import { EmailTaken } from '../validators/email-taken';
@Component({
  selector: 'app-registro',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  constructor(
    public authService: AuthService,
    public emailTaken: EmailTaken
  ) { }

  showAlert: boolean = false;
  alertColor: string = 'blue';
  alertMsg: string = 'Please wait! Your account is being created.';
  inSubmission: boolean = false;

  name = new FormControl('', [Validators.required, Validators.minLength(3)]);
  email = new FormControl('', [Validators.required, Validators.email], [this.emailTaken.validate]);
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
  }, [
    RegisterValidators.match('password', 'confirm_password')
  ]);
  async register() {
    this.inSubmission = true;
    this.showAlert = true;
    this.alertMsg = 'Please wait! Your account is being created.';
    this.alertColor = 'blue';
    try {
      await this.authService.createUser(this.registerForm.value);
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
