interface TableViewProps {
  data: any[];
}

export default function TableView({ data }: TableViewProps) {

  if (!data || data.length === 0) {
    return <div>No data to display.</div>;
  }

  const columns = Object.keys(data[0]);

  return (
    <div className='space-y-4'>
      <h2>Table View</h2>
      <div className="overflow-y max-h-[400px] border border-gray-600 rounded" style={{height: '400px', overflowY: 'scroll', border: '1px solid #ccc' }}>
        <table className="w-full table-auto" style={{ borderCollapse: 'collapse', width: '100%' }}>
          <thead className="sticky">
            <tr>    
              {columns.map(col => <th key={col} className="px-2 py-1 text-left border-b">{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <tr key={idx}>
                {columns.map(col => <td key={col} className="px-2 py-1 border-b">{row[col]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}