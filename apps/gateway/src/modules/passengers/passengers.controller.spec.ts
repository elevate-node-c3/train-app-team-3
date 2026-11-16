import { ClientGrpc } from "@nestjs/microservices";
import { of } from "rxjs";
import { Metadata } from "@grpc/grpc-js";
import { IdentityGrpcService } from "../../clients/identity/identity-grpc.interface";
import { GatewayUser } from "../../common/guards/gateway-auth.guard";
import { PassengersController } from "./passengers.controller";
import { CreatePassengerDto } from "./dtos/create-passenger.dto";
import { PassengerType } from "./enums/passenger-type.enum";

describe("PassengersController", () => {
  const user: GatewayUser = {
    sub: "authenticated-user-id",
    email: "user@example.com",
  };
  it("uses the authenticated user ID instead of accepting it from the form", async () => {
    const savePassenger = jest.fn().mockReturnValue(
      of({
        passengerId: "passenger-id",
        fullName: "Passenger Name",
        nationalId: "12345678901234",
        type: 1,
        isSelf: false,
      }),
    );
    const identityService = { savePassenger };
    const client = {
      getService: jest.fn().mockReturnValue(identityService),
    };
    const controller = new PassengersController(
      client as unknown as ClientGrpc,
    );
    controller.onModuleInit();

    const dto = Object.assign(new CreatePassengerDto(), {
      fullName: "Passenger Name",
      nationalId: "12345678901234",
      passengerType: PassengerType.REGULAR,
    });
    await controller.create("en", dto, user);

    expect(savePassenger).toHaveBeenCalledWith(
      {
        passengerId: "",
        fullName: "Passenger Name",
        nationalId: "12345678901234",
        type: 1,
        userId: "authenticated-user-id",
      },
      expect.any(Metadata),
    );
  });

  it("lists only passengers belonging to the authenticated user", async () => {
    const listPassengers = jest.fn().mockReturnValue(of({ passengers: [] }));
    const client = {
      getService: jest.fn().mockReturnValue({ listPassengers }),
    };
    const controller = new PassengersController(
      client as unknown as ClientGrpc,
    );
    controller.onModuleInit();

    await expect(controller.list("en", user)).resolves.toEqual({
      passengers: [],
    });
    expect(listPassengers).toHaveBeenCalledWith(
      { userId: "authenticated-user-id" },
      expect.any(Metadata),
    );
  });

  it("uses the owner ID for every single-passenger operation", async () => {
    const passenger = {
      passengerId: "passenger-id",
      fullName: "Passenger Name",
      nationalId: "12345678901234",
      type: 1,
      isSelf: false,
    };
    const getPassenger = jest.fn().mockReturnValue(of(passenger));
    const updatePassenger = jest.fn().mockReturnValue(of(passenger));
    const deletePassenger = jest.fn().mockReturnValue(of({ success: true }));
    const client = {
      getService: jest.fn().mockReturnValue({
        getPassenger,
        updatePassenger,
        deletePassenger,
      }),
    };
    const controller = new PassengersController(
      client as unknown as ClientGrpc,
    );
    controller.onModuleInit();
    const params = { id: "passenger-id" };
    const dto = Object.assign(new CreatePassengerDto(), {
      fullName: "Passenger Name",
      nationalId: "12345678901234",
      passengerType: PassengerType.REGULAR,
    });

    await controller.get("en", params, user);
    await controller.update("en", params, dto, user);
    await controller.delete("en", params, user);

    expect(getPassenger).toHaveBeenCalledWith(
      { passengerId: params.id, userId: user.sub },
      expect.any(Metadata),
    );
    expect(updatePassenger).toHaveBeenCalledWith(
      {
        passengerId: params.id,
        userId: user.sub,
        fullName: dto.fullName,
        nationalId: dto.nationalId,
        type: 1,
      },
      expect.any(Metadata),
    );
    expect(deletePassenger).toHaveBeenCalledWith(
      { passengerId: params.id, userId: user.sub },
      expect.any(Metadata),
    );
  });
});
