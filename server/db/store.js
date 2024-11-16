// In-memory storage
export const store = {
  users: new Map(),
  cars: new Map(),
  sequences: {
    userId: 1,
    carId: 1,
  },
};

// Helper functions
export const generateId = (type) => {
  const id = store.sequences[type]++;
  return id.toString();
};

export const createUser = (email, hashedPassword) => {
  const id = generateId('userId');
  const user = { 
    id, 
    email: email.toLowerCase(), 
    password: hashedPassword,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  store.users.set(id, user);
  return user;
};

export const findUserByEmail = (email) => {
  const normalizedEmail = email.toLowerCase();
  return Array.from(store.users.values()).find(user => user.email === normalizedEmail);
};

export const findUserById = (id) => {
  return store.users.get(id);
};

export const createCar = (data) => {
  const id = generateId('carId');
  const car = { 
    id, 
    ...data, 
    createdAt: new Date().toISOString(), 
    updatedAt: new Date().toISOString() 
  };
  store.cars.set(id, car);
  return car;
};

export const updateCar = (id, data) => {
  const car = store.cars.get(id);
  if (!car) return null;
  
  const updatedCar = { 
    ...car, 
    ...data, 
    updatedAt: new Date().toISOString() 
  };
  store.cars.set(id, updatedCar);
  return updatedCar;
};

export const deleteCar = (id) => {
  return store.cars.delete(id);
};

export const findCarsByUserId = (userId) => {
  return Array.from(store.cars.values())
    .filter(car => car.userId === userId)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
};

export const findCarById = (id) => {
  return store.cars.get(id);
};

export const searchCars = (userId, query = '', tags = []) => {
  let userCars = findCarsByUserId(userId);
  
  if (query || tags.length > 0) {
    const searchTerm = query.toLowerCase();
    userCars = userCars.filter(car => {
      const matchesSearch = !searchTerm || 
        car.title.toLowerCase().includes(searchTerm) ||
        car.description.toLowerCase().includes(searchTerm) ||
        car.tags.some(tag => tag.toLowerCase().includes(searchTerm));

      const matchesTags = tags.length === 0 || 
        tags.every(tag => car.tags.includes(tag));

      return matchesSearch && matchesTags;
    });
  }

  return userCars;
};