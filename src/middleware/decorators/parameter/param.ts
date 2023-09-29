import { Param, ParseUUIDPipe, ParseIntPipe } from '@nestjs/common';
import { z, ZodType, ZodTypeDef } from 'zod';
import { ZodValidationPipe } from '../../pipes/zod-validation.pipe';

export function ParamUuid(name: string): ParameterDecorator {
  return Param(name, ParseUUIDPipe);
}

export function ParamInt(name: string): ParameterDecorator {
  return Param(name, ParseIntPipe);
}

export function ParamString(name: string): ParameterDecorator {
  return ParamZodValidated(name, z.string());
}

export function ParamZodValidated<TInput, TOutput>(
  name: string,
  schema: ZodType<TOutput, ZodTypeDef, TInput>,
): ParameterDecorator {
  return Param(name, new ZodValidationPipe<TInput, TOutput>(schema));
}
