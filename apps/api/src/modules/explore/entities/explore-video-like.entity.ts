import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { CustomBaseEntity } from 'src/common/database/base.entity';
import { Users } from 'src/modules/users/entities/users.entity';
import { ExploreVideo } from './explore-video.entity';

@Entity('explore_video_likes')
export class ExploreVideoLike extends CustomBaseEntity {
  @ManyToOne(() => ExploreVideo, (v) => v.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'video_id' })
  video!: ExploreVideo;

  @ManyToOne(() => Users, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user?: Users | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip?: string | null;
}
