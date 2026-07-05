import { ApiResponseDto } from '@/shared/dto/api-response.dto';
import { PublicMenuResponseDto } from '../dto/responses/public-menu.response.dto';

export class PublicMenuApiExamples {
  static readonly successEnvelope = {
    success: true,
    statusCode: 200,
    message: 'Success',
    timestamp: '2026-07-03T10:00:00.000Z',
    path: '/api/v1/public/menu/qr-abc123',
  };

  static readonly menu: PublicMenuResponseDto = {
    restaurantName: 'Lezzet Durağı',
    tableId: '660e8400-e29b-41d4-a716-446655440010',
    tableName: 'Masa 5',
    categories: [
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        name: 'Ana Yemekler',
        description: 'Restoranın ana yemek kategorisi',
        icon: 'utensils',
        items: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Izgara Köfte',
            description: 'Dana kıyma ile hazırlanan ızgara köfte',
            imageUrl: 'https://cdn.example.com/items/kofte.jpg',
            price: {
              amountMinor: '25000',
              currencyCode: 'TRY',
            },
          },
        ],
      },
    ],
  };

  static readonly menuResponse: ApiResponseDto<PublicMenuResponseDto> = {
    ...PublicMenuApiExamples.successEnvelope,
    data: PublicMenuApiExamples.menu,
  };

  static readonly errorEnvelope = {
    success: false,
    timestamp: '2026-07-03T10:00:00.000Z',
    path: '/api/v1/public/menu/qr-abc123',
  };
}
