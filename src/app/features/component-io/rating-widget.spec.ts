import { provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RatingWidget } from './rating-widget';

/**
 * Тест в zoneless-проекте.
 *
 * Отличия от Angular 16:
 *  - в провайдерах TestBed указывается provideZonelessChangeDetection();
 *  - вместо fixture.detectChanges() чаще используется await fixture.whenStable();
 *  - входы задаются через fixture.componentRef.setInput() — это работает
 *    и для сигнальных входов, объявленных функцией input().
 */
describe('RatingWidget', () => {
  let fixture: ComponentFixture<RatingWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RatingWidget],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(RatingWidget);
    fixture.componentRef.setInput('label', 'Оценка');
    fixture.componentRef.setInput('max', 5);
    await fixture.whenStable();
  });

  it('рисует столько звёзд, сколько указано во входе max', async () => {
    const buttons = fixture.nativeElement.querySelectorAll('.stars button');
    expect(buttons.length).toBe(5);

    fixture.componentRef.setInput('max', 8);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelectorAll('.stars button').length).toBe(8);
  });

  it('model() обновляет значение в обе стороны', async () => {
    const host = signal(0);
    fixture.componentInstance.value.subscribe((value) => host.set(value));

    const thirdStar: HTMLButtonElement = fixture.nativeElement.querySelectorAll('.stars button')[2];
    thirdStar.click();
    await fixture.whenStable();

    // значение внутри компонента
    expect(fixture.componentInstance.value()).toBe(3);
    // ...и оно же уехало наружу через valueChange
    expect(host()).toBe(3);
  });

  it('output() эмитит событие rated', async () => {
    const rated: number[] = [];
    fixture.componentInstance.rated.subscribe((value) => rated.push(value));

    const firstStar: HTMLButtonElement = fixture.nativeElement.querySelectorAll('.stars button')[0];
    firstStar.click();
    await fixture.whenStable();

    expect(rated).toEqual([1]);
  });

  it('не реагирует на клики, когда вход disabled установлен', async () => {
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    const firstStar: HTMLButtonElement = fixture.nativeElement.querySelectorAll('.stars button')[0];
    firstStar.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.value()).toBe(0);
  });
});
