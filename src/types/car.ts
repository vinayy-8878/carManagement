export interface Car {
  id: string;
  title: string;
  description: string;
  tags: string[];
  images: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CarFormData {
  title: string;
  description: string;
  tags: string[];
  images: File[];
}