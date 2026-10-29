import { UsernameEnum } from 'src/common/auth/enums/username.enum';

export interface DetectedUsernameType {
  type: UsernameEnum;
  username: string;
}
