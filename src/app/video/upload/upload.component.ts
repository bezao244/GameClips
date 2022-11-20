import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { last, switchMap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {
  isDragover: boolean = false;
  file: File | null = null;
  nextStep: boolean = false;
  user: firebase.User | null = null;
  task?: AngularFireUploadTask;

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
    private clipService: ClipService,
    private router: Router,
  ) {
    auth.user.subscribe(user => {
      this.user = user;
    });

  }

  ngOnDestroy(): void {
    this.task?.cancel();

  }

  storeFile($event: Event) {
    this.isDragover = false;
    // armazenando o arquivo
    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files[0] ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type != 'video/mp4') return;

    // adicionando no titulo o nome do arquivo
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  uploadFile() {
    this.submiting();
    const cliFileName = uuid();
    const clipPath = `clips/${cliFileName}.mp4`;

    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);

    //observando o progesso do upload
    this.task.percentageChanges().subscribe(progess => {
      this.percentage = progess as number / 100;
    });

    this.task.snapshotChanges().pipe(
      last(),
      switchMap(() => clipRef.getDownloadURL())
    ).subscribe({
      next: async (url) => {
        const clip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value as string,
          fileName: `${cliFileName}.mp4`,
          url,
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }

        const clipDocRef = await this.clipService.createClip(clip);
        this.finish(clipDocRef);
      },
      error: (err) => {
        this.errorOcurried();
      },
    });

  }

  submiting() {
    this.uploadForm.disable();
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Your file is being uploaded';
    this.inSubmission = true;
    this.showPercentage = true;
  }

  finish(clipDocRef: any) {
    setTimeout(() => {
      this.router.navigate(['clips', clipDocRef.id]);
    }, 1000);
    this.alertColor = 'green';
    this.alertMsg = 'Success! Your clip is now ready to share with the world.';
    this.showPercentage = false;
  }

  errorOcurried() {
    this.uploadForm.enable();
    this.alertColor = 'red';
    this.alertMsg = 'Upload failed! Please try again later.'
    this.inSubmission = true;
    this.showPercentage = false;
  }

}
