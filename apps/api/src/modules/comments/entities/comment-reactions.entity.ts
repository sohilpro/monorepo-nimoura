import { Entity, Column, Index, ManyToOne, Unique } from 'typeorm';
import { Comments } from './comments.entity';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Users } from 'src/modules/users/entities/users.entity';

@Entity('comments_reactions')
@Unique(['user', 'comment'])
export class CommentReactions extends CustomBaseEntity {
  @ManyToOne(() => Users)
  user!: Users;

  @Index('idx_comment_reactions_comment')
  @ManyToOne(() => Comments, (comment) => comment.id, { eager: false })
  comment!: Comments;

  @Column({ type: 'enum', enum: ['like', 'dislike'] })
  type!: 'like' | 'dislike';
}
