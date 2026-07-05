import { randomUUID } from 'node:crypto';

export const RESTAURANT_ID = '660e8400-e29b-41d4-a716-446655440001';

const TABLES = [
  { id: '660e8400-e29b-41d4-a716-446655440010', token: 'qr-masa-1', name: 'Masa 1' },
  { id: '660e8400-e29b-41d4-a716-446655440011', token: 'qr-masa-2', name: 'Masa 2' },
  { id: '660e8400-e29b-41d4-a716-446655440012', token: 'qr-masa-3', name: 'Masa 3' },
  { id: '660e8400-e29b-41d4-a716-446655440013', token: 'qr-masa-4', name: 'Masa 4' },
];

const CATEGORIES = [
  {
    id: '660e8400-e29b-41d4-a716-446655441001',
    slug: 'baslangiclar',
    name: 'Başlangıçlar',
    description: 'Günün çorbaları ve mezeler',
    icon: '🥗',
    color: '#22c55e',
    displayOrder: 0,
  },
  {
    id: '660e8400-e29b-41d4-a716-446655441002',
    slug: 'ana-yemekler',
    name: 'Ana Yemekler',
    description: 'Izgara ve kebap çeşitleri',
    icon: '🍽️',
    color: '#ef4444',
    displayOrder: 1,
  },
  {
    id: '660e8400-e29b-41d4-a716-446655441003',
    slug: 'icecekler',
    name: 'İçecekler',
    description: 'Soğuk ve sıcak içecekler',
    icon: '🥤',
    color: '#3b82f6',
    displayOrder: 2,
  },
  {
    id: '660e8400-e29b-41d4-a716-446655441004',
    slug: 'tatlilar',
    name: 'Tatlılar',
    description: 'Geleneksel tatlılar',
    icon: '🍰',
    color: '#a855f7',
    displayOrder: 3,
  },
];

const MENU_ITEMS = [
  {
    id: '660e8400-e29b-41d4-a716-446655442001',
    sku: 'CORBA-MERCIMEK',
    slug: 'mercimek-corbasi',
    name: 'Mercimek Çorbası',
    description: 'Tereyağlı, limonlu klasik mercimek çorbası',
    categorySlug: 'baslangiclar',
    priceMinor: 9500n,
    prepSeconds: 600,
  },
  {
    id: '660e8400-e29b-41d4-a716-446655442002',
    sku: 'MEZE-HUMUS',
    slug: 'humus',
    name: 'Humus',
    description: 'Zeytinyağlı, tahinli humus',
    categorySlug: 'baslangiclar',
    priceMinor: 12000n,
    prepSeconds: 300,
  },
  {
    id: '660e8400-e29b-41d4-a716-446655442003',
    sku: 'KOEFTE-IZGARA',
    slug: 'izgara-kofte',
    name: 'Izgara Köfte',
    description: 'Dana kıyma, közlenmiş biber ve domates ile',
    categorySlug: 'ana-yemekler',
    priceMinor: 25000n,
    prepSeconds: 900,
  },
  {
    id: '660e8400-e29b-41d4-a716-446655442004',
    sku: 'TAVUK-SIS',
    slug: 'tavuk-sis',
    name: 'Tavuk Şiş',
    description: 'Marine edilmiş tavuk göğsü, pilav ve salata',
    categorySlug: 'ana-yemekler',
    priceMinor: 24000n,
    prepSeconds: 840,
  },
  {
    id: '660e8400-e29b-41d4-a716-446655442005',
    sku: 'LAHMACUN',
    slug: 'lahmacun',
    name: 'Lahmacun',
    description: 'Taş fırında ince hamur, kıymalı harç',
    categorySlug: 'ana-yemekler',
    priceMinor: 8500n,
    prepSeconds: 720,
  },
  {
    id: '660e8400-e29b-41d4-a716-446655442006',
    sku: 'ADANA-KEBAP',
    slug: 'adana-kebap',
    name: 'Adana Kebap',
    description: 'Acılı kıyma kebap, közlenmiş sebzeler',
    categorySlug: 'ana-yemekler',
    priceMinor: 32000n,
    prepSeconds: 960,
  },
  {
    id: '660e8400-e29b-41d4-a716-446655442007',
    sku: 'AYRAN',
    slug: 'ayran',
    name: 'Ayran',
    description: 'Ev yapımı yoğurt ayranı',
    categorySlug: 'icecekler',
    priceMinor: 3500n,
    prepSeconds: 60,
  },
  {
    id: '660e8400-e29b-41d4-a716-446655442008',
    sku: 'KOLA',
    slug: 'kola',
    name: 'Kola',
    description: '330 ml',
    categorySlug: 'icecekler',
    priceMinor: 4500n,
    prepSeconds: 30,
  },
  {
    id: '660e8400-e29b-41d4-a716-446655442009',
    sku: 'KAHVE-TURK',
    slug: 'turk-kahvesi',
    name: 'Türk Kahvesi',
    description: 'Orta şekerli, lokumlu',
    categorySlug: 'icecekler',
    priceMinor: 5500n,
    prepSeconds: 420,
  },
  {
    id: '660e8400-e29b-41d4-a716-446655442010',
    sku: 'TATLI-KUNEFE',
    slug: 'kunefe',
    name: 'Künefe',
    description: 'Antep fıstıklı, sıcak servis',
    categorySlug: 'tatlilar',
    priceMinor: 18000n,
    prepSeconds: 600,
  },
  {
    id: '660e8400-e29b-41d4-a716-446655442011',
    sku: 'TATLI-SUTLAC',
    slug: 'sutlac',
    name: 'Sütlaç',
    description: 'Fırında karamelize üstlü',
    categorySlug: 'tatlilar',
    priceMinor: 9500n,
    prepSeconds: 300,
  },
  {
    id: '660e8400-e29b-41d4-a716-446655442012',
    sku: 'SALATA-COBAN',
    slug: 'coban-salata',
    name: 'Çoban Salata',
    description: 'Domates, salatalık, soğan, maydanoz',
    categorySlug: 'baslangiclar',
    priceMinor: 7500n,
    prepSeconds: 240,
  },
];

function minutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000);
}

async function upsertCategory(prisma, category) {
  const existing = await prisma.menuCategory.findFirst({
    where: { restaurantId: RESTAURANT_ID, slug: category.slug },
  });
  const id = existing?.id ?? category.id;

  await prisma.menuCategory.upsert({
    where: { id },
    create: {
      id,
      restaurantId: RESTAURANT_ID,
      name: category.name,
      slug: category.slug,
      description: category.description,
      icon: category.icon,
      color: category.color,
      displayOrder: category.displayOrder,
      status: 'ACTIVE',
    },
    update: {
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      displayOrder: category.displayOrder,
      status: 'ACTIVE',
    },
  });

  return id;
}

async function upsertMenuItem(prisma, item, categoryId) {
  const existing = await prisma.menuItem.findFirst({
    where: {
      restaurantId: RESTAURANT_ID,
      OR: [{ sku: item.sku }, { slug: item.slug }],
    },
  });
  const itemId = existing?.id ?? item.id;

  await prisma.menuItem.upsert({
    where: { id: itemId },
    create: {
      id: itemId,
      restaurantId: RESTAURANT_ID,
      name: item.name,
      sku: item.sku,
      slug: item.slug,
      description: item.description,
      status: 'ACTIVE',
      preparationTimeSeconds: item.prepSeconds,
      prices: {
        create: {
          id: randomUUID(),
          restaurantId: RESTAURANT_ID,
          amountMinor: item.priceMinor,
          currencyCode: 'TRY',
          status: 'ACTIVE',
        },
      },
    },
    update: {
      name: item.name,
      description: item.description,
      status: 'ACTIVE',
      preparationTimeSeconds: item.prepSeconds,
    },
  });

  const existingPrice = await prisma.menuPrice.findFirst({
    where: { menuItemId: itemId, status: 'ACTIVE' },
  });

  if (existingPrice) {
    await prisma.menuPrice.update({
      where: { id: existingPrice.id },
      data: { amountMinor: item.priceMinor },
    });
  }

  await prisma.menuCategoryPlacement.upsert({
    where: {
      categoryId_menuItemId: {
        categoryId,
        menuItemId: itemId,
      },
    },
    create: {
      id: randomUUID(),
      restaurantId: RESTAURANT_ID,
      categoryId,
      menuItemId: itemId,
      displayOrder: 0,
      isPrimary: true,
    },
    update: {
      isPrimary: true,
    },
  });

  return { ...item, id: itemId };
}

async function upsertDemoOrder(prisma, { id, tableId, status, createdAt, lines }) {
  const subtotal = lines.reduce(
    (sum, line) => sum + line.unitPriceMinor * BigInt(line.quantity),
    0n,
  );

  const existing = await prisma.order.findUnique({ where: { id } });

  if (existing) {
    await prisma.order.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });
    return;
  }

  await prisma.order.create({
    data: {
      id,
      restaurantId: RESTAURANT_ID,
      tableId,
      status,
      subtotalMinor: subtotal,
      totalMinor: subtotal,
      createdAt,
      updatedAt: createdAt,
      lines: {
        create: lines.map((line, index) => ({
          id: randomUUID(),
          restaurantId: RESTAURANT_ID,
          lineNumber: index + 1,
          quantity: line.quantity,
          unitPriceMinor: line.unitPriceMinor,
          lineTotalMinor: line.unitPriceMinor * BigInt(line.quantity),
          currencyCode: 'TRY',
          menuItemId: line.menuItemId,
          sku: line.sku,
          name: line.name,
          itemType: 'SIMPLE',
          snapshotCapturedAt: createdAt,
        })),
      },
    },
  });
}

/**
 * Idempotent demo dataset for RC1 — restaurant, menu, tables, and orders.
 */
export async function seedDemoData(prisma) {
  await prisma.restaurant.upsert({
    where: { id: RESTAURANT_ID },
    create: {
      id: RESTAURANT_ID,
      name: 'Lezzet Durağı',
      slug: 'lezzet-duragi',
    },
    update: {
      name: 'Lezzet Durağı',
    },
  });

  const tableByToken = {};

  for (const table of TABLES) {
    const row = await prisma.table.upsert({
      where: { tableToken: table.token },
      create: {
        id: table.id,
        restaurantId: RESTAURANT_ID,
        tableToken: table.token,
        name: table.name,
      },
      update: {
        name: table.name,
      },
    });
    tableByToken[table.token] = row.id;
  }

  const categoryBySlug = {};

  for (const category of CATEGORIES) {
    categoryBySlug[category.slug] = await upsertCategory(prisma, category);
  }

  const itemBySku = {};

  for (const item of MENU_ITEMS) {
    const categoryId = categoryBySlug[item.categorySlug];
    const savedItem = await upsertMenuItem(prisma, item, categoryId);
    itemBySku[item.sku] = savedItem;
  }

  const line = (sku, quantity = 1) => {
    const item = itemBySku[sku];
    return {
      menuItemId: item.id,
      sku: item.sku,
      name: item.name,
      quantity,
      unitPriceMinor: item.priceMinor,
    };
  };

  await upsertDemoOrder(prisma, {
    id: '660e8400-e29b-41d4-a716-446655443001',
    tableId: tableByToken['qr-masa-1'],
    status: 'OPEN',
    createdAt: minutesAgo(12),
    lines: [line('CORBA-MERCIMEK'), line('KOEFTE-IZGARA')],
  });

  await upsertDemoOrder(prisma, {
    id: '660e8400-e29b-41d4-a716-446655443002',
    tableId: tableByToken['qr-masa-2'],
    status: 'IN_KITCHEN',
    createdAt: minutesAgo(22),
    lines: [line('ADANA-KEBAP'), line('AYRAN', 2)],
  });

  await upsertDemoOrder(prisma, {
    id: '660e8400-e29b-41d4-a716-446655443003',
    tableId: tableByToken['qr-masa-3'],
    status: 'PARTIALLY_SERVED',
    createdAt: minutesAgo(18),
    lines: [line('LAHMACUN', 2), line('SALATA-COBAN')],
  });

  await upsertDemoOrder(prisma, {
    id: '660e8400-e29b-41d4-a716-446655443004',
    tableId: tableByToken['qr-masa-4'],
    status: 'OPEN',
    createdAt: minutesAgo(5),
    lines: [line('TAVUK-SIS'), line('KOLA')],
  });

  await upsertDemoOrder(prisma, {
    id: '660e8400-e29b-41d4-a716-446655443005',
    tableId: tableByToken['qr-masa-1'],
    status: 'CLOSED',
    createdAt: minutesAgo(95),
    lines: [line('MEZE-HUMUS'), line('TATLI-SUTLAC')],
  });

  await upsertDemoOrder(prisma, {
    id: '660e8400-e29b-41d4-a716-446655443006',
    tableId: tableByToken['qr-masa-2'],
    status: 'CLOSED',
    createdAt: minutesAgo(26 * 60),
    lines: [line('KOEFTE-IZGARA'), line('KAHVE-TURK', 2), line('TATLI-KUNEFE')],
  });

  return {
    restaurantId: RESTAURANT_ID,
    tableToken: 'qr-masa-1',
    tables: TABLES.length,
    categories: CATEGORIES.length,
    menuItems: MENU_ITEMS.length,
    orders: 6,
  };
}
