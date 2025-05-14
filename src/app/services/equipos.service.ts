import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EquiposService {
  constructor(private afs: AngularFirestore) {}

  obtenerEquipos(): Observable<any[]> {
    return this.afs.collection('equipos').valueChanges();
  }

  buscarEquipos(termino: string): Observable<any[]> {
    console.log('Servicio - Buscando:', termino);
    
    // Obtener todos los equipos y filtrar en el cliente
    return this.afs.collection('equipos').snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data() as any;
          const id = a.payload.doc.id;
          return { id, ...data };
        }).filter(equipo => 
          equipo.nombreEquipo.toLowerCase().includes(termino.toLowerCase())
        );
      })
    );
  }
}
