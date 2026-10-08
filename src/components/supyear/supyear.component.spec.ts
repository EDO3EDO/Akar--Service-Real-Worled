/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SupyearComponent } from './supyear.component';

describe('SupyearComponent', () => {
  let component: SupyearComponent;
  let fixture: ComponentFixture<SupyearComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SupyearComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SupyearComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
