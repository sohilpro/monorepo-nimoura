import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tag } from '../entities/tag.entity';
import { generateSlug, makeSlugUnique } from '../utils/slug.util';
import { CreateTagDto, UpdateTagDto } from '../dtos/misc.dto';

@Injectable()
export class TagsService {
  constructor(@InjectRepository(Tag) private readonly tagRepo: Repository<Tag>) {}

  async create(dto: CreateTagDto): Promise<Tag> {
    let slug = generateSlug(dto.name);
    if (await this.tagRepo.findOneBy({ slug })) slug = makeSlugUnique(slug);
    return this.tagRepo.save(this.tagRepo.create({ ...dto, slug }));
  }

  async findOrCreateByNames(names: string[]): Promise<Tag[]> {
    const tags: Tag[] = [];
    for (const name of names) {
      const slug = generateSlug(name);
      let tag = await this.tagRepo.findOneBy({ slug });
      if (!tag) tag = await this.tagRepo.save(this.tagRepo.create({ name, slug }));
      tags.push(tag);
    }
    return tags;
  }

  findAll(): Promise<Tag[]> {
    return this.tagRepo.find({ order: { name: 'ASC' } });
  }

  async findBySlug(slug: string): Promise<Tag> {
    const tag = await this.tagRepo.findOneBy({ slug });
    if (!tag) throw new NotFoundException('برچسب یافت نشد');
    return tag;
  }

  async update(id: number, dto: UpdateTagDto): Promise<Tag> {
    const tag = await this.tagRepo.findOneBy({ id });
    if (!tag) throw new NotFoundException('برچسب یافت نشد');
    Object.assign(tag, dto);
    return this.tagRepo.save(tag);
  }

  async remove(id: number): Promise<void> {
    const result = await this.tagRepo.delete(id);
    if (!result.affected) throw new NotFoundException('برچسب یافت نشد');
  }
}