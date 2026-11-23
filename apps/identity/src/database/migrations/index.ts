import { CreateUsersTable1710000000000 } from "./1710000000000-CreateUsersTable";
import { CreateSessionsTable1720000000000 } from "./1720000000000-CreateSessionsTable";
import { AddUserProfileFields1730000000000 } from "./1730000000000-AddUserProfileFields";
import { AddUserLanguage1794086400000 } from "./1794086400000-AddUserLanguage";
import { AddUserVerificationAndProfileUniqueness1794246600000 } from "./1794246600000-AddUserVerificationAndProfileUniqueness";
import { CreatePassengersTable1794350000000 } from "./1794350000000-CreatePassengersTable";
import { AddPassengerOwnerListIndex1794351000000 } from "./1794351000000-AddPassengerOwnerListIndex";
import { ConvertPassengerTypeToEnum1794352000000 } from "./1794352000000-ConvertPassengerTypeToEnum";

export const migrations = [
  CreateUsersTable1710000000000,
  CreateSessionsTable1720000000000,
  AddUserProfileFields1730000000000,
  AddUserLanguage1794086400000,
  AddUserVerificationAndProfileUniqueness1794246600000,
  CreatePassengersTable1794350000000,
  AddPassengerOwnerListIndex1794351000000,
  ConvertPassengerTypeToEnum1794352000000,
];
