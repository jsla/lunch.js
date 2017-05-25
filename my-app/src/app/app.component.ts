import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.css'],
  template: `
    <h1>{{title}}</h1>
    <sebm-google-map [latitude]="lat" [longitude]="lng">
      <sebm-google-map-marker [latitude]="lat" [longitude]="lng"></sebm-google-map-marker>
    </sebm-google-map>
    <nav>
      <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
      <a routerLink="/heroes" routerLinkActive="active">Champions</a>
    </nav>
    <router-outlet></router-outlet>
  `
})

export class AppComponent {
  // Title
  title: string = ''; // left blank intentionally for now

  // Google Maps
  lat: number = 34.0522;
  lng: number = -118.2437;
}

