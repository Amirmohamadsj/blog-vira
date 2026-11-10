import { ObjectLiteral,SelectQueryBuilder } from "typeorm";
import { applySearch } from '../query/search/apply-search.js';
import { applyFilter } from '../query/filter/apply-filter.js';
import { applySort } from '../query/sort/apply-sort.js';


export interface QueryOptions {
    search?: string;
    filters?: Record<string, unknown>;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

export interface QueryConfig {
    searchColumns?: string[];
    allowedFilters?: Record<string, string>;
    allowedSorts?: Record<string, string>;
}

export function applyQueryOptions<T extends ObjectLiteral>(
    queryBuilder : SelectQueryBuilder<T>,
    options : QueryOptions,
    config : QueryConfig
):SelectQueryBuilder<T>{
    if(config.searchColumns?.length){
        applySearch(
            queryBuilder,
            options.search,
            config.searchColumns,
        );
    }

    if(config.allowedFilters){
        applyFilter(
            queryBuilder,
            options.filters ?? {},
            config.allowedFilters,
        );
    }

    if (config.allowedSorts) {
        applySort(
        queryBuilder,
        options.sortBy,
        options.sortOrder,
        config.allowedSorts,
        );
    }

    return queryBuilder;
}