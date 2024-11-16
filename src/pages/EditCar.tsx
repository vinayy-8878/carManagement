import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCarsStore } from '../store/cars';
import CarForm from '../components/CarForm';
import { CarFormData } from '../types/car';
import { useEffect } from 'react';

export default function EditCar() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { cars, fetchCars, updateCar } = useCarsStore();

  useEffect(() => {
    fetchCars();
  }, [fetchCars]);

  const car = cars.find((c) => c.id === id);

  if (!car) {
    return <div>Car not found</div>;
  }

  const handleSubmit = async (data: CarFormData) => {
    try {
      await updateCar(car.id, data);
      toast.success('Car updated successfully');
      navigate(`/cars/${car.id}`);
    } catch (error) {
      toast.error('Failed to update car');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Car</h1>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <CarForm onSubmit={handleSubmit} initialData={car} submitLabel="Update Car" />
      </div>
    </div>
  );
}