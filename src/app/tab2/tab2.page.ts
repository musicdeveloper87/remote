import { Component, OnInit } from '@angular/core';
import { CitasService } from '../services/citas.service';
import { NavController, AlertController, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { TabsVisibilityService } from '../services/tabs-visibility.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page implements OnInit {

  citasAgendadas: any[] = [];
  userData: any;

  constructor(
    private navCtrl: NavController,
    private citasService: CitasService,
    private alertController: AlertController,
    private firestore: AngularFirestore,
    private router: Router,
    private authService: AuthService,
    private toastController: ToastController,
    private tabsVisibilityService: TabsVisibilityService
  ) {}

  async ngOnInit() {
    try {
      const uid = localStorage.getItem('uid');
      if (!uid) {
        console.error('No hay UID en localStorage');
        this.router.navigate(['/login']);
        return;
      }

      const userDoc = await this.firestore
        .collection('usuarios')
        .doc(uid)
        .get()
        .toPromise();

      if (userDoc?.exists) {
        this.userData = userDoc.data();
        console.log('Datos del usuario:', this.userData);
      }

      this.obtenerCitas();
    } catch (error) {
      console.error('Error en ngOnInit:', error);
    }
  }

  obtenerCitas() {
    const uid = localStorage.getItem('uid');
    if (!uid) {
      console.error('No hay UID en localStorage');
      this.router.navigate(['/login']);
      return;
    }
    
    // Consultar solo las citas del usuario actual
    this.firestore.collection('citas', ref => ref.where('uid', '==', uid))
      .valueChanges({ idField: 'id' })
      .subscribe((data: any[]) => {
        console.log('Citas del usuario:', data);
        this.citasAgendadas = data;
      });
  }

  formatFecha(timestamp: any): string {
    // Verifica que el timestamp no sea nulo y que sea un objeto
    if (timestamp && typeof timestamp === 'object') {
      // Extrae los segundos del objeto Timestamp y crea un objeto Date
      const date = new Date(timestamp.seconds * 1000); // Multiplica por 1000 para convertir segundos en milisegundos
      // Formatea la fecha según tus necesidades, por ejemplo 'dd/MM/yyyy HH:mm:ss'
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    } else {
      return 'En solicitud';
      // cambia estatus a programada y aparece fecha
    }
  }

  iniciarCita(cita: any) {
    if (this.userData?.jitsi) {
      localStorage.setItem('currentJitsi', this.userData.jitsi);
      this.navCtrl.navigateForward('/main/tabs/tab3');
    } else {
      this.mostrarToast('No hay enlace de reunión disponible', 'warning');
    }
  }

  async confirmarCancelacion(cita: any) {
    const alert = await this.alertController.create({
      header: 'Confirmar cancelación',
      message: '¿Está seguro que desea cancelar esta cita?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Sí, cancelar',
          handler: () => {
            this.cancelarCita(cita);
          }
        }
      ]
    });

    await alert.present();
  }

  async cancelarCita(cita: any) {
    try {
      await this.firestore.collection('citas').doc(cita.id).delete();
      this.mostrarToast('Cita cancelada exitosamente', 'success');
    } catch (error) {
      console.error('Error al cancelar la cita:', error);
      this.mostrarToast('Error al cancelar la cita', 'danger');
    }
  }

  async guardarCita(cita: any) {
    try {
      const uid = localStorage.getItem('uid');
      if (!uid) {
        console.error('No hay UID en localStorage');
        this.mostrarToast('Error: Usuario no identificado', 'danger');
        return;
      }

      if (!this.userData?.idCelular) {
        console.error('No se encontró el ID del celular del usuario');
        this.mostrarToast('Error: Datos de usuario incompletos', 'danger');
        return;
      }

      const citaNueva = {
        ...cita,
        uid: uid,  // UID del usuario
        idCelular: this.userData.idCelular,  // ID del celular del usuario
        jitsi: this.userData.jitsi,
        createdAt: new Date(),
        estatus: 'nueva'
      };

      // Eliminar el campo direccion_streaming si existe
      delete citaNueva.direccion_streaming;

      console.log('Guardando cita con datos:', citaNueva);

      const docRef = await this.firestore.collection('citas').add(citaNueva);
      console.log('Cita guardada con ID:', docRef.id);
      
      this.mostrarToast('Cita guardada exitosamente', 'success');
    } catch (error) {
      console.error('Error al guardar la cita:', error);
      this.mostrarToast('Error al guardar la cita', 'danger');
    }
  }

  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'top'
    });
    toast.present();
  }

  async logout() {
    try {
      await this.authService.logOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  handleContentClick(event: MouseEvent) {
    // Desactivado temporalmente para solucionar problema
    // No hagas nada por ahora
    console.log('Click detected but not processed');
  }
}
