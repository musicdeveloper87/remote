export interface Visor {
  id?: string;
  id_celular: string;
  direccion_streaming: string;
}

export interface Cliente {
  nombre: string;
  email: string;
  uid: string;
  photo: string;
  id_visor?: string;
}

