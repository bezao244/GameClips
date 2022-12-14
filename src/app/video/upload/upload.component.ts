import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';
import { combineLatest, forkJoin, last, switchMap } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';
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
  screenshots: string[] = [];
  selectedScreenshot: string = '';
  screenshotTask?: AngularFireUploadTask;

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    auth.user.subscribe(user => {
      this.user = user;
    });
    this.ffmpegService.init();
  }

  ngOnDestroy(): void {
    this.task?.cancel();
  }

  async storeFile($event: Event) {
    if (this.ffmpegService.isRunning) return;

    this.isDragover = false;
    // armazenando o arquivo
    this.file = ($event as DragEvent).dataTransfer
      ? ($event as DragEvent).dataTransfer?.files[0] ?? null
      : ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type != 'video/mp4') return;

    this.screenshots = await this.ffmpegService.getScreenShots(this.file);

    this.selectedScreenshot = this.screenshots[0];
    // adicionando no titulo o nome do arquivo
    this.title.setValue(this.file.name.replace(/\.[^/.]+$/, ''));
    this.nextStep = true;
  }

  async uploadFile() {
    this.submiting();
    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;

    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);

    const screenshotBlob = await this.ffmpegService.blobFromURL(this.selectedScreenshot);
    const screenshotPath = `screenshots/${clipFileName}.png`;

    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);
    const screenshotRef = this.storage.ref(screenshotPath);


    //observando o progesso do upload
    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges()
    ]).subscribe((progess) => {
      const [clipProgress, screenshotProgress] = progess;

      if (!clipProgress || !screenshotProgress) return;

      const total = clipProgress + screenshotProgress;
      this.percentage = total as number / 200;

    });

    forkJoin(
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges()
    ).pipe(
      switchMap(() => forkJoin([
        clipRef.getDownloadURL(),
        screenshotRef.getDownloadURL()
      ]))
    ).subscribe({
      next: async (urls) => {
        const [clipUrl, screenshotUrl] = urls;

        const clip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value as string,
          fileName: `${clipFileName}.mp4`,
          url: clipUrl,
          screenshotUrl,
          screenshotFileName: `${clipFileName}.png`,
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

  selectScreenshot(item: string) {
    this.selectedScreenshot = item;
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
