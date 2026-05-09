export function DataTable({ columns, rows, sortBy, order, onSort }) {
  const nextOrder = (column) => (sortBy === column && order === "asc" ? "desc" : "asc");
  return (
    <div className="tableWrap">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>
                {column.sortable ? (
                  <button className="sort" onClick={() => onSort(column.key, nextOrder(column.key))}>
                    {column.label} {sortBy === column.key ? (order === "asc" ? "↑" : "↓") : ""}
                  </button>
                ) : column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
