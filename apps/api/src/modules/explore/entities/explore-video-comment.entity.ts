import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import { ExploreVideo } from './explore-video.entity';

@Entity('explore_video_comments')
export class ExploreVideoComment extends CustomBaseEntity {
  @Column({ type: 'text' })
  text!: string;

  @ManyToOne(() => ExploreVideo, (v) => v.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'video_id' })
  video!: ExploreVideo;

  @ManyToOne(() => Users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: Users;

  @Column({ name: 'is_approved', type: 'boolean', default: true })
  isApproved!: boolean;
}
