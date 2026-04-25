import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * One row per refresh-token issuance. We store the SHA-256 hash, never the raw
 * value, so a database leak doesn't compromise active sessions.
 *
 * Rotation flow:
 *  - login/register → insert row, send raw token in httpOnly cookie
 *  - /auth/refresh   → mark current row revoked, insert new row with
 *                      `replacedByTokenId` pointing to it, send new cookie
 *  - reuse of an already-rotated token → likely theft → revoke whole family
 *  - logout         → revoke just this row
 *  - logout-all     → revoke every active row for the user
 */
@Entity('refresh_tokens')
export class RefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index()
  @Column()
  userId: string;

  /** SHA-256 of the raw token. Lookups go via this column. */
  @Index({ unique: true })
  @Column({ length: 64 })
  tokenHash: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt: Date | null;

  /** Set when this token was rotated; points at the new token row. */
  @Column({ type: 'uuid', nullable: true })
  replacedByTokenId: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  userAgent: string | null;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
