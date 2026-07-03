const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'

const ORDER_STATUS_FROM_API = {
  draft: 'pending',
  open: 'pending',
  in_kitchen: 'preparing',
  partially_served: 'ready',
  served: 'served',
  bill_requested: 'served',
  payment_in_progress: 'served',
  closed: 'completed',
  cancelled: 'cancelled',
  voided: 'cancelled',
}

const ORDER_STATUS_TO_API = {
  pending: 'open',
  preparing: 'in_kitchen',
  ready: 'partially_served',
  served: 'served',
  completed: 'closed',
  cancelled: 'cancelled',
}

export function minorToMajor(amountMinor) {
  return Number(amountMinor || 0) / 100
}

export function majorToMinor(amount) {
  return Math.round(Number(amount) * 100)
}

export function mapCategory(category) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? '',
    icon: category.icon || '🍽️',
    color: category.color || '#6366f1',
    displayOrder: category.displayOrder ?? 0,
    status: category.status,
  }
}

export function mapMenuItem(item, categoryId = null) {
  const preparationMinutes = item.preparationTimeSeconds
    ? Math.max(1, Math.ceil(item.preparationTimeSeconds / 60))
    : 10

  return {
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    price: minorToMajor(item.basePriceMinor),
    categoryId,
    isAvailable: item.status === 'active',
    status: item.status,
    image: item.imageUrl || DEFAULT_IMAGE,
    preparationTime: preparationMinutes,
    sku: item.sku,
    slug: item.slug,
    itemType: item.itemType,
    currencyCode: item.currencyCode || 'TRY',
  }
}

export function mapPublicMenuItem(item, categoryId) {
  return {
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    price: minorToMajor(item.price?.amountMinor),
    categoryId,
    isAvailable: true,
    image: item.imageUrl || DEFAULT_IMAGE,
    preparationTime: 10,
  }
}

export function mapOrder(order) {
  const lines = order.lines || []

  return {
    id: order.id,
    tableId: order.tableId,
    restaurantId: order.restaurantId,
    status: ORDER_STATUS_FROM_API[order.status] || order.status,
    total: minorToMajor(order.totalMinor),
    subtotal: minorToMajor(order.subtotalMinor),
    currencyCode: order.currencyCode || 'TRY',
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    version: order.version,
    items: lines.map((line) => ({
      id: line.id,
      menuItemId: line.menuItemId,
      quantity: line.quantity,
      price: minorToMajor(line.unitPriceMinor),
      name: line.name,
      sku: line.sku,
      lineTotal: minorToMajor(line.lineTotalMinor),
    })),
  }
}

export function mapPublicOrder(order) {
  const mapped = mapOrder(order)
  return {
    id: mapped.id,
    tableId: mapped.tableId,
    status: mapped.status,
    total: mapped.total,
    currencyCode: mapped.currencyCode,
    createdAt: mapped.createdAt,
    items: mapped.items,
  }
}

export function toApiOrderStatus(uiStatus) {
  return ORDER_STATUS_TO_API[uiStatus] || uiStatus
}
