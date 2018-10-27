import {Component, OnInit} from '@angular/core';
import {LogService} from '../../providers/log.service';
import {AppMenuService} from '../../providers/appmenu.service';

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {

  logs: string;

  constructor(private logService: LogService, private appMenuService: AppMenuService) {
  }

  ngOnInit() {
    this.appMenuService.changeMenuPage('Logs');
    this.logService.currentLogs.subscribe(logs => this.logs = logs);
  }

  clear() {
    this.logService.clearLogs();
  }

}
