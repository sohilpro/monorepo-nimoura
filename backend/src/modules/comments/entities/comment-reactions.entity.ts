import {
  Entity,
  Column,
  ManyToOne,
  Unique,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comments } from './comments.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Users } from 'src/modules/users/entities/users.entity';

@Entity('comments_reactions')
@Unique(['user', 'comment'])
export class CommentReactions extends CustomBaseEntity {
  @ManyToOne(() => Users, { eager: true })
  user!: Users;

  @ManyToOne(() => Comments, (comment) => comment.id, { eager: false })
  comment!: Comments;

  @Column({ type: 'enum', enum: ['like', 'dislike'] })
  type!: 'like' | 'dislike';
}
