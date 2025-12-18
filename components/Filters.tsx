'use client'

interface FiltersProps {
  filters: {
    gender: string
    color: string
    maxPrice: number
  }
  setFilters: (filters: any) => void
}

export default function Filters({ filters, setFilters }: FiltersProps) {
  return (
    <div className="flex flex-wrap justify-center items-center gap-4 py-8 px-4">
      <select
        value={filters.gender}
        onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
        className="px-4 py-2 rounded-full bg-gray-800 text-gold border-none outline-none"
      >
        <option value="all">All Genders</option>
        <option value="Men">Men</option>
        <option value="Women">Women</option>
        <option value="Kids">Kids</option>
      </select>

      <select
        value={filters.color}
        onChange={(e) => setFilters({ ...filters, color: e.target.value })}
        className="px-4 py-2 rounded-full bg-gray-800 text-gold border-none outline-none"
      >
        <option value="all">All Colors</option>
        <option value="gold">Gold</option>
        <option value="red">Red</option>
        <option value="blue">Blue</option>
        <option value="green">Green</option>
        <option value="black">Black</option>
      </select>

      <div className="flex items-center gap-2">
        <label className="text-gold-light">Max Price: </label>
        <span className="text-gold-light">${filters.maxPrice}</span>
        <input
          type="range"
          min="50"
          max="250"
          step="10"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
          className="w-32"
        />
      </div>
    </div>
  )
}

