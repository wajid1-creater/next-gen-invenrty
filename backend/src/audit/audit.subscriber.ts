import { Injectable, Logger } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  RemoveEvent,
  UpdateEvent,
} from 'typeorm';
import { AuditLog, AuditAction } from './entities/audit-log.entity';

/**
 * Entities we audit. Add new ones here intentionally — auditing every entity
 * is noisy and ends up logging session refresh churn from refresh_tokens.
 */
const AUDITED_TABLES = new Set([
  'products',
  'suppliers',
  'purchase_orders',
  'deliveries',
]);

/** Columns we strip before persisting — sensitive or noise. */
const REDACTED_FIELDS = new Set(['password', 'token', 'tokenHash']);

/** Key under which the request middleware stores the authenticated user id. */
export const CLS_USER_ID_KEY = 'userId';

@EventSubscriber()
@Injectable()
export class AuditSubscriber implements EntitySubscriberInterface {
  private readonly logger = new Logger(AuditSubscriber.name);

  constructor(
    @InjectDataSource() private dataSource: DataSource,
    private cls: ClsService,
  ) {
    dataSource.subscribers.push(this);
  }

  async afterInsert(event: InsertEvent<unknown>): Promise<void> {
    const tableName = event.metadata.tableName;
    if (!AUDITED_TABLES.has(tableName)) return;
    await this.write(
      tableName,
      event.entityId,
      'insert',
      null,
      this.scrub(event.entity),
    );
  }

  async afterUpdate(event: UpdateEvent<unknown>): Promise<void> {
    const tableName = event.metadata.tableName;
    if (!AUDITED_TABLES.has(tableName)) return;
    if (!event.entity) return;

    // Build a sparse diff: only fields that actually changed.
    const before: Record<string, unknown> = {};
    const after: Record<string, unknown> = {};
    for (const col of event.updatedColumns) {
      const name = col.propertyName;
      if (REDACTED_FIELDS.has(name)) continue;
      before[name] = (
        event.databaseEntity as Record<string, unknown> | undefined
      )?.[name];
      after[name] = (event.entity as Record<string, unknown>)[name];
    }
    if (Object.keys(after).length === 0) return;

    const id = (event.entity as { id?: string }).id;
    await this.write(tableName, id, 'update', before, after);
  }

  async beforeRemove(event: RemoveEvent<unknown>): Promise<void> {
    const tableName = event.metadata.tableName;
    if (!AUDITED_TABLES.has(tableName)) return;
    const id =
      (event.entity as { id?: string } | undefined)?.id ?? event.entityId;
    await this.write(
      tableName,
      id,
      'delete',
      this.scrub(event.databaseEntity),
      null,
    );
  }

  private async write(
    entityType: string,
    entityId: unknown,
    action: AuditAction,
    before: Record<string, unknown> | null,
    after: Record<string, unknown> | null,
  ): Promise<void> {
    if (!entityId || typeof entityId !== 'string') return;

    try {
      const userId = this.cls.isActive()
        ? this.cls.get<string | undefined>(CLS_USER_ID_KEY)
        : undefined;
      // Use the audit-log repo directly so we don't recursively trigger the subscriber.
      // Cast around TypeORM's QueryDeepPartialEntity which can't model arbitrary jsonb.
      await this.dataSource.getRepository(AuditLog).insert({
        entityType,
        entityId,
        action,
        userId: userId ?? null,
        before: before as never,
        after: after as never,
      });
    } catch (err) {
      // Audit failures must never break the user-facing write. Log and move on.
      this.logger.warn(
        `audit write failed for ${entityType}#${String(entityId)}: ${String(err)}`,
      );
    }
  }

  private scrub(entity: unknown): Record<string, unknown> | null {
    if (!entity || typeof entity !== 'object') return null;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(entity as Record<string, unknown>)) {
      if (REDACTED_FIELDS.has(k)) continue;
      out[k] = v;
    }
    return out;
  }
}
