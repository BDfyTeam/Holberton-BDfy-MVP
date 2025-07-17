interface StatusFilterProps {
    className?: string;
    onStatusChange: (status: string) => void;
    currentStatus: string;
}

export default function StatusFilter({ className ="", currentStatus, onStatusChange}: StatusFilterProps){
    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onStatusChange(e.target.value);
    };
return (
    <>
    <form className={`filter ${className}`}>
        <div className="filter-group flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-white rounded-lg border border-gray-200">
            <label 
                htmlFor="status-filter" 
                className="text-sm font-medium text-gray-700 whitespace-nowrap"
            >
                Filtrar por estado:
            </label>
            <select 
                id="status-filter" 
                name="status"
                value={currentStatus}
                onChange={handleStatusChange}
                className="status-select px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
                <option value="" className="text-gray-600">Todos los estados</option>
                <option value="active" className="text-green-600">Activas</option>
                <option value="closed" className="text-red-600">Cerradas</option>
            </select>
        </div>
    </form>
    </>
    );
}