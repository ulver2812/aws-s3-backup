import 'zone.js/dist/zone-mix';
import 'reflect-metadata';
import '../polyfills';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HttpClientModule, HttpClient } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';

// NG Translate
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { ElectronService } from './providers/electron.service';

import { WebviewDirective } from './directives/webview.directive';

import { AppComponent } from './app.component';

import { MaterialComponentsModule } from './material-component/material-components.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NewJobComponent } from './components/new-job/new-job.component';
import { MenuComponent } from './components/menu/menu.component';
import { JobsListComponent } from './components/jobs-list/jobs-list.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SettingsComponent } from './components/settings/settings.component';
import { EditJobComponent } from './components/edit-job/edit-job.component';
import {NgxElectronModule} from 'ngx-electron';
import {JobsService} from './providers/jobs.service';
import {ReactiveFormsModule} from '@angular/forms';
import {JobSchedulerService} from './providers/job-scheduler.service';
import { LogsComponent } from './components/logs/logs.component';
import { S3ExplorerComponent } from './components/s3-explorer/s3-explorer.component';
import { JobAlertDialogComponent } from './components/dialogs/job-alert-dialog/job-alert-dialog.component';
import { JobBackupManuallyComponent } from './components/dialogs/job-backup-manually/job-backup-manually.component';
import { NoInternetConnectionComponent } from './components/dialogs/no-internet-connection/no-internet-connection.component';
import {NotificationsService} from './providers/notifications.service';
import {ProcessesHandlerService} from './providers/processes-handler.service';
import { S3StatsComponent } from './components/s3-stats/s3-stats.component';
import { ChartModule } from 'angular2-chartjs';


// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    WebviewDirective,
    NewJobComponent,
    MenuComponent,
    JobsListComponent,
    SettingsComponent,
    EditJobComponent,
    LogsComponent,
    S3ExplorerComponent,
    JobAlertDialogComponent,
    JobBackupManuallyComponent,
    NoInternetConnectionComponent,
    S3StatsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    AppRoutingModule,
    MaterialComponentsModule,
    FlexLayoutModule,
    NgxElectronModule,
    ReactiveFormsModule,
    ChartModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (HttpLoaderFactory),
        deps: [HttpClient]
      }
    }),
    BrowserAnimationsModule
  ],
  providers: [ElectronService, JobsService, JobSchedulerService, NotificationsService, ProcessesHandlerService],
  bootstrap: [AppComponent],
  entryComponents: [JobAlertDialogComponent, JobBackupManuallyComponent, NoInternetConnectionComponent]
})
export class AppModule { }
