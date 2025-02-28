import { Injectable } from '@nestjs/common';
import { ICookieManager } from './i-cookie-manager';
import { Request, Response } from 'express';

@Injectable()
export class CookieManager implements ICookieManager {
  getCookie(key: string, request: Request): string | undefined {
    const header = request.headers.cookie;

    if (!header) {
      return undefined;
    }

    const cookies = header.split(';');

    for (const cookie of cookies) {
      const [name, value] = cookie.split('=');
      if (name === key) {
        return value;
      }
    }

    return undefined;
  }
  setCookie(key: string, value: string, expires: Date, response: Response): void {
    response.cookie(key, value, { httpOnly: true, secure: true, expires });
  }
  deleteCookie(key: string, response: Response): void {
    response.clearCookie(key);
  }
}
