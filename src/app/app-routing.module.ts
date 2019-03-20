import {NewJobComponent} from './components/new-job/new-job.component';
import {EditJobComponent} from './components/edit-job/edit-job.component';
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {JobsListComponent} from './components/jobs-list/jobs-list.component';
import {SettingsComponent} from './components/settings/settings.component';
import {LogsComponent} from './components/logs/logs.component';
import {S3ExplorerComponent} from './components/s3-explorer/s3-explorer.component';
import {S3StatsComponent} from './components/s3-stats/s3-stats.component';

const routes: Routes = [
  {
    path: '',
    component: JobsListComponent
  },
  {
    path: 'new-job',
    component: NewJobComponent
  },
  {
    path: 'edit-job/:id',
    component: EditJobComponent
  },
  {
    path: 'settings',
    component: SettingsComponent
  },
  {
    path: 's3-explorer',
    component: S3ExplorerComponent
  },
  {
    path: 's3-stats',
    component: S3StatsComponent
  },
  {
    path: 'logs',
    component: LogsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
