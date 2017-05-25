import { InMemoryDbService } from 'angular-in-memory-web-api';

export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    let heroes = [
      {id: 11, name: ''}, // blank needed for some reason
      {id: 12, name: 'Koreatown/Mid-Wilshire'},
      {id: 13, name: 'Culver City x Playa Vista'},
      {id: 14, name: 'Santa Monica'},
      {id: 15, name: 'SF Valley'},
    ];
    return {heroes};
  }
}
