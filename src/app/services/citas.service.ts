import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CitasService {
  citasCollection: AngularFirestoreCollection<any>;

  constructor(private firestore: AngularFirestore) {
    this.citasCollection = this.firestore.collection('citas');
  }

  agregarCita(citaData: any): Promise<any> {
    return this.firestore.collection('citas').add(citaData);
  }

  obtenerCitas(): Observable<any[]> {
    return this.citasCollection.valueChanges();
  }

  asignarCita(id: string): Promise<void> {
    return this.citasCollection.doc(id).update({ estatus: 'asignada' });
  }

  eliminarCita(citaId: string): Promise<void> {
    return this.citasCollection.doc(citaId).delete();
  }
}
