import { Metadata, status } from "@grpc/grpc-js";
import { Controller } from "@nestjs/common";
import { GrpcMethod, RpcException } from "@nestjs/microservices";
import { I18nService } from "nestjs-i18n";
import { getAuthLanguage } from "../../i18n/grpc-language";
import { PassengerType } from "./application/enums/passenger-type.enum";
import { PassengersService } from "./passengers.service";

interface SavePassengerRequest {
  fullName: string;
  nationalId: string;
  type: number;
  userId: string;
}

interface PassengerOwnerRequest {
  passengerId: string;
  userId: string;
}

interface UpdatePassengerRequest extends PassengerOwnerRequest {
  fullName: string;
  nationalId: string;
  type: number;
}

@Controller()
export class PassengersGrpcController {
  constructor(
    private readonly passengersService: PassengersService,
    private readonly i18n: I18nService,
  ) {}

  @GrpcMethod("IdentityService", "Create")
  async create(data: SavePassengerRequest, metadata: Metadata) {
    const language = getAuthLanguage(metadata);
    const passenger = await this.passengersService.create(
      {
        fullName: data.fullName.trim(),
        nationalId: data.nationalId.trim(),
        passengerType: this.getPassengerType(data.type, language),
        userId: data.userId,
      },
      language,
    );
    return this.toResponse(passenger);
  }

  @GrpcMethod("IdentityService", "ListPassengers")
  async listPassengers(data: { userId: string }, metadata: Metadata) {
    const passengers = await this.passengersService.findByUserId(
      data.userId,
      getAuthLanguage(metadata),
    );
    return {
      passengers: passengers.map((passenger) => this.toResponse(passenger)),
    };
  }

  @GrpcMethod("IdentityService", "GetPassenger")
  async getPassenger(data: PassengerOwnerRequest, metadata: Metadata) {
    const passenger = await this.passengersService.findByIdForUser(
      data.passengerId,
      data.userId,
      getAuthLanguage(metadata),
    );
    return this.toResponse(passenger);
  }

  @GrpcMethod("IdentityService", "UpdatePassenger")
  async updatePassenger(data: UpdatePassengerRequest, metadata: Metadata) {
    const language = getAuthLanguage(metadata);
    const passenger = await this.passengersService.updateForUser(
      data.passengerId,
      data.userId,
      {
        fullName: data.fullName.trim(),
        nationalId: data.nationalId.trim(),
        passengerType: this.getPassengerType(data.type, language),
      },
      language,
    );
    return this.toResponse(passenger);
  }

  @GrpcMethod("IdentityService", "DeletePassenger")
  async deletePassenger(data: PassengerOwnerRequest, metadata: Metadata) {
    await this.passengersService.deleteForUser(
      data.passengerId,
      data.userId,
      getAuthLanguage(metadata),
    );
    return { success: true };
  }

  private getPassengerType(type: number, language: "en" | "ar"): PassengerType {
    if (type !== 1) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: this.i18n.translate("passengers.invalidType", {
          lang: language,
        }),
      });
    }
    return PassengerType.REGULAR;
  }

  private toResponse(passenger: {
    id: string;
    fullName: string;
    nationalId: string;
  }) {
    return {
      passengerId: passenger.id,
      fullName: passenger.fullName,
      nationalId: passenger.nationalId,
      type: 1,
      isSelf: false,
    };
  }
}
