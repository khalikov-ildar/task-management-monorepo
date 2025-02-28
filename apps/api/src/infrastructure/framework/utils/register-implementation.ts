import { InjectionToken, Provider, Scope, Type } from '@nestjs/common';

export function registerImplementation<T>(abstraction: InjectionToken, implementation: Type<T>, scope?: Scope): Provider {
  return { provide: abstraction, useClass: implementation, scope };
}
