import { registerDecorator, ValidationOptions } from 'class-validator';
import { isEmail, isMobilePhone } from 'validator';
import { AuthMessage } from '../enums/auth-message.enum';

export function IsValidUsername(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsValidUsername',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown) {
          if (typeof value !== 'string') return false;
          const isGmail = isEmail(value, { host_whitelist: ['gmail.com'] });
          const isIranMobile = isMobilePhone(value, 'fa-IR');
          return isGmail || isIranMobile;
        },
        defaultMessage(): string {
          return AuthMessage.InValidUsername;
        },
      },
    });
  };
}
