import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Streaming2Page } from './streaming2.page';

describe('Streaming2Page', () => {
  let component: Streaming2Page;
  let fixture: ComponentFixture<Streaming2Page>;

  beforeEach(async(() => {
    fixture = TestBed.createComponent(Streaming2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
