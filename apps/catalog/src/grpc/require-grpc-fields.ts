import { status } from "@grpc/grpc-js";
import { RpcException } from "@nestjs/microservices";

export function requireGrpcFields<
  Message extends object,
  Key extends keyof Message,
>(
  message: Message,
  ...keys: Key[]
): asserts message is Message & Required<Pick<Message, Key>> {
  const missing = keys.filter((key) => message[key] === undefined);
  if (missing.length > 0) {
    throw new RpcException({
      code: status.INVALID_ARGUMENT,
      message: `Missing required fields: ${missing.join(", ")}`,
    });
  }
}
