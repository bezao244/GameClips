import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  isDragover: boolean = false;
  file: File | null = null;
  nextStep: boolean = false;

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

  percentage: number = 0;

  constructor(
    private storage: AngularFireStorage
  ) { }

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
    //observando o progesso do upload
    task.percentageChanges().subscribe(progess => {
      this.percentage = progess as number / 100;
    });

  }

  submiting() {
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Your file is being uploaded';
    this.inSubmission = true;
  }

}
