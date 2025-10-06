function Table({ children, className = "" }) {
  return (
    <div className="overflow-x-auto">
      <table className={`w-full ${className}`}>{children}</table>
    </div>
  );
}

function TableHeader({ children }) {
  return (
    <thead className="bg-slate-700 border-b border-slate-600">
      <tr>{children}</tr>
    </thead>
  );
}

function TableHeaderCell({ children, className = "", align = "left" }) {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <th
      className={`px-6 py-3 text-xs font-medium text-slate-300 uppercase tracking-wider ${alignClass[align]} ${className}`}
    >
      {children}
    </th>
  );
}

function TableBody({ children }) {
  return (
    <tbody className="bg-slate-800 divide-y divide-slate-700">{children}</tbody>
  );
}

function TableRow({ children, onClick, className = "" }) {
  const clickableClass = onClick
    ? "cursor-pointer hover:bg-slate-700 transition-colors"
    : "";

  return (
    <tr onClick={onClick} className={`${clickableClass} ${className}`}>
      {children}
    </tr>
  );
}

function TableCell({ children, className = "", align = "left" }) {
  const alignClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  };

  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-slate-300 ${alignClass[align]} ${className}`}
    >
      {children}
    </td>
  );
}

function TableEmpty({ children, colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center">
        <div className="flex flex-col items-center justify-center text-slate-400">
          <svg
            className="w-12 h-12 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <p className="text-lg font-medium">
            {children || "No data available"}
          </p>
        </div>
      </td>
    </tr>
  );
}

// Attach sub-components
Table.Header = TableHeader;
Table.HeaderCell = TableHeaderCell;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.Empty = TableEmpty;

export default Table;
