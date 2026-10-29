import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Author } from '../entities/author.entity';
import { CreateAuthorDto, UpdateAuthorDto } from '../dtos/misc.dto';
import { generateSlug, makeSlugUnique } from '../utils/slug.util';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author) private readonly authorRepo: Repository<Author>,
  ) {}

  async create(dto: CreateAuthorDto): Promise<Author> {
    let slug = generateSlug(dto.name);
    if (await this.authorRepo.findOneBy({ slug })) slug = makeSlugUnique(slug);
    return this.authorRepo.save(this.authorRepo.create({ ...dto, slug }));
  }

  findAllAdmin(): Promise<Author[]> {
    return this.authorRepo.find({
      // where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async findBySlug(slug: string): Promise<Author> {
    const author = await this.authorRepo.findOne({
      where: { slug },
      relations: { articles: true },
    });
    if (!author) throw new NotFoundException('نویسنده یافت نشد');
    return author;
  }

  async update(id: number, dto: UpdateAuthorDto): Promise<Author> {
    const author = await this.authorRepo.findOneBy({ id });
    if (!author) throw new NotFoundException('نویسنده یافت نشد');
    Object.assign(author, dto);
    return this.authorRepo.save(author);
  }

  async remove(id: number): Promise<void> {
    const result = await this.authorRepo.delete(id);
    if (!result.affected) throw new NotFoundException('نویسنده یافت نشد');
  }
}
