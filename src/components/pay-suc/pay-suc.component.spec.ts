/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PaySucComponent } from './pay-suc.component';

describe('PaySucComponent', () => {
  let component: PaySucComponent;
  let fixture: ComponentFixture<PaySucComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaySucComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaySucComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
