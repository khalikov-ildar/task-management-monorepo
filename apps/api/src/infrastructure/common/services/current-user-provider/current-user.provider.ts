import { Injectable } from '@nestjs/common';
import { CurrentUserDetails, ICurrentUserProvider } from '../../../../application/common/services/i-current-user.provider';
import { AlsProvider } from '../async-local-storage/als.provider';

@Injectable()
export class CurrentUserProvider implements ICurrentUserProvider {
  constructor(private readonly alsProvider: AlsProvider) {}

  getCurrentUserDetails(): CurrentUserDetails {
    return { role: this.alsProvider.getValue('role'), userId: this.alsProvider.getValue('userId') };
  }
}
