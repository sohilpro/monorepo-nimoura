import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Addresses } from './entities/addresses.entity';
import { CreateAddressDto } from './dtos/create-address.dto';
import { UpdateAddressDto } from './dtos/update-address.dto';
import { Users } from '../entities/users.entity';
import {
  buildPagination,
  buildSearchWhereClause,
} from 'src/common/utils/pagination.helper';

const ADDRESS_SELECT = {
  id: true,
  title: true,
  postal_code: true,
  state: true,
  city: true,
  address: true,
  userId: true,
} as const;

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Addresses)
    private readonly addressRepo: Repository<Addresses>,
    @InjectRepository(Users)
    private readonly userRepo: Repository<Users>,
  ) {}

  async create(dto: CreateAddressDto, userId: number): Promise<any> {
    const userExists = await this.userRepo.existsBy({ id: userId });
    if (!userExists) {
      throw new NotFoundException(`کاربر با شناسه ${userId} یافت نشد.`);
    }

    const address = this.addressRepo.create({
      ...dto,
      userId,
    });

    const save = await this.addressRepo.save(address);

    return {
      message: 'آدرس با موفقیت اضاف شد.',
      address: {
        id: save.id,
        title: save.title,
        postal_code: save.postal_code,
        state: save.state,
        city: save.city,
        address: save.address,
        userId: save.userId,
      },
    };
  }

  async findMyAddresses(userId: number, query: any): Promise<any> {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortOrder = 'DESC',
      sortBy = 'id',
    } = query;

    const searchableFields = ['orderCode'];

    // شرط جستجو
    const searchWhere = buildSearchWhereClause(search, searchableFields);

    // شرط کاربر
    const userWhere = { user: { id: userId } };

    // ترکیب شرط‌ها
    const where = search ? { ...userWhere, ...searchWhere } : userWhere;

    const [data, total] = await this.addressRepo.findAndCount({
      select: ADDRESS_SELECT,
      where,
      take: +limit,
      skip: (+page - 1) * +limit,
      order: { [sortBy]: sortOrder.toUpperCase() },
      withDeleted: false,
      loadEagerRelations: false,
    });

    return buildPagination([data, total], page, limit, 'addresses');
  }

  async findOne(id: number, userId: number): Promise<Addresses> {
    const address = await this.addressRepo.findOne({
      where: { id, userId },
      select: ADDRESS_SELECT,
      loadEagerRelations: false,
    });
    if (!address) throw new NotFoundException('آدرس مورد نظر یافت نشد.');
    return address;
  }

  async update(
    id: number,
    dto: UpdateAddressDto,
    userId: number,
  ): Promise<any> {
    const address = await this.addressRepo.findOne({
      where: { id },
      select: ADDRESS_SELECT,
      loadEagerRelations: false,
    });

    if (!address) throw new NotFoundException('آدرس پیدا نشد');
    if (address.userId !== userId)
      throw new ForbiddenException('دسترسی غیرمجاز');

    Object.assign(address, dto);
    const save = await this.addressRepo.save(address);

    return {
      message: 'آدرس با موفقیت ویرایش شد.',
      address: {
        id: save.id,
        title: save.title,
        postal_code: save.postal_code,
        state: save.state,
        city: save.city,
        address: save.address,
        userId: save.userId,
      },
    };
  }

  async remove(id: number, userId: number): Promise<any> {
    const address = await this.addressRepo.findOne({
      where: { id },
      select: { id: true, userId: true },
      loadEagerRelations: false,
    });

    if (!address) throw new NotFoundException('آدرس پیدا نشد');
    if (address.userId !== userId)
      throw new ForbiddenException('دسترسی غیرمجاز');

    await this.addressRepo.delete(id);

    return {
      message: 'آدرس با موفقیت حذف شد.',
    };
  }

  //! for admin-panel
  async findAllPaginated(
    page: number,
    limit: number,
  ): Promise<{ data: Addresses[]; total: number }> {
    const [data, total] = await this.addressRepo.findAndCount({
      select: {
        ...ADDRESS_SELECT,
        createdAt: true,
        user: {
          id: true,
          first_name: true,
          last_name: true,
          mobile: true,
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: {
        user: true,
      },
      loadEagerRelations: false,
    });

    return { data, total };
  }

  async adminUpdate(id: number, dto: UpdateAddressDto): Promise<Addresses> {
    const address = await this.addressRepo.findOne({
      where: { id },
      select: ADDRESS_SELECT,
      loadEagerRelations: false,
    });
    if (!address) throw new NotFoundException('آدرس پیدا نشد');

    Object.assign(address, dto);
    return this.addressRepo.save(address);
  }

  async adminDelete(id: number): Promise<void> {
    const exists = await this.addressRepo.findOneBy({ id });
    if (!exists) throw new NotFoundException('آدرس وجود ندارد');
    await this.addressRepo.delete(id);
  }
}
