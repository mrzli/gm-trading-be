import { ArgumentMetadata, BadRequestException, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { SafeParseError, ZodType, ZodTypeDef } from 'zod';

@Injectable()
export class ZodValidationPipe<TInput, TOutput>
  implements PipeTransform<TInput, Promise<TOutput>>
{
  public constructor(
    private readonly schema: ZodType<TOutput, ZodTypeDef, TInput>
  ) {}

  public async transform(
    value: TInput,
    _metadata: ArgumentMetadata
  ): Promise<TOutput> {
    return await zodValidateOrThrowBadRequest(this.schema, value);
  }
}

async function zodValidateOrThrowBadRequest<TInput, TOutput>(
  schema: ZodType<TOutput, ZodTypeDef, TInput>,
  value: TInput
): Promise<TOutput> {
  const result = await schema.safeParseAsync(value);
  if (result.success) {
    return result.data;
  } else {
    throwZodBadRequest(result);
  }
}

function throwZodBadRequest<TInput>(
  error: SafeParseError<TInput>
): never {
  throw new BadRequestException({
    statusCode: HttpStatus.BAD_REQUEST,
    message: error.error.issues[0]?.message,
    error: 'Bad Request',
    validationIssues: error.error.issues,
  });
}