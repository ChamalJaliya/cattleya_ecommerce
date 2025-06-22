'use client';

import {
  ArchiveBoxIcon,
  FlagIcon,
  TrashIcon,
  ArrowUturnLeftIcon,
  CalendarIcon,
  InboxIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

// These color functions are simplified and would ideally be shared or passed in
const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
};

export default function MessageDetail({ selectedMessage }: { selectedMessage: any }) {
  if (!selectedMessage) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
        <InboxIcon className="w-24 h-24 text-gray-300" />
        <h2 className="mt-4 text-xl font-semibold">Select a message to read</h2>
        <p className="mt-1 text-sm">Nothing to see here... yet.</p>
      </div>
    );
  }

  return (
    <motion.div
      key={selectedMessage.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full"
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-start justify-between pb-6 border-b border-gray-200">
          <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-lg mr-4">
              {selectedMessage.from.avatar}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h2>
              <p className="text-sm text-gray-600 mt-1">From: <span className="font-semibold">{selectedMessage.from.name}</span> &lt;{selectedMessage.from.email}&gt;</p>
            </div>
          </div>
          <div className="text-sm text-gray-500">{new Date(selectedMessage.createdAt).toLocaleString()}</div>
        </div>
        <div className="py-6 flex-grow overflow-y-auto">
          <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{selectedMessage.content}</p>
          
          {selectedMessage.metadata && (
            <div className="bg-gray-50 rounded-xl p-4 mt-6 border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Message Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {Object.entries(selectedMessage.metadata).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                    <span className="ml-2 text-gray-800">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="border-t pt-6 mt-auto">
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <button className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <ArchiveBoxIcon className="w-4 h-4 mr-2" />
                Archive
              </button>
              <button className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <FlagIcon className="w-4 h-4 mr-2" />
                Flag
              </button>
              <button className="flex items-center px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <TrashIcon className="w-4 h-4 mr-2" />
                Delete
              </button>
            </div>
            <button className="group relative overflow-hidden">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all duration-200 flex items-center group-hover:scale-105">
                <ArrowUturnLeftIcon className="w-5 h-5 mr-2" />
                Reply
              </div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
} 