import { Injectable } from '@angular/core';
import {BehaviorSubject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppMenuService {

  private startPage = new BehaviorSubject('');
  currentPage = this.startPage.asObservable();

  constructor() { }

  changeMenuPage(page: string) {
    this.startPage.next(page);
  }
}
