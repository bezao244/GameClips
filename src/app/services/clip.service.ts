import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import IClip from '../models/clip.model';

@Injectable({
  providedIn: 'root'
})
export class ClipService {
  public clipsCollection: AngularFirestoreCollection<IClip>;

  constructor(
    public db: AngularFirestore
  ) {
    this.clipsCollection = db.collection('clips');

  }

  public async createClip(data: IClip) {
    await this.clipsCollection.add(data);

  }

}
