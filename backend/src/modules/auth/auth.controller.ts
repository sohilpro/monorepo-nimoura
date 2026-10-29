import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { SendOtpDto } from './dtos/send-otp.dto';
import { CheckOtpDto } from './dtos/check-otp.dto';
import { CurrentUser, Public } from 'src/common/auth/auth.decorators';
import { Consumes } from '../../common/auth/enums/consumes.enum';

@ApiTags('Auth')
@Controller(['auth', 'admin/auth']) // مسیر: /api/v1/auth
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ثبت نام کاربر جدید با رمز عبور' })
  @ApiConsumes(Consumes.Form, Consumes.Json)
  @ApiResponse({ status: 201, description: 'ثبت‌نام با موفقیت انجام شد' })
  @ApiResponse({ status: 409, description: 'کاربر از قبل وجود دارد' })
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ورود با نام کاربری/شماره و رمز عبور' })
  @ApiConsumes(Consumes.Form, Consumes.Json)
  @ApiResponse({ status: 200, description: 'ورود موفقیت‌آمیز' })
  @ApiResponse({ status: 401, description: 'اطلاعات ورود نامعتبر است' })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ارسال کد یک‌بار مصرف به ایمیل یا شماره موبایل' })
  @ApiConsumes(Consumes.Form, Consumes.Json)
  @ApiResponse({ status: 200, description: 'کد ارسال شد' })
  sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto);
  }

  @Public()
  @Post('check-otp')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'تأیید کد OTP و ورود / ثبت‌نام خودکار' })
  @ApiConsumes(Consumes.Form, Consumes.Json)
  @ApiResponse({ status: 200, description: 'کد تأیید شد و توکن ارسال گردید' })
  @ApiResponse({ status: 400, description: 'کد اشتباه یا منقضی شده است' })
  checkOtp(@Body() checkOtpDto: CheckOtpDto) {
    return this.authService.checkOtp(checkOtpDto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'دریافت اطلاعات پروفایل کاربر لاگین شده' })
  @ApiResponse({ status: 200, description: 'اطلاعات کاربر' })
  @ApiResponse({ status: 401, description: 'عدم دسترسی / توکن نامعتبر' })
  getProfile(@CurrentUser('id') userId: number) {
    return this.authService.me(userId);
  }
}
