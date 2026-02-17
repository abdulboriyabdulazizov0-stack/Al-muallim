
import React from 'react';
import { Course, CourseLevel, FAQItem, Resource, Quiz } from './types';
import { Book, Video, Image as ImageIcon, Info, HelpCircle, LayoutDashboard, LogIn, GraduationCap } from 'lucide-react';

export const COLORS = {
  primary: '#1E40AF', // Blue
  secondary: '#10B981', // Green
  accent: '#FBBF24', // Gold/Yellow
  background: '#F9FAFB',
  white: '#FFFFFF',
};

export const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: <Book className="w-5 h-5" /> },
  { label: 'Courses', path: '/courses', icon: <GraduationCap className="w-5 h-5" /> },
  { label: 'Resources', path: '/resources', icon: <ImageIcon className="w-5 h-5" /> },
  { label: 'FAQ', path: '/faq', icon: <HelpCircle className="w-5 h-5" /> },
  { label: 'About', path: '/about', icon: <Info className="w-5 h-5" /> },
];

const MOCK_QUIZ_1: Quiz = {
  id: 'q1',
  courseId: 'c1',
  title: 'Arabic Basics Quiz',
  questions: [
    {
      id: 'qu1',
      text: 'Arab alifbosida nechta harf bor?',
      options: ['24', '26', '28', '30'],
      correctOptionIndex: 2,
      explanation: 'Arab alifbosida 28 ta asosiy harf mavjud.'
    },
    {
      id: 'qu2',
      text: '"Fatha" belgisi harfning qayeriga qo\'yiladi?',
      options: ['Tepasiga', 'Pastiga', 'Yoniga', 'Ichiga'],
      correctOptionIndex: 0,
      explanation: 'Fatha belgisi harfning tepasiga qo\'yiladi va "a" tovushini beradi.'
    }
  ]
};

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Arabic Grammar Essentials',
    description: 'Master the foundation of Arabic sentences and word structures (Nahw & Sarf).',
    level: CourseLevel.BEGINNER,
    thumbnail: 'https://picsum.photos/seed/arabic1/800/450',
    category: 'Grammar',
    quiz: MOCK_QUIZ_1,
    lessons: [
      { id: 'l1', courseId: 'c1', title: 'The Arabic Alphabet', content: 'Introduction to the 28 letters of the Arabic alphabet...', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '15 min' },
      { id: 'l2', courseId: 'c1', title: 'Nouns vs Verbs', content: 'Differentiating between Ism and Fi\'l in Arabic grammar...', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '20 min' },
    ]
  },
  {
    id: 'c2',
    title: 'Tajweed Rules for Beginners',
    description: 'Learn the correct pronunciation of the Quranic text with basic Tajweed rules.',
    level: CourseLevel.BEGINNER,
    thumbnail: 'https://picsum.photos/seed/tajweed1/800/450',
    category: 'Tajweed',
    lessons: [
      { id: 'l3', courseId: 'c2', title: 'Articulation Points (Makharij)', content: 'Understanding where each letter originates from the mouth and throat...', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '25 min' },
      { id: 'l4', courseId: 'c2', title: 'Rules of Noon Sakinah', content: 'Mastering Izhaar, Idghaam, Iqlaab, and Ikhfaa...', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', duration: '30 min' },
    ]
  }
];

export const MOCK_RESOURCES: Resource[] = [
  { id: 'r1', title: 'Arabic Alphabet Chart', type: 'image', url: 'https://picsum.photos/seed/alphabet/600/800', category: 'Basics' },
  { id: 'r2', title: 'Tajweed Map', type: 'infographic', url: 'https://picsum.photos/seed/tajweedmap/800/1200', category: 'Tajweed' },
  { id: 'r3', title: 'Verb Conjugation Table', type: 'image', url: 'https://picsum.photos/seed/verbs/800/600', category: 'Grammar' },
];

export const FAQ_DATA: FAQItem[] = [
  { question: "Bu platforma bolalar uchun mosmi?", answer: "Ha, bizda 7 yoshdan 60 yoshgacha bo'lganlar uchun mo'ljallangan kontent mavjud." },
  { question: "AI Tutor qanday ishlaydi?", answer: "Bizning AI Tutorimiz arab tili grammatikasi va tajvid qoidalari haqidagi savollaringizga real vaqt rejimida o'zbek tilida javob beradi." },
  { question: "Darslar bepulmi?", answer: "Bizda ham bepul darslar, ham chuqurlashtirilgan pullik kurslar mavjud." },
];
