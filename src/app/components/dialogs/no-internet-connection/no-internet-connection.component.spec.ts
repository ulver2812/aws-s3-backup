import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NoInternetConnectionComponent } from './no-internet-connection.component';

describe('NoInternetConnectionComponent', () => {
  let component: NoInternetConnectionComponent;
  let fixture: ComponentFixture<NoInternetConnectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NoInternetConnectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NoInternetConnectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
