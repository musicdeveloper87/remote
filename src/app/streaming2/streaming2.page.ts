import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
declare var JitsiMeetExternalAPI: any;

@Component({
  selector: 'app-streaming2',
  templateUrl: './streaming2.page.html',
  styleUrls: ['./streaming2.page.scss'],
})
export class Streaming2Page implements OnInit, AfterViewInit {

  domain: string = "8x8.vc"; // Dominio de Jitsi
  room: any;
  options: any;
  api: any;
  user: any;

  // Para controles personalizados
  isAudioMuted = false;
  isVideoMuted = false;

  constructor(
    private authService: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Obtiene los parámetros de la URL
    // const jitsiId = this.route.snapshot.paramMap.get('jitsiId');
    // const roomParam = this.route.snapshot.paramMap.get('room');
    
    // if (!jitsiId || !roomParam) {
    //   console.error('ID de Jitsi o Room no encontrado en la URL.');
    //   return;
    // }

    // Construye la URL completa del room
    this.room = 'vpaas-magic-cookie-9dd052d618814c95adccfe5a59207ace/room2';
    console.log('Room Jitsi:', this.room);

    // Obtiene el UID del usuario desde Firebase o localStorage, si es necesario
    const uid = localStorage.getItem('uid');
    if (uid) {
      this.authService.obtenerClientePorId(uid).subscribe((usuario: any) => {
        this.user = {
          name: usuario?.nombre || 'Usuario',
          email: usuario?.email || 'usuario@example.com'
        };

        // Inicializa Jitsi con la sala obtenida
        this.iniciarJitsi();
      });
    } else {
      this.user = {
        name: 'Usuario',
        email: 'usuario@example.com'
      };
      this.iniciarJitsi();
    }
  }

  ngAfterViewInit(): void {
    // Inicializa Jitsi solo después de obtener el room desde la URL y los datos del usuario
  }

  iniciarJitsi(): void {
    this.options = {
      roomName: this.room,
      configOverwrite: { 
        prejoinPageEnabled: false,
        hideConferenceTimer: true,
        hideConferenceSubject: true,
        hideRecordingLabel: true,
        hideParticipantsStats: true,
      },
      interfaceConfigOverwrite: {
        SHOW_ROOM_NAME: true,  // Oculta el nombre de la sala
        SHOW_TIMER: false,      // Oculta el tiempo de la reunión
        SHOW_CHROME_EXTENSION_BANNER: false,
        SHOW_DEEP_LINKING_IMAGE: false,
        SHOW_JITSI_WATERMARK: false,
        SHOW_POWERED_BY: false,
        SHOW_PROMOTIONAL_CLOSE_PAGE: false,
        SHOW_BRAND_WATERMARK: false,
        JITSI_WATERMARK_LINK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        TOOLBAR_BUTTONS: [], // Oculta todos los botones de la barra de herramientas
        HIDE_INVITE_MORE_HEADER: true, // Oculta el mensaje de invitar a más personas
        TOOLBAR_ALWAYS_VISIBLE: false, // Oculta la barra de herramientas por completo
        filmStripOnly: false, // Evita que se muestre solo la tira de película (film strip)
        TILE_VIEW_MAX_COLUMNS: 1, // Configura la vista de un solo video en pantalla completa
        DISABLE_VIDEO_BACKGROUND: true, // Elimina el fondo del video
        SHOW_WATERMARK: false, // Oculta cualquier marca de agua
        SHOW_ROOM_TIMER: false, // Oculta el temporizador de la sala
        SHOW_PARTICIPANT_NAME: false, // Oculta el nombre del participante
        SHOW_TITLE_VIEW: false, // Oculta el título de la sala

        SHOW_MEETING_NAME: false,

      },
      parentNode: document.querySelector('#jitsi-iframe'),
      userInfo: {
        displayName: this.user.name
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
  
  
}
