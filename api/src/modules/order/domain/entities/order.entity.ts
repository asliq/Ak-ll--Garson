import { DomainEvent } from '@/core/events/domain-event.interface';
import { OrderStatus } from '../enums/order-status.enum';
import { OrderInvariants } from '../invariants/order.invariants';
import { OrderStatusChangedEvent } from '../events/order-status-changed.event';
import { OrderLine } from './order-line.entity';

export interface OrderProps {
  id: string;
  restaurantId: string;
  tableId: string;
  status: OrderStatus;
  displayNumber: number | null;
  notes: string | null;
  currencyCode: string;
  subtotalMinor: bigint;
  totalMinor: bigint;
  lines: OrderLine[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  version: number;
}

export class Order {
  private readonly domainEvents: DomainEvent[] = [];

  private constructor(private props: OrderProps) {}

  static reconstitute(props: OrderProps): Order {
    return new Order(props);
  }

  changeStatus(nextStatus: OrderStatus): void {
    OrderInvariants.assertCanTransition(this.props.status, nextStatus);

    const previousStatus = this.props.status;
    this.props.status = nextStatus;
    this.touch();

    this.record(
      new OrderStatusChangedEvent({
        orderId: this.id,
        restaurantId: this.restaurantId,
        tableId: this.tableId,
        previousStatus,
        newStatus: nextStatus,
      }),
    );
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  recordCreatedEvents(): void {
    // Events recorded by factory after construction
  }

  get id(): string {
    return this.props.id;
  }

  get restaurantId(): string {
    return this.props.restaurantId;
  }

  get tableId(): string {
    return this.props.tableId;
  }

  get status(): OrderStatus {
    return this.props.status;
  }

  get displayNumber(): number | null {
    return this.props.displayNumber;
  }

  get notes(): string | null {
    return this.props.notes;
  }

  get currencyCode(): string {
    return this.props.currencyCode;
  }

  get subtotalMinor(): bigint {
    return this.props.subtotalMinor;
  }

  get totalMinor(): bigint {
    return this.props.totalMinor;
  }

  get lines(): readonly OrderLine[] {
    return this.props.lines;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  get version(): number {
    return this.props.version;
  }

  toProps(): OrderProps {
    return {
      ...this.props,
      lines: [...this.props.lines],
    };
  }

  private touch(): void {
    this.props.updatedAt = new Date();
    this.props.version += 1;
  }

  record(event: DomainEvent): void {
    this.domainEvents.push(event);
  }
}
