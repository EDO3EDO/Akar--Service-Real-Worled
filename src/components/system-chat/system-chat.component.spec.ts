/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { SystemChatComponent } from './system-chat.component';

describe('SystemChatComponent', () => {
  let component: SystemChatComponent;
  let fixture: ComponentFixture<SystemChatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SystemChatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SystemChatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
