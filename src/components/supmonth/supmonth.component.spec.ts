/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SupmonthComponent } from './supmonth.component';

describe('SupmonthComponent', () => {
  let component: SupmonthComponent;
  let fixture: ComponentFixture<SupmonthComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupmonthComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupmonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
