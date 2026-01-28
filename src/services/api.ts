// API Service Layer
// This provides a centralized place for all API calls

const API_BASE_URL = '/api';

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        data: null,
        error: data.message || 'An error occurred',
        status: response.status,
      };
    }

    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

// Entity types
export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  medicalRecordNumber: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  licenseNumber: string;
  experience: number;
  status: 'active' | 'inactive' | 'on-leave';
  createdAt: string;
}

export interface Laboratory {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  type: 'clinical' | 'pathology' | 'radiology' | 'general';
  accreditation: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  image?: string;
}

export interface MembershipRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'patient' | 'doctor' | 'laboratory';
  specialty?: string;
  licenseNumber?: string;
  facilityType?: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

// API methods
export const api = {
  patients: {
    getAll: () => request<Patient[]>('/patients'),
    getById: (id: string) => request<Patient>(`/patients/${id}`),
    create: (patient: Omit<Patient, 'id' | 'createdAt'>) =>
      request<Patient>('/patients', { method: 'POST', body: JSON.stringify(patient) }),
    update: (id: string, patient: Partial<Patient>) =>
      request<Patient>(`/patients/${id}`, { method: 'PUT', body: JSON.stringify(patient) }),
    delete: (id: string) => request<void>(`/patients/${id}`, { method: 'DELETE' }),
  },
  doctors: {
    getAll: () => request<Doctor[]>('/doctors'),
    getById: (id: string) => request<Doctor>(`/doctors/${id}`),
    create: (doctor: Omit<Doctor, 'id' | 'createdAt'>) =>
      request<Doctor>('/doctors', { method: 'POST', body: JSON.stringify(doctor) }),
    update: (id: string, doctor: Partial<Doctor>) =>
      request<Doctor>(`/doctors/${id}`, { method: 'PUT', body: JSON.stringify(doctor) }),
    delete: (id: string) => request<void>(`/doctors/${id}`, { method: 'DELETE' }),
  },
  laboratories: {
    getAll: () => request<Laboratory[]>('/laboratories'),
    getById: (id: string) => request<Laboratory>(`/laboratories/${id}`),
    create: (lab: Omit<Laboratory, 'id' | 'createdAt'>) =>
      request<Laboratory>('/laboratories', { method: 'POST', body: JSON.stringify(lab) }),
    update: (id: string, lab: Partial<Laboratory>) =>
      request<Laboratory>(`/laboratories/${id}`, { method: 'PUT', body: JSON.stringify(lab) }),
    delete: (id: string) => request<void>(`/laboratories/${id}`, { method: 'DELETE' }),
  },
  products: {
    getAll: () => request<Product[]>('/products'),
    getById: (id: string) => request<Product>(`/products/${id}`),
    create: (product: Omit<Product, 'id' | 'createdAt'>) =>
      request<Product>('/products', { method: 'POST', body: JSON.stringify(product) }),
    update: (id: string, product: Partial<Product>) =>
      request<Product>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
    delete: (id: string) => request<void>(`/products/${id}`, { method: 'DELETE' }),
  },
};

// Demo data
export const demoPatients: Patient[] = [
  { id: '1', name: 'Mohammed Al-Farsi', email: 'mohammed@email.com', phone: '+966 50 123 4567', dateOfBirth: '1985-03-15', gender: 'male', medicalRecordNumber: 'MRN-001234', status: 'active', createdAt: '2024-01-10' },
  { id: '2', name: 'Fatima Al-Rashid', email: 'fatima@email.com', phone: '+966 55 234 5678', dateOfBirth: '1990-07-22', gender: 'female', medicalRecordNumber: 'MRN-001235', status: 'active', createdAt: '2024-01-12' },
  { id: '3', name: 'Ahmed Hassan', email: 'ahmed.h@email.com', phone: '+966 54 345 6789', dateOfBirth: '1978-11-08', gender: 'male', medicalRecordNumber: 'MRN-001236', status: 'pending', createdAt: '2024-01-15' },
  { id: '4', name: 'Sara Al-Mutairi', email: 'sara.m@email.com', phone: '+966 56 456 7890', dateOfBirth: '1995-02-28', gender: 'female', medicalRecordNumber: 'MRN-001237', status: 'active', createdAt: '2024-01-18' },
  { id: '5', name: 'Khalid Ibrahim', email: 'khalid.i@email.com', phone: '+966 50 567 8901', dateOfBirth: '1988-09-14', gender: 'male', medicalRecordNumber: 'MRN-001238', status: 'inactive', createdAt: '2024-01-20' },
  { id: '6', name: 'Nour Al-Salem', email: 'nour.s@email.com', phone: '+966 55 678 9012', dateOfBirth: '1992-05-03', gender: 'female', medicalRecordNumber: 'MRN-001239', status: 'active', createdAt: '2024-01-22' },
];

export const demoDoctors: Doctor[] = [
  { id: '1', name: 'Dr. Omar Al-Zahrani', email: 'dr.omar@tabeebak.com', phone: '+966 50 111 2222', specialty: 'Cardiology', licenseNumber: 'SL-12345', experience: 15, status: 'active', createdAt: '2023-06-01' },
  { id: '2', name: 'Dr. Layla Hassan', email: 'dr.layla@tabeebak.com', phone: '+966 55 222 3333', specialty: 'Pediatrics', licenseNumber: 'SL-12346', experience: 10, status: 'active', createdAt: '2023-06-15' },
  { id: '3', name: 'Dr. Youssef Mansour', email: 'dr.youssef@tabeebak.com', phone: '+966 54 333 4444', specialty: 'Orthopedics', licenseNumber: 'SL-12347', experience: 12, status: 'on-leave', createdAt: '2023-07-01' },
  { id: '4', name: 'Dr. Hana Al-Qahtani', email: 'dr.hana@tabeebak.com', phone: '+966 56 444 5555', specialty: 'Dermatology', licenseNumber: 'SL-12348', experience: 8, status: 'active', createdAt: '2023-07-20' },
  { id: '5', name: 'Dr. Tariq Al-Shehri', email: 'dr.tariq@tabeebak.com', phone: '+966 50 555 6666', specialty: 'Neurology', licenseNumber: 'SL-12349', experience: 20, status: 'active', createdAt: '2023-08-10' },
];

export const demoLaboratories: Laboratory[] = [
  { id: '1', name: 'Central Clinical Lab', email: 'central@labs.com', phone: '+966 11 123 4567', location: 'Riyadh, Main Branch', type: 'clinical', accreditation: 'CAP Certified', status: 'active', createdAt: '2023-01-15' },
  { id: '2', name: 'Al-Noor Pathology Center', email: 'alnoor@labs.com', phone: '+966 12 234 5678', location: 'Jeddah, Al-Rawdah', type: 'pathology', accreditation: 'ISO 15189', status: 'active', createdAt: '2023-02-20' },
  { id: '3', name: 'Advanced Radiology Institute', email: 'ari@labs.com', phone: '+966 13 345 6789', location: 'Dammam, City Center', type: 'radiology', accreditation: 'JCI Accredited', status: 'active', createdAt: '2023-03-10' },
  { id: '4', name: 'HealthFirst Labs', email: 'healthfirst@labs.com', phone: '+966 11 456 7890', location: 'Riyadh, Al-Olaya', type: 'general', accreditation: 'MOH Licensed', status: 'pending', createdAt: '2023-04-05' },
  { id: '5', name: 'MedTest Laboratory', email: 'medtest@labs.com', phone: '+966 12 567 8901', location: 'Jeddah, Al-Hamra', type: 'clinical', accreditation: 'CAP Certified', status: 'inactive', createdAt: '2023-05-12' },
];

export const demoProducts: Product[] = [
  { id: '1', name: 'Premium Stethoscope', description: 'High-quality diagnostic tool', price: 299, stock: 45, category: 'Medical Equipment', status: 'active', createdAt: '2024-01-10' },
  { id: '2', name: 'Blood Pressure Monitor', description: 'Digital BP monitoring device', price: 89, stock: 120, category: 'Medical Equipment', status: 'active', createdAt: '2024-01-15' },
  { id: '3', name: 'Surgical Gloves Box', description: 'Latex-free sterile gloves', price: 24, stock: 500, category: 'Supplies', status: 'active', createdAt: '2024-01-20' },
  { id: '4', name: 'Thermometer Pro', description: 'Infrared temperature scanner', price: 45, stock: 0, category: 'Medical Equipment', status: 'draft', createdAt: '2024-02-01' },
  { id: '5', name: 'First Aid Kit', description: 'Complete emergency kit', price: 65, stock: 78, category: 'Supplies', status: 'active', createdAt: '2024-02-10' },
];

export const demoMembershipRequests: MembershipRequest[] = [
  { id: '1', name: 'Dr. Nadia Khaled', email: 'dr.nadia@email.com', phone: '+966 57 123 4567', type: 'doctor', specialty: 'Neurology', licenseNumber: 'SL-22156', message: 'I would like to join TABEEBAK to provide neurological consultations.', status: 'pending', createdAt: '2024-02-20' },
  { id: '2', name: 'Al-Hayat Diagnostic Center', email: 'info@alhayatlab.com', phone: '+966 57 234 5678', type: 'laboratory', facilityType: 'clinical', message: 'We are a certified diagnostic center looking to partner with TABEEBAK.', status: 'pending', createdAt: '2024-02-21' },
  { id: '3', name: 'Yousef Al-Mahmoud', email: 'yousef.m@email.com', phone: '+966 57 345 6789', type: 'patient', message: 'I would like to register as a patient to book appointments with specialists.', status: 'pending', createdAt: '2024-02-22' },
  { id: '4', name: 'Dr. Salma Ahmed', email: 'dr.salma@email.com', phone: '+966 57 456 7890', type: 'doctor', specialty: 'Ophthalmology', licenseNumber: 'SL-21089', message: 'Experienced ophthalmologist seeking to offer services through your platform.', status: 'pending', createdAt: '2024-02-23' },
  { id: '5', name: 'Precision Labs', email: 'contact@precisionlabs.com', phone: '+966 57 567 8901', type: 'laboratory', facilityType: 'pathology', message: 'State-of-the-art pathology lab interested in joining your network.', status: 'pending', createdAt: '2024-02-24' },
  { id: '6', name: 'Amira Hassan', email: 'amira.h@email.com', phone: '+966 57 678 9012', type: 'patient', message: 'Looking for a reliable platform to manage my family healthcare needs.', status: 'pending', createdAt: '2024-02-25' },
];
