import {Injectable} from '@angular/core';
import {ElectronService} from 'ngx-electron';
import * as fs from 'fs-extra';
import * as moment from 'moment';
import {LogType} from '../enum/log.type.enum';
import {BehaviorSubject, Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogService {

  private logsObservable: BehaviorSubject<string>;
  public currentLogs: Observable<string>;

  logFile: string;

  constructor(private electronService: ElectronService) {
    this.logFile = this.electronService.remote.app.getPath('userData') + '/storage/logs.log';

    this.logsObservable = new BehaviorSubject(this.getLogs());
    this.currentLogs = this.logsObservable.asObservable();
  }

  printLog(type: LogType, data) {
    const stats = fs.statSync(this.logFile);
    const fileSizeInMegabytes = stats.size / 1000000.0;
    if (fileSizeInMegabytes >= 20) {
      this.clearLogs();
    }

    const dateTime = moment().format('YYYY-MM-DD HH:mm');
    const message = dateTime + ' - ' + type + ': ' + data + '\r\n';
    fs.outputFileSync(this.logFile, message, {flag: 'a', encoding: 'utf8'});
    this.logsObservable.next(this.getLogs());
  }

  clearLogs() {
    fs.outputFileSync(this.logFile, '', {encoding: 'utf8'});
    this.logsObservable.next(this.getLogs());
  }

  getLogs() {
    fs.ensureFileSync(this.logFile);
    return fs.readFileSync(this.logFile, {encoding: 'utf8'});
  }

  getLogsFile() {
    return this.logFile;
  }
}
