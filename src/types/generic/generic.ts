// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyObject = Record<string, any>;

export type RequiredOnly<T extends AnyObject, K extends keyof T> = Required<
  Pick<Readonly<T>, K>
> &
  Partial<Readonly<Omit<T, K>>>;

export type NonRequiredOnly<T extends AnyObject, K extends keyof T> = Partial<
  Pick<Readonly<T>, K>
> &
  Required<Readonly<Omit<T, K>>>;

export type Nullish<TValue> = TValue | null | undefined;
export type NullishOnly<TValue> = TValue extends null | undefined
  ? TValue
  : never;
