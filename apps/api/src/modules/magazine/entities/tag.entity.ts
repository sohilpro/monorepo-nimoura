import { Entity, Column, ManyToMany, Index } from 'typeorm';
import { Article } from './articles.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';

@Entity('magazine_tags')
export class Tag extends CustomBaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 120, unique: true })
  @Index()
  slug: string;

  @ManyToMany(() => Article, (article) => article.tags)
  articles: Article[];
}
