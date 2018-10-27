import {Component, OnInit} from '@angular/core';
import {AppMenuService} from '../../providers/appmenu.service';
import {ElectronService} from '../../providers/electron.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  public page: string;

  constructor(private appMenuService: AppMenuService, private electron: ElectronService) {
  }

  ngOnInit() {
    this.appMenuService.currentPage.subscribe(page => this.page = page);
  }

  helpPage() {
    // TODO: aggiungere link help alla repo di github
    this.electron.shell.openExternal('https://www.google.com');
  }
}
