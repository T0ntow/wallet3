import { NgModule, CUSTOM_ELEMENTS_SCHEMA, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { NavComponent } from './components/nav/nav.component';
import { BaseChartDirective } from 'ng2-charts';
import { RouterModule } from '@angular/router';

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import {MaskitoDirective} from '@maskito/angular';
registerLocaleData(localePt, 'pt');

@NgModule({
  declarations: [AppComponent, NavComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, BaseChartDirective,  RouterModule.forRoot([]), MaskitoDirective],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, { provide: LOCALE_ID, useValue: 'pt' }],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],  // Adicione esta linha
})
export class AppModule {}
