import Ajv, { ValidateFunction } from 'ajv';
import addFormats from "ajv-formats"
import { invariant } from '@gmjs/assert';
import { readTextAsync } from '@gmjs/fs-async';
import { join } from '@gmjs/path';

export const SERVER_DATA_DIR = 'data';

export const AJV = new Ajv();
addFormats(AJV);

export async function readJson<TResult>(
  file: string,
  validate: ValidateFunction<TResult>,
  errorMessage: string,
): Promise<TResult> {
  const path = join(SERVER_DATA_DIR, file);
  const content = await readTextAsync(path);
  const data = JSON.parse(content);
  const isValid = validate(data);
  if (!isValid) {
    console.error(validate.errors);
    invariant(false, errorMessage);
  }

  return data;
}
