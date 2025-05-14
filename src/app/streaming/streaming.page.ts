import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-streaming',
  templateUrl: './streaming.page.html',
  styleUrls: ['./streaming.page.scss'],
})
export class StreamingPage implements OnInit, AfterViewInit {

  domain: string = "8x8.vc"; // Dominio de Jitsi
  room: any;
  options: any;
  api: any;
  userName: string = 'Usuario';

  // Para controles personalizados
  isAudioMuted = false;
  isVideoMuted = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  async ngOnInit() {
    const userData = await this.authService.getCurrentUser();
    this.userName = userData?.displayName || 'Usuario';

    const jitsiUrl = localStorage.getItem('currentJitsi');
    console.log('Jitsi URL recibida:', jitsiUrl);
    
    if (jitsiUrl) {
      this.room = jitsiUrl;
      await this.iniciarJitsi();
    } else {
      console.error('No se encontró la URL de Jitsi');
    }
  }

  ngAfterViewInit(): void {
    // Inicializa Jitsi solo después de obtener el room desde Firebase
  }

  iniciarJitsi(): void {
    this.options = {
      roomName: this.room,
      configOverwrite: { 
        prejoinPageEnabled: false,
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableInitialGUM: false,
        startSilent: false,
        devices: {
          audioInput: 'default',
          audioOutput: 'default',
          videoInput: 'default'
        },
        hideConferenceTimer: true,
        hideConferenceSubject: true,
        hideRecordingLabel: true,
        hideParticipantsStats: true,
        noSsl: true,
        enableNoisyMicDetection: false,
        enableNoAudioDetection: false,
        defaultRemoteDisplayName: '',
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
        TOOLBAR_BUTTONS: [],
        INITIAL_TOOLBAR_TIMEOUT: 0,
        TOOLBAR_TIMEOUT: 0,
        TOOLBAR_ALWAYS_VISIBLE: false,
        filmStripOnly: false,
        TILE_VIEW_MAX_COLUMNS: 1,
        DISABLE_VIDEO_BACKGROUND: true,
        SHOW_WATERMARK: false,
        SHOW_ROOM_TIMER: false,
        SHOW_PARTICIPANT_NAME: false,
        SHOW_TITLE_VIEW: false,
        SHOW_MEETING_NAME: false,
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
    jitsiContainer.style.height = '100vh'; // Ocupa toda la altura de la pantalla
    jitsiContainer.style.position = 'fixed'; // Fija el contenedor
    jitsiContainer.style.top = '0';
    jitsiContainer.style.left = '0';
    jitsiContainer.style.zIndex = '9999'; // Asegura que esté al frente
  }
  
  async logout() {
    try {
      await this.authService.logOut();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
