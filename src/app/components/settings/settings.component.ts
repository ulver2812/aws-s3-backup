import {Component, OnInit} from '@angular/core';
import {SettingsService} from '../../providers/settings.service';
import {MatSnackBar} from '@angular/material';
import {AppMenuService} from '../../providers/appmenu.service';
import {AwsService} from '../../providers/aws.service';
import {UtilsService} from '../../providers/utils.service';
import {TranslateService} from '@ngx-translate/core';
import {MatChipInputEvent} from '@angular/material';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {isUndefined} from 'util';
import {ElectronService} from '../../providers/electron.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})

export class SettingsComponent implements OnInit {

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  settings: {
    awsAccessKeyID: string,
    awsSecretAccessKey: string,
    awsRegion: string,
    language: string,
    allowNotifications: boolean,
    emailHost: string,
    emailPort: number,
    emailSecure: boolean,
    emailUser: string,
    emailPassword: string,
    emailSender: string,
    emailReceivers: string[],
    s3MaxConcurrentRequests: number,
    s3MaxBandwidth: number,
    autoStart: boolean
  };

  awsCliStatus: any;
  awsCliCredentials: any;
  spinner = true;

  bandwidthMbs: string;

  regions = [
    {id: 'eu-west-1', value: 'EU (Ireland)'},
    {id: 'eu-west-2', value: 'EU (London)'},
    {id: 'eu-west-3', value: 'EU (Paris)'},
    {id: 'us-east-1', value: 'US East (N. Virginia))'},
    {id: 'us-east-2', value: 'US East (Ohio)'},
    {id: 'us-west-1', value: 'US West (N. California)'},
    {id: 'us-west-2', value: 'US West (Oregon)'},
    {id: 'ca-central-1', value: 'Canada (Central)'},
    {id: 'eu-central-1', value: 'EU (Frankfurt)'},
    {id: 'ap-northeast-1', value: 'Asia Pacific (Tokyo)'},
    {id: 'ap-northeast-2', value: 'Asia Pacific (Seoul)'},
    {id: 'ap-northeast-3', value: 'Asia Pacific (Osaka-Local)'},
    {id: 'ap-southeast-1', value: 'Asia Pacific (Singapore)'},
    {id: 'ap-southeast-2', value: 'Asia Pacific (Sydney)'},
    {id: 'ap-south-1', value: 'Asia Pacific (Mumbai)'},
    {id: 'sa-east-1', value: 'South America (São Paulo)'}
  ];

  languages = [
    {id: 'en', value: 'English'},
    {id: 'it', value: 'Italian'}
  ];

  constructor(
    private settingsService: SettingsService,
    private snackBar: MatSnackBar,
    private appMenuService: AppMenuService,
    private aws: AwsService,
    private utilsService: UtilsService,
    private translate: TranslateService,
    private electronService: ElectronService
  ) {
  }

  ngOnInit() {
    this.appMenuService.changeMenuPage('Settings');
    this.settings = this.settingsService.getSettings();

    if (isUndefined(this.settings.emailReceivers)) {
      this.settings.emailReceivers = [];
    }

    if (isUndefined(this.settings.s3MaxBandwidth)) {
      this.settings.s3MaxBandwidth = 3000;
    }

    if (isUndefined(this.settings.s3MaxConcurrentRequests)) {
      this.settings.s3MaxConcurrentRequests = 10;
    }

    this.checkSettings();
    this.utilsService.checkInternetConnection();

    this.convertS3MaxBandwidth(this.settings.s3MaxBandwidth);
  }

  save() {
    this.settingsService.save(this.settings);
    this.translate.use(this.settings.language);
    this.electronService.ipcRenderer.send('set-auto-start', this.settings.autoStart);
    this.snackBar.open('Settings saved', '', {
      duration: 3000,
      verticalPosition: 'top',
      panelClass: 'app-snackbar'
    });
    this.checkSettings();
  }

  checkSettings() {
    this.spinner = true;
    this.awsCliStatus = 'nostatus';
    this.awsCliCredentials = 'nostatus';
    const checkCli = this.aws.checkCli().then((status) => {
      this.awsCliStatus = status;
    });

    const checkCredentials = this.aws.checkCredentials().then((status) => {
      this.awsCliCredentials = status;
    });

    Promise.all([checkCli, checkCredentials]).then(values => {
      this.spinner = false;
    });
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add our email
    if ((value || '').trim()) {
      this.settings.emailReceivers.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(email: string): void {
    const index = this.settings.emailReceivers.indexOf(email);

    if (index >= 0) {
      this.settings.emailReceivers.splice(index, 1);
    }
  }

  convertS3MaxBandwidth(bandwidthKBs) {
    const res = (bandwidthKBs / 1000 ) * 8;
    this.bandwidthMbs = res.toFixed(2) + 'Mb/s';
  }
}
