import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { NavController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import { Cliente, Visor } from '../interfaces/interfaces';
import { Storage } from '@ionic/storage-angular';
import { UsuarioModel } from '../models/usuario.model';
import { Observable, from, map, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Device } from '@capacitor/device';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly FIREBASE_URL = 'https://identitytoolkit.googleapis.com/v1';
  private readonly API_KEY = environment.firebase.apiKey;
  private readonly STREAMING_DEFAULT = 'vpaas-magic-cookie-796970a3dd9c4a25a9bc3e443c364298/usuarioimocom1234567890';
  
  private userToken: string | null = null;
  private dbReady = false;

  constructor(
    private afs: AngularFirestore,
    private http: HttpClient,
    private afAuth: AngularFireAuth,
    private storage: Storage,
    private navCtrl: NavController,
  ) {
    this.initStorage();
  }

  // Inicializar el storage
  async initStorage() {
    try {
      await this.storage.create();
      this.dbReady = true;
      console.log('Storage initialized successfully');
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  // Métodos de autenticación
  login(usuario: UsuarioModel): Observable<any> {
    const authData = {
      ...usuario,
      returnSecureToken: true
    };

    return this.http.post(
      `${this.FIREBASE_URL}/accounts:signInWithPassword?key=${this.API_KEY}`, 
      authData
    ).pipe(
      map(async (resp: any) => {
        await this.guardarToken(resp.idToken);
        await this.storage.set('uid', resp.localId);
        await this.actualizarIdCelularUsuario(resp.localId);
        return resp;
      })
    );
  }

  async loginGoogle(): Promise<boolean> {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await this.afAuth.signInWithPopup(provider);
      
      if (!result.user) return false;

      await this.guardarToken(await result.user.getIdToken());
      await this.storage.set('uid', result.user.uid);
      await this.crearUsuarioDB({
        nombre: result.user.displayName || '',
        email: result.user.email || '',
        uid: result.user.uid,
        photo: result.user.photoURL || ''
      });

      return true;
    } catch (error) {
      console.error('Error en loginGoogle:', error);
      return false;
    }
  }

  // Métodos de gestión de visores
  async buscarIdCelularEnVisores(idCelular: string): Promise<boolean> {
    try {
      const snapshot = await this.afs.collection('Visores', ref => 
        ref.where('id_celular', '==', idCelular)
      ).get().toPromise();

      return snapshot ? !snapshot.empty : false;
    } catch (error) {
      console.error('Error en buscarIdCelularEnVisores:', error);
      return false;
    }
  }

  async crearVisor(idCelular: string): Promise<string> {
    try {
      const visor: Visor = {
        id_celular: idCelular,
        direccion_streaming: this.STREAMING_DEFAULT
      };

      const docRef = await this.afs.collection('Visores').add(visor);
      await docRef.update({ id: docRef.id });
      
      return docRef.id;
    } catch (error) {
      console.error('Error en crearVisor:', error);
      throw error;
    }
  }

  // Métodos de gestión de usuarios
  obtenerClientePorId(uid: string): Observable<Cliente | undefined> {
    return this.afs.doc<Cliente>(`usuarios/${uid}`).valueChanges();
  }

  private async crearUsuarioDB(cliente: Cliente): Promise<void> {
    try {
      await this.afs.doc(`usuarios/${cliente.uid}`).set(cliente);
    } catch (error) {
      console.error('Error en crearUsuarioDB:', error);
      throw error;
    }
  }

  // Métodos de gestión de tokens
  private async guardarToken(token: string): Promise<void> {
    try {
      // Asegurar que el storage esté inicializado
      if (!this.dbReady) {
        await this.initStorage();
      }
      
      this.userToken = token;
      await this.storage.set('token', token);
      
      const expiraEn = new Date();
      expiraEn.setHours(expiraEn.getHours() + 1);
      await this.storage.set('expira', expiraEn.getTime().toString());
    } catch (error) {
      console.error('Error al guardar token:', error);
      throw error;
    }
  }

  async estaLogueado(): Promise<boolean> {
    this.userToken = await this.storage.get('token');
    if (!this.userToken) {
      this.navCtrl.navigateRoot('/login');
      return false;
    }

    const expira = Number(await this.storage.get('expira'));
    const expiraDate = new Date(expira);

    if (expiraDate <= new Date()) {
      this.navCtrl.navigateRoot('/login');
      return false;
    }

    return true;
  }

  async logOut(): Promise<boolean> {
    try {
      await this.afAuth.signOut();
      // Remover el UID del localStorage
      localStorage.removeItem('uid');
      return true;
    } catch (error) {
      console.error('Error en logout:', error);
      return false;
    }
  }

  // Nuevo método para actualizar el idCelular
  private async actualizarIdCelularUsuario(uid: string): Promise<void> {
    try {
      const deviceInfo = await Device.getId();
      await this.afs.doc(`usuarios/${uid}`).update({
        idCelular: deviceInfo.identifier
      });
    } catch (error) {
      console.error('Error al actualizar idCelular:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    const user = await this.afAuth.currentUser;
    return user;
  }
}
