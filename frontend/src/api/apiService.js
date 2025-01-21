// src/apiService.js
import apiClient from './apiClient';

// const getToken = () => localStorage.getItem('token');

export const login = async (credentials) => {
    try {
        const response = await apiClient.post('/auth/login', credentials);
        // Misalnya, jika server mengembalikan token, Anda bisa menyimpannya di localStorage
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            if (response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
        }
        return response.data; // Mengembalikan data dari response
    } catch (error) {
        throw error.response ? error.response.data : new Error('Login gagal'); // Mengembalikan error jika ada
    }
};

// Fungsi untuk logout
export const logout = async () => {
    try {
        const response = await apiClient.post('/auth/logout');
        localStorage.removeItem('token'); // Menghapus token dari localStorage saat logout
        return response.data; // Mengembalikan data dari response
    } catch (error) {
        throw error.response.data; // Mengembalikan error jika ada
    }
};

// Fungsi untuk membuat data (Create)
export const createData = async (endpoint, data) => {
    try {
        const response = await apiClient.post(endpoint, data);
        return response.data; // Mengembalikan data dari response
    } catch (error) {
        throw error.response.data; // Mengembalikan error jika ada
    }
};

// Fungsi untuk mendapatkan data (Read)
export const getData = async (endpoint) => {
    try {
      console.log(`Fetching data from: ${endpoint}`); // Debug log
      const response = await apiClient.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
      
      if (error.response) {
        console.error('Response Error:', error.response.data);
        console.error('Status:', error.response.status);
      }

      throw error.response ? error.response.data : new Error('Gagal mengambil data');
    }
  };

// Fungsi untuk memperbarui data (Update)
export const updateData = async (endpoint, data) => {
    try {
        const response = await apiClient.put(endpoint, data);
        return response.data; // Mengembalikan data yang diperbarui
    } catch (error) {
        throw error.response.data; // Mengembalikan error jika ada
    }
};

// Fungsi untuk menghapus data (Delete)
export const deleteData = async (endpoint) => {
    try {
        const response = await apiClient.delete(endpoint);
        return response.data; // Mengembalikan data dari response
    } catch (error) {
        throw error.response.data; // Mengembalikan error jika ada
    }
};

// api/apiService.js
export const createDocument = async (documentData) => {
    try {
      const response = await apiClient.post('/documents', documentData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Gagal membuat dokumen');
    }
  };
  
  export const getDocuments = async () => {
    try {
      const response = await apiClient.get('/documents');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Gagal mengambil dokumen');
    }
  };

  export const getDocumentById = async (id) => {
    try {
      const response = await apiClient.get(`/documents/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Gagal mengambil dokumen');
    }
  };
  
  export const updateDocument = async (id, documentData) => {
    try {
      const response = await apiClient.put(`/documents/${id}`, documentData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Gagal memperbarui dokumen');
    }
  };
  
  export const deleteDocument = async (id) => {
    try {
      const response = await apiClient.delete(`/documents/${id}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : new Error('Gagal menghapus dokumen');
    }
  };