import {Component, OnInit} from '@angular/core';
import {AppMenuService} from '../../providers/appmenu.service';
import {ElectronService} from '../../providers/electron.service';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';
const {version: appVersion} = require('../../../../package.json');

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  public page: string;
  public appVersion: string;

  constructor(
    private appMenuService: AppMenuService,
    private electron: ElectronService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.registerIcons();
  }

  ngOnInit() {
    this.appMenuService.currentPage.subscribe(page => this.page = page);
    this.appVersion = appVersion;
  }

  helpPage() {
    this.electron.shell.openExternal('https://github.com/ulver2812/aws-s3-backup/wiki');
  }

  registerIcons(){
    this.matIconRegistry.addSvgIcon(
      'custom_icon_help',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/help.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'custom_icon_settings',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/settings.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'custom_icon_add_job',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/add.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'custom_icon_job_list',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/job_list.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'custom_icon_log',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/log.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'custom_icon_s3_explorer',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/s3_explorer.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'custom_icon_s3_stats',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/stats.svg')
    );
  }
}
