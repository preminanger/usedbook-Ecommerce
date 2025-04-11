import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyProductComponent } from './my-product.component';

describe('MyProductComponent', () => {
  let component: MyProductComponent;
  let fixture: ComponentFixture<MyProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
