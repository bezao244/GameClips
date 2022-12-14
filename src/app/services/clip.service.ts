import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { doc } from 'firebase/firestore';
import { BehaviorSubject, combineLatest, map, of, switchMap } from 'rxjs';
import IClip from '../models/clip.model';

@Injectable({
  providedIn: 'root'
})
export class ClipService {
  public clipsCollection: AngularFirestoreCollection<IClip>;
  public pageClips: IClip[] = [];
  pendingRequest: boolean = false;

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

  public getUserClips(sort$: BehaviorSubject<string>) {
    return combineLatest([this.auth.user, sort$]).pipe(
      switchMap(values => {
        const [user, sort] = values
        if (!user) return of([]);

        const query = this.clipsCollection.ref.where(
          'uid', '==', user.uid
        ).orderBy(
          'timestamp',
          sort === '1' ? 'desc' : 'asc'
        )

        return query.get()
      }),
      map(snapshot => (snapshot as QuerySnapshot<IClip>).docs)
    )
  }

  public updateClip(id: string, title: string) {
    return this.clipsCollection.doc(id).update({
      title: title
    });
  }

  async deleteClip(clip: IClip) {
    const clipRef = this.storage.ref(`clips/${clip.fileName}`);
    const screenshotRef = this.storage.ref(`screenshots/${clip.screenshotFileName}`);

    clipRef.delete();
    screenshotRef.delete();
    await this.clipsCollection.doc(clip.docID).delete();

  }

  public async getClips() {
    if (this.pendingRequest) return;

    this.pendingRequest = true;
    let query = this.clipsCollection.ref.orderBy('timestamp', 'desc').limit(6);
    const { length } = this.pageClips;

    if (length) {
      const lastDocId = this.pageClips[length - 1].docID;
      const lastDoc = await this.clipsCollection.doc(lastDocId).get().toPromise();

      query = query.startAfter(lastDoc);
    }

    const snapshot = await query.get();
    snapshot.forEach(doc => {
      this.pageClips.push({
        docID: doc.id,
        ...doc.data()
      });
    });

    this.pendingRequest = false;
  }

}
