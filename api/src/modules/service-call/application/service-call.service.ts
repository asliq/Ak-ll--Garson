import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@/core/database/prisma.service';
import { DomainEventPublisher } from '@/core/events/domain-event.publisher';
import { DomainException } from '@/shared/exceptions/domain.exception';
import { NotFoundException } from '@/shared/exceptions/not-found.exception';
import { TABLE_LOOKUP } from '@/modules/order/application/ports/tokens';
import { TableLookupPort } from '@/modules/order/application/ports/table-lookup.port';
import { ServiceCallStatus } from '../domain/enums/service-call-status.enum';
import { ServiceCallType } from '../domain/enums/service-call-type.enum';
import { ServiceCallCreatedEvent } from '../domain/events/service-call-created.event';
import { ServiceCallStatusChangedEvent } from '../domain/events/service-call-status-changed.event';
import { ServiceCallResult } from './results/service-call.result';

const VALID_WAITER_REASONS = new Set(['water', 'bread', 'sauce', 'assistance', 'other']);

const STATUS_TRANSITIONS: Record<ServiceCallStatus, ServiceCallStatus[]> = {
  [ServiceCallStatus.WAITING]: [ServiceCallStatus.ACCEPTED, ServiceCallStatus.COMPLETED],
  [ServiceCallStatus.ACCEPTED]: [ServiceCallStatus.COMPLETED],
  [ServiceCallStatus.COMPLETED]: [],
};

@Injectable()
export class ServiceCallService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(TABLE_LOOKUP)
    private readonly tableLookup: TableLookupPort,
    private readonly eventPublisher: DomainEventPublisher,
  ) {}

  async createPublic(input: {
    tableToken: string;
    type: ServiceCallType;
    reason?: string | null;
  }): Promise<ServiceCallResult> {
    const table = await this.tableLookup.findActiveByToken(input.tableToken.trim());
    if (!table) {
      throw new NotFoundException('Table', input.tableToken);
    }

    if (input.type === ServiceCallType.WAITER) {
      const reason = input.reason?.trim().toLowerCase();
      if (!reason || !VALID_WAITER_REASONS.has(reason)) {
        throw new DomainException(
          'Valid waiter reason is required',
          'SERVICE_CALL_REASON_REQUIRED',
          400,
        );
      }
    }

    const tableRecord = await this.prisma.table.findFirst({
      where: { id: table.tableId, restaurantId: table.restaurantId },
      select: { name: true },
    });

    const reason =
      input.type === ServiceCallType.BILL
        ? null
        : input.reason?.trim().toLowerCase() ?? null;

    const record = await this.prisma.serviceCall.create({
      data: {
        restaurantId: table.restaurantId,
        tableId: table.tableId,
        type: input.type === ServiceCallType.BILL ? 'BILL' : 'WAITER',
        reason,
        status: 'WAITING',
      },
      include: {
        table: { select: { name: true } },
      },
    });

    const result = this.toResult(record, tableRecord?.name ?? 'Masa');

    this.eventPublisher.publish(
      new ServiceCallCreatedEvent({
        serviceCallId: result.id,
        restaurantId: result.restaurantId,
        tableId: result.tableId,
        tableName: result.tableName,
        type: result.type,
        reason: result.reason,
        status: result.status,
      }),
    );

    return result;
  }

  async list(restaurantId: string, status?: ServiceCallStatus): Promise<ServiceCallResult[]> {
    const records = await this.prisma.serviceCall.findMany({
      where: {
        restaurantId,
        ...(status ? { status: this.toPrismaStatus(status) } : {}),
      },
      include: {
        table: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => this.toResult(record, record.table.name));
  }

  async updateStatus(
    restaurantId: string,
    id: string,
    nextStatus: ServiceCallStatus,
  ): Promise<ServiceCallResult> {
    const existing = await this.prisma.serviceCall.findFirst({
      where: { id, restaurantId },
      include: { table: { select: { name: true } } },
    });

    if (!existing) {
      throw new NotFoundException('ServiceCall', id);
    }

    const currentStatus = this.fromPrismaStatus(existing.status);
    const allowed = STATUS_TRANSITIONS[currentStatus];

    if (!allowed.includes(nextStatus)) {
      throw new DomainException(
        `Cannot transition service call from '${currentStatus}' to '${nextStatus}'`,
        'SERVICE_CALL_INVALID_STATUS_TRANSITION',
        400,
      );
    }

    const record = await this.prisma.serviceCall.update({
      where: { id },
      data: { status: this.toPrismaStatus(nextStatus) },
      include: { table: { select: { name: true } } },
    });

    const result = this.toResult(record, record.table.name);

    this.eventPublisher.publish(
      new ServiceCallStatusChangedEvent({
        serviceCallId: result.id,
        restaurantId: result.restaurantId,
        tableId: result.tableId,
        tableName: result.tableName,
        type: result.type,
        reason: result.reason,
        previousStatus: currentStatus,
        newStatus: nextStatus,
      }),
    );

    return result;
  }

  private toResult(
    record: {
      id: string;
      restaurantId: string;
      tableId: string;
      type: 'BILL' | 'WAITER';
      reason: string | null;
      status: 'WAITING' | 'ACCEPTED' | 'COMPLETED';
      createdAt: Date;
      updatedAt: Date;
    },
    tableName: string,
  ): ServiceCallResult {
    return {
      id: record.id,
      restaurantId: record.restaurantId,
      tableId: record.tableId,
      tableName,
      type: record.type === 'BILL' ? ServiceCallType.BILL : ServiceCallType.WAITER,
      reason: record.reason,
      status: this.fromPrismaStatus(record.status),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private fromPrismaStatus(status: 'WAITING' | 'ACCEPTED' | 'COMPLETED'): ServiceCallStatus {
    const map: Record<'WAITING' | 'ACCEPTED' | 'COMPLETED', ServiceCallStatus> = {
      WAITING: ServiceCallStatus.WAITING,
      ACCEPTED: ServiceCallStatus.ACCEPTED,
      COMPLETED: ServiceCallStatus.COMPLETED,
    };
    return map[status];
  }

  private toPrismaStatus(status: ServiceCallStatus): 'WAITING' | 'ACCEPTED' | 'COMPLETED' {
    const map: Record<ServiceCallStatus, 'WAITING' | 'ACCEPTED' | 'COMPLETED'> = {
      [ServiceCallStatus.WAITING]: 'WAITING',
      [ServiceCallStatus.ACCEPTED]: 'ACCEPTED',
      [ServiceCallStatus.COMPLETED]: 'COMPLETED',
    };
    return map[status];
  }
}
