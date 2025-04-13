import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { HashingService } from './hashing.service';

@Injectable()
export class BcryptService implements HashingService {
  async hash(data: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hashed = await bcrypt.hash(data, salt);
    return hashed;
  }

  async compare(data: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted);
  }
}
