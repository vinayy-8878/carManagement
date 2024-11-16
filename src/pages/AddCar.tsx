import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCarsStore } from '../store/cars';
import CarForm from '../components/CarForm';
import { CarFormData } from '../types/car';

export default function AddCar() {
  const navigate = useNavigate();
  const addCar = useCarsStore((state) => state.addCar);

  const handleSubmit = async (data: CarFormData) => {
    try {
      await addCar(data);
      toast.success('Car added successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to add car');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Car</h1>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <CarForm onSubmit={handleSubmit} submitLabel="Add Car" />
      </div>
    </div>
  );
}