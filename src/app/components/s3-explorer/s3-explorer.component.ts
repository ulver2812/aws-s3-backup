import {Component, OnInit} from '@angular/core';
import {AppMenuService} from '../../providers/appmenu.service';
import {AwsService} from '../../providers/aws.service';
import * as sugar from 'sugar';
import * as path from 'path';
import {UtilsService} from '../../providers/utils.service';
import {MatIconRegistry} from '@angular/material/icon';
import {DomSanitizer} from '@angular/platform-browser';

@Component({
  selector: 'app-s3-explorer',
  templateUrl: './s3-explorer.component.html',
  styleUrls: ['./s3-explorer.component.scss']
})
export class S3ExplorerComponent implements OnInit {

  buckets = [];
  spinner = true;
  loadFile = false;
  currentBucket = '';
  currentDirs = [];
  currentFiles = [];
  currentPrefix = '';
  backPrefix = '';
  currentBucketSize = '--';
  currentBucketSizeIA = '--';
  currentBucketNumberOfObjects = '--';

  constructor(
    private appMenuService: AppMenuService,
    private aws: AwsService,
    private utilsService: UtilsService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.registerIcons();
  }

  ngOnInit() {
    this.appMenuService.changeMenuPage('S3 Explorer');
    this.aws.listBuckets().then((data) => {
      this.spinner = false;
      this.buckets = data;
    });

    this.utilsService.checkInternetConnection();
  }

  selectKey(prefix = '') {
    this.backPrefix = this.getBackPrefix(prefix);
    this.currentPrefix = prefix;
    this.spinner = true;
    this.aws.listObjects(this.currentBucket, prefix).then((data) => {
      if (!sugar.Object.isEmpty(data)) {
        this.currentDirs = data.directories;
        this.currentFiles = data.files;
      }

      if (prefix === '') {

        const numOfObjs = this.aws.getBucketNumberOfObjects(this.currentBucket).then((number) => {
          this.currentBucketNumberOfObjects = number;
        });

        const standardBucketSize = this.aws.getBucketSizeBytes(this.currentBucket, 'StandardStorage').then((size) => {
          this.currentBucketSize = size;
        });

        const standardIABucketSize = this.aws.getBucketSizeBytes(this.currentBucket, 'StandardIAStorage').then((size) => {
          this.currentBucketSizeIA = size;
        });

        Promise.all([numOfObjs, standardBucketSize, standardIABucketSize]).then(() => {
          this.spinner = false;
        });

      } else {
        this.spinner = false;
      }

    });
  }

  download(key) {
    this.loadFile = true;
    this.aws.downloadObject(this.currentBucket, key).then(() => {
      this.loadFile = false;
    });
  }

  getBackPrefix(prefix) {
    let backPrefix;
    if (prefix === '' || sugar.Array.exclude(prefix.split('/'), '').length === 1) {
      return '';
    } else {
      backPrefix = path.dirname(prefix);
      if (backPrefix.substr(-1) !== '/') {
        backPrefix += '/';
      }
      return backPrefix;
    }
  }

  registerIcons() {
    this.matIconRegistry.addSvgIcon(
      'custom_icon_folder',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/folder.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'custom_icon_file',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/file.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'custom_icon_download',
      this.domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/download.svg')
    );
  }
}
