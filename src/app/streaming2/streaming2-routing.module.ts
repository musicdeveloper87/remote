import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Streaming2Page } from './streaming2.page';

const routes: Routes = [
  {
    path: '',
    component: Streaming2Page
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class Streaming2PageRoutingModule {}
