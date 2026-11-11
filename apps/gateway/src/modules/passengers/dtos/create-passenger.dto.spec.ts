import { validateSync } from "class-validator";
import { CreatePassengerDto } from "./create-passenger.dto";
import { PassengerType } from "../enums/passenger-type.enum";

function validate(input: Record<string, unknown>) {
  return validateSync(Object.assign(new CreatePassengerDto(), input), {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

describe("CreatePassengerDto", () => {
  const validInput = {
    fullName: "Passenger Name",
    nationalId: "12345678901234",
    passengerType: PassengerType.REGULAR,
  };

  it.each(["12345678901234", "١٢٣٤٥٦٧٨٩٠١٢٣٤", "۱۲۳۴۵۶۷۸۹۰۱۲۳۴"])(
    "accepts a 14-digit national ID: %s",
    (nationalId) => {
      expect(validate({ ...validInput, nationalId })).toHaveLength(0);
    },
  );

  it("rejects malformed national IDs and unsupported passenger types", () => {
    expect(
      validate({
        ...validInput,
        nationalId: "1234",
        passengerType: "CHILD",
      }),
    ).not.toHaveLength(0);
  });

  it("rejects userId in the request body", () => {
    const errors = validate({ ...validInput, userId: "spoofed-user-id" });
    expect(errors.some((error) => error.property === "userId")).toBe(true);
  });
});
