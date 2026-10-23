import {
  ObjectLiteral,
  SelectQueryBuilder,
} from 'typeorm';

export function applyFilter<T extends ObjectLiteral>(
  queryBuilder: SelectQueryBuilder<T>,
  filters: Record<string, unknown>,
  allowedFilters: Record<string, string>,
): SelectQueryBuilder<T> {
  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === null) {
      continue;
    }

    const column = allowedFilters[key];

    if (!column) {
      continue;
    }

    queryBuilder.andWhere(`${column} = :${key}`, {
      [key]: value,
    });
  }

  return queryBuilder;
}