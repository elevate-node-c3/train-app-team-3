import {
  toCatalogApplicationData,
  toCatalogGrpcMessage,
} from './catalog-message.mapper';

describe('catalog message mapping', () => {
  it('converts gateway snake-case payloads to proto camel-case fields', () => {
    expect(
      toCatalogGrpcMessage({
        name_ar: 'محطة',
        type_of_train_id: 'train-type-id',
        alternative_names: ['Central'],
        unused_field: undefined,
      }),
    ).toEqual({
      nameAr: 'محطة',
      typeOfTrainId: 'train-type-id',
      alternativeNames: ['Central'],
    });
  });

  it('maps generated request names to catalog application DTO names', () => {
    expect(
      toCatalogApplicationData({
        nameAr: 'محطة',
        nameEn: 'Station',
        cityId: 'city-id',
      }),
    ).toEqual({
      name_ar: 'محطة',
      name_en: 'Station',
      cityId: 'city-id',
    });
  });

  it('converts catalog response fields and dates to proto message shape', () => {
    const createdAt = new Date('2025-01-02T03:04:05.000Z');

    expect(
      toCatalogGrpcMessage({
        stations: [
          {
            name_ar: 'محطة',
            governorate_id: 'governorate-id',
            created_at: createdAt,
          },
        ],
      }),
    ).toEqual({
      stations: [
        {
          nameAr: 'محطة',
          governorateId: 'governorate-id',
          createdAt: '2025-01-02T03:04:05.000Z',
        },
      ],
    });
  });
});
