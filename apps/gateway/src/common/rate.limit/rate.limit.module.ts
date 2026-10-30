import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { Module } from "@nestjs/common";

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        { name: "default", ttl: 60000, limit: 60 },
        { name: "auth", ttl: 60000, limit: 5 },
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class RateLimitModule {}
