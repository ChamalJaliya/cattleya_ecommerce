import { ListBulletIcon } from '@heroicons/react/24/outline';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div className="w-full border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-transparent">
      <div className="p-2 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <button type="button" onClick={() => document.execCommand('bold')} className="p-2 rounded-md hover:bg-gray-100 text-gray-600 font-bold">B</button>
          <button type="button" onClick={() => document.execCommand('italic')} className="p-2 rounded-md hover:bg-gray-100 text-gray-600 italic">I</button>
          <button type="button" onClick={() => document.execCommand('underline')} className="p-2 rounded-md hover:bg-gray-100 text-gray-600 underline">U</button>
          <button type="button" onClick={() => document.execCommand('insertUnorderedList')} className="p-2 rounded-md hover:bg-gray-100 text-gray-600">
            <ListBulletIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div
        contentEditable="true"
        dangerouslySetInnerHTML={{ __html: value }}
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        className="w-full px-4 py-3 min-h-[150px] resize-y focus:outline-none"
        data-placeholder={placeholder}
      />
    </div>
  );
} 