import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  OnModuleInit,
  Param,
  Post,
  Put,
  UsePipes,
} from "@nestjs/common";
import { ClientGrpc } from "@nestjs/microservices";
import { I18nLang, I18nValidationPipe } from "nestjs-i18n";
import { Metadata } from "@grpc/grpc-js";
import { lastValueFrom } from "rxjs";
import { Authenticated } from "../../common/decorators/authenticated.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { GatewayUser } from "../../common/guards/gateway-auth.guard";
import { IdentityGrpcService } from "../../clients/identity/identity-grpc.interface";
import { CreatePassengerDto } from "./dtos/create-passenger.dto";
import { PassengerIdDto } from "./dtos/passenger-id.dto";
import { UpdatePassengerDto } from "./dtos/update-passenger.dto";
import { PassengerType } from "./enums/passenger-type.enum";

const PASSENGER_TYPE_GRPC_VALUE: Record<PassengerType, number> = {
  [PassengerType.REGULAR]: 1,
};

@Controller("passengers")
@Authenticated()
export class PassengersController implements OnModuleInit {
  private identityService!: IdentityGrpcService;

  constructor(
    @Inject("IDENTITY_PACKAGE") private readonly client: ClientGrpc,
  ) {}

  onModuleInit(): void {
    this.identityService =
      this.client.getService<IdentityGrpcService>("IdentityService");
  }

  @Post()
  @UsePipes(
    new I18nValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  )
  async create(
    @I18nLang() lang: string,
    @Body() dto: CreatePassengerDto,
    @CurrentUser() user: GatewayUser,
  ) {
    return lastValueFrom(
      this.identityService.create(
        {
          passengerId: "",
          fullName: dto.fullName.trim(),
          nationalId: dto.nationalId.trim(),
          type: PASSENGER_TYPE_GRPC_VALUE[dto.passengerType],
          userId: user.sub,
        },
        this.metadataFor(lang),
      ),
    );
  }

  @Get()
  async list(@I18nLang() lang: string, @CurrentUser() user: GatewayUser) {
    return lastValueFrom(
      this.identityService.listPassengers(
        { userId: user.sub },
        this.metadataFor(lang),
      ),
    );
  }

  @Get(":id")
  @UsePipes(
    new I18nValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  )
  async get(
    @I18nLang() lang: string,
    @Param() params: PassengerIdDto,
    @CurrentUser() user: GatewayUser,
  ) {
    return lastValueFrom(
      this.identityService.getPassenger(
        { passengerId: params.id, userId: user.sub },
        this.metadataFor(lang),
      ),
    );
  }

  @Put(":id")
  @UsePipes(
    new I18nValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  )
  async update(
    @I18nLang() lang: string,
    @Param() params: PassengerIdDto,
    @Body() dto: UpdatePassengerDto,
    @CurrentUser() user: GatewayUser,
  ) {
    return lastValueFrom(
      this.identityService.updatePassenger(
        {
          passengerId: params.id,
          userId: user.sub,
          fullName: dto.fullName.trim(),
          nationalId: dto.nationalId.trim(),
          type: PASSENGER_TYPE_GRPC_VALUE[dto.passengerType],
        },
        this.metadataFor(lang),
      ),
    );
  }

  @Delete(":id")
  @UsePipes(
    new I18nValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
  )
  async delete(
    @I18nLang() lang: string,
    @Param() params: PassengerIdDto,
    @CurrentUser() user: GatewayUser,
  ) {
    return lastValueFrom(
      this.identityService.deletePassenger(
        { passengerId: params.id, userId: user.sub },
        this.metadataFor(lang),
      ),
    );
  }

  private metadataFor(language: string): Metadata {
    const metadata = new Metadata();
    metadata.set("accept-language", language);
    return metadata;
  }
}
