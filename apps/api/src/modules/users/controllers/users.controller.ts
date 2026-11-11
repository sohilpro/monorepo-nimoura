import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/common/auth/auth.decorators';
import { UsersService } from '../user.service';
import { Consumes } from 'src/common/auth/enums/consumes.enum';
import { UpdateUserDto } from '../dtos/update-user.dto';

@ApiTags('Store - User Profile')
@ApiBearerAuth()
@Controller('user') // مسیر نهایی: /api/v1/user
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'دریافت اطلاعات پروفایل کاربر',
    description:
      'اطلاعات کامل کاربر به‌همراه آمار خلاصه (تعداد سفارش‌ها و آدرس‌ها) را بازمی‌گرداند.',
  })
  @ApiResponse({
    status: 200,
    description: 'پروفایل کاربر با موفقیت دریافت شد.',
  })
  @ApiResponse({
    status: 401,
    description: 'دسترسی غیرمجاز. نیاز به توکن معتبر دارد.',
  })
  getProfile(@CurrentUser('id') userId: number) {
    return this.userService.getProfile(userId);
  }

  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'ویرایش اطلاعات پروفایل',
    description:
      'کاربر می‌تواند نام، نام خانوادگی، کدملی یا سایر مشخصات مجاز خود را ویرایش کند.',
  })
  @ApiConsumes(Consumes.Form, Consumes.Json)
  @ApiResponse({
    status: 200,
    description: 'اطلاعات با موفقیت به‌روزرسانی شد.',
  })
  @ApiResponse({
    status: 400,
    description: 'اطلاعات وارد شده نامعتبر است.',
  })
  @ApiResponse({
    status: 401,
    description: 'دسترسی غیرمجاز.',
  })
  updateProfile(
    @CurrentUser('id') userId: number,
    @Body() updateProfileDto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(userId, updateProfileDto);
  }
}
