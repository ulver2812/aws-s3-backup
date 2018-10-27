import {Injectable} from '@angular/core';
import {ElectronService} from 'ngx-electron';
import * as fs from 'fs-extra';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  currentSettings: object;
  settingsFile: string;

  constructor(private electronService: ElectronService) {
    this.settingsFile = this.electronService.remote.app.getPath('userData') + '/storage/settings.json';
  }

  save(settings) {
    fs.outputJsonSync(this.settingsFile, settings);
    this.currentSettings = settings;
  }

  load() {
    fs.ensureFileSync(this.settingsFile);
    const data = fs.readJsonSync(this.settingsFile, {throws: false});
    if (data !== null) {
      this.currentSettings = data;
    } else {
      this.currentSettings = {};
    }
  }

  getSetting(key) {
    if (Object.keys(this.currentSettings).length > 0 && this.currentSettings.constructor === Object) {
      return this.currentSettings[key];
    } else {
      return null;
    }
  }

  getSettings(): any {
    if (Object.keys(this.currentSettings).length > 0 && this.currentSettings.constructor === Object) {
      return this.currentSettings;
    } else {
      return {};
    }
  }
}
