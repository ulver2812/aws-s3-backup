import {Component, OnInit} from '@angular/core';
import {AppMenuService} from '../../providers/appmenu.service';
import {AwsService} from '../../providers/aws.service';
import * as sugar from 'sugar';
import * as path from 'path';
import {UtilsService} from '../../providers/utils.service';

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

  constructor(private appMenuService: AppMenuService, private aws: AwsService, private utilsService: UtilsService) {
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
      this.spinner = false;
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
}
