import { Body } from '@nestjs/common';
import { ZodType, ZodTypeDef } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';

export function BodyZodValidated<TInput, TOutput>(
  schema: ZodType<TOutput, ZodTypeDef, TInput>,
): ParameterDecorator {
  return Body(new ZodValidationPipe<TInput, TOutput>(schema));
}
