import { Request, Response } from 'express';

export abstract class ICookieManager {
  abstract getCookie(key: string, request: Request): string | undefined;
  abstract setCookie(key: string, value: string, expires: Date, response: Response): void;
  abstract deleteCookie(key: string, response: Response): void;
}
