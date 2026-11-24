import { Directive, ElementRef, forwardRef } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { formatPhone, isValidPhone, normalizePhone, PHONE_LENGTH } from './phone.util';

/**
 * Masque téléphone : <input type="tel" appPhoneMask [(ngModel)]="tel">
 * - affiche « XX XXX XXX » pendant la saisie ;
 * - le modèle reçoit uniquement les chiffres (8 max) ;
 * - le contrôle est invalide (erreur `phone`) tant qu'il n'y a pas 8 chiffres.
 */
@Directive({
  selector: 'input[appPhoneMask]',
  standalone: true,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PhoneMaskDirective), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => PhoneMaskDirective), multi: true },
  ],
  host: {
    inputmode: 'numeric',
    autocomplete: 'tel',
    '(input)': 'onInput()',
    '(blur)': 'onTouched()',
  },
})
export class PhoneMaskDirective implements ControlValueAccessor, Validator {
  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  constructor(private el: ElementRef<HTMLInputElement>) {
    const input = el.nativeElement;
    if (!input.placeholder || input.placeholder.startsWith('+216')) {
      input.placeholder = 'XX XXX XXX';
    }
  }

  writeValue(value: string | null | undefined): void {
    this.el.nativeElement.value = formatPhone(value);
    // Ancien numéro (ex. « +216 12 345 678 ») : on renvoie la version nettoyée au modèle
    const digits = normalizePhone(value);
    if (value && digits !== value) {
      Promise.resolve().then(() => this.onChange(digits));
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.el.nativeElement.disabled = isDisabled;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return isValidPhone(control.value) ? null : { phone: { requiredLength: PHONE_LENGTH } };
  }

  onInput(): void {
    const input = this.el.nativeElement;
    const raw = input.value;
    const caret = input.selectionStart ?? raw.length;
    const digitsBeforeCaret = raw.slice(0, caret).replace(/\D/g, '').length;

    const digits = normalizePhone(raw);
    const formatted = formatPhone(digits);
    input.value = formatted;

    // Replace le curseur après le même nombre de chiffres qu'avant le formatage
    const target = Math.min(digitsBeforeCaret, digits.length);
    let pos = 0;
    for (let seen = 0; pos < formatted.length && seen < target; pos++) {
      if (/\d/.test(formatted[pos])) {
        seen++;
      }
    }
    if (document.activeElement === input) {
      input.setSelectionRange(pos, pos);
    }

    this.onChange(digits);
  }
}
