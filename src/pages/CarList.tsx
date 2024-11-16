import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, X } from 'lucide-react';
import { useCarsStore } from '../store/cars';
import { toast } from 'react-hot-toast';
import { useDebounce } from '../hooks/useDebounce';

export default function CarList() {
  const { cars, loading, error, fetchCars, searchCars } = useCarsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  useEffect(() => {
    fetchCars().catch(() => {
      toast.error('Failed to fetch cars');
    });
  }, [fetchCars]);

  useEffect(() => {
    if (debouncedSearchTerm || activeFilters.length > 0) {
      searchCars(debouncedSearchTerm, activeFilters).catch(() => {
        toast.error('Search failed');
      });
    } else {
      fetchCars().catch(() => {
        toast.error('Failed to fetch cars');
      });
    }
  }, [debouncedSearchTerm, activeFilters, searchCars, fetchCars]);

  // Get unique tags from all cars
  const allTags = Array.from(new Set(cars.flatMap(car => car.tags)));

  const toggleFilter = (tag: string) => {
    setActiveFilters(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearSearch = () => {
    setSearchTerm('');
    setActiveFilters([]);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <div className="relative flex-1 max-w-xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search cars by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10 py-2 w-full border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            {(searchTerm || activeFilters.length > 0) && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          <Link
            to="/cars/add"
            className="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Car
          </Link>
        </div>

        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleFilter(tag)}
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  activeFilters.includes(tag)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tag}
                {activeFilters.includes(tag) && (
                  <X className="h-4 w-4 ml-1" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="text-center text-red-600 py-4">
          <p>{error}</p>
          <button
            onClick={() => fetchCars()}
            className="mt-2 text-indigo-600 hover:text-indigo-500"
          >
            Try again
          </button>
        </div>
      )}

      {!error && cars.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-500 mb-4">
            {searchTerm || activeFilters.length > 0 
              ? 'No cars found matching your search criteria' 
              : 'No cars added yet'}
          </p>
          {!searchTerm && activeFilters.length === 0 && (
            <Link
              to="/cars/add"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Car
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cars.map((car) => (
          <Link
            key={car.id}
            to={`/cars/${car.id}`}
            className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={car.images[0]}
                alt={car.title}
                className="object-cover w-full h-48 rounded-t-lg"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{car.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-2 mb-3">{car.description}</p>
              <div className="flex flex-wrap gap-1">
                {car.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      activeFilters.includes(tag)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-indigo-100 text-indigo-800'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}