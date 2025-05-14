import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'main',
    loadChildren: () => import('./tabs/tabs.module').then(m => m.TabsPageModule),
    //canActivate: [ AuthGuard ]
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'streaming1',
    loadChildren: () => import('./streaming/streaming.module').then( m => m.StreamingPageModule)
  },
  {
    path: 'streaming2',
    loadChildren: () => import('./streaming2/streaming2.module').then( m => m.Streaming2PageModule)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  },


];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
