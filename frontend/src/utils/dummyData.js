// Dummy data for development
export const dummyPosts = [
  {
    _id: '1',
    title: 'Laptop for Coding Projects',
    description: 'Dell XPS 15 available for sharing. Perfect for development work. Includes charger and accessories.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=500',
    images: [
      'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800',
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=800'
    ],
    author: {
      _id: 'u1',
      name: 'John Doe',
      email: 'john@example.com',
      verified: true,
      verificationStatus: 'verified',
      avatar: 'https://i.pravatar.cc/150?img=1'
    },
    status: 'available',
    location: 'Dhaka, Bangladesh',
    createdAt: '2024-01-15T10:30:00Z',
    likes: 24,
    saves: 12,
  },
  {
    _id: '2',
    title: 'Programming Books Collection',
    description: 'Collection of programming books including Clean Code, Design Patterns, and more. Free to borrow.',
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500',
    images: [
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=800',
      'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800',
      'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800'
    ],
    author: {
      _id: 'u2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      verified: true,
      verificationStatus: 'verified',
      avatar: 'https://i.pravatar.cc/150?img=2'
    },
    status: 'available',
    location: 'Chittagong, Bangladesh',
    createdAt: '2024-01-14T15:20:00Z',
    likes: 45,
    saves: 28,
  },
  {
    _id: '3',
    title: 'DSLR Camera Kit',
    description: 'Canon EOS 90D with two lenses and tripod. Great for photography enthusiasts.',
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800'
    ],
    author: {
      _id: 'u3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
      verified: false,
      verificationStatus: 'unverified',
      avatar: 'https://i.pravatar.cc/150?img=3'
    },
    status: 'borrowed',
    location: 'Sylhet, Bangladesh',
    createdAt: '2024-01-13T09:15:00Z',
    likes: 67,
    saves: 34,
  },
  {
    _id: '4',
    title: 'Gaming Console - PS5',
    description: 'PlayStation 5 with controllers and games. Available for weekend sharing.',
    category: 'Gaming',
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500',
    author: {
      _id: 'u4',
      name: 'Sarah Williams',
      email: 'sarah@example.com',
      verified: true,
      verificationStatus: 'verified',
      avatar: 'https://i.pravatar.cc/150?img=4'
    },
    status: 'available',
    location: 'Dhaka, Bangladesh',
    createdAt: '2024-01-12T14:45:00Z',
    likes: 89,
    saves: 45,
  },
];

export const dummyUser = {
  _id: 'u1',
  name: 'John Doe',
  email: 'john@example.com',
  role: 'admin', // Change to 'admin' to access admin pages, 'user' for regular user
  verified: true,
  verificationStatus: 'verified', // unverified | pending | verified | rejected
  nid: '1234567890',
  nidImage: 'https://via.placeholder.com/400x250?text=NID+Card',
  avatar: 'https://i.pravatar.cc/150?img=1',
  bio: 'Tech enthusiast and sharing economy advocate',
  location: 'Dhaka, Bangladesh',
  joinedDate: '2023-06-15',
  postsCount: 12,
  rating: 4.8,
};

export const dummyNotifications = [
  {
    _id: 'n1',
    type: 'like',
    message: 'Sarah Williams liked your post "Laptop for Coding Projects"',
    read: false,
    createdAt: '2024-01-15T11:30:00Z',
    user: {
      name: 'Sarah Williams',
      avatar: 'https://i.pravatar.cc/150?img=4'
    }
  },
  {
    _id: 'n3',
    type: 'request',
    message: 'Mike Johnson requested to borrow your item',
    read: true,
    createdAt: '2024-01-14T16:20:00Z',
    user: {
      name: 'Mike Johnson',
      avatar: 'https://i.pravatar.cc/150?img=3'
    }
  },
];

export const dummyConversations = [
  {
    _id: 'c1',
    user: {
      _id: 'u2',
      name: 'Jane Smith',
      avatar: 'https://i.pravatar.cc/150?img=2',
      online: true,
    },
    lastMessage: 'Sure, when do you need it?',
    timestamp: '2024-01-15T11:45:00Z',
    unread: 2,
  },
  {
    _id: 'c2',
    user: {
      _id: 'u3',
      name: 'Mike Johnson',
      avatar: 'https://i.pravatar.cc/150?img=3',
      online: false,
    },
    lastMessage: 'Thanks for sharing!',
    timestamp: '2024-01-14T18:30:00Z',
    unread: 0,
  },
];

export const dummyMessages = [
  {
    _id: 'm1',
    sender: 'u2',
    content: 'Hi! Is the laptop still available?',
    timestamp: '2024-01-15T11:30:00Z',
  },
  {
    _id: 'm2',
    sender: 'u1',
    content: 'Yes, it is! When do you need it?',
    timestamp: '2024-01-15T11:35:00Z',
  },
  {
    _id: 'm3',
    sender: 'u2',
    content: 'Sure, when do you need it?',
    timestamp: '2024-01-15T11:45:00Z',
  },
];

export const categories = [
  'All',
  'Electronics',
  'Books',
  'Tools',
  'Sports',
  'Gaming',
  'Furniture',
  'Others',
];

export const adminStats = {
  totalUsers: 1248,
  verifiedUsers: 892,
  pendingVerification: 45,
  totalPosts: 3456,
  activePosts: 2891,
  reportedPosts: 23,
};
