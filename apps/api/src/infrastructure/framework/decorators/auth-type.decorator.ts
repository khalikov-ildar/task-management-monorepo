import { SetMetadata } from '@nestjs/common';
import { AuthTypes } from '../enums/auth-types.enum';

export const Auth_Type_Metadata = 'AuthTypeMetadata';

export const AuthType = (...types: AuthTypes[]) => SetMetadata(Auth_Type_Metadata, types);
