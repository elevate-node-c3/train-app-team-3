type CamelCaseKey<Key extends string> = Key extends `${infer Head}_${infer Tail}`
  ? `${Head}${Capitalize<CamelCaseKey<Tail>>}`
  : Key;

type ApplicationKey<Key extends string> = Key extends "nameAr"
  ? "name_ar"
  : Key extends "nameEn"
    ? "name_en"
    : Key;

export type CatalogGrpcMessage<Message> = Message extends Date
  ? string
  : Message extends readonly (infer Item)[]
    ? CatalogGrpcMessage<Item>[]
    : Message extends object
      ? {
          [Key in keyof Message as Key extends string
            ? CamelCaseKey<Key>
            : Key]: CatalogGrpcMessage<Message[Key]>;
        }
      : Message;

export type CatalogApplicationData<Message> = Message extends readonly (
  infer Item
)[]
  ? CatalogApplicationData<Item>[]
  : Message extends object
    ? {
        [Key in keyof Message as Key extends string
          ? ApplicationKey<Key>
          : Key]: CatalogApplicationData<Message[Key]>;
      }
    : Message;

function mapMessage(
  value: unknown,
  renameKey: (key: string) => string,
  seen = new WeakMap<object, unknown>(),
): unknown {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    const mappedArray: unknown[] = [];
    seen.set(value, mappedArray);
    for (const item of value) {
      mappedArray.push(mapMessage(item, renameKey, seen));
    }
    return mappedArray;
  }

  if (value !== null && typeof value === "object") {
    const existing = seen.get(value);
    if (existing !== undefined) {
      return existing;
    }

    const mappedObject: Record<string, unknown> = {};
    seen.set(value, mappedObject);
    for (const [key, nestedValue] of Object.entries(value)) {
      if (nestedValue !== undefined) {
        mappedObject[renameKey(key)] = mapMessage(
          nestedValue,
          renameKey,
          seen,
        );
      }
    }
    return mappedObject;
  }

  return value;
}

export function toCatalogGrpcMessage<Message>(
  message: Message,
): CatalogGrpcMessage<Message> {
  return mapMessage(
    message,
    (key) => key.replace(/_([a-z])/g, (_, letter: string) =>
      letter.toUpperCase(),
    ),
  ) as CatalogGrpcMessage<Message>;
}

export function toCatalogApplicationData<Message>(
  message: Message,
): CatalogApplicationData<Message> {
  return mapMessage(
    message,
    (key) =>
      key === "nameAr" ? "name_ar" : key === "nameEn" ? "name_en" : key,
  ) as CatalogApplicationData<Message>;
}
