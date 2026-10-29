import 'reflect-metadata';
import { IsEmail, IsNotEmpty, IsString, MinLength, ValidateNested, validate } from 'class-validator';
import { plainToInstance, Type } from 'class-transformer';
import { fromClassValidator } from './class-validator.mapper';
import { validationFailed } from '../envelope';

class Passenger { @IsString() @IsNotEmpty() fullName!: string; }
class RegisterDto {
  @IsEmail({}, { context: { example: 'name@example.com' } }) email!: string;
  @MinLength(8, { context: { min: 8 } }) password!: string;
  @ValidateNested({ each: true }) @Type(() => Passenger) passengers!: Passenger[];
}

async function run(plain: object, lang: 'ar' | 'en') {
  const dto = plainToInstance(RegisterDto, plain);
  const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
  return validationFailed(fromClassValidator(errors as any), { correlationId: 'c-1', language: lang });
}

describe('class-validator -> envelope', () => {
  const bad = { email: 'mona@', password: 'abc', passengers: [{ fullName: '' }], hack: 1 };

  it('ignores class-validator English text and uses our catalogue (English)', async () => {
    const r = await run(bad, 'en');
    const byField = Object.fromEntries(r.body.error.details!.map((d) => [d.field, d]));
    expect(byField.email.message).toBe('Email is not in the right format.');
    expect(byField.email.hint).toBe('Use a format like name@example.com.');
    expect(byField.password.message).toBe('Password must be at least 8 characters.');
    expect(byField.password).not.toHaveProperty('value');
    expect(byField['passengers[0].fullName'].code).toBe('FIELD_REQUIRED');
    expect(byField.hack.code).toBe('FIELD_NOT_ALLOWED');
    expect(JSON.stringify(r.body)).not.toContain('must be an email');
  });

  it('same errors in Arabic', async () => {
    const r = await run(bad, 'ar');
    const d = r.body.error.details!.find((x) => x.field === 'password')!;
    expect(d.message).toBe('يجب ألا يقل كلمة المرور عن 8 أحرف.');
  });

  it('a missing field is FIELD_REQUIRED, not a format error', async () => {
    const r = await run({ password: 'longenough1', passengers: [] }, 'en');
    expect(r.body.error.details!.find((d) => d.field === 'email')!.code).toBe('FIELD_REQUIRED');
  });
});
