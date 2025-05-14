import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, ToastController } from '@ionic/angular';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map } from 'rxjs/operators';
import { Device } from '@capacitor/device';
import { EquiposService } from '../services/equipos.service';
import { TabsVisibilityService } from '../services/tabs-visibility.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page implements OnInit {
  citaForm!: FormGroup;
  mostrarFormulario: boolean = false;
  equiposFiltrados: any[] = [];
  equipoSeleccionado: any = null;
  tecnicos: any[] = [];
  uidEmpresaUsuario: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private toastController: ToastController,
    private navCtrl: NavController,
    private firestore: AngularFirestore,
    private equiposService: EquiposService,
    private tabsVisibilityService: TabsVisibilityService
  ) {}

  async ngOnInit(): Promise<void> {
    this.citaForm = this.formBuilder.group({
      buscarEquipo: ['', Validators.required],
      descripcionProblema: ['', Validators.required]
    });

    // Cargar técnicos al inicio
    this.firestore.collection('tecnicos').valueChanges()
      .subscribe(tecnicos => {
        this.tecnicos = tecnicos;
      });

    // Obtener el uid_empresa del usuario al iniciar
    const uid = localStorage.getItem('uid');
    if (uid) {
      const userDoc = await this.firestore.doc(`usuarios/${uid}`).get().toPromise();
      const userData = userDoc?.data() as { uid_empresa: string };
      this.uidEmpresaUsuario = userData?.uid_empresa || null;
    }
  }

  logDeviceInfo = async () => {
    const info = await Device.getId();
    console.log( 'name', info )
    console.log(info);

    alert(JSON.stringify(info));

  };

  logBatteryInfo = async () => {
    const info = await Device.getBatteryInfo();

    console.log(info);
  };

  logout() {
    this.navCtrl.navigateRoot('/login');
  }

  async buscarEquipo(event: any) {
    const searchTerm = event.target.value;
    console.log('Componente - Buscando:', searchTerm);
    
    if (!searchTerm || searchTerm.trim() === '') {
      this.equiposFiltrados = [];
      return;
    }

    this.equiposService.buscarEquipos(searchTerm).subscribe({
      next: (equipos) => {
        // Filtrar equipos por id_empresa
        this.equiposFiltrados = equipos.filter(
          (equipo: any) => equipo.id_empresa === this.uidEmpresaUsuario
        );
        console.log('Equipos encontrados:', this.equiposFiltrados);
      },
      error: (error) => {
        console.error('Error en búsqueda:', error);
        this.mostrarToast('Error al buscar equipos', 'error');
      }
    });
  }

  async agendarCita(): Promise<void> {
    if (!this.citaForm.valid || !this.equipoSeleccionado) {
      await this.mostrarToast('Por favor complete todos los campos', 'warning');
      return;
    }

    try {
      const uid = localStorage.getItem('uid');
      if (!uid) {
        throw new Error('No se encontró el UID del usuario');
      }

      // Obtener datos del usuario
      const userDoc = await this.firestore.doc(`usuarios/${uid}`).get().toPromise();
      const userData = userDoc?.data() as { 
        idCelular: string;
        jitsi: string;
        nombre: string;
        uid_empresa: string;
      };
      
      if (!userData) {
        throw new Error('No se encontraron datos del usuario');
      }

      const citaNueva = {
        uid: uid,
        idCelular: userData.idCelular,
        jitsi: userData.jitsi,
        maquina: this.equipoSeleccionado,
        problema: this.citaForm.value.descripcionProblema,
        usuario: userData.nombre || 'Usuario',
        createdAt: new Date(),
        estatus: 'nueva',
        fecha: 'sin asignar',
        tecnico: 'sin asignar',
        uid_empresa: userData.uid_empresa
      };

      // Crear la cita en Firebase
      const citaRef = await this.firestore.collection('citas').add(citaNueva);
      await citaRef.update({ id: citaRef.id });

      await this.mostrarToast('Cita agendada exitosamente', 'success');
      this.citaForm.reset();
      this.equipoSeleccionado = null;
      this.mostrarFormulario = false;
      this.navCtrl.navigateForward('/main/tabs/tab2');

    } catch (error) {
      console.error('Error al agendar cita:', error);
      await this.mostrarToast('Error al agendar la cita', 'error');
    }
  }

  async mostrarToast(mensaje: string, color: 'success' | 'warning' | 'error'): Promise<void> {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      color: color === 'error' ? 'danger' : color,
      cssClass: 'custom-toast',
      buttons: [
        {
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  mostrarFormulariof(): void {
    this.mostrarFormulario = true;
  }

  seleccionarEquipo(equipo: any): void {
    this.equipoSeleccionado = equipo;
    this.citaForm.patchValue({
      buscarEquipo: equipo.nombreEquipo
    });
    this.equiposFiltrados = []; // Limpiar resultados después de seleccionar
  }

  handleContentClick(event: MouseEvent) {
    // Desactivado temporalmente para solucionar problema
    // No hagas nada por ahora
    console.log('Click detected but not processed');
  }
}
