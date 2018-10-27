import {Component} from '@angular/core';
import {ElectronService} from './providers/electron.service';
import {TranslateService} from '@ngx-translate/core';
import {AppConfig} from '../environments/environment';
import {SettingsService} from './providers/settings.service';
import {JobsService} from './providers/jobs.service';
import {JobSchedulerService} from './providers/job-scheduler.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(public electronService: ElectronService,
              private translate: TranslateService,
              private settingsService: SettingsService,
              private jobsService: JobsService,
              private jobScheduler: JobSchedulerService
  ) {

    console.log('AppConfig', AppConfig);

    translate.setDefaultLang('en');
    this.settingsService.load();
    this.jobsService.load();
    this.jobScheduler.bootstrapScheduleJobs();

    const language = this.settingsService.getSetting('language');
    if (language !== null) {
      translate.use(language);
    }

    if (electronService.isElectron()) {
      console.log('Mode electron');
      console.log('Electron ipcRenderer', electronService.ipcRenderer);
      console.log('NodeJS childProcess', electronService.childProcess);
    } else {
      console.log('Mode web');
    }
  }
}
