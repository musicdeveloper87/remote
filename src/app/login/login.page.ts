import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { UsuarioModel } from '../models/usuario.model';
import { NavController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { NgForm } from '@angular/forms';
import { Device } from '@capacitor/device';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  loginUser: UsuarioModel;
  registerUser: UsuarioModel;
  usuario: UsuarioModel = new UsuarioModel();
  recordarme = false;

  private url = 'https://identitytoolkit.googleapis.com/v1';
  private apiKey = 'AIzaSyBfc75dEK_DE0DkhV8bbGY3bmNGmGjrQsQ';

  userToken: string | null = null;
  usuarioUid: string | null = null;
  existeId = false;
  idCelular = '';

  @ViewChild('swiper') swiper: any;

  constructor(
    private loginService: AuthService,
    private navCtrl: NavController,
    private http: HttpClient,
    private toastController: ToastController
  ) {
    this.loginUser = new UsuarioModel();
    this.registerUser = new UsuarioModel();
  }

  async ngOnInit() {
    await this.checkDeviceId();
  }

  private async checkDeviceId() {
    try {
      const info = await Device.getId();
      this.idCelular = info.identifier;
      await this.buscarId(this.idCelular);
    } catch (error) {
      console.error('Error al obtener ID del dispositivo:', error);
      await this.mostrarMensaje('Error al obtener ID del dispositivo', 'error');
    }
  }

  private async mostrarMensaje(mensaje: string, tipo: 'success' | 'error' | 'warning') {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 3000,
      position: 'top',
      color: 'primary',
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

  async buscarId(id_celular: string) {
    try {
      const exiteCelular = await this.loginService.buscarIdCelularEnVisores(id_celular);
      this.existeId = exiteCelular;

      if (!exiteCelular) {
        await this.mostrarMensaje(
          `El dispositivo con ID: ${id_celular} no ha sido indexado en la colección de visores`,
          'error'
        );
      }
    } catch (error) {
      console.error('Error al buscar ID:', error);
      await this.mostrarMensaje('Error al verificar el dispositivo', 'error');
    }
  }

  async loginGoogle() {
    try {
      console.log('Iniciando login con Google...');
      const valido = await this.loginService.loginGoogle();
      console.log('Resultado login Google:', valido);
      
      if (valido) {
        // Obtener el UID del usuario actual
        const user = await this.loginService.getCurrentUser();
        console.log('Usuario actual:', user);
        
        if (user?.uid) {
          localStorage.setItem('uid', user.uid);
          console.log('UID guardado en localStorage:', user.uid);
        } else {
          console.warn('No se encontró UID en el usuario');
        }
        this.navCtrl.navigateRoot('/main/tabs/tab1');
      }
    } catch (error) {
      console.error('Error en login con Google:', error);
      await this.mostrarMensaje('Error al iniciar sesión con Google', 'error');
    }
  }

  handleLogin(form: NgForm) {
    if (form.invalid) {
      this.mostrarMensaje('Por favor complete todos los campos', 'warning');
      return;
    }

    try {
      this.mostrarMensaje('Procesando...', 'warning');

      if (!this.existeId) {
        const indexCelular = this.loginService.crearVisor(this.idCelular);
        this.mostrarMensaje('Dispositivo indexado correctamente', 'success');
      }

      if (this.recordarme && this.usuario.email) {
        localStorage.setItem('email', this.usuario.email);
      }

      this.loginService.login(this.usuario).subscribe({
        next: async (resp: any) => {
          const result = await resp;
          console.log('Resultado login:', result);
          
          if (result.localId) {
            localStorage.setItem('uid', result.localId);
            console.log('UID guardado:', result.localId);
            this.navCtrl.navigateRoot('/main/tabs/tab1');
          }
        },
        error: (err) => {
          console.error('Error de login:', err);
          this.mostrarMensaje('Credenciales inválidas', 'error');
        }
      });

    } catch (error) {
      console.error('Error en el proceso:', error);
      this.mostrarMensaje('Error en el proceso de login', 'error');
    }
  }

  registroGoogle() {
    this.loginService.loginGoogle();
  }

  mostrarRegistro() {
    this.swiper?.slideTo(0);
  }

  mostrarLogin() {
    this.swiper?.slideTo(1);
  }
}
