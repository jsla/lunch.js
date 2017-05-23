import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

// used by both Heroes and Google Maps
import { HttpModule } from '@angular/http';

// Router
import { AppRoutingModule } from './app-routing.module';
//import { RouterModule }   from '@angular/router';

// Imports for loading & configuring the in-memory web api
//import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
//import { InMemoryDataService }  from './in-memory-data.service';

import { AppComponent } from './app.component';
import { DashboardComponent }   from './dashboard.component';
import { HeroesComponent }     from './heroes.component';
import { HeroDetailComponent } from './hero-detail.component';
import { HeroService }         from './hero.service';

// Google Map Imports
import { AgmCoreModule } from 'angular2-google-maps/core';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HeroDetailComponent,
    HeroesComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    //InMemoryWebApiModule.forRoot(InMemoryDataService),
    AppRoutingModule,

    // Google Maps Imports
    CommonModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBfS7l-JACKgKu35_Goh4mHfU7MuI-hxVI'
    })
  ],
  providers: [ HeroService ],
  bootstrap: [ AppComponent ]
})


export class AppModule { }
