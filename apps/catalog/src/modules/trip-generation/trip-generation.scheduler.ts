import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { DataSource } from 'typeorm';
import { TripGenerationService } from './trip-generation.service';

@Injectable()
export class TripGenerationScheduler implements OnApplicationBootstrap {
  private readonly logger = new Logger(TripGenerationScheduler.name);
  private isRunning = false;
  private readonly lockKey = 'catalog-trip-generation';

  constructor(
    private readonly dataSource: DataSource,
    private readonly generation: TripGenerationService,
  ) {}

  /** A catalog that was down catches up as soon as it starts. */
  onApplicationBootstrap() {
    void this.generateUpcomingTrips();
  }

  /** Every 6 hours, Cairo time. Each run fills every missing day of the window. */
  @Cron('0 0 */6 * * *', { timeZone: 'Africa/Cairo' })
  async generateUpcomingTrips() {
    if (this.isRunning) return;
    this.isRunning = true;

    const runner = this.dataSource.createQueryRunner();
    let locked = false;

    try {
      await runner.connect();

      // One instance at a time. The unique (train, date) index and the per-trip
      // transaction stay as the safety net if the lock is ever bypassed.
      const [row] = await runner.query('SELECT pg_try_advisory_lock(hashtext($1)) AS locked', [
        this.lockKey,
      ]);
      locked = row?.locked === true;

      if (!locked) {
        this.logger.warn('Another instance is generating trips');
        return;
      }

      const summary = await this.generation.generateWindow();
      this.logger.log(
        `Generated ${summary.generated}, skipped ${summary.skipped}, failed ${summary.failed.length}`,
      );
    } catch (error) {
      this.logger.error(
        'Trip generation failed',
        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      if (locked) {
        await runner
          .query('SELECT pg_advisory_unlock(hashtext($1))', [this.lockKey])
          .catch((error) => this.logger.error('Failed to release scheduler lock', error));
      }
      if (!runner.isReleased) await runner.release();
      this.isRunning = false;
    }
  }
}