import {Injectable} from '@angular/core';
import * as isOnline from 'is-online';
import {MatDialog} from '@angular/material';
import {NoInternetConnectionComponent} from '../components/dialogs/no-internet-connection/no-internet-connection.component';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(private dialog: MatDialog) {
  }

  castObj(rawObj, constructor) {
    const obj = new constructor();
    for (const i of Object.keys(rawObj)) {
      obj[i] = rawObj[i];
    }
    return obj;
  }

  checkInternetConnection() {
    isOnline().then(connection => {
      if (!connection) {
        this.dialog.open(NoInternetConnectionComponent, {
          width: '350px',
          autoFocus: false
        });
      }
    });
  }
}
