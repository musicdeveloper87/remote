import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { Streaming2PageRoutingModule } from './streaming2-routing.module';

import { Streaming2Page } from './streaming2.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    Streaming2PageRoutingModule
  ],
  declarations: [Streaming2Page]
})
export class Streaming2PageModule {}
