/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  experience: string;
  price: number;
  image: string;
  description: string;
}

export interface Article {
  id: string;
  title: string;
  category: string;
  readTime: string;
  image: string;
  summary: string;
}

export const DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'dr. Sarah Johnson',
    specialty: 'Dokter Umum',
    rating: 4.9,
    experience: '10 tahun',
    price: 50000,
    image: 'https://picsum.photos/seed/doc1/200/200',
    description: 'dr. Sarah adalah dokter umum yang penuh kasih dengan pengalaman lebih dari satu dekade dalam kedokteran keluarga. Beliau spesialis dalam perawatan pencegahan dan manajemen penyakit kronis.',
  },
  {
    id: '2',
    name: 'dr. Michael Chen',
    specialty: 'Dokter Anak',
    rating: 4.8,
    experience: '8 tahun',
    price: 75000,
    image: 'https://picsum.photos/seed/doc2/200/200',
    description: 'dr. Michael berdedikasi untuk memberikan perawatan terbaik bagi anak-anak dari segala usia. Beliau memiliki pendekatan yang lembut dan sangat terampil dalam diagnostik pediatrik dan vaksinasi.',
  },
  {
    id: '3',
    name: 'dr. Emily Brown',
    specialty: 'Dokter Kulit',
    rating: 4.7,
    experience: '12 tahun',
    price: 100000,
    image: 'https://picsum.photos/seed/doc3/200/200',
    description: 'dr. Emily adalah pakar kesehatan kulit, spesialis dalam dermatologi medis dan kosmetik. Beliau dikenal karena rencana perawatan yang dipersonalisasi untuk jerawat dan penuaan kulit.',
  },
];

export const ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Cara Menjaga Jantung Tetap Sehat',
    category: 'Gaya Hidup',
    readTime: '5 mnt',
    image: 'https://picsum.photos/seed/heart/400/200',
    summary: 'Pelajari praktik terbaik untuk menjaga jantung Anda tetap kuat dan sehat melalui diet dan olahraga.',
  },
  {
    id: '2',
    title: 'Pentingnya Tidur yang Cukup',
    category: 'Kesehatan',
    readTime: '4 mnt',
    image: 'https://picsum.photos/seed/sleep/400/200',
    summary: 'Temukan mengapa mendapatkan tidur berkualitas yang cukup sangat penting bagi kesejahteraan fisik dan mental Anda.',
  },
  {
    id: '3',
    title: 'Makan Sehat dengan Anggaran Terbatas',
    category: 'Nutrisi',
    readTime: '6 mnt',
    image: 'https://picsum.photos/seed/food/400/200',
    summary: 'Tips dan trik untuk makan makanan bergizi tanpa harus menguras kantong.',
  },
];
