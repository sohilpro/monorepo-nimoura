import { Entity, Column, OneToMany, Index } from 'typeorm';
import { Article } from './articles.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';

@Entity('magazine_authors')
export class Author extends CustomBaseEntity {
  @Column({ length: 150 })
  name: string;

  @Column({ length: 160, unique: true })
  @Index()
  slug: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  avatar: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  // مثلا: متخصص پوست، کارشناس آرایشی، تیم تحریریه نیمورا
  jobTitle: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  // شبکه‌های اجتماعی به صورت JSON: { instagram, telegram, website }
  @Column({ type: 'jsonb', nullable: true })
  socialLinks: Record<string, string>;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Article, (article) => article.author)
  articles: Article[];
}
