import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Edit, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Baby, 
  User,
  FileText,
  Activity
} from 'lucide-react';
import type { Parent } from "../types/parent";
import type { Child } from "../types/children";

const ParentDetail: React.FC = () => {
  // const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');

  // Mock data - in real app, fetch based on ID
  const parent: Parent = {
    id: 1,
    nama_ayah: 'Andi Pratama',
    nama_ibu: 'Sari Dewi Jr.',
    tanggal_lahir_ayah: new Date('2022-11-15'),
    tanggal_lahir_ibu: new Date('2022-07-20'),
    no_hp: '08123456789',
    email: '3k3lG@example.com',
    alamat: 'Jl. Contoh No. 123, Kota Contoh',
    pekerjaan: 'Pekerjaan Contoh',
    pendidikan: 'SMA Contoh',
    status_aktif: 'Aktif',
    kunjungan_terakhir: '2024-01-15',
    notes: 'Catatan Orang Tua',
    tanggal_lahir: '2022-11-15',
    created_at: '2023-11-15'
  };

  const children: Child[] = [
    {
      id: 1,
      nama: 'Andi Pratama',
      gender: 'Laki-laki',
      tanggal_lahir: '2022-11-15',
      umur: 12,
      status_berat: 'normal',
      status_tinggi: 'normal',
      lastExamination: '2024-01-15',
      updated_at: '2023-12-15',
      created_at: '2023-11-15'
    },
    {
      id: 2,
      nama: 'Sari Dewi Jr.',
      gender: 'Perempuan',
      tanggal_lahir: '2022-07-20',
      umur: 18,
      status_berat: 'normal',
      status_tinggi: 'normal',
      lastExamination: '2024-01-15',
      updated_at: '2023-12-15',
      created_at: '2023-11-15'
    }
  ];

  const visitHistory = [
    {
      date: '2024-01-15',
      purpose: 'Pemeriksaan Rutin',
      children: ['Andi Pratama', 'Sari Dewi Jr.'],
      notes: 'Pemeriksaan berjalan lancar'
    },
    {
      date: '2023-12-15',
      purpose: 'Konsultasi Gizi',
      children: ['Sari Dewi Jr.'],
      notes: 'Konsultasi mengenai pola makan'
    },
    {
      date: '2023-11-15',
      purpose: 'Pemeriksaan Rutin',
      children: ['Andi Pratama', 'Sari Dewi Jr.'],
      notes: 'Semua dalam kondisi baik'
    }
  ];

  const tabs = [
    { id: 'info', name: 'Informasi Pribadi', icon: User },
    { id: 'children', name: 'Data Anak', icon: Baby },
    { id: 'history', name: 'Riwayat Kunjungan', icon: Activity },
    { id: 'notes', name: 'Catatan', icon: FileText }
  ];

  return (
    <div className="mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/parents')}
            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{parent.nama_ayah}</h1>
            <p className="text-gray-600">Detail Orang Tua</p>
          </div>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Edit className="h-4 w-4 mr-2" />
          Edit Data
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Jumlah Anak</p>
          <p className="text-2xl font-bold text-blue-600">{children.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Kunjungan Terakhir</p>
          <p className="text-lg font-semibold text-gray-900">{parent.kunjungan_terakhir}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Total Kunjungan</p>
          <p className="text-2xl font-bold text-green-600">{visitHistory.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">Status Aktif</p>
          <p className="text-lg font-semibold text-green-600">Aktif</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Informasi Pribadi Tab */}
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Kontak</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="font-medium">{parent.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Nomor Telepon</p>
                      <p className="font-medium">{parent.no_hp}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Alamat</p>
                      <p className="font-medium">{parent.alamat}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Informasi Pribadi</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Lahir</p>
                      <p className="font-medium">{parent.tanggal_lahir}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Pekerjaan</p>
                      <p className="font-medium">{parent.pekerjaan}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Pendidikan</p>
                      <p className="font-medium">{parent.pendidikan}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Kontak Darurat</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="text-gray-600">Nama:</span> 
                      <span className="font-medium ml-2">-</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Telepon:</span> 
                      <span className="font-medium ml-2">-</span>
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-600">Hubungan:</span> 
                      <span className="font-medium ml-2">-</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Data Anak Tab */}
          {activeTab === 'children' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Daftar Anak</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {children.map((child) => (
                  <div key={child.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">{child.nama}</h4>
                        <p className="text-sm text-gray-600">{child.umur} • {child.gender}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        child.status_berat === 'green' 
                          ? 'bg-green-100 text-green-800'
                          : child.status_berat === 'yellow'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {child.status_berat}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Lahir: {child.tanggal_lahir}</p>
                      <p>Pemeriksaan terakhir: {child.lastExamination}</p>
                    </div>
                    <button 
                      onClick={() => navigate(`/babies/${child.id}`)}
                      className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Lihat Detail →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Riwayat Kunjungan Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Riwayat Kunjungan</h3>
              <div className="space-y-4">
                {visitHistory.map((visit, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{visit.purpose}</h4>
                        <p className="text-sm text-gray-600">{visit.date}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-600">Anak yang diperiksa:</p>
                        <p className="text-sm font-medium">{visit.children.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Catatan:</p>
                        <p className="text-sm">{visit.notes}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Catatan Tab */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Catatan Medis</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                  Tambah Catatan
                </button>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">{parent.notes}</p>
                <p className="text-xs text-gray-500 mt-2">Terakhir diperbarui: {parent.kunjungan_terakhir}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDetail;