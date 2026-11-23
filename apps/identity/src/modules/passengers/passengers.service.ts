import { status } from "@grpc/grpc-js";
import { Inject, Injectable } from "@nestjs/common";
import { RpcException } from "@nestjs/microservices";
import { randomUUID } from "crypto";
import { I18nService } from "nestjs-i18n";
import { AuthLanguage } from "../../i18n/grpc-language";
import { normalizeNationalId } from "../users/domain/utils/national-id";
import { UsersService } from "../users/users.service";
import { Passenger } from "./domain/entities/passenger.entity";
import { MAX_PASSENGERS_PER_USER } from "./domain/constants/passenger.constants";
import {
  PASSENGER_REPOSITORY,
  PassengerRepository,
} from "./domain/repositories/passenger.repository";
import { CreatePassengerInput } from "./application/dtos/create-passenger.input";
import { UpdatePassengerInput } from "./application/dtos/update-passenger.input";

@Injectable()
export class PassengersService {
  constructor(
    @Inject(PASSENGER_REPOSITORY)
    private readonly passengerRepository: PassengerRepository,
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
  ) {}

  async create(
    input: CreatePassengerInput,
    language: AuthLanguage = "ar",
  ): Promise<Passenger> {
    const nationalId = normalizeNationalId(input.nationalId);
    this.validateInput(input.fullName, nationalId, language);
    await this.assertNotRegisteredUser(nationalId, input.userId, language);
    if (
      await this.passengerRepository.findByNationalIdForUser(
        nationalId,
        input.userId,
      )
    ) {
      throw this.passengerError("duplicatePassenger", status.ALREADY_EXISTS, language);
    }

    const now = new Date();
    const passenger = new Passenger(
      randomUUID(),
      input.fullName,
      nationalId,
      input.passengerType,
      input.userId,
      now,
      now,
    );
    const result = await this.passengerRepository.saveIfBelowLimit(
      passenger,
      MAX_PASSENGERS_PER_USER,
    );
    if (!result.created) {
      if (result.reason === "user_not_found") {
        throw this.passengerError("userNotFound", status.NOT_FOUND, language);
      }
      throw this.passengerError(
        "limitReached",
        status.RESOURCE_EXHAUSTED,
        language,
      );
    }
    return result.passenger;
  }

  async findByUserId(
    userId: string,
    language: AuthLanguage = "ar",
  ): Promise<Passenger[]> {
    await this.assertUserExists(userId, language);
    return this.passengerRepository.findByUserId(userId);
  }

  async findByIdForUser(
    id: string,
    userId: string,
    language: AuthLanguage = "ar",
  ): Promise<Passenger> {
    await this.assertUserExists(userId, language);
    const passenger = await this.passengerRepository.findByIdForUser(
      id,
      userId,
    );
    if (!passenger) {
      throw this.passengerError("notFound", status.NOT_FOUND, language);
    }
    return passenger;
  }

  async updateForUser(
    id: string,
    userId: string,
    input: UpdatePassengerInput,
    language: AuthLanguage = "ar",
  ): Promise<Passenger> {
    const existing = await this.findByIdForUser(id, userId, language);
    const nationalId = normalizeNationalId(input.nationalId);
    this.validateInput(input.fullName, nationalId, language);
    await this.assertNotRegisteredUser(nationalId, userId, language);

    const duplicate = await this.passengerRepository.findByNationalIdForUser(
      nationalId,
      userId,
    );
    if (duplicate && duplicate.id !== existing.id) {
      throw this.passengerError("duplicatePassenger", status.ALREADY_EXISTS, language);
    }

    const updated = new Passenger(
      existing.id,
      input.fullName,
      nationalId,
      input.passengerType,
      existing.userId,
      existing.createdAt,
      new Date(),
    );
    return this.passengerRepository.save(updated);
  }

  async deleteForUser(
    id: string,
    userId: string,
    language: AuthLanguage = "ar",
  ): Promise<void> {
    await this.assertUserExists(userId, language);
    const deleted = await this.passengerRepository.deleteByIdForUser(id, userId);
    if (!deleted) {
      throw this.passengerError("notFound", status.NOT_FOUND, language);
    }
  }

  private validateInput(
    fullName: string,
    nationalId: string,
    language: AuthLanguage,
  ): void {
    if (!fullName.trim() || fullName.length > 100) {
      throw this.passengerError(
        "invalidFullName",
        status.INVALID_ARGUMENT,
        language,
      );
    }
    if (!/^[0-9]{14}$/.test(nationalId)) {
      throw this.passengerError(
        "invalidNationalId",
        status.INVALID_ARGUMENT,
        language,
      );
    }
  }

  private async assertNotRegisteredUser(
    nationalId: string,
    userId: string,
    language: AuthLanguage,
  ): Promise<void> {
    const user = await this.assertUserExists(userId, language);
    if (
      user.nationalId &&
      normalizeNationalId(user.nationalId) === nationalId
    ) {
      throw this.passengerError("selfPassenger", status.ALREADY_EXISTS, language);
    }
    if (await this.usersService.isNationalIdUsed(nationalId, userId)) {
      throw this.passengerError(
        "nationalIdBelongsToUser",
        status.ALREADY_EXISTS,
        language,
      );
    }
  }

  private async assertUserExists(userId: string, language: AuthLanguage) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw this.passengerError("userNotFound", status.NOT_FOUND, language);
    }
    return user;
  }

  private passengerError(
    messageKey: string,
    code: number,
    language: AuthLanguage,
  ): RpcException {
    return new RpcException({
      code,
      message: this.i18n.translate(`passengers.${messageKey}`, {
        lang: language,
      }),
    });
  }
}
