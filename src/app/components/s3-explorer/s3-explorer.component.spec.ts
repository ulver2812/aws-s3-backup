import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { S3ExplorerComponent } from './s3-explorer.component';

describe('S3ExplorerComponent', () => {
  let component: S3ExplorerComponent;
  let fixture: ComponentFixture<S3ExplorerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ S3ExplorerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(S3ExplorerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
