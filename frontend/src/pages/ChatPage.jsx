import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { messagesAPI, usersAPI } from '../services/api';
import { useSelector } from 'react-redux';

const ChatPage = () => {
  const currentUser = useSelector((state) => state.auth.user);
  const [searchParams, setSearchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);
  
  // Handle URL query parameter for starting a new conversation
  useEffect(() => {
    const userId = searchParams.get('user');
    const postId = searchParams.get('post');
    const postTitle = searchParams.get('title');
    
    if (userId) {
      // Check if conversation already exists
      const existingConv = conversations.find(conv => {
        const convUserId = conv.user?._id?.toString() || conv.user?.toString();
        return convUserId === userId;
      });
      
      if (existingConv) {
        setActiveConversation(existingConv);
        // If there's a post reference, pre-fill the message
        if (postId && postTitle) {
          setMessage(`Hi! I'm interested in your post: "${decodeURIComponent(postTitle)}". ${window.location.origin}/post/${postId}`);
        }
        // Remove the query parameters after handling
        setSearchParams({});
      } else {
        // Create a new conversation placeholder
        fetchUserAndStartConversation(userId, postId, postTitle);
        // Remove the query parameters after handling
        setSearchParams({});
      }
    }
  }, [searchParams, conversations]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
    }
  }, [activeConversation]);
  
  const fetchUserAndStartConversation = async (userId, postId = null, postTitle = null) => {
    try {
      const response = await usersAPI.getUserProfile(userId);
      if (response.data.success) {
        const user = response.data.data.user;
        // Create a temporary conversation object
        const newConv = {
          _id: userId,
          user: user,
          lastMessage: 'Start a conversation...',
          timestamp: new Date(),
          unread: 0
        };
        setActiveConversation(newConv);
        setMessages([]);
        
        // If there's a post reference, pre-fill the message
        if (postId && postTitle) {
          setMessage(`Hi! I'm interested in your post: "${decodeURIComponent(postTitle)}". ${window.location.origin}/post/${postId}`);
        }
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messagesAPI.getConversations();
      if (response.data.success) {
        setConversations(response.data.data);
        if (response.data.data.length > 0) {
          setActiveConversation(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const response = await messagesAPI.getMessages(userId);
      if (response.data.success) {
        setMessages(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!message.trim() || !activeConversation) return;

    try {
      const response = await messagesAPI.sendMessage(activeConversation._id, { content: message });
      if (response.data.success) {
        setMessages([...messages, response.data.data]);
        setMessage('');
        // Refresh conversations to show the new conversation
        fetchConversations();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
      <div className="container-custom h-full py-4">
        <div className="h-full bg-white dark:bg-gray-800 rounded-xl shadow-soft overflow-hidden flex">
          {/* Conversations List */}
          <div className="w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Messages</h2>
            </div>

            {/* Search */}
            <div className="p-4">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  No conversations yet
                </div>
              ) : (
                <>
                  {conversations.map((conv) => (
                    <motion.div
                      key={conv._id}
                      whileHover={{ x: 4 }}
                      onClick={() => setActiveConversation(conv)}
                      className={`p-4 cursor-pointer transition-colors border-b border-gray-100 dark:border-gray-700 ${
                        activeConversation?._id === conv._id
                          ? 'bg-primary-50 dark:bg-primary-900/20'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={conv.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.user?.name || 'User')}&background=random&size=200`}
                            alt={conv.user?.name || 'User'}
                            className="w-12 h-12 rounded-full"
                          />
                          {conv.user?.online && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {conv.user?.name || 'Unknown User'}
                            </h3>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(conv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {conv.lastMessage}
                            </p>
                            {conv.unread > 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-primary-600 text-white text-xs font-bold rounded-full">
                                {conv.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div className="hidden md:flex flex-1 flex-col">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={activeConversation.user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeConversation.user?.name || 'User')}&background=random&size=200`}
                      alt={activeConversation.user?.name || 'User'}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {activeConversation.user?.name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {activeConversation.user?.online ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const isSent = msg.sender === currentUser?._id;
                    return (
                      <motion.div
                        key={msg._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md ${isSent ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          isSent
                            ? 'bg-primary-600 text-white rounded-br-none'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none'
                        }`}
                      >
                        <p>{msg.content}</p>
                      </div>
                      <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${isSent ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors"
                >
                  Send
                </button>
              </div>
            </form>
          </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
