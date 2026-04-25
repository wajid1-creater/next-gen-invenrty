import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type AuditAction = 'insert' | 'update' | 'delete';

/**
 * Append-only log of writes to audited entities. Powers the "who changed what"
 * answer that inventory systems are required to give.
 */
@Entity('audit_logs')
@Index(['entityType', 'entityId'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 64 })
  entityType: string;

  @Column({ type: 'uuid' })
  entityId: string;

  @Column({ type: 'varchar', length: 16 })
  action: AuditAction;

  @Column({ type: 'uuid', nullable: true })
  userId: string | null;

  /** Sparse: only the columns that actually changed. */
  @Column({ type: 'jsonb', nullable: true })
  before: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  after: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  at: Date;
}
