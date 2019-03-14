import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { S3StatsComponent } from './s3-stats.component';

describe('S3StatsComponent', () => {
  let component: S3StatsComponent;
  let fixture: ComponentFixture<S3StatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ S3StatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(S3StatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
