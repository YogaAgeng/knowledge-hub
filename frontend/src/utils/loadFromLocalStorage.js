// src/utils/loadFromLocalStorage.js

/**
 * Memuat token JWT dari localStorage
 * @returns {string|null} Token yang dimuat, atau null jika tidak ada
 */
const loadFromLocalStorage = () => {
    const token = localStorage.getItem('token'); // Mengambil token dari localStorage
    return token ? token : null; // Mengembalikan token jika ada, atau null jika tidak
};

export default loadFromLocalStorage;