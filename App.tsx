
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { 
  Menu, X, User as UserIcon, LogOut, MessageSquare, ChevronRight, 
  Play, CheckCircle, Award, BarChart3, Upload, Trash2, 
  LayoutDashboard, LogIn, GraduationCap, Video, 
  Image as ImageIcon, Book, Heart, Bookmark, Search,
  Clock, ArrowLeft, Trophy, HelpCircle, Mic, Square, Loader2,
  TrendingUp, Calendar, Zap, Star
} from 'lucide-react';
import { NAV_ITEMS, MOCK_COURSES, MOCK_RESOURCES, FAQ_DATA } from './constants';
import { User, UserRole, Course, Lesson, CourseLevel, Quiz, Question, Badge, Activity } from './types';
import { askAiTutor, analyzeRecitation } from './services/geminiService';

// --- Badges Definitions ---
const ALL_BADGES: Badge[] = [
  { id: 'b1', name: '7-Kunlik Zanjir', description: '7 kun davomida darslarni ko\'rib borish.', icon: '🔥' },
  { id: 'b2', name: 'Birinchi Surah', description: 'Birinchi darsni muvaffaqiyatli tugatish.', icon: '📖' },
  { id: 'b3', name: 'Bilimdon', description: 'Birinchi testdan 100% natija olish.', icon: '🎓' },
  { id: 'b4', name: 'Muxlis', description: '5 ta darsni saqlab qo\'yish.', icon: '❤️' },
];

// --- Global State Simulation ---
const useAppStore = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('courses');
    return saved ? JSON.parse(saved) : MOCK_COURSES;
  });

  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('courses', JSON.stringify(courses));
  }, [courses]);

  const addXP = (amount: number) => {
    if (!user) return;
    const newXP = user.xp + amount;
    const newLevel = Math.floor(newXP / 1000) + 1;
    
    // Check for badges
    let newBadges = [...user.badges];
    if (newXP > 0 && !newBadges.find(b => b.id === 'b2')) {
      newBadges.push({ ...ALL_BADGES[1], earnedAt: new Date().toISOString() });
    }

    setUser({ ...user, xp: newXP, level: newLevel, badges: newBadges });
  };

  const toggleLessonCompletion = (lessonId: string) => {
    if (!user) return;
    const isCompleted = user.completedLessons.includes(lessonId);
    if (isCompleted) {
      setUser({ ...user, completedLessons: user.completedLessons.filter(id => id !== lessonId) });
    } else {
      addXP(100);
      setUser({ ...user, completedLessons: [...user.completedLessons, lessonId] });
    }
  };

  const toggleBookmark = (lessonId: string) => {
    if (!user) return;
    const isBookmarked = user.bookmarks.includes(lessonId);
    const newBookmarks = isBookmarked 
      ? user.bookmarks.filter(id => id !== lessonId)
      : [...user.bookmarks, lessonId];
    setUser({ ...user, bookmarks: newBookmarks });
  };

  return { user, setUser, courses, setCourses, toggleLessonCompletion, toggleBookmark, addXP };
};

// --- Tajweed Recorder ---
const TajweedRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder.current = new MediaRecorder(stream);
    audioChunks.current = [];
    
    mediaRecorder.current.ondataavailable = (e) => audioChunks.current.push(e.data);
    mediaRecorder.current.onstop = async () => {
      const audioBlob = new Blob(audioChunks.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        setIsAnalyzing(true);
        const result = await analyzeRecitation(base64);
        setFeedback(result);
        setIsAnalyzing(false);
      };
    };

    mediaRecorder.current.start();
    setIsRecording(true);
    setFeedback(null);
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    setIsRecording(false);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="font-bold">Tajvid Amaliyoti</h4>
          <p className="text-xs text-gray-500">Ovozingizni yozib oling va AI tahlilini oling.</p>
        </div>
        <Mic className={`w-6 h-6 ${isRecording ? 'text-red-500 animate-pulse' : 'text-gray-300'}`} />
      </div>
      <div className="flex gap-4 items-center">
        {!isRecording ? (
          <button onClick={startRecording} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
            <Mic className="w-4 h-4" /> Yozishni boshlash
          </button>
        ) : (
          <button onClick={stopRecording} className="bg-red-50 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2">
            <Square className="w-4 h-4" /> To'xtatish
          </button>
        )}
      </div>
      
      {isAnalyzing && (
        <div className="mt-4 flex items-center gap-2 text-blue-600 font-medium text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> AI tahlil qilmoqda...
        </div>
      )}

      {feedback && (
        <div className="mt-4 p-4 bg-white rounded-2xl border border-blue-50 text-sm leading-relaxed text-gray-700 animate-in fade-in slide-in-from-top-2">
          <p className="font-bold text-blue-600 mb-2">AI O'qituvchi Fikri:</p>
          {feedback}
        </div>
      )}
    </div>
  );
};

// --- Quiz Module ---
const QuizModule = ({ quiz, onComplete }: { quiz: Quiz, onComplete: (score: number) => void }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const currentQuestion = quiz.questions[currentStep];

  const handleAnswer = () => {
    if (selectedOption === null) return;
    if (selectedOption === currentQuestion.correctOptionIndex) setScore(score + 1);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    if (currentStep < quiz.questions.length - 1) setCurrentStep(currentStep + 1);
    else {
      setFinished(true);
      onComplete(score);
    }
  };

  if (finished) {
    return (
      <div className="bg-white p-8 rounded-3xl text-center shadow-xl border border-blue-100">
        <Trophy className="w-16 h-16 text-accent mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">Test Yakunlandi!</h3>
        <p className="text-gray-600 mb-6">Sizning natijangiz: {score} / {quiz.questions.length}</p>
        <div className="flex gap-2 justify-center">
           <button onClick={() => { setFinished(false); setCurrentStep(0); setScore(0); }} className="bg-gray-100 px-6 py-3 rounded-full font-bold">Qayta topshirish</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Savol {currentStep + 1} / {quiz.questions.length}</span>
      </div>
      <h3 className="text-xl font-bold mb-8">{currentQuestion.text}</h3>
      <div className="space-y-3 mb-8">
        {currentQuestion.options.map((opt, i) => (
          <button
            key={i}
            disabled={showFeedback}
            onClick={() => setSelectedOption(i)}
            className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between ${
              selectedOption === i ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-200'
            } ${showFeedback && i === currentQuestion.correctOptionIndex ? 'border-green-500 bg-green-50' : ''}`}
          >
            <span className="font-medium">{opt}</span>
          </button>
        ))}
      </div>
      {!showFeedback ? (
        <button onClick={handleAnswer} disabled={selectedOption === null} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold disabled:opacity-50">Tekshirish</button>
      ) : (
        <button onClick={handleNext} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold">Keyingisi</button>
      )}
    </div>
  );
};

// --- Page Components ---

// Fix: Added the missing HomePage component
const HomePage = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest border border-blue-100">
                <Zap className="w-4 h-4" /> Innovatsion Arab tili ta'limi
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-tight">
                Arab tilini <span className="text-blue-600 italic">AI Ustoz</span> bilan o'rganing
              </h1>
              <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
                Nahv, Sarf va Tajvid qoidalarini eng zamonaviy texnologiyalar yordamida o'rganing. 
                Sizning shaxsiy AI o'qituvchingiz har qadamda yordam beradi.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/courses" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 hover:scale-105 transition-all">Kurslarni boshlash</Link>
                <Link to="/faq" className="bg-white text-gray-700 px-8 py-4 rounded-2xl font-bold border border-gray-100 hover:bg-gray-50 transition-all">Batafsil ma'lumot</Link>
              </div>
            </div>
            <div className="relative animate-in fade-in slide-in-from-right-8 duration-700">
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-accent/20 rounded-full blur-3xl opacity-50"></div>
              <img src="https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&q=80&w=1000" 
                   className="rounded-[3rem] shadow-2xl border-8 border-white relative z-10" alt="Arabic Learning" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Nega aynan Al-Mu'allim?</h2>
            <p className="text-gray-500">Biz ta'lim va texnologiyani birlashtirib, o'rganish jarayonini yanada qiziqarli va samarali qildik.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: <Book className="w-8 h-8 text-blue-600" />, title: 'Sifatli Kontent', desc: 'Tajribali ustozlar tomonidan tayyorlangan darsliklar va video darslar.' },
              { icon: <Mic className="w-8 h-8 text-green-500" />, title: 'Tajvid AI Tahlil', desc: 'Talaffuzingizni AI yordamida tekshiring va real vaqtda fikr-mulohaza oling.' },
              { icon: <MessageSquare className="w-8 h-8 text-accent" />, title: 'AI Tutor 24/7', desc: 'Savollaringizga istalgan vaqtda o\'zbek tilida javob oling.' },
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-[2.5rem] bg-gray-50 border border-gray-50 hover:border-blue-100 hover:bg-white hover:shadow-xl transition-all group">
                <div className="mb-6 p-4 bg-white rounded-2xl w-fit group-hover:scale-110 transition-transform">{f.icon}</div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const Navbar = ({ user, onLogout }: { user: User | null; onLogout: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-blue-600 p-2 rounded-lg"><span className="text-white font-bold text-xl font-arabic">ع</span></div>
              <span className="text-xl font-bold text-blue-900 tracking-tight">Al-Mu'allim</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            {NAV_ITEMS.map((item) => (
              <Link key={item.path} to={item.path} className={`px-3 py-2 rounded-xl text-sm font-medium transition-all ${location.pathname === item.path ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'}`}>
                {item.label}
              </Link>
            ))}
            {user ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l">
                <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200"><UserIcon className="w-4 h-4" /></div>
                  <span className="text-sm font-bold text-gray-700 hidden lg:block">{user.name}</span>
                </Link>
                {user.role === UserRole.ADMIN && (
                  <Link to="/dashboard" title="Admin Dashboard" className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl"><LayoutDashboard className="w-5 h-5" /></Link>
                )}
                <button onClick={onLogout} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl"><LogOut className="w-4 h-4" /></button>
              </div>
            ) : (
              <Link to="/login" className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-md ml-4">Login</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const ProfilePage = ({ user, courses }: { user: User | null; courses: Course[] }) => {
  if (!user) return <div className="text-center py-20">Iltimos, avval tizimga kiring.</div>;

  const allLessons = useMemo(() => courses.flatMap(c => c.lessons), [courses]);
  const bookmarkedLessons = allLessons.filter(l => user.bookmarks.includes(l.id));
  const progressPercent = Math.round((user.completedLessons.length / (allLessons.length || 1)) * 100);

  // Activity Data Mock Visualization
  const activityData = [12, 18, 15, 25, 30, 22, 10]; // last 7 days XP

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center border-4 border-white shadow-md">
                <UserIcon className="w-12 h-12 text-blue-600" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-accent text-white w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 border-white shadow-sm">
                {user.level}
              </div>
            </div>
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-400 text-sm mb-6">{user.role === UserRole.ADMIN ? 'Professor' : 'O\'quvchi'}</p>
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-blue-600 mb-2">
               <span>Tajriba (XP)</span>
               <span>{user.xp % 1000} / 1000</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
               <div className="bg-blue-600 h-full transition-all duration-700" style={{ width: `${(user.xp % 1000) / 10}%` }}></div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
             <h3 className="font-bold mb-4 flex items-center gap-2"><Trophy className="text-accent w-4 h-4" /> Yutuqlar</h3>
             <div className="grid grid-cols-2 gap-3">
                {ALL_BADGES.map(badge => {
                  const earned = user.badges.find(b => b.id === badge.id);
                  return (
                    <div key={badge.id} className={`p-3 rounded-2xl flex flex-col items-center justify-center text-center transition-all ${earned ? 'bg-blue-50 border border-blue-100 opacity-100' : 'bg-gray-50 border border-transparent opacity-30 grayscale'}`}>
                       <span className="text-2xl mb-1">{badge.icon}</span>
                       <span className="text-[10px] font-bold leading-tight">{badge.name}</span>
                    </div>
                  );
                })}
             </div>
          </div>
        </div>

        {/* Main Dashboard */}
        <div className="lg:col-span-3 space-y-8">
           {/* Stats Summary */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: 'Tugatilgan Darslar', value: user.completedLessons.length, icon: <CheckCircle className="text-green-500" /> },
                { label: 'O\'rtacha Ball', value: '92%', icon: <Star className="text-accent" /> },
                { label: 'Faollik Kunlari', value: '14', icon: <TrendingUp className="text-blue-500" /> },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
                  <div className="p-3 bg-gray-50 rounded-2xl">{stat.icon}</div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                  </div>
                </div>
              ))}
           </div>

           {/* Learning Activity Chart (SVG) */}
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold flex items-center gap-2"><Calendar className="text-blue-600" /> Faollik Grafigi</h3>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase">Oxirgi 7 kun</span>
              </div>
              <div className="h-48 flex items-end justify-between gap-4 px-4">
                 {activityData.map((val, i) => (
                   <div key={i} className="flex-1 flex flex-col items-center gap-3">
                      <div className="w-full bg-blue-100 rounded-t-xl relative group" style={{ height: `${(val / 30) * 100}%` }}>
                         <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                            {val} XP
                         </div>
                         <div className="w-full h-full bg-blue-600 rounded-t-xl transition-all hover:bg-blue-700"></div>
                      </div>
                      <span className="text-[10px] font-bold text-gray-400">Kun {i+1}</span>
                   </div>
                 ))}
              </div>
           </div>

           {/* Bookmarks Section */}
           <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-500"><Bookmark className="fill-current" /> Saqlangan Darslar</h3>
              {bookmarkedLessons.length === 0 ? (
                <p className="text-gray-400 italic text-center py-10">Hali hech qanday dars saqlanmagan.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bookmarkedLessons.map(lesson => (
                    <Link key={lesson.id} to={`/courses/${lesson.courseId}`} className="group p-4 rounded-2xl border border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600"><Play className="w-5 h-5 fill-current" /></div>
                      <div className="flex-1">
                        <p className="font-bold text-sm line-clamp-1">{lesson.title}</p>
                        <p className="text-xs text-gray-500">{lesson.duration}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ courses, onAddCourse }: { courses: Course[], onAddCourse: (c: Course) => void }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newLevel, setNewLevel] = useState<CourseLevel>(CourseLevel.BEGINNER);
  const [newCategory, setNewCategory] = useState<'Grammar' | 'Tajweed' | 'Vocabulary'>('Grammar');
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    // Simulate Cloudinary upload delay
    await new Promise(r => setTimeout(r, 2000));
    
    const course: Course = {
      id: 'c' + Date.now(),
      title: newTitle,
      description: newDesc,
      level: newLevel,
      category: newCategory,
      thumbnail: `https://picsum.photos/seed/${newTitle}/800/450`,
      lessons: [
        { id: 'l' + Date.now(), courseId: '', title: 'Intro to ' + newTitle, content: 'Tavsif...', duration: '10 min', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' }
      ]
    };
    onAddCourse(course);
    setUploading(false);
    setShowAddModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-12">
        <div><h1 className="text-3xl font-bold">Admin Panel</h1><p className="text-gray-500">Video va kurslarni boshqarish.</p></div>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-all"><Upload className="w-5 h-5" /> Video Yuklash</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={course.thumbnail} className="w-16 h-10 object-cover rounded-lg" alt="" />
              <div><p className="font-bold text-sm">{course.title}</p><p className="text-[10px] text-blue-600 font-bold uppercase">{course.category}</p></div>
            </div>
            <button className="text-red-400 p-2 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
           <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold">Video Yuklash</h2>
                 <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-6 h-6" /></button>
              </div>
              <form onSubmit={handleUpload} className="space-y-4">
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Video Nomi</label>
                    <input required value={newTitle} onChange={e => setNewTitle(e.target.value)} type="text" className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Kategoriya</label>
                    <select value={newCategory} onChange={e => setNewCategory(e.target.value as any)} className="w-full border p-3 rounded-xl outline-none">
                       <option value="Grammar">Grammatika</option>
                       <option value="Tajweed">Tajvid</option>
                       <option value="Vocabulary">Lug'at</option>
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Video Fayl</label>
                    <div className="border-2 border-dashed border-gray-200 p-8 rounded-2xl text-center">
                       <Upload className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                       <p className="text-sm text-gray-400">MP4, MOV fayllarini yuklang</p>
                    </div>
                 </div>
                 <button type="submit" disabled={uploading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2">
                    {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Upload className="w-5 h-5" /> Nashr Etish</>}
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

const LessonDetailPage = ({ user, courses, onToggleCompletion, onToggleBookmark, addXP }: { user: User | null; courses: Course[], onToggleCompletion: (id: string) => void, onToggleBookmark: (id: string) => void, addXP: (amount: number) => void }) => {
  const { id } = useParams();
  const course = courses.find(c => c.id === id) || courses[0];
  const [activeIdx, setActiveIdx] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const lesson = course.lessons[activeIdx];

  const handleQuizComplete = (score: number) => {
    addXP(score * 100);
    // Badge check could happen here too
  };

  if (!lesson) return <div className="text-center py-20">Dars topilmadi.</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-8">
        <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
           <iframe width="100%" height="100%" src={lesson.videoUrl} title="Player" frameBorder="0" allowFullScreen></iframe>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-100">
           <div className="flex justify-between items-start mb-6">
              <h1 className="text-3xl font-bold">{lesson.title}</h1>
              <div className="flex gap-2">
                <button onClick={() => onToggleBookmark(lesson.id)} className={`p-3 rounded-full border ${user?.bookmarks.includes(lesson.id) ? 'bg-red-50 text-red-500' : 'text-gray-400'}`}><Heart className={user?.bookmarks.includes(lesson.id) ? 'fill-current' : ''} /></button>
                <button onClick={() => onToggleCompletion(lesson.id)} className={`px-6 py-3 rounded-full font-bold flex items-center gap-2 ${user?.completedLessons.includes(lesson.id) ? 'bg-green-600 text-white' : 'bg-gray-100'}`}>
                  {user?.completedLessons.includes(lesson.id) ? <><CheckCircle /> Tugatildi</> : 'Tugatish'}
                </button>
              </div>
           </div>
           <p className="text-gray-600 mb-8">{lesson.content}</p>
           
           <TajweedRecorder />
           
           <div className="mt-8 bg-blue-50 p-6 rounded-3xl flex items-center justify-between">
              <div><h4 className="font-bold">Darsdan keyingi test</h4><p className="text-sm text-blue-600">Bilimingizni tekshiring va +200 XP oling.</p></div>
              <button onClick={() => setShowQuiz(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2"><GraduationCap className="w-5 h-5" /> Testni Boshlash</button>
           </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden sticky top-24">
           <div className="p-6 bg-gray-50/50 border-b border-gray-100 font-bold">Kurs Tarkibi</div>
           <div className="divide-y divide-gray-50">
              {course.lessons.map((l, i) => (
                <div key={l.id} onClick={() => setActiveIdx(i)} className={`p-4 flex gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${activeIdx === i ? 'bg-blue-50/50 border-r-4 border-blue-600' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${user?.completedLessons.includes(l.id) ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
                    {user?.completedLessons.includes(l.id) ? <CheckCircle className="w-5 h-5" /> : i + 1}
                  </div>
                  <div><p className="text-sm font-bold">{l.title}</p><p className="text-[10px] text-gray-400">{l.duration}</p></div>
                </div>
              ))}
           </div>
        </div>
      </div>

      {showQuiz && (
        <div className="fixed inset-0 z-[100] bg-blue-900/40 backdrop-blur-sm flex items-center justify-center p-4">
           <div className="w-full max-w-2xl relative">
              <button onClick={() => setShowQuiz(false)} className="absolute -top-12 right-0 text-white"><X /></button>
              {course.quiz ? <QuizModule quiz={course.quiz} onComplete={handleQuizComplete} /> : <div className="bg-white p-12 rounded-3xl text-center">Tez orada...</div>}
           </div>
        </div>
      )}
    </div>
  );
};

const LoginPage = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === 'admin' && pass === '123') {
      onLogin({ id: 'a1', name: 'Ustoz (Admin)', email, role: UserRole.ADMIN, completedLessons: [], bookmarks: [], xp: 5000, level: 5, badges: [], activityLog: [] });
      navigate('/dashboard');
    } else {
      onLogin({ id: 'u1', name: 'Demo Talaba', email, role: UserRole.STUDENT, completedLessons: [], bookmarks: [], xp: 0, level: 1, badges: [], activityLog: [] });
      navigate('/profile');
    }
  };

  return (
    <div className="max-w-md mx-auto py-32 px-4">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100">
        <h1 className="text-3xl font-bold text-center mb-8">Xush Kelibsiz</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input required value={email} onChange={e => setEmail(e.target.value)} type="text" placeholder="Login" className="w-full bg-gray-50 border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
          <input required value={pass} onChange={e => setPass(e.target.value)} type="password" placeholder="Parol" className="w-full bg-gray-50 border p-4 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-200">Kirish</button>
        </form>
        <p className="mt-6 text-center text-xs text-gray-400">Admin Login: admin | Parol: 123</p>
      </div>
    </div>
  );
};

// --- App Entry ---

export default function App() {
  const { user, setUser, courses, setCourses, toggleLessonCompletion, toggleBookmark, addXP } = useAppStore();

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar user={user} onLogout={handleLogout} />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/courses" element={<div className="max-w-7xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {courses.map(course => (
                <Link key={course.id} to={`/courses/${course.id}`} className="group bg-white rounded-[2rem] border border-gray-100 p-4 hover:shadow-xl transition-all">
                  <img src={course.thumbnail} className="w-full h-48 object-cover rounded-2xl mb-4" alt="" />
                  <div className="px-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">{course.category}</p>
                    <h3 className="text-lg font-bold mb-4">{course.title}</h3>
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                      <span className="text-xs font-bold text-gray-400 uppercase">{course.level}</span>
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center"><Play className="w-4 h-4 fill-current" /></div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>} />
            <Route path="/courses/:id" element={<LessonDetailPage user={user} courses={courses} onToggleCompletion={toggleLessonCompletion} onToggleBookmark={toggleBookmark} addXP={addXP} />} />
            <Route path="/login" element={<LoginPage onLogin={setUser} />} />
            <Route path="/profile" element={<ProfilePage user={user} courses={courses} />} />
            {user?.role === UserRole.ADMIN && (
              <Route path="/dashboard" element={<AdminDashboard courses={courses} onAddCourse={(c) => setCourses([...courses, c])} />} />
            )}
            <Route path="/faq" element={<div className="max-w-3xl mx-auto py-20 px-4 space-y-4">
               {FAQ_DATA.map((item, i) => (
                 <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100"><h4 className="font-bold mb-2">{item.question}</h4><p className="text-gray-500">{item.answer}</p></div>
               ))}
            </div>} />
          </Routes>
        </main>
        <AITutorChat />
      </div>
    </Router>
  );
}

const AITutorChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);
    const botReply = await askAiTutor(userMsg);
    setMessages(prev => [...prev, { role: 'bot', text: botReply }]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="bg-white rounded-[2rem] shadow-2xl w-80 sm:w-96 flex flex-col h-[500px] border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center"><MessageSquare className="w-4 h-4" /></div>
              <h4 className="font-bold">Al-Mu'allim AI</h4>
            </div>
            <button onClick={() => setIsOpen(false)}><X /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border'}`}>{m.text}</div>
              </div>
            ))}
            {isTyping && <div className="text-xs text-blue-500 font-bold animate-pulse">Javob tayyorlanmoqda...</div>}
          </div>
          <div className="p-4 bg-white border-t flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Savol yo'llang..." className="flex-1 bg-gray-50 border-none rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-blue-500" />
            <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-2xl"><ChevronRight /></button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white p-5 rounded-3xl shadow-2xl hover:scale-110 transition-all flex items-center gap-3">
          <MessageSquare className="w-6 h-6" /><span className="font-bold">AI Ustoz</span>
        </button>
      )}
    </div>
  );
};
