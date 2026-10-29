import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpEntity } from './entities/otp.entity';
import { isEmail, isMobilePhone } from 'class-validator';
import { UsernameEnum } from '../../common/auth/enums/username.enum';
import { AuthMessage } from '../../common/auth/enums/auth-message.enum';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { Users } from 'src/modules/users/entities/users.entity';
import { TokensService } from './tokens.service';
import { SmsService } from 'src/modules/payments/sms.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { SendOtpDto } from './dtos/send-otp.dto';
import { randomInt } from 'crypto';
import { CheckOtpDto } from './dtos/check-otp.dto';
import { DetectedUsernameType } from './types/detected-username.type';
import { UserRole } from 'src/common/auth/jwt.types';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,

    @InjectRepository(OtpEntity)
    private readonly otpRepository: Repository<OtpEntity>,

    private readonly tokensService: TokensService,
    private readonly smsService: SmsService,
    // private readonly emailService: EmailService
  ) {}

  DetectUsername(username: string): DetectedUsernameType {
    if (isEmail(username)) {
      return { type: UsernameEnum.Email, username };
    } else if (isMobilePhone(username, 'fa-IR')) {
      return { type: UsernameEnum.Mobile, username };
    } else {
      throw new BadRequestException(AuthMessage.InValidUsername);
    }
  }

  async register(registerDto: RegisterDto) {
    const { first_name, password, last_name } = registerDto;
    const { type, username } = this.DetectUsername(registerDto.username);

    let user = await this.userRepository.findOneBy({ [type]: username });
    if (user) throw new ConflictException(AuthMessage.ConflictUser);

    const userCount = await this.userRepository.count();
    const role: UserRole = userCount === 0 ? UserRole.OWNER : UserRole.USER;

    const salt = genSaltSync(12);
    const hashedPassword = hashSync(password, salt);

    user = this.userRepository.create({
      first_name,
      last_name,
      role,
      [type]: username,
      password: hashedPassword,
    });
    user = await this.userRepository.save(user);

    const accessToken = this.tokensService.genAccessToken(user);
    return {
      message: AuthMessage.RegisterSuccess,
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { password } = loginDto;
    const { type, username } = this.DetectUsername(loginDto.username);

    const user = await this.userRepository.findOneBy({ [type]: username });
    if (!user) throw new NotFoundException(AuthMessage.NotFoundUser);

    if (!user.password || !compareSync(password, user.password)) {
      throw new UnauthorizedException(AuthMessage.InCorrectPass);
    }

    const accessToken = this.tokensService.genAccessToken(user);
    return {
      message: AuthMessage.LoginSuccess,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        mobile: user.mobile,
        verify_email: user.verify_email,
        verify_mobile: user.verify_mobile,
      },
      accessToken,
    };
  }

  async sendOtp(sendOtpDto: SendOtpDto) {
    const { username } = sendOtpDto;
    const { type, username: validUsername } = this.DetectUsername(username);

    const existingOtp = await this.otpRepository.findOneBy({
      username: validUsername,
    });

    if (existingOtp && existingOtp.expires > new Date()) {
      const timeLeft = Math.floor(
        (existingOtp.expires.getTime() - Date.now()) / 1000,
      );
      throw new BadRequestException(
        `کد قبلی هنوز معتبر است (${timeLeft} ثانیه باقی‌مانده)`,
      );
    }

    const code: string = randomInt(10000, 99999).toString();
    const expires = new Date(Date.now() + 2 * 60 * 1000);

    if (existingOtp) {
      await this.otpRepository.update(
        { id: existingOtp.id },
        { code, expires },
      );
    } else {
      await this.otpRepository.save({
        username: validUsername,
        code,
        expires,
      });
    }

    try {
      if (type === UsernameEnum.Mobile) {
        await this.smsService.sendOtpViaMeliSms(validUsername, code);
      }
      //   else {
      //     await this.emailService.sendOtpViaEmail(validUsername, code);
      //   }
    } catch (error) {
      console.error('خطا در ارسال OTP:', error);
      throw new InternalServerErrorException('خطا در ارسال کد تأیید');
    }

    return {
      message: AuthMessage.SendOtpCode,
    };
  }

  async checkOtp(checkOtpDto: CheckOtpDto) {
    const { username, code } = checkOtpDto;
    const { type, username: validUsername } = this.DetectUsername(username);

    const otp = await this.otpRepository.findOneBy({
      username: validUsername,
      code,
    });

    if (!otp || otp.expires < new Date()) {
      throw new BadRequestException(AuthMessage.ExpiredOtpCode);
    }

    let user = await this.userRepository.findOneBy({ [type]: validUsername });

    if (!user) {
      const userCount = await this.userRepository.count();
      const role: UserRole = userCount === 0 ? UserRole.OWNER : UserRole.USER;

      user = this.userRepository.create({
        [type]: validUsername,
        role,
        verify_email: type === UsernameEnum.Email,
        verify_mobile: type === UsernameEnum.Mobile,
      });
      user = await this.userRepository.save(user);
    }

    await this.otpRepository.delete({ id: otp.id });

    const accessToken = this.tokensService.genAccessToken(user);

    return {
      message: AuthMessage.LoginSuccess,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        mobile: user.mobile,
        verify_email: user.verify_email,
        verify_mobile: user.verify_mobile,
        identity_card: user.identity_card,
      },
    };
  }

  async me(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },

      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        identity_card: true,
        role: true,
        mobile: true,
        verify_email: true,
        verify_mobile: true,
      },
    });

    if (!user) throw new UnauthorizedException(AuthMessage.NotFoundUser);

    return user;
  }
}
