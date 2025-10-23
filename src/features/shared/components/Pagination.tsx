interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export const Pagination = ({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: PaginationProps) => (
  <div className="flex flex-col gap-4 border-t border-gray-100 px-4 py-4 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-center gap-2">
      <span>Tampilkan</span>
      <select
        className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm"
        value={pageSize}
        onChange={(event) => onPageSizeChange(Number(event.target.value))}
      >
        {pageSizeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span>data per halaman</span>
    </div>
    <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
      <p className="text-sm text-gray-500">
        Menampilkan {Math.min((page - 1) * pageSize + 1, totalItems)}-
        {Math.min(page * pageSize, totalItems)} dari {totalItems} data
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-lg border border-gray-200 px-3 py-1 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Sebelumnya
        </button>
        <span className="text-sm font-medium text-gray-700">
          Halaman {page} dari {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-lg border border-gray-200 px-3 py-1 text-sm font-medium text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Selanjutnya
        </button>
      </div>
    </div>
  </div>
);
