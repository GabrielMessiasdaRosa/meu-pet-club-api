import { RoleEnum } from '@/common/enums/role.enum';

export interface ActiveUserData {
  sub: string;
  email: string;
  name: string;
  role: RoleEnum;
}
