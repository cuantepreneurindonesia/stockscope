// Module augmentation for react-table v7 plugin interfaces.
// react-table v7 ships no built-in TypeScript declarations. The @types/react-table
// community package provides base types, but plugin-specific properties (sortBy,
// pageSize, isSorted, getSortByToggleProps, etc.) are opt-in via module augmentation.
// This file merges useSortBy and usePagination plugin interfaces into the core types
// so that TypeScript can resolve them without implicit `any` errors.
// Reference: https://github.com/DefinitelyTyped/DefinitelyTyped/tree/master/types/react-table#configuration-using-declaration-merging

import {
  UseSortByColumnProps,
  UseSortByInstanceProps,
  UseSortByOptions,
  UseSortByState,
  UsePaginationInstanceProps,
  UsePaginationOptions,
  UsePaginationState,
} from 'react-table';

declare module 'react-table' {
  // Merge useSortBy and usePagination options into TableOptions
  interface TableOptions<D extends object>
    extends UseSortByOptions<D>,
      UsePaginationOptions<D> {}

  // Merge useSortBy and usePagination state into TableState
  interface TableState<D extends object>
    extends UseSortByState<D>,
      UsePaginationState<D> {}

  // Merge useSortBy column properties (isSorted, isSortedDesc, getSortByToggleProps)
  interface ColumnInstance<D extends object> extends UseSortByColumnProps<D> {}

  // Merge useSortBy instance props (rows, sortedRows) and usePagination instance
  // props (page, pageCount, nextPage, previousPage, etc.) into TableInstance
  interface TableInstance<D extends object>
    extends UseSortByInstanceProps<D>,
      UsePaginationInstanceProps<D> {}
}
