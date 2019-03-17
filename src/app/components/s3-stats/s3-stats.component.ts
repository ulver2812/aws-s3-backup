import {Component, OnInit} from '@angular/core';
import {AwsService} from '../../providers/aws.service';
import {AppMenuService} from '../../providers/appmenu.service';
import {UtilsService} from '../../providers/utils.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-s3-stats',
  templateUrl: './s3-stats.component.html',
  styleUrls: ['./s3-stats.component.scss']
})
export class S3StatsComponent implements OnInit {

  buckets = [];
  spinner = true;
  currentBucket = '';
  type: string;
  type2: string;
  data: object;
  data2: object;
  options: object;
  options2: object;

  constructor(
    private appMenuService: AppMenuService,
    private aws: AwsService,
    private utilsService: UtilsService,
    private translate: TranslateService,
  ) {
  }

  ngOnInit() {
    this.appMenuService.changeMenuPage('S3 Explorer');
    this.aws.listBuckets().then((data) => {
      this.spinner = false;
      this.buckets = data;
    });
    this.utilsService.checkInternetConnection();
  }

  selectBucket() {

    this.spinner = true;
    this.type = 'line';
    this.data = {datasets: []};
    this.options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'day'
          }
        }]
      }
    };

    this.translate.get([
      'PAGES.S3-STATS.SIZE-LABEL',
      'PAGES.S3-STATS.NUMBER-OBJECTS-LABEL',
      'PAGES.S3-STATS.SIZE-IA-LABEL'
    ]).subscribe((translation) => {

      const bucketSize = this.aws.getBucketSizeBytesLastDays(this.currentBucket, 'StandardStorage', 15).then((data) => {
        const dataGraph = [];
        data.forEach((item) => {
          dataGraph.push({x: item.Timestamp, y: (item.Average / 1000000000).toFixed(2)});
        });

        this.data['datasets'].push({
          label: translation['PAGES.S3-STATS.SIZE-LABEL'],
          data: dataGraph,
          backgroundColor: 'rgba(32, 193, 21, 0.5)'
        });
      });

      const bucketSizeIA = this.aws.getBucketSizeBytesLastDays(this.currentBucket, 'StandardIAStorage', 15).then((data) => {

        if (data.length === 0) {
          return;
        }

        const dataGraph = [];
        data.forEach((item) => {
          dataGraph.push({x: item.Timestamp, y: (item.Average / 1000000000).toFixed(2)});
        });

        this.data['datasets'].push({
          label: translation['PAGES.S3-STATS.SIZE-IA-LABEL'],
          data: dataGraph,
          backgroundColor: 'rgba(226, 201, 18, 0.5)'
        });
      });

      const bucketObjects = this.aws.getBucketNumberOfObjectsLastDays(this.currentBucket, 'StandardStorage', 15).then((data) => {

        const dataGraph = [];
        data.forEach((item) => {
          dataGraph.push({x: item.Timestamp, y: (item.Average / 1000).toFixed(2)});
        });

        this.type2 = 'line';
        this.data2 = {
          datasets: [
            {
              label: translation['PAGES.S3-STATS.NUMBER-OBJECTS-LABEL'],
              data: dataGraph,
              backgroundColor: 'rgba(21, 50, 193, 0.5)'
            }
          ]
        };
        this.options2 = {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            xAxes: [{
              type: 'time',
              time: {
                unit: 'day'
              }
            }]
          }
        };
      });

      Promise.all([bucketSize, bucketSizeIA, bucketObjects]).then(() => {
        this.spinner = false;
      });

    });
  }

}
