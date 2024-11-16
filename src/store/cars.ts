import { create } from 'zustand';
import api from '../lib/axios';
import { Car, CarFormData } from '../types/car';

interface CarsState {
  cars: Car[];
  loading: boolean;
  error: string | null;
  searchQuery: string;
  fetchCars: () => Promise<void>;
  searchCars: (query: string, tags?: string[]) => Promise<void>;
  addCar: (data: CarFormData) => Promise<Car>;
  updateCar: (id: string, data: Partial<CarFormData>) => Promise<Car>;
  deleteCar: (id: string) => Promise<void>;
}

export const useCarsStore = create<CarsState>((set) => ({
  cars: [],
  loading: false,
  error: null,
  searchQuery: '',

  fetchCars: async () => {
    try {
      set({ loading: true, error: null });
      const { data } = await api.get<Car[]>('/cars');
      set({ cars: data, loading: false });
    } catch (error) {
      set({ error: 'Failed to fetch cars', loading: false });
      throw error;
    }
  },

  searchCars: async (query: string, tags: string[] = []) => {
    try {
      set({ loading: true, error: null, searchQuery: query });
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      if (tags.length > 0) params.append('tags', tags.join(','));
      
      const { data } = await api.get<Car[]>(`/cars/search?${params.toString()}`);
      set({ cars: data, loading: false });
    } catch (error) {
      set({ error: 'Failed to search cars', loading: false });
      throw error;
    }
  },

  addCar: async (carData: CarFormData) => {
    try {
      const formData = new FormData();
      formData.append('title', carData.title.trim());
      formData.append('description', carData.description.trim());
      formData.append('tags', JSON.stringify(carData.tags.map(tag => tag.trim())));
      
      carData.images.forEach((image) => {
        formData.append('images', image);
      });

      const { data } = await api.post<Car>('/cars', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      set((state) => ({ cars: [...state.cars, data] }));
      return data;
    } catch (error) {
      throw new Error('Failed to add car');
    }
  },

  updateCar: async (id: string, carData: Partial<CarFormData>) => {
    try {
      const formData = new FormData();
      if (carData.title) formData.append('title', carData.title.trim());
      if (carData.description) formData.append('description', carData.description.trim());
      if (carData.tags) formData.append('tags', JSON.stringify(carData.tags.map(tag => tag.trim())));
      if (carData.images) {
        carData.images.forEach((image) => {
          formData.append('images', image);
        });
      }

      const { data } = await api.put<Car>(`/cars/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      set((state) => ({
        cars: state.cars.map((car) => (car.id === id ? data : car)),
      }));
      return data;
    } catch (error) {
      throw new Error('Failed to update car');
    }
  },

  deleteCar: async (id: string) => {
    try {
      await api.delete(`/cars/${id}`);
      set((state) => ({
        cars: state.cars.filter((car) => car.id !== id),
      }));
    } catch (error) {
      throw new Error('Failed to delete car');
    }
  },
}));