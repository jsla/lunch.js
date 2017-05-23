import { Component, OnInit } from '@angular/core';
import { Router }            from '@angular/router';

import { Hero } from './hero';
import { HeroService } from './hero.service';

@Component({
  selector: 'app-root',
  templateUrl: './heroes.component.html',
  styleUrls: ['./heroes.component.css'],
  providers: [ HeroService ]
})

export class HeroesComponent implements OnInit {
  // Google Maps
  lat: number = 51.678418;
  lng: number = 7.809007;

  // Heroes
  heroes: Hero[];
  selectedHero: Hero;

  constructor(
    private router: Router,
    private heroService: HeroService) { }

  getHeroes(): void {
    this.heroService.getHeroes().then(heroes => this.heroes = heroes);
  }

  ngOnInit(): void {
    this.getHeroes();
  }

  onSelect(hero: Hero): void {
    this.selectedHero = hero;
  }

  gotoDetail(): void {
    this.router.navigate(['/detail', this.selectedHero.id]);
  }
}

