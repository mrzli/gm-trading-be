import { ParseUUIDPipe, ParseIntPipe, Query } from '@nestjs/common';
import { z, ZodType, ZodTypeDef } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';

export function QueryUuid(name: string): ParameterDecorator {
  return Query(name, ParseUUIDPipe);
}

export function QueryInt(name: string): ParameterDecorator {
  return Query(name, ParseIntPipe);
}

export function QueryString(name: string): ParameterDecorator {
  return QueryZodValidated(name, z.string());
}

export function QueryUrl(name: string): ParameterDecorator {
  return QueryZodValidated(name, z.string().url());
}

export function QueryZodValidated<TInput, TOutput>(
  name: string,
  schema: ZodType<TOutput, ZodTypeDef, TInput>,
): ParameterDecorator {
  return Query(name, new ZodValidationPipe<TInput, TOutput>(schema));
}
