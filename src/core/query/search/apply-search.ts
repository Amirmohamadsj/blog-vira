import {
  Brackets,
  ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';

export function applySearch<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  search: string | undefined,
  columns: string[],
): SelectQueryBuilder<T> {
  if (!search?.trim() || columns.length === 0) {
    return queryBuilder;
  }

  const searchTerm = search.trim();

  queryBuilder.andWhere(
    new Brackets((qb) => {
      columns.forEach((column, index) => {
        const parameterName = `searchTerm${index}`;

        qb.orWhere(`${column} ILIKE :${parameterName}`, {
          [parameterName]: `%${searchTerm}%`,
        });
      });
    }),
  );

  return queryBuilder;
}
