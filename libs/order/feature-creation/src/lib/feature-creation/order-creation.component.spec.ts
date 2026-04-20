import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureCreation } from './feature-creation';

describe('FeatureCreation', () => {
  let component: FeatureCreation;
  let fixture: ComponentFixture<FeatureCreation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeatureCreation],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureCreation);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
