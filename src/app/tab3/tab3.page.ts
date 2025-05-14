import { AfterViewInit, Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';
declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page implements OnInit, OnDestroy {
  domain: string = "8x8.vc"; // For self hosted use your domain
  room: any;
  options: any;
  api: any;
  userName: string = 'Usuario'; // Valor por defecto

  // For Custom Controls
  isAudioMuted = false;
  isVideoMuted = false;

  // Variable para controlar visibilidad
  controlsVisible = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private navCtrl: NavController,
    private platform: Platform
  ) {}

  async ngOnInit() {
    // Configurar barra de estado transparente específicamente para la videollamada
    try {
      if (this.platform.is('capacitor') || this.platform.is('cordova')) {
        await StatusBar.setBackgroundColor({ color: '#00000000' });
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setOverlaysWebView({ overlay: true });
      }
    } catch (error) {
      console.error('Error al configurar StatusBar:', error);
    }
    
    // Intenta solicitar permisos proactivamente
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        // Auto-solicitar permisos al inicio
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        // Usar casting a any para evitar error de tipo
        (window as any).localStream = stream;
        console.log('Permisos obtenidos proactivamente');
      } catch (e) {
        console.error('Error en pre-solicitud de permisos:', e);
      }
    }
    
    await this.initializeJitsi();
  }

  ngOnDestroy() {
    this.cleanupJitsi();
    
    // Restaurar barra de estado normal al salir de la videollamada
    try {
      if (this.platform.is('capacitor') || this.platform.is('cordova')) {
        StatusBar.setOverlaysWebView({ overlay: false });
        StatusBar.setBackgroundColor({ color: '#3880ff' }); // Color azul de Ionic por defecto
        StatusBar.setStyle({ style: Style.Dark });
      }
    } catch (error) {
      console.error('Error al restaurar StatusBar:', error);
    }
  }

  async recargarComponente(event: any) {
    console.log('Recargando componente...');
    this.cleanupJitsi();
    
    // Limpiar el contenedor
    const container = document.querySelector('#jitsi-iframe');
    if (container) {
      container.innerHTML = '';
    }

    // Reinicializar Jitsi
    await this.initializeJitsi();
    
    // Completar el refresher
    event.target.complete();
  }

  private async initializeJitsi() {
    try {
      const userData = await this.authService.getCurrentUser();
      this.userName = userData?.displayName || 'Usuario';

      const jitsiUrl = localStorage.getItem('currentJitsi');
      console.log('Jitsi URL recibida:', jitsiUrl);
      
      if (jitsiUrl) {
        this.room = jitsiUrl;
        setTimeout(() => {  // Agregamos un pequeño delay
          this.iniciarJitsi();
        }, 100);
      } else {
        console.error('No se encontró la URL de Jitsi');
        this.navCtrl.navigateBack('/main/tabs/tab2');
      }
    } catch (error) {
      console.error('Error al inicializar Jitsi:', error);
      this.navCtrl.navigateBack('/main/tabs/tab2');
    }
  }

  private cleanupJitsi() {
    if (this.api) {
      try {
        // Asegurar desconexión completa de Jitsi
        this.api.executeCommand('hangup');
        
        // Detener transmisión de video/audio
        if ((window as any).localStream) {
          const tracks = (window as any).localStream.getTracks();
          tracks.forEach((track: MediaStreamTrack) => {
            track.stop();
          });
          (window as any).localStream = null;
        }
        
        this.api.dispose();
        this.api = null;
      } catch (error) {
        console.error('Error al limpiar Jitsi:', error);
      }
    }
    
    // Limpiar el contenedor
    const container = document.querySelector('#jitsi-iframe');
    if (container) {
      container.innerHTML = '';
    }
  }

  iniciarJitsi(): void {
    // Declarar stream global para acceso
    (window as any).localStream = (window as any).localStream || null;
    
    this.options = {
      roomName: this.room,
      configOverwrite: { 
        prejoinPageEnabled: false,
        disableInitialGUM: false,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disablePolls: true,
        disableSelfViewSettings: true,
        disableAudioLevels: true,
        disableDeepLinking: true,
        enableClosePage: false,
        ios: {
          alwaysKnowMyDisplayName: true,
          callIntegration: {
            enabled: false
          },
          disablePermissionsRequests: false
        },
        hideConferenceTimer: true,
        hideConferenceSubject: true,
        hideRecordingLabel: true,
        hideParticipantsStats: true,
        noSsl: true,
        enableNoisyMicDetection: false,
        enableNoAudioDetection: false,
        defaultRemoteDisplayName: '',
        constraints: {
          video: {
            aspectRatio: 9/16,
            height: { ideal: 1280 },
            width: { ideal: 720 }
          }
        },
        toolbarConfig: {
          alwaysVisible: false,
          autoHideWhileChatIsOpen: false,
          initialTimeout: 20000,
          timeout: 20000
        }
      },
      interfaceConfigOverwrite: {
        SHOW_CHROME_EXTENSION_BANNER: false,
        SHOW_DEEP_LINKING_IMAGE: false,
        SHOW_JITSI_WATERMARK: false,
        SHOW_POWERED_BY: false,
        SHOW_PROMOTIONAL_CLOSE_PAGE: false,
        SHOW_BRAND_WATERMARK: false,
        JITSI_WATERMARK_LINK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone'
        ],
        INITIAL_TOOLBAR_TIMEOUT: 20000,
        TOOLBAR_TIMEOUT: 20000,
        TOOLBAR_ALWAYS_VISIBLE: false,
        filmStripOnly: false,
        TILE_VIEW_MAX_COLUMNS: 1,
        DISABLE_VIDEO_BACKGROUND: true,
        SHOW_WATERMARK: false,
        SHOW_ROOM_TIMER: false,
        SHOW_PARTICIPANT_NAME: false,
        SHOW_TITLE_VIEW: false,
        SHOW_MEETING_NAME: false,
        VERTICAL_FILMSTRIP: false,
        DISABLE_FILMSTRIP_AUTOHIDE: true,
        DEFAULT_LOCAL_DISPLAY_NAME: '',
        DEFAULT_REMOTE_DISPLAY_NAME: '',
        FILM_STRIP_MAX_HEIGHT: 0
      },
      parentNode: document.querySelector('#jitsi-iframe'),
      userInfo: {
        displayName: this.userName
      }
    };

    console.log('Options:', this.options);
    this.api = new JitsiMeetExternalAPI(this.domain, this.options);

    const jitsiContainer = document.querySelector('#jitsi-iframe') as HTMLElement;
    jitsiContainer.style.width = '100%';
    jitsiContainer.style.height = '100vh';
    jitsiContainer.style.position = 'fixed';
    jitsiContainer.style.top = '0';
    jitsiContainer.style.left = '0';
    jitsiContainer.style.zIndex = '9999';

    // Show controls initially but allow toggling
    setTimeout(() => {
      if (this.api) {
        this.showControls();
        // Make controls visible initially but allow toggling
        this.controlsVisible = true;
      }
    }, 1000);

    // Después de crear la API de Jitsi
    this.api.addEventListener('videoConferenceJoined', () => {
      // Pasar el stream local a Jitsi si ya lo tenemos
      if ((window as any).localStream) {
        try {
          // Asegurar que el audio y video estén habilitados
          setTimeout(() => {
            this.api.isAudioMuted().then((muted: boolean) => {
              if (muted) {
                this.api.executeCommand('toggleAudio');
              }
            });
            
            this.api.isVideoMuted().then((muted: boolean) => {
              if (muted) {
                this.api.executeCommand('toggleVideo');
              }
            });
          }, 1000);
        } catch (error) {
          console.error('Error al configurar streams:', error);
        }
      }
    });
  }

  // Simplify the toggle function for better mobile compatibility
  toggleControls(): void {
    console.log('Toggle controls called, current visibility:', this.controlsVisible);
    
    if (this.api) {
      try {
        this.api.executeCommand('toggleToolbox');
        this.controlsVisible = !this.controlsVisible;
        console.log('Controls toggled to:', this.controlsVisible);
      } catch (error) {
        console.error('Error toggling controls:', error);
      }
    }
  }

  // Update show controls to not set alwaysVisible
  showControls(): void {
    if (this.api) {
      try {
        // If controls are not visible, make them visible
        if (!this.controlsVisible) {
          this.api.executeCommand('toggleToolbox');
          this.controlsVisible = true;
        }
      } catch (error) {
        console.error('Error showing controls:', error);
      }
    }
  }

  async logout() {
    try {
      await this.authService.logOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }

  goBack() {
    // Asegurar cierre completo de la sesión de Jitsi
    if (this.api) {
      try {
        this.api.executeCommand('hangup');
        
        // Esperar un momento para asegurar que el comando se procese
        setTimeout(() => {
          this.cleanupJitsi();
          localStorage.removeItem('currentJitsi');
          this.navCtrl.navigateBack('/main/tabs/tab2');
        }, 300);
      } catch (error) {
        console.error('Error al cerrar sesión de Jitsi:', error);
        this.cleanupJitsi();
        localStorage.removeItem('currentJitsi');
        this.navCtrl.navigateBack('/main/tabs/tab2');
      }
    } else {
      localStorage.removeItem('currentJitsi');
      this.navCtrl.navigateBack('/main/tabs/tab2');
    }
  }
}
