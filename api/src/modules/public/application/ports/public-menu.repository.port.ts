export interface PublicMenuItemPriceReadModel {
  amountMinor: string;
  currencyCode: string;
}

export interface PublicMenuItemReadModel {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: PublicMenuItemPriceReadModel;
}

export interface PublicMenuCategoryReadModel {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  items: PublicMenuItemReadModel[];
}

export interface PublicMenuReadModel {
  restaurantName: string;
  tableId: string;
  tableName: string;
  categories: PublicMenuCategoryReadModel[];
}

export interface PublicMenuRepositoryPort {
  findByTableToken(tableToken: string): Promise<PublicMenuReadModel | null>;
}
