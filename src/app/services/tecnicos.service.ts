import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class TecnicosService {

  tecnicosCollection: AngularFirestoreCollection<any>;

  constructor(private firestore: AngularFirestore) {
    this.tecnicosCollection = this.firestore.collection('tecnicos');
   }

  obtenerTecnicos() {
    return this.tecnicosCollection.valueChanges();
  }
}
