'use client';

import { ConfigData } from '@/types/config';
import { previewImageCache } from '@/lib/previewImageCache';
import DeviceSettingsCard from './DeviceSettingsCard';
import SensorList from './SensorList';

interface ConfigFormProps {
  config: ConfigData;
  onChange: (config: ConfigData) => void;
  activeScreenIndex: number;
  onActiveScreenChange: (index: number) => void;
}

export default function ConfigForm({
  config,
  onChange,
  activeScreenIndex,
  onActiveScreenChange,
}: ConfigFormProps) {
  return (
    <div className="space-y-6">
      <DeviceSettingsCard config={config} onChange={onChange} />

      {/* Screen Tabs Selector */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex border-b border-gray-200 bg-gray-50/50">
          {[0, 1, 2].map((idx) => {
            const isActive = idx === activeScreenIndex;
            const screenName = config.screens?.[idx]?.name || `Screen ${idx + 1}`;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onActiveScreenChange(idx)}
                className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all -mb-px outline-none ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {screenName}
              </button>
            );
          })}
        </div>

        {/* Screen Specific Settings: Name and Colors */}
        <div className="p-6 border-t border-gray-100 space-y-4">
          <div className="flex flex-col md:flex-row gap-6 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Screen Name
              </label>
              <input
                type="text"
                value={config.screens?.[activeScreenIndex]?.name || ''}
                onChange={(e) => {
                  const newScreens = [...(config.screens || [])];
                  if (newScreens[activeScreenIndex]) {
                    newScreens[activeScreenIndex] = {
                      ...newScreens[activeScreenIndex],
                      name: e.target.value,
                    };
                    onChange({ ...config, screens: newScreens });
                  }
                }}
                className="w-full px-3.5 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-4 w-full md:w-auto">
              <div className="flex-grow sm:flex-grow-0 min-w-[140px]">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Color Theme
                </label>
                <select
                  onChange={(e) => {
                    const theme = e.target.value;
                    let bg = '#0f1419';
                    let fg = '#ffffff';
                    if (theme === 'frigate') {
                      bg = '#0a0a0c';
                      fg = '#f4f4f7';
                    } else if (theme === 'ha') {
                      bg = '#1c1c21';
                      fg = '#f4f4f7';
                    } else if (theme === 'light') {
                      bg = '#f8fafc';
                      fg = '#0f172a';
                    }
                    
                    const newScreens = [...(config.screens || [])];
                    if (newScreens[activeScreenIndex]) {
                      newScreens[activeScreenIndex] = {
                        ...newScreens[activeScreenIndex],
                        backgroundColor: bg,
                        fontColor: fg,
                      };
                      onChange({ ...config, screens: newScreens });
                    }
                  }}
                  value={
                    config.screens?.[activeScreenIndex]?.backgroundColor === '#0a0a0c' && config.screens?.[activeScreenIndex]?.fontColor === '#f4f4f7' ? 'frigate' :
                    config.screens?.[activeScreenIndex]?.backgroundColor === '#1c1c21' && config.screens?.[activeScreenIndex]?.fontColor === '#f4f4f7' ? 'ha' :
                    config.screens?.[activeScreenIndex]?.backgroundColor === '#f8fafc' && config.screens?.[activeScreenIndex]?.fontColor === '#0f172a' ? 'light' :
                    config.screens?.[activeScreenIndex]?.backgroundColor === '#0f1419' && config.screens?.[activeScreenIndex]?.fontColor === '#ffffff' ? 'default' : 'custom'
                  }
                  className="h-10 w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
                >
                  <option value="default">Default Dark</option>
                  <option value="frigate">Frigate Dark (Sleek)</option>
                  <option value="ha">HA Dark (Slate)</option>
                  <option value="light">Light Theme</option>
                  <option value="custom" disabled>Custom Color...</option>
                </select>
              </div>
              <div className="flex-1 md:flex-none">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.screens?.[activeScreenIndex]?.backgroundColor || '#0f1419'}
                    onChange={(e) => {
                      const newScreens = [...(config.screens || [])];
                      if (newScreens[activeScreenIndex]) {
                        newScreens[activeScreenIndex] = {
                          ...newScreens[activeScreenIndex],
                          backgroundColor: e.target.value,
                        };
                        onChange({ ...config, screens: newScreens });
                      }
                    }}
                    className="w-10 h-10 p-0 border border-gray-300 rounded-md cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={config.screens?.[activeScreenIndex]?.backgroundColor || '#0f1419'}
                    onChange={(e) => {
                      const newScreens = [...(config.screens || [])];
                      if (newScreens[activeScreenIndex]) {
                        newScreens[activeScreenIndex] = {
                          ...newScreens[activeScreenIndex],
                          backgroundColor: e.target.value,
                        };
                        onChange({ ...config, screens: newScreens });
                      }
                    }}
                    className="w-24 px-2 py-2 border border-gray-300 rounded-md text-sm uppercase text-center font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex-1 md:flex-none">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Font Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.screens?.[activeScreenIndex]?.fontColor || '#ffffff'}
                    onChange={(e) => {
                      const newScreens = [...(config.screens || [])];
                      if (newScreens[activeScreenIndex]) {
                        newScreens[activeScreenIndex] = {
                          ...newScreens[activeScreenIndex],
                          fontColor: e.target.value,
                        };
                        onChange({ ...config, screens: newScreens });
                      }
                    }}
                    className="w-10 h-10 p-0 border border-gray-300 rounded-md cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={config.screens?.[activeScreenIndex]?.fontColor || '#ffffff'}
                    onChange={(e) => {
                      const newScreens = [...(config.screens || [])];
                      if (newScreens[activeScreenIndex]) {
                        newScreens[activeScreenIndex] = {
                          ...newScreens[activeScreenIndex],
                          fontColor: e.target.value,
                        };
                        onChange({ ...config, screens: newScreens });
                      }
                    }}
                    className="w-24 px-2 py-2 border border-gray-300 rounded-md text-sm uppercase text-center font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="flex-grow min-w-[200px]">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Background Image Path (Leave empty for none)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. images/bg_home.png"
                    value={config.screens?.[activeScreenIndex]?.backgroundImage || ''}
                    onChange={(e) => {
                      const newScreens = [...(config.screens || [])];
                      if (newScreens[activeScreenIndex]) {
                        newScreens[activeScreenIndex] = {
                          ...newScreens[activeScreenIndex],
                          backgroundImage: e.target.value,
                        };
                        onChange({ ...config, screens: newScreens });
                      }
                    }}
                    className="flex-1 px-3 h-10 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <label className="flex items-center justify-center px-4 h-10 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-md transition-colors text-sm border border-gray-300 cursor-pointer shrink-0">
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Standard ESPHome path convention for the config
                          const esphomePath = `images/${file.name}`;
                          
                          // Set preview in cache
                          const blobUrl = URL.createObjectURL(file);
                          previewImageCache.set(esphomePath, blobUrl);
                          
                          // Update config
                          const newScreens = [...(config.screens || [])];
                          if (newScreens[activeScreenIndex]) {
                            newScreens[activeScreenIndex] = {
                              ...newScreens[activeScreenIndex],
                              backgroundImage: esphomePath,
                            };
                            onChange({ ...config, screens: newScreens });
                          }
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <SensorList config={config} onChange={onChange} activeScreenIndex={activeScreenIndex} />
    </div>
  );
}