import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtModuleOptions } from './jwt.interface';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtService {
  constructor(
    @Inject('CONFIG_OPTIONS') private readonly options: JwtModuleOptions,
  ) {}

  sign(userId: string): string {
    return jwt.sign(userId, this.options.privateKey);
  }
  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
