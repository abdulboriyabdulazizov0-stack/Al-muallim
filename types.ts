
export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export enum CourseLevel {
  BEGINNER = 'Beginner',
  INTERMEDIATE = 'Intermediate',
  ADVANCED = 'Advanced'
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface Quiz {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  questions: Question[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

export interface Activity {
  date: string;
  lessonsCompleted: number;
  xpEarned: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  completedLessons: string[]; // lesson IDs
  bookmarks: string[]; // lesson IDs
  xp: number;
  level: number;
  badges: Badge[];
  activityLog: Activity[];
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  videoUrl?: string;
  imageUrl?: string;
  duration: string;
  isCompleted?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  thumbnail: string;
  lessons: Lesson[];
  category: 'Grammar' | 'Tajweed' | 'Vocabulary';
  quiz?: Quiz;
}

export interface Resource {
  id: string;
  title: string;
  type: 'image' | 'infographic' | 'pdf';
  url: string;
  category: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
