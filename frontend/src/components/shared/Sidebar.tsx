import React from 'react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  active?: boolean;
}

interface SidebarConfig {
  subtitle: string;
  navigation: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  config: SidebarConfig;
  currentPath?: string; 
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isOpen, 
  onClose, 
  isCollapsed, 
  onToggleCollapse,
  config,
  currentPath 
}) => {
  
  const isItemActive = (href: string, active?: boolean) => {
    if (currentPath) {
      return currentPath === href || currentPath.startsWith(href + '/');
    }
    return active || false;
  };

  return (
    <>
      <div className="hidden lg:flex lg:flex-shrink-0 lg:fixed lg:inset-y-0">
        <div className={`flex flex-col transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-64'
        } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700`}>
          
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700`}>
            <div className={`flex items-center ${isCollapsed ? '' : 'flex-1'}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 7V9C15 10.1 14.1 11 13 11V22H11V16H9V22H7V11C5.9 11 5 10.1 5 9V7H3V9C3 11.2 4.8 13 7 13V20C7 21.1 7.9 22 9 22H15C16.1 22 17 21.1 17 20V13C19.2 13 21 11.2 21 9Z"/>
                </svg>
              </div>
              {!isCollapsed && (
                <div className="ml-3 transition-opacity duration-300">
                  <span className="block text-xl font-bold text-gray-900 dark:text-gray-100">
                    Mentora
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {config.subtitle}
                  </span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                onClick={onToggleCollapse}
                className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Collapse sidebar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            )}
          </div>

          {isCollapsed && (
            <div className="px-2 py-4">
              <button
                onClick={onToggleCollapse}
                className="w-full p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex justify-center"
                title="Expand sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-hidden">
            {config.navigation.map((item) => {
              const itemIsActive = isItemActive(item.href, item.active);
              return (
              <div key={item.name} className="relative group">
                <a
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    itemIsActive
                      ? 'bg-gradient-to-r from-teal-50 to-teal-100 dark:from-teal-900/30 dark:to-teal-800/40 text-teal-700 dark:text-teal-200 font-semibold border-l-3 border-teal-500 dark:border-teal-400 shadow-sm'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <span className={`${itemIsActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'} ${
                    isCollapsed ? '' : 'mr-3'
                  }`}>
                    {item.icon}
                  </span>
                  
                  {!isCollapsed && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      {item.badge && (
                        <span className="ml-3 inline-block py-0.5 px-2 text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </a>

                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                    {item.name}
                    {item.badge && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-gray-700 dark:bg-gray-600 rounded">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )})}
          </nav>
        </div>
      </div>

      <div className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900 dark:text-gray-100">
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 dark:hover:text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {config.navigation.map((item) => {
              const itemIsActive = isItemActive(item.href, item.active);
              return (
              <a
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  itemIsActive
                    ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <span className={`${itemIsActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400'} mr-3`}>
                  {item.icon}
                </span>
                <span className="flex-1">{item.name}</span>
                {item.badge && (
                  <span className="ml-3 inline-block py-0.5 px-2 text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-full">
                    {item.badge}
                  </span>
                )}
              </a>
            )})}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;