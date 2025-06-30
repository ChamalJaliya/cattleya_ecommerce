import React from 'react';
import { PencilIcon, TrashIcon, ListBulletIcon, ShieldCheckIcon, EyeIcon, FunnelIcon, MagnifyingGlassIcon, ChartBarIcon, CubeIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

interface AttributeCardProps {
  attribute: any;
  index: number;
  onEdit: (attribute: any) => void;
  onDelete: (attribute: any) => void;
  showAllOptionsIndex: number | null;
  setShowAllOptionsIndex: (idx: number | null) => void;
}

const AttributeCard: React.FC<AttributeCardProps> = ({ attribute, index, onEdit, onDelete, showAllOptionsIndex, setShowAllOptionsIndex }) => {
  // Helper for badge config
  const getBadgeConfig = (key: string, value: boolean) => {
    const configs = {
      isRequired: {
        icon: ShieldCheckIcon,
        activeBg: 'bg-gradient-to-r from-red-50 to-pink-50',
        inactiveBg: 'bg-gradient-to-r from-gray-50 to-slate-50',
        activeText: 'text-red-700',
        inactiveText: 'text-gray-500'
      },
      isVisible: {
        icon: EyeIcon,
        activeBg: 'bg-gradient-to-r from-green-50 to-emerald-50',
        inactiveBg: 'bg-gradient-to-r from-gray-50 to-slate-50',
        activeText: 'text-green-700',
        inactiveText: 'text-gray-500'
      },
      isFilterable: {
        icon: FunnelIcon,
        activeBg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
        inactiveBg: 'bg-gradient-to-r from-gray-50 to-slate-50',
        activeText: 'text-blue-700',
        inactiveText: 'text-gray-500'
      },
      isSearchable: {
        icon: MagnifyingGlassIcon,
        activeBg: 'bg-gradient-to-r from-purple-50 to-pink-50',
        inactiveBg: 'bg-gradient-to-r from-gray-50 to-slate-50',
        activeText: 'text-purple-700',
        inactiveText: 'text-gray-500'
      },
      isComparable: {
        icon: ChartBarIcon,
        activeBg: 'bg-gradient-to-r from-orange-50 to-red-50',
        inactiveBg: 'bg-gradient-to-r from-gray-50 to-slate-50',
        activeText: 'text-orange-700',
        inactiveText: 'text-gray-500'
      },
      isVariantDefining: {
        icon: CubeIcon,
        activeBg: 'bg-gradient-to-r from-indigo-50 to-violet-50',
        inactiveBg: 'bg-gradient-to-r from-gray-50 to-slate-50',
        activeText: 'text-indigo-700',
        inactiveText: 'text-gray-500'
      },
      isVariantOverridable: {
        icon: GlobeAltIcon,
        activeBg: 'bg-gradient-to-r from-teal-50 to-cyan-50',
        inactiveBg: 'bg-gradient-to-r from-gray-50 to-slate-50',
        activeText: 'text-teal-700',
        inactiveText: 'text-gray-500'
      }
    };
    return configs[key as keyof typeof configs];
  };

  return (
    <div className="group relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-200/50 p-6 h-auto flex flex-col justify-between">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-bold text-xl bg-gradient-to-r from-purple-600 via-pink-600 to-violet-600 bg-clip-text text-transparent">
            {attribute.name}
          </h3>
          <p className="text-sm text-gray-500 font-mono mt-1 bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">
            {attribute.code}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onEdit(attribute)} className="p-2 text-blue-600 hover:text-blue-700 rounded-xl transition-colors duration-200">
            <PencilIcon className="h-4 w-4" />
          </button>
          <button onClick={() => onDelete(attribute)} className="p-2 text-red-600 hover:text-red-700 rounded-xl transition-colors duration-200">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
      {/* Badges */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {Object.entries({
          isRequired: attribute.isRequired,
          isVisible: attribute.isVisible,
          isFilterable: attribute.isFilterable,
          isSearchable: attribute.isSearchable,
          isComparable: attribute.isComparable,
          isVariantDefining: attribute.isVariantDefining,
          isVariantOverridable: attribute.isVariantOverridable
        }).map(([key, value]) => {
          const config = getBadgeConfig(key, value);
          const IconComponent = config.icon;
          return (
            <div key={key} className={`flex items-center p-2 rounded-lg border transition-all duration-300 ${value ? config.activeBg : config.inactiveBg}`}> 
              <IconComponent className={`w-4 h-4 mr-2 ${value ? config.activeText : config.inactiveText}`} />
              <span className={`text-xs font-medium ${value ? config.activeText : config.inactiveText}`}>
                {key.replace('is', '').replace(/([A-Z])/g, ' $1').trim()}
              </span>
              {value && <div className="ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400" />}
            </div>
          );
        })}
      </div>
      {/* Options Preview */}
      {attribute.options && attribute.options.length > 0 && (
        <div className="mt-2">
          <div className="font-semibold text-violet-700 text-sm mb-1 flex items-center">
            <ListBulletIcon className="w-4 h-4 mr-1 text-violet-400" />
            Options ({attribute.options.length}):
          </div>
          <div className="flex flex-wrap gap-2 w-full">
            {(showAllOptionsIndex === index
              ? attribute.options
              : attribute.options.slice(0, 6)
            ).map((opt: any, i: number) => (
              <span key={opt.value} className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border border-violet-200">
                {opt.label}
              </span>
            ))}
            {attribute.options.length > 6 && showAllOptionsIndex !== index && (
              <button
                className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300 hover:bg-violet-100 hover:text-violet-700 transition"
                onClick={() => setShowAllOptionsIndex(index)}
              >
                +{attribute.options.length - 6} more
              </button>
            )}
            {attribute.options.length > 6 && showAllOptionsIndex === index && (
              <button
                className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300 hover:bg-violet-100 hover:text-violet-700 transition"
                onClick={() => setShowAllOptionsIndex(null)}
              >
                Show less
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttributeCard; 