import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Unique,
} from 'typeorm';

@Entity('nda_signatures')
@Unique(['projectId', 'userId'])
export class NdaSignature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  projectId: string;

  @Column()
  userId: string;

  @Column({ type: 'text', nullable: true })
  ipAddress: string | null;

  @CreateDateColumn()
  signedAt: Date;
}
