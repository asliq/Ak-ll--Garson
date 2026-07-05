import { GetPublicMenuQuery } from '../../application/queries/get-public-menu.query';
import { GetPublicMenuResult } from '../../application/results/get-public-menu.result';
import { PublicMenuResponseDto } from '../dto/responses/public-menu.response.dto';

export class PublicMenuPresentationMapper {
  static toQuery(tableToken: string): GetPublicMenuQuery {
    return new GetPublicMenuQuery(tableToken);
  }

  static toResponse(result: GetPublicMenuResult): PublicMenuResponseDto {
    return {
      restaurantName: result.restaurantName,
      tableId: result.tableId,
      tableName: result.tableName,
      categories: result.categories.map((category) => ({
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
