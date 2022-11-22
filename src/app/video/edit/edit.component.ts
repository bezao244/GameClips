import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit, OnDestroy, OnChanges {
  @Input() public activeClip: IClip | null = null;
  @Output() update = new EventEmitter();

  // FORM 
  clipId = new FormControl('');
  title = new FormControl('', [Validators.required, Validators.minLength(3)]);
  editForm = new FormGroup({
    title: this.title
  });

  //Alert
  alertMsg: string = 'Please wait! Updating clip';
  alertColor: string = 'blue';
  showAlert: boolean = false;

  inSubmission: boolean = false;
  constructor(
    public modal: ModalService,
    public clipService: ClipService
  ) { }

  ngOnInit(): void {
    this.modal.register('editClip');
  }

  ngOnDestroy() {
    this.modal.unregister('editClip');
  }

  ngOnChanges() {
    if (!this.activeClip) return;

    this.inSubmission = false;
    this.showAlert = false;
    this.clipId.setValue(this.activeClip.docID ?? null);
    this.title.setValue(this.activeClip.title);
  }

  async submit() {
    if (!this.activeClip) return;

    this.submiting();
    try {
      await this.clipService.updateClip(this.clipId.value ?? '', this.title.value ?? '')
    } catch (e) {
      this.errorOcurried();
      return;
    }
    this.activeClip.title = this.title.value ?? '';
    this.update.emit(this.activeClip);
    this.finish();
  }

  submiting() {
    this.editForm.disable();
    this.showAlert = true;
    this.alertColor = 'blue';
    this.alertMsg = 'Please wait! Your file is being uploaded';
    this.inSubmission = true;
  }

  errorOcurried() {
    this.editForm.enable();
    this.alertColor = 'red';
    this.alertMsg = 'Update failed! Please try again later.'
    this.inSubmission = true;
  }

  finish() {
    this.inSubmission = false;
    this.alertColor = 'green';
    this.alertMsg = 'Success!';
  }

}
