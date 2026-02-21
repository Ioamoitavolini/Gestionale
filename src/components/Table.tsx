import React from 'react';
import styles from './Table.module.css';

interface TableColumn {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface TableProps {
  columns: TableColumn[];
  data: any[];
  onRowClick?: (row: any) => void;
  actions?: {
    edit?: (row: any) => void;
    delete?: (row: any) => void;
  };
}

export default function Table({
  columns,
  data,
  onRowClick,
  actions,
}: TableProps) {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.label}</th>
            ))}
            {actions && <th>Azioni</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className={styles.empty}>
                Nessun dato disponibile
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={idx}
                onClick={() => onRowClick?.(row)}
                className={onRowClick ? styles.clickable : ''}
              >
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
                {actions && (
                  <td className={styles.actions}>
                    {actions.edit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          actions.edit?.(row);
                        }}
                        className={styles.editBtn}
                        title="Modifica"
                      >
                        ✏️
                      </button>
                    )}
                    {actions.delete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('Sei sicuro?')) {
                            actions.delete?.(row);
                          }
                        }}
                        className={styles.deleteBtn}
                        title="Elimina"
                      >
                        🗑️
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
