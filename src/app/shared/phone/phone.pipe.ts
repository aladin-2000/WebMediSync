import { Pipe, PipeTransform } from '@angular/core';
import { formatPhone } from './phone.util';

/** {{ numero | phone }} → « 12 345 678 » */
@Pipe({ name: 'phone', standalone: true })
export class PhonePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return formatPhone(value);
  }
}
