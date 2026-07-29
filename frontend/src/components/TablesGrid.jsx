import { TABLE_STATUSES } from '../constants/statuses';

export default function TablesGrid({ tables, selectedTable, onSelectTable }) {
  return (
    <section className="tables-section" aria-label="Selección de mesa">
      <h2>Mesas</h2>
      <div className="tables-grid" role="group" aria-label="Lista de mesas">
        {tables.map((table) => (
          <button
            key={table._id}
            className={`table-card ${table.status} ${selectedTable === table.number ? 'selected' : ''}`}
            onClick={() => onSelectTable(table.number)}
            aria-label={`Mesa ${table.number}, ${table.capacity} personas, ${TABLE_STATUSES[table.status]}`}
            aria-pressed={selectedTable === table.number}
          >
            <span className="table-number">{table.number}</span>
            <span className="table-capacity">{table.capacity} pers.</span>
            <span className={`table-status ${table.status}`}>
              {TABLE_STATUSES[table.status]}
            </span>
          </button>
        ))}
      </div>
      {selectedTable && (
        <p className="selected-hint" aria-live="polite">
          Mesa {selectedTable} seleccionada
        </p>
      )}
    </section>
  );
}
