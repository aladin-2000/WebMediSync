import { ChangeDetectorRef, Component, Input, forwardRef, inject } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const pad = (n: number) => String(n).padStart(2, '0');

// Remplace <input type="time">, dont le format 12h/24h est imposé par la langue du navigateur.
@Component({
  selector: 'app-time-input',
  standalone: true,
  template: `
    <select aria-label="Heures" [disabled]="disabled" (change)="onHourChange($any($event.target).value)" (blur)="onTouched()">
      @if (allowEmpty) {
        <option value="" [selected]="hour === ''">--</option>
      }
      @for (h of hours; track h) {
        <option [value]="h" [selected]="h === hour">{{ h }}</option>
      }
    </select>
    <span aria-hidden="true">:</span>
    <select aria-label="Minutes" [disabled]="disabled || hour === ''" (change)="onMinuteChange($any($event.target).value)" (blur)="onTouched()">
      @for (m of minutes; track m) {
        <option [value]="m" [selected]="m === minute">{{ m }}</option>
      }
    </select>
  `,
  styles: [`
    :host { display: flex; align-items: center; gap: 4px; width: 100%; min-width: 0; }
    select {
      flex: 1; min-width: 0; padding: 7px 4px; border: 1px solid #dee2e6; border-radius: 8px;
      background: #fff; color: #212529; font-size: 14px; font-family: inherit; cursor: pointer;
    }
    select:focus { outline: none; border-color: #1971c2; }
    select:disabled { opacity: 0.6; cursor: not-allowed; }
    span { color: #868e96; font-weight: 600; }
    @media (max-width: 768px) { select { font-size: 16px; padding: 10px 4px; } }
  `],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => TimeInputComponent), multi: true }],
})
export class TimeInputComponent implements ControlValueAccessor {
  @Input() allowEmpty = false;

  readonly hours = Array.from({ length: 24 }, (_, i) => pad(i));
  readonly minutes = Array.from({ length: 60 }, (_, i) => pad(i));
  hour = '';
  minute = '00';
  disabled = false;

  private readonly cdr = inject(ChangeDetectorRef);
  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    const [hour, minute] = (value ?? '').split(':');
    this.hour = hour ?? '';
    this.minute = minute ?? '00';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  onHourChange(hour: string): void {
    this.hour = hour;
    this.emit();
  }

  onMinuteChange(minute: string): void {
    this.minute = minute;
    this.emit();
  }

  private emit(): void {
    this.onChange(this.hour ? `${this.hour}:${this.minute}` : '');
  }
}
