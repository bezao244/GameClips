import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { map, of, switchMap } from 'rxjs';
import IClip from '../models/clip.model';

@Injectable({
  providedIn: 'root'
})
export class ClipService {
  public clipsCollection: AngularFirestoreCollection<IClip>;

  constructor(
    public db: AngularFirestore,
    private auth: AngularFireAuth,
    public storage: AngularFireStorage
  ) {
    this.clipsCollection = db.collection('clips');

  }

  public createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data);

  }

  public getUserClips() {
    return this.auth.user.pipe(
      switchMap(user => {
        if (!user) return of([])

        const query = this.clipsCollection.ref.where(
          'uid', '==', user.uid
        );
        return query.get();

      }
      ),
      map(snapshot => (snapshot as QuerySnapshot<IClip>).docs)
    );
  }

  public updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({
      title: title
    });
  }

  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);

    clipRef.delete();
    await this.clipsCollection.doc(clip.docID).delete();

  }
}
