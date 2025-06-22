'use client';

import { XMarkIcon, PaperAirplaneIcon, ListBulletIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import RichTextEditor from './RichTextEditor';
import React from 'react';

interface ComposeMessageModalProps {
  onClose: () => void;
  onSend: (message: any) => void;
}

export default function ComposeMessageModal({ onClose, onSend }: ComposeMessageModalProps) {
  const [composeMessage, setComposeMessage] = React.useState({
    to: '',
    subject: '',
    content: '',
    category: 'support',
    priority: 'medium'
  });

  const handleSend = () => {
    onSend(composeMessage);
    onClose();
    // Reset after sending
    setComposeMessage({
      to: '',
      subject: '',
      content: '',
      category: 'support',
      priority: 'medium'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 50, scale: 0.95 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[70vh] flex flex-col overflow-hidden border border-gray-200/50"
      >
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Compose Message</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">To</label>
            <input
              type="email"
              value={composeMessage.to}
              onChange={(e) => setComposeMessage({...composeMessage, to: e.target.value})}
              placeholder="recipient@email.com"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
            <input
              type="text"
              value={composeMessage.subject}
              onChange={(e) => setComposeMessage({...composeMessage, subject: e.target.value})}
              placeholder="Message subject"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={composeMessage.category}
                onChange={(e) => setComposeMessage({...composeMessage, category: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="support">Support</option>
                <option value="orders">Orders</option>
                <option value="refunds">Refunds</option>
                <option value="alerts">Alerts</option>
                <option value="rewards">Rewards</option>
                <option value="customers">Customers</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
              <select
                value={composeMessage.priority}
                onChange={(e) => setComposeMessage({...composeMessage, priority: e.target.value})}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
            <RichTextEditor
              value={composeMessage.content}
              onChange={(content) => setComposeMessage({ ...composeMessage, content })}
              placeholder="Type your message..."
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4 p-6 border-t border-gray-100 mt-auto">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 font-semibold transition-colors rounded-xl"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="group relative overflow-hidden"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center group-hover:scale-105">
                <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                Send Message
              </div>
            </button>
        </div>
      </div>
    </motion.div>
  );
} 