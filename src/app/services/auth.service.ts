import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import IUser from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<IUser>;
  public isAuthenticated$: Observable<boolean>;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore
  ) {
    //tabela de dados do usuario
    this.usersCollection = db.collection('users');
    //usuario logado ?
    this.isAuthenticated$ = auth.user.pipe(map(user => !!user));
  }

  public async createUser(user: any) {

    if (!user.password)
      throw new Error("Password not provided")

    //criando um novo usuario
    const userCred = await this.auth.createUserWithEmailAndPassword(
      user.email ?? "", user.password ?? "");

    if (!userCred.user)
      throw new Error("User can't be found");

    //adicionando os dados do usuario 
    await this.usersCollection.doc(userCred.user?.uid).set({
      name: user.name,
      email: user.email,
      age: user.age,
      phoneNumber: user.phoneNumber,
    });

    await userCred.user.updateProfile({
      displayName: user.name
    });

  }

}
