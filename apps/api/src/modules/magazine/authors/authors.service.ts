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
      select: {
        id: true,
        name: true,
        slug: true,
        avatar: true,
        jobTitle: true,
        isActive: true,
        createdAt: true,
      },
      order: { name: 'ASC' },
      loadEagerRelations: false,
    });
  }

  async findBySlug(slug: string): Promise<Author> {
    const author = await this.authorRepo.findOne({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        avatar: true,
        jobTitle: true,
        bio: true,
        socialLinks: true,
        articles: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          coverImage: true,
          coverImageAlt: true,
          readingTime: true,
          publishedAt: true,
        },
      },
      relations: { articles: true },
      loadEagerRelations: false,
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
