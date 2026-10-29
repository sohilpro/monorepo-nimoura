import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannerPosition } from './entities';
import { CreatePositionDto, UpdatePositionDto } from './dtos';

@Injectable()
export class BannerPositionService {
  constructor(
    @InjectRepository(BannerPosition)
    private readonly positionRepo: Repository<BannerPosition>,
  ) {}

  async create(dto: CreatePositionDto): Promise<BannerPosition> {
    const exists = await this.positionRepo.findOne({ where: { key: dto.key } });
    if (exists) {
      throw new ConflictException(`جایگاهی با کلید "${dto.key}" از قبل وجود دارد`);
    }
    const position = this.positionRepo.create(dto);
    return this.positionRepo.save(position);
  }

  findAll(): Promise<BannerPosition[]> {
    return this.positionRepo.find({ order: { createdAt: 'ASC' } });
  }

  async findOne(id: number): Promise<BannerPosition> {
    const position = await this.positionRepo.findOne({ where: { id } });
    if (!position) throw new NotFoundException('جایگاه بنر یافت نشد');
    return position;
  }

  async findByKey(key: string): Promise<BannerPosition | null> {
    return this.positionRepo.findOne({ where: { key } });
  }

  async update(id: number, dto: UpdatePositionDto): Promise<BannerPosition> {
    const position = await this.findOne(id);
    Object.assign(position, dto);
    return this.positionRepo.save(position);
  }

  async remove(id: number): Promise<void> {
    const position = await this.findOne(id);
    await this.positionRepo.remove(position);
  }
}
