import React, { useState } from 'react';
import { TourismSpot, ForumPost, SocialStory } from '../types';
import {
  Trees,
  Compass,
  MessageSquare,
  MapPin,
  Star,
  Calendar,
  ThumbsUp,
  Share2,
  Plus,
  Send,
  Users,
  Waves,
  Sparkles,
  Heart,
  CheckCircle2,
  Image as ImageIcon,
  Bookmark,
  TrendingUp,
  BarChart3,
  HelpCircle,
  Eye,
  Check,
  Globe,
  Radio,
  ExternalLink,
  MessageCircle,
  Hash,
  X,
  MoreHorizontal,
  Flame,
  ShieldCheck,
  Search,
  UserCheck,
  Smile,
  SendHorizontal,
  Filter
} from 'lucide-react';

interface TourismCommunityTabProps {
  onNavigateTab?: (tab: string, payload?: any) => void;
}

interface ActiveNeighbor {
  id: string;
  name: string;
  role: string;
  avatar: string;
  settlement: string;
  isOnline: boolean;
  isVerified?: boolean;
}

const ACTIVE_NEIGHBORS: ActiveNeighbor[] = [
  {
    id: 'u1',
    name: 'Олена Петренко',
    role: 'Волонтер & Вчителька',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    settlement: 'смт Рокитне',
    isOnline: true,
    isVerified: true
  },
  {
    id: 'u2',
    name: 'Микола Ковальчук',
    role: 'Велоактивіст',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    settlement: 'смт Рокитне',
    isOnline: true
  },
  {
    id: 'u3',
    name: 'Ганна Василівна',
    role: 'Староста Кисоричі',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    settlement: 'с. Кисоричі',
    isOnline: true,
    isVerified: true
  },
  {
    id: 'u4',
    name: 'Вадим Сидоренко',
    role: 'Організатор сплавів',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    settlement: 'с. Осницьк',
    isOnline: false
  }
];

const STORIES: SocialStory[] = [
  {
    id: 's1',
    title: 'Блакитне Озеро',
    subtitle: 'Пляжний сезон 2026',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
    authorName: 'Рокитне Туризм',
    authorRole: 'Офіційно',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    isOfficial: true,
    unseen: true,
    timeAgo: '10 хв тому',
    content: 'Запрошуємо на чисті береги Блакитного озера! Вода +23°C, працюють роздягальні, оренди катамаранів та альтанки.'
  },
  {
    id: 's2',
    title: 'Ярмарок ЗСУ',
    subtitle: 'Зібрано 45 000 грн',
    imageUrl: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=600&q=80',
    authorName: 'Волонтери Рокитне',
    authorRole: 'Громада',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
    isOfficial: false,
    unseen: true,
    timeAgo: '1 год тому',
    content: 'Дякуємо всім, хто завітав на благодійний ярмарок дерунів та випічки у смт Рокитне! Всі кошти направлено на дрони для 104-ї ОБр ТрО.'
  },
  {
    id: 's3',
    title: 'Сплав по Льві',
    subtitle: 'Байдарки у суботу',
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80',
    authorName: 'Клуб "Байдарочник"',
    authorRole: 'Активний відпочинок',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    isOfficial: false,
    unseen: false,
    timeAgo: '3 год тому',
    content: 'Старт о 09:00 від села Осницьк. Довжина маршруту 12 км. Залишилося 4 вільні місця!'
  },
  {
    id: 's4',
    title: 'Новий ЦНАП',
    subtitle: 'Графік у серпні',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80',
    authorName: 'ЦНАП Рокитне',
    authorRole: 'Офіційний канал',
    authorAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    isOfficial: true,
    unseen: false,
    timeAgo: '5 год тому',
    content: 'Оформлення паспортів, ВПО допомоги та земельних витягів у прискореному режимі без черг через електронний запис.'
  }
];

const TOURISM_SPOTS: TourismSpot[] = [
  {
    id: 'spot-1',
    title: 'Блакитне Озеро "Поліська Перлина"',
    category: 'nature_lake',
    description: 'Мальовниче затоплене гранітне кар’єрне озеро з прозорою блакитною водою в оточенні вікових сосен. Ідеальне місце для купання, сімейного відпочинку та фотосесій.',
    location: 'поблизу смт Рокитне (3 км)',
    features: ['Прозора кришталева вода', 'Альтанки та пірс', 'Пляжна зона', 'Кемпінг'],
    rating: 4.9,
    reviewsCount: 142,
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    bestSeason: 'Травень – Вересень',
    contactInfo: '(067) 360-12-34 (Оренда альтанок)',
    amenities: ['Парковка', 'Мангали', 'Катамарани', 'Дітям']
  },
  {
    id: 'spot-2',
    title: 'Річковий Сплав по річці Льва',
    category: 'nature_lake',
    description: 'Захоплюючий байдарковий маршрут унікальними водно-болотними угіддями Полісся. Спокійна течія, недоторкана природа, чаплі та білі латаття.',
    location: 'урочище "Став", с. Осницьк',
    features: ['Прокат байдарок', 'Маршрути 8 км та 18 км', 'Інструктор'],
    rating: 4.8,
    reviewsCount: 89,
    imageUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    bestSeason: 'Червень – Жовтень',
    contactInfo: '(098) 123-45-67 (Клуб "Поліський Байдарочник")',
    amenities: ['Спорядження', 'Трансфер', 'Гібриди']
  },
  {
    id: 'spot-3',
    title: 'База Відпочинку "Сосновий Бор"',
    category: 'recreation_camp',
    description: 'Затишні дерев’яні котеджі в глибині соснового лісу. Фінська сауна, басейн з джерельною водою, спортивні майданчики та дитячий зона.',
    location: 'с. Кисоричі, Рокитнівська громада',
    features: ['Дерев’яні будиночки', 'Сауна на дровах', 'Карпатські чани'],
    rating: 4.7,
    reviewsCount: 110,
    imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    bestSeason: 'Цілорічно',
    contactInfo: '(03635) 2-22-11',
    amenities: ['Wi-Fi', 'Ресторан', 'Сауна', 'Мангали']
  },
  {
    id: 'spot-4',
    title: 'Еко-Садиба "Поліська Гостина"',
    category: 'gastro_cafe',
    description: 'Автентичний зелений туризм: дегустація поліських дерунів, грибної юшки, запеченого лина та натурального вересового меду.',
    location: 'с. Томашгород, вул. Лісова 12',
    features: ['Традиційна кухня', 'Майстер-класи', 'Медоварня'],
    rating: 4.9,
    reviewsCount: 76,
    imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    bestSeason: 'Цілорічно',
    contactInfo: '(097) 555-43-21',
    amenities: ['Домашня їжа', 'Еко-продукти', 'Дегустації']
  }
];

const INITIAL_FORUM_POSTS: ForumPost[] = [
  {
    id: 'post-official-1',
    author: 'Григорій Таргонський',
    authorRole: 'Селищний Голова Рокитного',
    isVerified: true,
    category: 'announcement',
    title: '📢 Про хід благоустрою та ремонт доріг у Томашгороді та Кисоричах',
    content: 'Шановні жителі Рокитнівської громади! Завершено перший етап грейдерування та підсипання щебенем під’їзних шляхів. Також на Блакитному озері встановлено нові сміттєві контейнери та сонячні ліхтарі для безпеки відпочивальників.',
    mediaUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80',
    likes: 128,
    sharesCount: 34,
    commentsCount: 14,
    timestamp: '2 години тому',
    settlement: 'смт Рокитне',
    isPopular: true,
    comments: [
      { id: 'c101', author: 'Марія К.', text: 'Дякуємо за світло на озері! Тепер увечері гуляти набагато безпечніше.', timestamp: '1 год тому', likes: 8 },
      { id: 'c102', author: 'Василь О.', text: 'А коли планується грейдерування вулиці Лісової в Осницьку?', timestamp: '45 хв тому', likes: 3 }
    ]
  },
  {
    id: 'post-poll-1',
    author: 'Молодіжна Рада Рокитного',
    authorRole: 'Офіційне Опитування Громади',
    isVerified: true,
    category: 'poll',
    title: '🗳️ Опитування: Який проект облаштування парку відпочинку варто реалізувати першим?',
    content: 'Громада бере участь у грантовій програмі розвитку. Просимо кожного жителя проголосувати за пріоритетну локацію!',
    likes: 89,
    sharesCount: 19,
    commentsCount: 22,
    timestamp: '4 години тому',
    settlement: 'смт Рокитне',
    isPopular: true,
    pollOptions: [
      { id: 'opt-1', text: '🛹 Сучасний скейт-парк та памп-трек для молоді', votes: 142 },
      { id: 'opt-2', text: '🏖️ Покращений пляжний пірс із зонами барбекю', votes: 189 },
      { id: 'opt-3', text: '🌳 Зелений амфітеатр для кінопоказів просто неба', votes: 98 }
    ],
    comments: [
      { id: 'c201', author: 'Дмитро П.', text: 'Скейт-парк дуже потрібен нашій молоді, вони давно про це мріють!', timestamp: '2 год тому', likes: 12 }
    ]
  },
  {
    id: 'post-1',
    author: 'Микола Ковальчук',
    authorRole: 'Житель Рокитного',
    isVerified: false,
    category: 'recreation_meet',
    title: '🚴 Збираємо групу на велозаїзд до Блакитного озера цієї суботи!',
    content: 'Друзі! Пропоную в суботу о 10:00 зібратися біля площі Незалежності та дружньо виїхати на заїзд до Блакитного озера (близько 12 км туди й назад). Беріть із собою воду, перекус та гарний настрій!',
    mediaUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    likes: 42,
    sharesCount: 7,
    commentsCount: 8,
    timestamp: 'Сьогодні о 14:20',
    settlement: 'смт Рокитне',
    comments: [
      { id: 'c1', author: 'Олена П.', text: 'Чудова ідея! Приєднаюся з дітьми.', timestamp: '14:35', likes: 4 },
      { id: 'c2', author: 'Артем Б.', text: 'Які вимоги до велосипеда? Шосейник підійде чи краще гірський?', timestamp: '15:10', likes: 2 }
    ]
  },
  {
    id: 'post-2',
    author: 'Ганна Василівна',
    authorRole: 'Староста села Кисоричі',
    isVerified: true,
    category: 'initiative',
    title: '🌿 Еко-суботник "Чисті береги річки Льва" — долучаймося разом!',
    content: 'Шановні жителі громади! Запрошуємо на загальну толоку прибирання прибережної смуги річки Льва. Рукавиці та сміттєві пакети надає селищна рада. По завершенню — частування поліським чаєм з травами та дерунами!',
    likes: 67,
    sharesCount: 15,
    commentsCount: 9,
    timestamp: 'Учора о 18:45',
    settlement: 'с. Кисоричі',
    isPopular: true,
    comments: [
      { id: 'c3', author: 'Ігор С.', text: 'Дякуємо за ініціативу! Будемо всією родиною.', timestamp: 'Учора 19:10', likes: 9 }
    ]
  }
];

export const TourismCommunityTab: React.FC<TourismCommunityTabProps> = ({ onNavigateTab }) => {
  const [subTab, setSubTab] = useState<'feed' | 'tourism' | 'polls' | 'chat'>('feed');
  const [postsFilter, setPostsFilter] = useState<string>('all');
  const [posts, setPosts] = useState<ForumPost[]>(INITIAL_FORUM_POSTS);
  const [activeStory, setActiveStory] = useState<SocialStory | null>(null);
  const [stories, setStories] = useState<SocialStory[]>(STORIES);

  // Hashtag filter
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);

  // New Post Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState<ForumPost['category']>('discussion');
  const [newSettlement, setNewSettlement] = useState('смт Рокитне');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);

  // Lightbox modal for post photos
  const [activeImageZoom, setActiveImageZoom] = useState<string | null>(null);

  // Comments toggle per post
  const [openCommentsMap, setOpenCommentsMap] = useState<{ [postId: string]: boolean }>({});
  const [commentTextMap, setCommentTextMap] = useState<{ [postId: string]: string }>({});

  // Direct Message Modal
  const [chatNeighbor, setChatNeighbor] = useState<ActiveNeighbor | null>(null);
  const [chatMessages, setChatMessages] = useState<{ sender: 'me' | 'other'; text: string; time: string }[]>([
    { sender: 'other', text: 'Привіт! Чим можу допомогти по питанню в Рокитному?', time: '12:05' }
  ]);
  const [newChatMessage, setNewChatMessage] = useState('');

  // Share Notification Feedback
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null);

  // Story Creation Simulator
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStoryCaption, setNewStoryCaption] = useState('');

  // Reactions count map
  const [postReactions, setPostReactions] = useState<{ [postId: string]: string }>({});

  // Toggle Like with Reactions
  const handleLike = (postId: string, reactionType: string = 'like') => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const isLiked = !p.isLiked;
          return {
            ...p,
            isLiked,
            likes: isLiked ? p.likes + 1 : Math.max(0, p.likes - 1)
          };
        }
        return p;
      })
    );
    setPostReactions(prev => ({ ...prev, [postId]: reactionType }));
  };

  // Toggle Comments section display
  const toggleComments = (postId: string) => {
    setOpenCommentsMap(prev => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Bookmark Toggle
  const handleBookmark = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return { ...p, isBookmarked: !p.isBookmarked };
        }
        return p;
      })
    );
  };

  // Poll Vote
  const handleVote = (postId: string, optionId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId && p.pollOptions) {
          if (p.userVotedOptionId) return p; // already voted
          const updatedOptions = p.pollOptions.map(opt =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          );
          return {
            ...p,
            pollOptions: updatedOptions,
            userVotedOptionId: optionId
          };
        }
        return p;
      })
    );
  };

  // Add Comment Live
  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentTextMap[postId]?.trim();
    if (!text) return;

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const newComment = {
            id: `c-${Date.now()}`,
            author: newAuthor.trim() || 'Житель Громади',
            text,
            timestamp: 'Щойно',
            likes: 1
          };
          const existingComments = p.comments || [];
          return {
            ...p,
            comments: [...existingComments, newComment],
            commentsCount: (p.commentsCount || 0) + 1
          };
        }
        return p;
      })
    );

    setCommentTextMap(prev => ({ ...prev, [postId]: '' }));
  };

  // Like a specific comment
  const handleLikeComment = (postId: string, commentId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId && p.comments) {
          const updatedComments = p.comments.map(c =>
            c.id === commentId ? { ...c, likes: c.likes + 1 } : c
          );
          return { ...p, comments: updatedComments };
        }
        return p;
      })
    );
  };

  // Share Post
  const handleShare = (postId: string) => {
    setPosts(prev =>
      prev.map(p => (p.id === postId ? { ...p, sharesCount: (p.sharesCount || 0) + 1 } : p))
    );
    setCopiedPostId(postId);
    setTimeout(() => setCopiedPostId(null), 2500);
  };

  // Create New Post Submission
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;

    const post: ForumPost = {
      id: `post-${Date.now()}`,
      author: newAuthor.trim() || 'Житель Рокитного',
      authorRole: 'Житель Громади',
      isVerified: false,
      category: newCategory,
      title: newTitle.trim() || 'Допис жителя громади',
      content: newContent,
      mediaUrl: newMediaUrl.trim() || undefined,
      likes: 1,
      sharesCount: 0,
      commentsCount: 0,
      timestamp: 'Щойно',
      settlement: newSettlement,
      comments: []
    };

    setPosts([post, ...posts]);
    setNewTitle('');
    setNewContent('');
    setNewMediaUrl('');
    setShowMediaInput(false);
    setIsCreateModalOpen(false);
  };

  // Create Story Submission
  const handleAddStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStoryTitle.trim()) return;

    const story: SocialStory = {
      id: `s-${Date.now()}`,
      title: newStoryTitle,
      subtitle: newStoryCaption || 'Моя історія',
      imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
      authorName: newAuthor.trim() || 'Я (Житель)',
      authorRole: 'Житель',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      isOfficial: false,
      unseen: true,
      timeAgo: 'Щойно',
      content: newStoryCaption || 'Вітання всім жителям Рокитнівської громади!'
    };

    setStories([story, ...stories]);
    setNewStoryTitle('');
    setNewStoryCaption('');
    setIsAddStoryOpen(false);
  };

  // Send Direct Message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatMessage.trim()) return;

    setChatMessages(prev => [
      ...prev,
      { sender: 'me', text: newChatMessage.trim(), time: 'Щойно' }
    ]);
    setNewChatMessage('');

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        { sender: 'other', text: 'Дякую за повідомлення! Вже переглядаю.', time: 'Щойно' }
      ]);
    }, 1200);
  };

  // Filtered posts
  const filteredPosts = posts.filter(post => {
    if (selectedHashtag) {
      return (
        post.content.toLowerCase().includes(selectedHashtag.toLowerCase()) ||
        post.title.toLowerCase().includes(selectedHashtag.toLowerCase())
      );
    }
    if (postsFilter === 'official') return post.isVerified;
    if (postsFilter === 'poll') return post.category === 'poll';
    if (postsFilter === 'recreation') return post.category === 'recreation_meet' || post.category === 'photo';
    if (postsFilter === 'initiative') return post.category === 'initiative';
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn text-slate-100">
      {/* Social Network Top Banner Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-950 via-cyan-950 to-emerald-950 border border-cyan-500/30 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Соціальна Мережа Рокитнівської Громади</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
              Рокитне Social — Головна Стрічка
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Офіційні оголошення селищного голови, фотографії Блакитного озера, волонтерські ініціативи, опитування та спілкування жителів Рокитнівщини.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Створити Допис</span>
            </button>
          </div>
        </div>

        {/* Sub-Tabs Selector */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => { setSubTab('feed'); setSelectedHashtag(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              subTab === 'feed' && !selectedHashtag
                ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-lg shadow-cyan-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <span>📲 Стрічка Громади</span>
          </button>

          <button
            onClick={() => { setSubTab('tourism'); setSelectedHashtag(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              subTab === 'tourism'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>🏞️ Туризм & Блакитне Озеро</span>
          </button>

          <button
            onClick={() => { setSubTab('polls'); setSelectedHashtag(null); }}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              subTab === 'polls'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span>🗳️ Опитування Громади</span>
          </button>

          {selectedHashtag && (
            <div className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-2">
              <Hash className="w-3.5 h-3.5" />
              <span>{selectedHashtag}</span>
              <button
                onClick={() => setSelectedHashtag(null)}
                className="p-0.5 hover:bg-cyan-500/30 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* STORIES CAROUSEL (Instagram/Facebook Style) */}
      <div className="bg-slate-900/90 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
          <div className="flex items-center gap-2 text-slate-200">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span className="uppercase tracking-wider text-[11px] font-black">Історії Рокитного (Stories)</span>
          </div>
          <span className="text-[11px] text-cyan-400">Натисніть для перегляду</span>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          {/* Add Story Button */}
          <button
            onClick={() => setIsAddStoryOpen(true)}
            className="flex-shrink-0 w-28 h-40 sm:w-32 sm:h-44 rounded-2xl bg-slate-950 border border-dashed border-cyan-500/40 hover:border-cyan-400 p-3 flex flex-col items-center justify-center text-center group transition-all hover:scale-105"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-110 transition-transform mb-2">
              <div className="w-full h-full bg-slate-900 rounded-full flex items-center justify-center">
                <Plus className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">Додати історію</span>
            <span className="text-[10px] text-slate-500 mt-1">Фото чи новину</span>
          </button>

          {/* Stories List */}
          {stories.map(story => (
            <button
              key={story.id}
              onClick={() => {
                setActiveStory(story);
                setStories(prev => prev.map(s => s.id === story.id ? { ...s, unseen: false } : s));
              }}
              className="flex-shrink-0 relative w-28 h-40 sm:w-32 sm:h-44 rounded-2xl overflow-hidden group border border-slate-800 transition-all hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/10 text-left"
            >
              <img
                src={story.imageUrl}
                alt={story.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Story Author Avatar Ring */}
              <div className={`absolute top-2.5 left-2.5 w-9 h-9 rounded-full p-0.5 ${
                story.unseen ? 'bg-gradient-to-tr from-amber-500 via-cyan-500 to-emerald-500 animate-pulse' : 'bg-slate-700'
              }`}>
                <img
                  src={story.authorAvatar}
                  alt={story.authorName}
                  className="w-full h-full rounded-full object-cover border border-slate-950"
                />
              </div>

              {/* Story Details */}
              <div className="absolute bottom-2.5 left-2.5 right-2.5 space-y-0.5">
                <p className="text-[11px] font-black text-white leading-tight line-clamp-1 group-hover:text-cyan-300">
                  {story.title}
                </p>
                <p className="text-[9px] text-slate-300 line-clamp-1">{story.authorName}</p>
              </div>

              {story.unseen && (
                <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-full bg-cyan-500 text-[8px] font-black text-slate-950 uppercase tracking-wider">
                  Нова
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN SOCIAL NETWORK LAYOUT GRID */}
      {subTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* CENTER SOCIAL FEED (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Quick Post Creator Card (Facebook Style) */}
            <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                  alt="Мой Аватар"
                  className="w-11 h-11 rounded-full object-cover border-2 border-cyan-500/50"
                />
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex-1 bg-slate-950 hover:bg-slate-800 text-left px-4 py-3 rounded-2xl text-xs sm:text-sm text-slate-400 border border-slate-800 hover:border-cyan-500/40 transition-all font-medium"
                >
                  Що у вас нового, сусіде? Напишіть у стрічку...
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2 overflow-x-auto text-xs font-bold text-slate-400">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-emerald-400 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-emerald-400" />
                  <span>Фото / Відео</span>
                </button>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-amber-400 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-amber-400" />
                  <span>Локація</span>
                </button>

                <button
                  onClick={() => {
                    setNewCategory('poll');
                    setIsCreateModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-purple-400 transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                  <span>Опитування</span>
                </button>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-800 hover:text-cyan-400 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Подія</span>
                </button>
              </div>
            </div>

            {/* FEED CATEGORY FILTER PILLS */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs font-bold">
              <button
                onClick={() => setPostsFilter('all')}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                  postsFilter === 'all'
                    ? 'bg-slate-200 text-slate-950 font-extrabold shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                Всі Дописи
              </button>

              <button
                onClick={() => setPostsFilter('official')}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  postsFilter === 'official'
                    ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-cyan-300'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Офіційні</span>
              </button>

              <button
                onClick={() => setPostsFilter('recreation')}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  postsFilter === 'recreation'
                    ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-emerald-300'
                }`}
              >
                <Waves className="w-3.5 h-3.5 text-emerald-400" />
                <span>Відпочинок & Блакитне Озеро</span>
              </button>

              <button
                onClick={() => setPostsFilter('poll')}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  postsFilter === 'poll'
                    ? 'bg-purple-500 text-slate-950 font-extrabold shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-purple-300'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-purple-400" />
                <span>Опитування</span>
              </button>

              <button
                onClick={() => setPostsFilter('initiative')}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  postsFilter === 'initiative'
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-amber-300'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                <span>Волонтерство & Толоки</span>
              </button>
            </div>

            {/* POSTS LIST */}
            <div className="space-y-6">
              {filteredPosts.map(post => {
                const totalVotes = post.pollOptions?.reduce((acc, curr) => acc + curr.votes, 0) || 0;
                const isCommentsOpen = openCommentsMap[post.id];
                const activeReaction = postReactions[post.id];

                return (
                  <article
                    key={post.id}
                    className={`bg-slate-900/90 rounded-3xl p-5 sm:p-6 border transition-all duration-300 shadow-xl ${
                      post.isVerified
                        ? 'border-cyan-500/40 bg-gradient-to-b from-slate-900 to-cyan-950/20'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Post Author Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={
                              post.isVerified
                                ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
                                : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
                            }
                            alt={post.author}
                            className="w-11 h-11 rounded-full object-cover border-2 border-slate-700"
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-extrabold text-white text-sm hover:text-cyan-300 transition-colors">
                              {post.author}
                            </h3>
                            {post.isVerified && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                                Офіційно
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            <span>{post.authorRole}</span>
                            <span>•</span>
                            <span>{post.timestamp}</span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 text-slate-300 font-medium">
                              <MapPin className="w-3 h-3 text-amber-400" />
                              {post.settlement}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 text-slate-400">
                        <button
                          onClick={() => handleBookmark(post.id)}
                          className={`p-2 rounded-xl hover:bg-slate-800 transition-colors ${
                            post.isBookmarked ? 'text-amber-400 bg-amber-500/10' : ''
                          }`}
                          title="Зберегти допис"
                        >
                          <Bookmark className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Post Title & Content */}
                    <div className="space-y-3 mb-4">
                      {post.title && (
                        <h2 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                          {post.title}
                        </h2>
                      )}

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>
                    </div>

                    {/* Post Media Attachment */}
                    {post.mediaUrl && (
                      <div
                        onClick={() => setActiveImageZoom(post.mediaUrl!)}
                        className="relative rounded-2xl overflow-hidden my-4 group cursor-pointer border border-slate-800"
                      >
                        <img
                          src={post.mediaUrl}
                          alt="Медіа допису"
                          className="w-full max-h-96 object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="px-3 py-1.5 rounded-xl bg-slate-900/90 text-white text-xs font-bold flex items-center gap-2">
                            <Eye className="w-4 h-4 text-cyan-400" />
                            Збільшити фото
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Poll Card (if Poll) */}
                    {post.category === 'poll' && post.pollOptions && (
                      <div className="my-4 bg-slate-950/80 rounded-2xl p-4 border border-purple-500/30 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                          <span>Всього проголосувало: {totalVotes} жителів</span>
                          {post.userVotedOptionId && <span className="text-emerald-400">✓ Ваш голос враховано</span>}
                        </div>

                        <div className="space-y-2.5">
                          {post.pollOptions.map(opt => {
                            const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                            const isVotedByMe = post.userVotedOptionId === opt.id;

                            return (
                              <button
                                key={opt.id}
                                disabled={!!post.userVotedOptionId}
                                onClick={() => handleVote(post.id, opt.id)}
                                className={`w-full relative overflow-hidden rounded-xl p-3 text-left border transition-all ${
                                  isVotedByMe
                                    ? 'border-purple-400 bg-purple-950/40'
                                    : 'border-slate-800 bg-slate-900 hover:border-purple-500/50'
                                }`}
                              >
                                {/* Progress background bar */}
                                <div
                                  className="absolute inset-y-0 left-0 bg-purple-600/20 transition-all duration-500"
                                  style={{ width: `${percent}%` }}
                                />

                                <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm">
                                  <span className="font-semibold text-slate-100">{opt.text}</span>
                                  <span className="font-bold text-purple-300 ml-2">{percent}% ({opt.votes})</span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Reactions Counters Line */}
                    <div className="flex items-center justify-between text-xs text-slate-400 py-2 border-t border-b border-slate-800/80 my-3">
                      <div className="flex items-center gap-1.5">
                        <span className="flex -space-x-1">
                          <span className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center text-[10px]">👍</span>
                          <span className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px]">❤️</span>
                          <span className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[10px]">🔥</span>
                        </span>
                        <span className="font-bold text-slate-300">{post.likes}</span>
                      </div>

                      <div className="flex items-center gap-4 text-[11px]">
                        <button onClick={() => toggleComments(post.id)} className="hover:text-cyan-300">
                          {post.commentsCount || post.comments?.length || 0} коментарів
                        </button>
                        <span>•</span>
                        <span>{post.sharesCount} поширень</span>
                      </div>
                    </div>

                    {/* Post Action Buttons Row (Like, Comment, Share) */}
                    <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                      <div className="relative group/react">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                            post.isLiked
                              ? 'bg-cyan-500/10 text-cyan-400'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span>{post.isLiked ? 'Вподобано' : 'Подобається'}</span>
                        </button>

                        {/* Hover Quick Emoji Bar */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover/react:flex items-center gap-1 bg-slate-950 p-1.5 rounded-full border border-slate-700 shadow-2xl z-20 animate-fadeIn">
                          {['👍', '❤️', '🔥', '💡', '😮'].map(emoji => (
                            <button
                              key={emoji}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleLike(post.id, emoji);
                              }}
                              className="w-7 h-7 hover:scale-125 transition-transform flex items-center justify-center text-sm"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => toggleComments(post.id)}
                        className={`w-full py-2 rounded-xl flex items-center justify-center gap-2 transition-colors ${
                          isCommentsOpen
                            ? 'bg-teal-500/10 text-teal-400'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Коментар</span>
                      </button>

                      <button
                        onClick={() => handleShare(post.id)}
                        className="w-full py-2 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 flex items-center justify-center gap-2 transition-colors relative"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>{copiedPostId === post.id ? 'Скопійовано!' : 'Поділитися'}</span>
                      </button>
                    </div>

                    {/* COMMENTS SECTION */}
                    {isCommentsOpen && (
                      <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 animate-fadeIn">
                        {/* New Comment Input */}
                        <form onSubmit={(e) => handleAddComment(post.id, e)} className="flex items-center gap-2">
                          <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"
                            alt="Аватар"
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <input
                            type="text"
                            placeholder="Напишіть відповідь чи коментар..."
                            value={commentTextMap[post.id] || ''}
                            onChange={(e) => setCommentTextMap({ ...commentTextMap, [post.id]: e.target.value })}
                            className="flex-1 bg-slate-950 text-xs text-white placeholder-slate-500 px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                          />
                          <button
                            type="submit"
                            className="p-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-colors"
                          >
                            <SendHorizontal className="w-4 h-4" />
                          </button>
                        </form>

                        {/* Existing Comments List */}
                        <div className="space-y-3 pt-2">
                          {post.comments?.map(comment => (
                            <div key={comment.id} className="flex items-start gap-2.5 text-xs bg-slate-950/60 p-3 rounded-2xl border border-slate-800/60">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-500 flex items-center justify-center font-bold text-slate-950 text-[10px]">
                                {comment.author[0]}
                              </div>
                              <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-200">{comment.author}</span>
                                  <span className="text-[10px] text-slate-500">{comment.timestamp}</span>
                                </div>
                                <p className="text-slate-300 leading-relaxed">{comment.text}</p>
                              </div>
                              <button
                                onClick={() => handleLikeComment(post.id, comment.id)}
                                className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-red-400 transition-colors self-end"
                              >
                                <Heart className="w-3 h-3 text-red-500" />
                                <span>{comment.likes}</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>

          {/* RIGHT SIDEBAR WIDGETS (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Widget 1: Popular Hashtags */}
            <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                <Hash className="w-4 h-4 text-cyan-400" />
                <span>Тренди Громади (#Хештеги)</span>
              </div>

              <div className="space-y-2 pt-1">
                {[
                  { tag: '#БлакитнеОзеро2026', count: '142 дописи', highlight: true },
                  { tag: '#ЦНАПЗапис', count: '89 дописів' },
                  { tag: '#ЕкоТолока', count: '64 дописи' },
                  { tag: '#СплавРічкоюЛьва', count: '51 допис' },
                  { tag: '#МолодьРокитного', count: '38 дописів' }
                ].map(item => (
                  <button
                    key={item.tag}
                    onClick={() => setSelectedHashtag(item.tag)}
                    className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800/80 text-left transition-all group"
                  >
                    <span className="text-xs font-extrabold text-cyan-300 group-hover:text-cyan-200">{item.tag}</span>
                    <span className="text-[10px] text-slate-400">{item.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Widget 2: Active Neighbors Online */}
            <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Активні Сусіди (Онлайн)</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px]">
                  3 онлайн
                </span>
              </div>

              <div className="space-y-3">
                {ACTIVE_NEIGHBORS.map(neighbor => (
                  <div key={neighbor.id} className="flex items-center justify-between gap-3 p-2 rounded-2xl hover:bg-slate-800/60 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="relative">
                        <img
                          src={neighbor.avatar}
                          alt={neighbor.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                        />
                        {neighbor.isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-slate-900" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-100">{neighbor.name}</p>
                        <p className="text-[10px] text-slate-400">{neighbor.role}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setChatNeighbor(neighbor)}
                      className="px-2.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 text-[11px] font-bold transition-all flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>Чат</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget 3: Upcoming Community Events */}
            <div className="bg-slate-900/90 rounded-3xl p-5 border border-slate-800 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Найближчі Події</span>
              </div>

              <div className="space-y-3">
                {[
                  { day: '12 СЕР', title: 'Велозаїзд "Рокитне - Озеро"', loc: 'Площа Незалежності' },
                  { day: '15 СЕР', title: 'Еко-Толока прибирання берега', loc: 'р. Льва, с. Кисоричі' }
                ].map((event, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex flex-col items-center justify-center font-black leading-none text-center p-1">
                      <span className="text-[10px]">{event.day.split(' ')[1]}</span>
                      <span className="text-sm">{event.day.split(' ')[0]}</span>
                    </div>

                    <div className="space-y-0.5 flex-1">
                      <p className="text-xs font-bold text-slate-100">{event.title}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-400" />
                        {event.loc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOURISM & RECREATION SPOTS SUB-TAB */}
      {subTab === 'tourism' && (
        <div className="space-y-8 animate-fadeIn">
          <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl">
            <h2 className="text-xl font-black text-white mb-2">🏞️ Туристичні Перлини та Зони Відпочинку</h2>
            <p className="text-xs text-slate-300">
              Офіційний туристичний довідник Рокитнівщини: затоплені гранітні кар’єри, еко-стежки, сплави на байдарках та бази відпочинку.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TOURISM_SPOTS.map(spot => (
              <div key={spot.id} className="bg-slate-900/90 rounded-3xl overflow-hidden border border-slate-800 shadow-xl hover:border-emerald-500/40 transition-all flex flex-col">
                <div className="relative h-48 overflow-hidden group">
                  <img
                    src={spot.imageUrl}
                    alt={spot.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                  <span className="absolute top-3 right-3 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 font-black text-xs shadow-lg">
                    ★ {spot.rating} ({spot.reviewsCount})
                  </span>
                </div>

                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">{spot.title}</h3>
                    <p className="text-xs text-amber-400 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {spot.location}
                    </p>
                    <p className="text-xs text-slate-300 leading-relaxed">{spot.description}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800">
                    <div className="flex flex-wrap gap-1.5">
                      {spot.features.map((feat, i) => (
                        <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 text-[11px] border border-slate-800">
                          ✓ {feat}
                        </span>
                      ))}
                    </div>

                    {spot.contactInfo && (
                      <p className="text-xs font-bold text-cyan-300">
                        📞 {spot.contactInfo}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POLLS SUB-TAB */}
      {subTab === 'polls' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="bg-slate-900/90 rounded-3xl p-6 border border-slate-800 shadow-xl">
            <h2 className="text-xl font-black text-white mb-2">🗳️ Публічні Опитування та Голосування Громади</h2>
            <p className="text-xs text-slate-300">
              Ваш голос має значення! Берить участь у вирішенні питань благоустрою та грантових проектів селища.
            </p>
          </div>

          <div className="space-y-6">
            {posts.filter(p => p.category === 'poll').map(pollPost => {
              const totalVotes = pollPost.pollOptions?.reduce((acc, curr) => acc + curr.votes, 0) || 0;

              return (
                <div key={pollPost.id} className="bg-slate-900/90 rounded-3xl p-6 border border-purple-500/40 shadow-xl space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                    <BarChart3 className="w-4 h-4" />
                    <span>Офіційне Голосування • {pollPost.settlement}</span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{pollPost.title}</h3>
                  <p className="text-xs text-slate-300">{pollPost.content}</p>

                  <div className="space-y-3 pt-2">
                    {pollPost.pollOptions?.map(opt => {
                      const percent = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
                      return (
                        <button
                          key={opt.id}
                          disabled={!!pollPost.userVotedOptionId}
                          onClick={() => handleVote(pollPost.id, opt.id)}
                          className="w-full relative overflow-hidden rounded-2xl p-4 text-left border border-slate-800 bg-slate-950 hover:border-purple-400 transition-all"
                        >
                          <div
                            className="absolute inset-y-0 left-0 bg-purple-600/30 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                          <div className="relative z-10 flex items-center justify-between text-xs sm:text-sm">
                            <span className="font-bold text-white">{opt.text}</span>
                            <span className="font-extrabold text-purple-300">{percent}% ({opt.votes} голосів)</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* CREATE POST MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 rounded-3xl max-w-lg w-full p-6 border border-slate-800 shadow-2xl space-y-5 relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
              <Plus className="w-5 h-5" />
              <span>Створити Допис у Стрічку Громади</span>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Ваше Ім'я / Посада</label>
                <input
                  type="text"
                  placeholder="напр. Іван Петренко"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Населений пункт</label>
                  <select
                    value={newSettlement}
                    onChange={(e) => setNewSettlement(e.target.value)}
                    className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="смт Рокитне">смт Рокитне</option>
                    <option value="с. Кисоричі">с. Кисоричі</option>
                    <option value="с. Томашгород">с. Томашгород</option>
                    <option value="с. Осницьк">с. Осницьк</option>
                    <option value="Блакитне Озеро">Блакитне Озеро</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Категорія</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="discussion">Загальне обговорення</option>
                    <option value="recreation_meet">Відпочинок & Вело</option>
                    <option value="initiative">Волонтерство & Толока</option>
                    <option value="announcement">Оголошення</option>
                    <option value="poll">Опитування</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Заголовок (необов'язково)</label>
                <input
                  type="text"
                  placeholder="Тема допису..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Текст Повідомлення *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Розкажіть про подію, ініціативу чи поставте запитання жителям..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-semibold">URL Зображення (необов'язково)</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-black hover:scale-105 transition-all shadow-lg shadow-cyan-500/20"
                >
                  Опублікувати
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULLSCREEN STORY VIEWER MODAL */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative max-w-sm w-full h-[540px] rounded-3xl overflow-hidden border border-slate-700 shadow-2xl flex flex-col justify-between p-5 bg-slate-900">
            <img
              src={activeStory.imageUrl}
              alt={activeStory.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-slate-950/60" />

            {/* Story Top Bar */}
            <div className="relative z-10 space-y-3">
              <div className="w-full bg-slate-700/60 h-1 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-3/4 animate-pulse" />
              </div>

              <div className="flex items-center justify-between text-white">
                <div className="flex items-center gap-2">
                  <img
                    src={activeStory.authorAvatar}
                    alt={activeStory.authorName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-cyan-400"
                  />
                  <div>
                    <p className="text-xs font-bold">{activeStory.authorName}</p>
                    <p className="text-[10px] text-slate-300">{activeStory.timeAgo}</p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveStory(null)}
                  className="p-1.5 rounded-full bg-slate-950/60 hover:bg-slate-800 text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Story Bottom Content */}
            <div className="relative z-10 space-y-3">
              <div className="space-y-1">
                <h3 className="text-lg font-black text-white">{activeStory.title}</h3>
                <p className="text-xs text-slate-200">{activeStory.content}</p>
              </div>

              <div className="flex items-center gap-2 pt-2">
                {['❤️', '🔥', '👏', '😍'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setActiveStory(null)}
                    className="flex-1 py-2 rounded-xl bg-slate-950/80 hover:bg-slate-800 text-sm flex items-center justify-center transition-transform hover:scale-110"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD STORY MODAL */}
      {isAddStoryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 rounded-3xl max-w-md w-full p-6 border border-slate-800 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setIsAddStoryOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white">Додати нову Історію (Story)</h3>

            <form onSubmit={handleAddStory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Короткий Заголовок</label>
                <input
                  type="text"
                  required
                  placeholder="напр. Пляж на Блакитному"
                  value={newStoryTitle}
                  onChange={(e) => setNewStoryTitle(e.target.value)}
                  className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Опис / Підпис</label>
                <input
                  type="text"
                  placeholder="Чудовий сонячний день у Рокитному!"
                  value={newStoryCaption}
                  onChange={(e) => setNewStoryCaption(e.target.value)}
                  className="w-full bg-slate-950 text-white p-3 rounded-xl border border-slate-800"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold"
                >
                  Опублікувати Історію
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DIRECT CHAT MODAL WITH ACTIVE NEIGHBOR */}
      {chatNeighbor && (
        <div className="fixed bottom-4 right-4 z-50 w-80 sm:w-96 bg-slate-900 rounded-3xl border border-cyan-500/40 shadow-2xl p-4 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <img
                src={chatNeighbor.avatar}
                alt={chatNeighbor.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div>
                <p className="text-xs font-bold text-white">{chatNeighbor.name}</p>
                <p className="text-[9px] text-emerald-400">🟢 Онлайн в Рокитному</p>
              </div>
            </div>

            <button
              onClick={() => setChatNeighbor(null)}
              className="p-1 rounded-full hover:bg-slate-800 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="h-48 overflow-y-auto space-y-2 p-1 scrollbar-none text-xs">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-2.5 rounded-2xl ${
                    msg.sender === 'me'
                      ? 'bg-cyan-600 text-white rounded-br-none'
                      : 'bg-slate-950 text-slate-200 border border-slate-800 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="text-[9px] opacity-60 block text-right mt-0.5">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChatMessage} className="flex items-center gap-2 pt-1">
            <input
              type="text"
              placeholder="Напишіть повідомлення..."
              value={newChatMessage}
              onChange={(e) => setNewChatMessage(e.target.value)}
              className="flex-1 bg-slate-950 text-xs text-white p-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* IMAGE LIGHTBOX MODAL */}
      {activeImageZoom && (
        <div
          onClick={() => setActiveImageZoom(null)}
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-4 cursor-zoom-out animate-fadeIn"
        >
          <img
            src={activeImageZoom}
            alt="Збільшене медіа"
            className="max-w-4xl max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-slate-700"
          />
        </div>
      )}
    </div>
  );
};
