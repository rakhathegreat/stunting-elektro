import { useMemo, useState } from 'react';

export const usePagination = <T>(items: T[], initialPageSize = 10) => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const currentPage = Math.min(page, totalPages);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, currentPage, pageSize]);

  const goToPage = (nextPage: number) => {
    setPage(() => {
      if (Number.isNaN(nextPage)) {
        return 1;
      }

      if (nextPage < 1) {
        return 1;
      }

      if (nextPage > totalPages) {
        return totalPages;
      }

      return nextPage;
    });
  };

  const nextPage = () => goToPage(currentPage + 1);
  const previousPage = () => goToPage(currentPage - 1);

  const updatePageSize = (size: number) => {
    setPageSize(size);
    setPage(1);
  };

  return {
    page: currentPage,
    pageSize,
    totalPages,
    totalItems,
    items: paginatedItems,
    setPage: goToPage,
    setPageSize: updatePageSize,
    nextPage,
    previousPage,
  };
};
