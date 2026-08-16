import React from 'react';

export type RobotState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'happy' | 'explaining' | 'serious' | 'sympathetic';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot' | 'system';
  text: string;
  timestamp: string;
  quickActions?: {
    label: string;
    action: string;
    payload?: any;
  }[];
  sources?: { title: string; url: string }[];
  category?: string;
  documentDraft?: string;
  emotion?: RobotState;
}

export interface CnapService {
  id: string;
  code: string;
  category: 'passport' | 'residence' | 'social' | 'land' | 'construction' | 'business' | 'veterans' | 'certificates' | string;
  title: string;
  description: string;
  requiredDocuments: string[];
  processingDays: number;
  feeUah: number;
  onlineBookingAvailable: boolean;
  department: string;
}

export type CnapServiceItem = CnapService;

export interface CnapTicket {
  ticketCode: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  fullName: string;
  phone: string;
  status: 'active' | 'completed' | 'cancelled';
  qrCodeData: string;
  createdTime: string;
}

export interface InfrastructureNode {
  id: string;
  name: string;
  title?: string;
  type?: 'cnap' | 'starosta' | 'education' | 'medical' | 'shelter' | 'communal' | 'culture' | 'business' | 'problem' | string;
  category?: string;
  address: string;
  settlement?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  phone?: string;
  hours?: string;
  headName?: string;
  description: string;
  servicesAvailable?: string[];
  isPointOfInvincibility?: boolean;
  categoryTag?: string;
  statusTag?: string;
  status?: string;
  capacity?: number;
  workingHours?: string;
  contactPhone?: string;
}

export interface SocialInquiry {
  id: string;
  category: 'vpo' | 'veteran_support' | 'material_help' | 'utilities' | 'pension' | 'mayor_appeal' | string;
  title?: string;
  subject?: string;
  fullName?: string;
  phone?: string;
  address?: string;
  details?: string;
  description?: string;
  status: 'new' | 'ai_processed' | 'registered' | 'in_progress' | 'resolved' | 'closed' | 'pending' | string;
  aiResponse?: string;
  suggestedDocuments?: string[];
  createdDate?: string;
  createdAt?: string;
  departmentAssigned?: string;
  department?: string;
  trackingNumber?: string;
  trackingCode?: string;
  applicantName?: string;
  applicantPhone?: string;
  responseDueDate?: string;
  officialResponse?: string;
  messagesThread?: { sender: string; text: string; time: string }[];
}

export type SocialRequest = SocialInquiry;

export interface TourismSpot {
  id: string;
  title: string;
  category: 'nature_lake' | 'forest_trail' | 'recreation_camp' | 'fishing' | 'historic_heritage' | 'gastro_cafe' | string;
  description: string;
  location: string;
  coordinates?: { lat: number; lng: number };
  features: string[];
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  bestSeason: string;
  contactInfo?: string;
  amenities: string[];
}

// --- COMMUNITY PROBLEMS ("ПРОБЛЕМИ ГРОМАДИ") ---

export type ProblemCategory =
  | 'дороди'
  | 'освітлення'
  | 'вода'
  | 'сміття'
  | 'благоустрій'
  | 'дерева'
  | 'транспорт'
  | 'жкг'
  | 'медицина'
  | 'освіта'
  | 'безпека'
  | 'інше'
  | string;

export type ProblemStatus = 'new' | 'accepted' | 'in_progress' | 'resolved' | 'closed';

export interface CommunityProblem {
  id: string;
  title: string;
  description: string;
  category: ProblemCategory;
  settlement: string;
  address: string;
  coordinates?: { lat: number; lng: number };
  imageUrl?: string;
  videoUrl?: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  status: ProblemStatus;
  statusProgress: number; // 0 to 100
  assignedDepartment: string;
  upvotesCount: number;
  userVoted?: boolean;
  commentsCount: number;
  updatesHistory: { date: string; status: string; note: string }[];
}

// --- PETITIONS ("ПЕТИЦІЇ") ---

export interface CommunityPetition {
  id: string;
  title: string;
  description: string;
  category: string;
  authorName: string;
  authorAvatar: string;
  createdDate: string;
  endDate: string;
  signaturesCount: number;
  signaturesGoal: number; // e.g. 1000
  status: 'active' | 'review' | 'accepted' | 'rejected' | 'completed' | string;
  imageUrl?: string;
  userSigned?: boolean;
  commentsCount: number;
  officialAnswer?: string;
}

// --- BUSINESS & MARKETPLACE ("БІЗНЕС") ---

export type BusinessCategory =
  | 'автомобілі'
  | 'нерухомість'
  | 'техніка'
  | 'електроніка'
  | 'одяг'
  | 'меблі'
  | 'будматеріали'
  | 'тварини'
  | 'послуги'
  | 'робота'
  | 'продукція'
  | 'фермерство'
  | 'оренда'
  | 'купівля'
  | 'продаж'
  | 'auto'
  | 'realty'
  | 'services'
  | 'agro'
  | 'jobs'
  | 'electronics'
  | 'animals'
  | 'інше'
  | string;

export interface BusinessListing {
  id: string;
  title: string;
  priceUah: number;
  category: BusinessCategory;
  subcategory?: string;
  sellerName: string;
  sellerAvatar: string;
  sellerPhone: string;
  sellerEmail?: string;
  settlement: string;
  location?: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
  imageUrl?: string;
  imageUrls?: string[];
  galleryUrls?: string[];
  description: string;
  dateAdded?: string;
  viewsCount?: number;
  favoritesCount?: number;
  isFavorite?: boolean;
  isVerifiedSeller?: boolean;
  isVerifiedBusiness?: boolean;
  companyName?: string;
  specs?: Record<string, string>;
  isOlxArchive?: boolean;
  olxId?: string;
  olxStatus?: 'active' | 'archived' | 'sold';
  olxOriginalDate?: string;
  condition?: 'new' | 'used' | 'craft' | string;
}

// --- ROKYTA SOCIAL NETWORK TYPES (FB-STYLE) ---

export type ReactionType = 'like' | 'love' | 'wow' | 'bravo' | 'helpful';

export interface PostComment {
  id: string;
  author?: string;
  authorName?: string;
  authorAvatar?: string;
  authorRole?: string;
  isVerified?: boolean;
  text: string;
  timestamp?: string;
  createdAt?: string;
  likesCount?: number;
  likes?: number;
  isLiked?: boolean;
}

export interface RokytaPost {
  id: string;
  author?: string;
  authorName?: string;
  authorAvatar?: string;
  authorRole?: string;
  isOfficialAccount?: boolean;
  isVerified?: boolean;
  settlement?: string;
  timestamp?: string;
  createdAt?: string;
  privacy?: 'public' | 'friends' | 'community';
  category: string;
  title?: string;
  content: string;
  mediaUrl?: string;
  imageUrls?: string[];
  mediaType?: 'image' | 'video' | 'gallery';
  mediaGallery?: string[];
  feeling?: string;
  locationTag?: string;
  problemRefId?: string;
  petitionRefId?: string;
  businessRefId?: string;
  reactions?: {
    like: number;
    love: number;
    wow: number;
    bravo: number;
    helpful: number;
  };
  likesCount?: number;
  likes?: number;
  userLiked?: boolean;
  userReaction?: ReactionType | null;
  commentsCount: number;
  sharesCount: number;
  comments?: PostComment[];
  isBookmarked?: boolean;
  isPopular?: boolean;
  pollOptions?: { id: string; option?: string; text?: string; votes: number }[];
  groupId?: string;
  groupName?: string;
}

export type SocialPost = RokytaPost;
export type ForumPost = RokytaPost;

export interface RokytaStory {
  id: string;
  title?: string;
  subtitle?: string;
  content?: string;
  mediaUrl?: string;
  authorName: string;
  authorAvatar?: string;
  authorRole?: string;
  isVerified?: boolean;
  isOfficial?: boolean;
  imageUrl?: string;
  caption?: string;
  timeAgo?: string;
  unseen?: boolean;
}

export type StoryItem = RokytaStory;
export type SocialStory = RokytaStory;

export interface RokytaGroup {
  id: string;
  name: string;
  category: string;
  coverImage: string;
  avatarImage: string;
  membersCount: number;
  description: string;
  isJoined?: boolean;
  privacy: 'Відкрита' | 'Закрита';
  recentActivity: string;
}

export interface RokytaEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  organizerAvatar: string;
  coverImage: string;
  category: 'Культура' | 'Спорт' | 'Волонтерство' | 'Ярмарок' | 'Діти' | string;
  goingCount: number;
  interestedCount: number;
  participantsCount?: number;
  userStatus?: 'going' | 'interested' | null;
  description: string;
}

export type CommunityEvent = RokytaEvent;

export interface RokytaFriend {
  id: string;
  name: string;
  avatar: string;
  settlement: string;
  mutualFriends: number;
  status: 'online' | 'offline';
  lastSeen?: string;
  bio?: string;
}

export interface RokytaChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  isSelf?: boolean;
  attachmentUrl?: string;
  attachmentType?: 'image' | 'doc' | 'audio';
}

// --- NON-BLOCKING FLOATING WINDOW SYSTEM ---

export interface WindowInstance {
  id: string;
  title: string;
  iconName?: string;
  component: React.ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

// --- NOTIFICATION TYPE ---

export interface NotificationItem {
  id: string;
  category: 'ai' | 'community' | 'appeal' | 'problem' | 'petition' | 'business' | 'weather' | 'cnap';
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

// --- WEATHER TYPE ---

export interface WeatherData {
  city: string;
  temp: number;
  feelsLike: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeedMs: number;
  pressureMmHg: number;
  uvIndex: number;
  airQuality: string;
  hourlyForecast: { time: string; temp: number; condition: string }[];
  dailyForecast: { day: string; high: number; low: number; condition: string }[];
}
