import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { delay, filter, map, Observable, of, switchMap } from 'rxjs';
import IUser from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<IUser>;
  public isAuthenticated$: Observable<boolean>;
  public isAuthenticatedWithDelay$: Observable<boolean>;
  private redirect = false;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    public router: Router,
    public route: ActivatedRoute,
  ) {

    //tabela de dados do usuario
    this.usersCollection = db.collection('users');

    //usuario logado ?
    this.isAuthenticated$ = auth.user.pipe(map(user => !!user));
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(delay(1000));

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd), //ignora os outros eventos e foca no evento final, que interessa nas permissoes
      map(e => this.route.firstChild),
      switchMap(route => route?.data ?? of({})) //se route data for null, vai entrar no OF criando um novo observable com data vazia p nao quebrar o app
    ).subscribe(data => {
      this.redirect = data['authOnly'] ?? false
    })
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

  async logout($event: Event) {
    if ($event) $event.preventDefault();
    //fazer logout
    await this.auth.signOut();
    if (this.redirect) {
      await this.router.navigateByUrl('/');
    }

  }

}
