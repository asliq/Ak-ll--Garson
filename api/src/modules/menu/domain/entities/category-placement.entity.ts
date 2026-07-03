import { DomainEvent } from '@/core/events/domain-event.interface';
import { DisplayOrder } from '../value-objects/display-order.vo';

export interface CategoryPlacementProps {
  id: string;
  restaurantId: string;
  categoryId: string;
  menuItemId: string;
  displayOrder: DisplayOrder;
  isPrimary: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string | null;
  updatedBy: string | null;
}

export class CategoryPlacement {
  private readonly domainEvents: DomainEvent[] = [];

  private constructor(private props: CategoryPlacementProps) {}

  static reconstitute(props: CategoryPlacementProps): CategoryPlacement {
    return new CategoryPlacement(props);
  }

  markAsPrimary(actorId?: string | null): void {
    if (this.props.isPrimary) {
      return;
    }
    this.props.isPrimary = true;
    this.touch(actorId);
  }

  unmarkPrimary(actorId?: string | null): void {
    if (!this.props.isPrimary) {
      return;
    }
    this.props.isPrimary = false;
    this.touch(actorId);
  }

  changeDisplayOrder(order: DisplayOrder, actorId?: string | null): void {
    this.props.displayOrder = order;
    this.touch(actorId);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = [...this.domainEvents];
    this.domainEvents.length = 0;
    return events;
  }

  record(event: DomainEvent): void {
    this.domainEvents.push(event);
  }

  get id(): string {
    return this.props.id;
  }

  get restaurantId(): string {
    return this.props.restaurantId;
  }

  get categoryId(): string {
    return this.props.categoryId;
  }

  get menuItemId(): string {
    return this.props.menuItemId;
  }

  get displayOrder(): DisplayOrder {
    return this.props.displayOrder;
  }

  get isPrimary(): boolean {
    return this.props.isPrimary;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get createdBy(): string | null {
    return this.props.createdBy;
  }

  get updatedBy(): string | null {
    return this.props.updatedBy;
  }

  toProps(): CategoryPlacementProps {
    return { ...this.props };
  }

  private touch(actorId?: string | null): void {
    this.props.updatedAt = new Date();
    this.props.updatedBy = actorId ?? this.props.updatedBy;
  }
}
