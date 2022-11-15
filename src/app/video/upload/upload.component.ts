import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  isDragover: boolean = false;
  file: File | null = null;
  nextStep: boolean = false;
  user: firebase.User | null = null;

  //ALERT 
  showAlert: boolean = false;
  alertColor: string = 'blue';
  alertMsg: string = 'Please wait! Your file is being uploaded';
  inSubmission: boolean = false;

  // FORM 
  title = new FormControl('', [Validators.required, Validators.minLength(3)]);
  uploadForm = new FormGroup({
    title: this.title
  });

  // PERCENTAGE
  percentage: number = 0;
  showPercentage: boolean = false;

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService
  ) {
    auth.user.subscribe(user => {
      this.user = user;
    });

  }

  ngOnInit(): void {
  }

  storeFile($event: Event) {
    this.isDragover = false;
    // armazenando o arquivo
    this.file = ($event as DragEvent).dataTransfer?.files[0] ?? null;

    if (!this.file || this.file.type != 'video/mp4') return;

    // adicionando no titulo o nome do arquivo
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  uploadFile() {
    this.submiting();
    const cliFileName = uuid();
    const clipPath = `clips/${cliFileName}.mp4`;

    const task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);

    //observando o progesso do upload
    task.percentageChanges().subscribe(progess => {
      this.percentage = progess as number / 100;
    });

    task.snapshotChanges().pipe(
      last(),
      switchMap(() => clipRef.getDownloadURL())
    ).subscribe({
      next: (url) => {
        const clip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value as string,
          fileName: `${cliFileName}.mp4`,
          url
        }

        this.clipService.createClip(clip);
        this.finish();
      },
      error: (err) => {
        this.errorOcurried();
      },
    });

  }

  submiting() {
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Your file is being uploaded';
    this.inSubmission = true;
    this.showPercentage = true;
  }

  finish() {
    this.alertColor = 'green';
    this.alertMsg = 'Success! Your clip is now ready to share with the world.';
    this.showPercentage = false;
  }

  errorOcurried() {
    this.alertColor = 'red';
    this.alertMsg = 'Upload failed! Please try again later.'
    this.inSubmission = true;
    this.showPercentage = false;
  }

}
