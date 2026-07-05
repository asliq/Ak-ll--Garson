import { PublicMenuReadModel } from '../ports/public-menu.repository.port';

export class PublicMenuItemPriceResult {
  amountMinor!: string;
  currencyCode!: string;
}

export class PublicMenuItemResult {
  id!: string;
  name!: string;
  description!: string | null;
  imageUrl!: string | null;
  price!: PublicMenuItemPriceResult;
}

export class PublicMenuCategoryResult {
  id!: string;
  name!: string;
  description!: string | null;
  icon!: string | null;
  items!: PublicMenuItemResult[];
}

export class GetPublicMenuResult {
  restaurantName!: string;
  tableId!: string;
  tableName!: string;
  categories!: PublicMenuCategoryResult[];

  static fromReadModel(model: PublicMenuReadModel): GetPublicMenuResult {
    return {
      restaurantName: model.restaurantName,
      tableId: model.tableId,
      tableName: model.tableName,
      categories: model.categories.map((category) => ({
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        items: category.items.map((item) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          imageUrl: item.imageUrl,
          price: {
            amountMinor: item.price.amountMinor,
            currencyCode: item.price.currencyCode,
          },
        })),
      })),
    };
  }
}
