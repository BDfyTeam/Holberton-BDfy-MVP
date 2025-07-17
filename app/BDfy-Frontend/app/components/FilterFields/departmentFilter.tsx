interface DepartmentFilterProps {
    className?: string;
    onStatusChange: (status: string) => void;
    currentStatus: string;
}

export default function DepartmentFilter({ className ="", currentStatus, onStatusChange}: DepartmentFilterProps){
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
                Filtrar por departamento:
            </label>
            <select 
                id="status-filter" 
                name="status"
                value={currentStatus}
                onChange={handleStatusChange}
                className="status-select px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
            <option value="Ninguno">Ninguno</option>
            <option value="Artigas">Artigas</option>
            <option value="Canelones">Canelones</option>
            <option value="Cerro Largo">Cerro Largo</option>
            <option value="Colonia">Colonia</option>
            <option value="Durazno">Durazno</option>
            <option value="Flores">Flores</option>
            <option value="Florida">Florida</option>
            <option value="Lavalleja">Lavalleja</option>
            <option value="Maldonado">Maldonado</option>
            <option value="Montevideo">Montevideo</option>
            <option value="Paysandú">Paysandú</option>
            <option value="Río Negro">Río Negro</option>
            <option value="Rivera">Rivera</option>
            <option value="Rocha">Rocha</option>
            <option value="Salto">Salto</option>
            <option value="San José">San José</option>
            <option value="Soriano">Soriano</option>
            <option value="Tacuarembó">Tacuarembó</option>
            <option value="Treinta y Tres">Treinta y Tres</option>
            </select>
        </div>
    </form>
    </>
    );
}