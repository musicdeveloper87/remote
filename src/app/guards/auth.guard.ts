import { Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor( private usuario: AuthService, private navCtrl: NavController  ) {}

  canActivate(): Observable<boolean> | Promise<boolean> | boolean{
    console.log( 'guard', this.usuario.estaLogueado());
  return this.usuario.estaLogueado();
  }

}
