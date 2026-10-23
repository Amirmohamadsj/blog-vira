import {
  ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';

type SortOrder = 'ASC' | 'DESC';

export function applySort<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  sortBy: string | undefined,
  sortOrder: SortOrder | undefined,
  allowedSorts: Record<string, string>,
): SelectQueryBuilder<T> {
  const selectedSort = sortBy ?? 'createdAt';
  const column = allowedSorts[selectedSort];

  if (!column) {
    return queryBuilder;
  }

  const order: SortOrder = sortOrder === 'ASC' ? 'ASC' : 'DESC';

  queryBuilder.orderBy(column, order);

  return queryBuilder;
}