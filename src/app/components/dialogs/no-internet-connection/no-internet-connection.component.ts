import {Component, OnInit} from '@angular/core';
import {MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-no-internet-connection',
  templateUrl: './no-internet-connection.component.html',
  styleUrls: ['./no-internet-connection.component.scss']
})
export class NoInternetConnectionComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<NoInternetConnectionComponent>) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
  }

}
