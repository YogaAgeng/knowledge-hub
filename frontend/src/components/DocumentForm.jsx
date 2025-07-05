/* eslint-disable react/prop-types */
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { createDocument } from '../api/apiService';

const DocumentForm = ({ onDocumentCreated, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'catatan',
    content: '',
    tags: ''
  });
  const [loading, setLoading] = useState(false);

  const documentTypes = [
    { value: 'tugas', label: 'Tugas', icon: '📝', description: 'Assignment atau tugas kuliah' },
    { value: 'makalah', label: 'Makalah', icon: '📄', description: 'Paper atau karya tulis ilmiah' },
    { value: 'catatan', label: 'Catatan', icon: '📋', description: 'Catatan kuliah atau study notes' }
  ];

  const documentTemplates = {
    tugas: `# Judul Tugas

## Deskripsi Tugas
[Deskripsikan tugas yang akan dikerjakan]

## Tujuan
- Tujuan 1
- Tujuan 2

## Langkah Pengerjaan
1. Langkah pertama
2. Langkah kedua
3. Langkah ketiga

## Hasil yang Diharapkan
[Jelaskan hasil yang diharapkan]

## Deadline
[Tanggal deadline]

## Catatan
[Catatan tambahan]`,

    makalah: `# Judul Makalah

## Abstrak
[Ringkasan singkat tentang makalah]

## 1. Pendahuluan

### 1.1 Latar Belakang
[Jelaskan latar belakang masalah]

### 1.2 Rumusan Masalah
[Rumuskan masalah yang akan dibahas]

### 1.3 Tujuan
[Tujuan penulisan makalah]

## 2. Tinjauan Pustaka
[Review literatur yang relevan]

## 3. Metodologi
[Metode yang digunakan]

## 4. Hasil dan Pembahasan
[Hasil penelitian dan pembahasannya]

## 5. Kesimpulan
[Kesimpulan dari penelitian]

## Daftar Pustaka
[Daftar referensi yang digunakan]`,

    catatan: `# Judul Mata Kuliah

## Pertemuan: [Tanggal]
**Topik:** [Topik yang dibahas]

## Materi Utama

### Konsep 1
- Point penting 1
- Point penting 2
- Contoh: [berikan contoh]

### Konsep 2
- Point penting 1
- Point penting 2

## Rumus/Formula Penting
\`\`\`
[Tulis rumus atau formula]
\`\`\`

## Contoh Soal
**Soal:** [tulis soal]
**Jawaban:** [tulis jawaban]

## Catatan Tambahan
[Catatan penting lainnya]

## Referensi
- [Buku/artikel referensi]`
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type,
      content: documentTemplates[type] || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const documentData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const newDocument = await createDocument(documentData);
      toast.success('Dokumen berhasil dibuat!');
      onDocumentCreated?.(newDocument);
      onClose?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Gagal membuat dokumen');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Buat Dokumen Baru</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Judul Dokumen
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Masukkan judul dokumen"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Document Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Tipe Dokumen
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {documentTypes.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleTypeChange(type.value)}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  formData.type === type.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{type.icon}</span>
                  <span className="font-medium">{type.label}</span>
                </div>
                <p className="text-sm text-gray-600">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tag (opsional)
          </label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="Pisahkan dengan koma (contoh: algoritma, programming, javascript)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Tag membantu mengorganisir dan mencari dokumen
          </p>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Konten Dokumen
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Masukkan konten dokumen..."
            className="w-full h-96 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm resize-none"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Gunakan format Markdown untuk formatting yang lebih baik
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
              disabled={loading}
            >
              Batal
            </button>
          )}
          <button
            type="submit"
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Membuat...' : 'Buat Dokumen'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentForm;