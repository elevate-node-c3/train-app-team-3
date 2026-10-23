import Redis from "ioredis";
import { OtpService } from "./otp.service";

describe("OtpService", () => {
  const transaction = {
    set: jest.fn(),
    del: jest.fn(),
    exec: jest.fn(),
  };
  const redis = {
    multi: jest.fn(),
    eval: jest.fn(),
    del: jest.fn(),
  } as unknown as Redis;

  let service: OtpService;

  beforeEach(() => {
    jest.clearAllMocks();
    transaction.set.mockReturnValue(transaction);
    transaction.del.mockReturnValue(transaction);
    transaction.exec.mockResolvedValue([
      [null, "OK"],
      [null, 1],
    ]);
    (redis.multi as jest.Mock).mockReturnValue(transaction);
    service = new OtpService(redis);
  });

  it("generates a zero-padded numeric code of the requested length", async () => {
    await expect(service.generate(6)).resolves.toMatch(/^\d{6}$/);
  });

  it("stores the code with a TTL and clears previous attempts", async () => {
    const code = await service.issue("traveler@example.com");

    expect(code).toMatch(/^\d{6}$/);
    expect(transaction.set).toHaveBeenCalledWith(
      expect.stringMatching(/^otp:email-verification:[a-f0-9]{64}:code$/),
      code,
      "EX",
      300,
    );
    expect(transaction.del).toHaveBeenCalledWith(
      expect.stringMatching(/^otp:email-verification:[a-f0-9]{64}:attempts$/),
    );
  });

  it("returns true only when Redis atomically accepts the one-time code", async () => {
    (redis.eval as jest.Mock).mockResolvedValue(1);

    await expect(
      service.verify("traveler@example.com", "012345"),
    ).resolves.toBe(true);
    expect(redis.eval).toHaveBeenCalledWith(
      expect.any(String),
      2,
      expect.stringMatching(/:code$/),
      expect.stringMatching(/:attempts$/),
      "012345",
      5,
    );
  });

  it("rejects malformed codes without querying Redis", async () => {
    await expect(
      service.verify("traveler@example.com", "123"),
    ).resolves.toBe(false);
    expect(redis.eval).not.toHaveBeenCalled();
  });
});
