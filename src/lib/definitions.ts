export type Shift = {
  id: string;
  userId: string;
  name: string;
  date: string; // YYYY-MM-DD format
  location: 'C.S. Granadilla' | 'SNU San Isidro';
  time: '20h a 8h' | '8h a 20h' | '9h a 17h' | '17h a 9h';
  phone: string;
  notes?: string;
  createdAt: Date;
};

export type NewShiftData = Omit<Shift, 'id' | 'createdAt'>;
