export class CreateOrderLineCommand {
  constructor(
    public readonly menuItemId: string,
    public readonly quantity: number,
  ) {}
}

export class CreateOrderCommand {
  constructor(
    public readonly tableToken: string,
    public readonly lines: CreateOrderLineCommand[],
    public readonly notes?: string | null,
  ) {}
}
