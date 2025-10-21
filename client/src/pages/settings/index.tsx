import { useTheme } from '../../contexts/ThemeContext';
import { getAllThemes } from '../../themes/theme';

export default function SettingsPage() {
  const { activeTheme, setActiveTheme } = useTheme();
  const themes = getAllThemes();

  return (
    <div className="p-6" style={{ backgroundColor: 'var(--bg-secondary)', minHeight: '100%' }}>
      <div className="mb-6">
        <h1 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>
      </div>

      <div className="space-y-6">
        {/* Appearance Section */}
        <div>
          <div className="mb-4">
            <h2 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              Appearance
            </h2>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
              Choose your preferred color theme
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {themes.map((theme) => (
              <div
                key={theme.name}
                onClick={() => setActiveTheme(theme.name)}
                className="cursor-pointer rounded-lg border-2 overflow-hidden transition-all hover:shadow-md"
                style={{
                  borderColor: activeTheme === theme.name ? 'var(--color-primary)' : 'var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                }}
              >
                {/* Theme Preview */}
                <div className="h-32 flex">
                  {/* Sidebar Preview */}
                  <div 
                    className="w-20 p-3 flex flex-col gap-1.5"
                    style={{ backgroundColor: theme.colors.sidebarBg }}
                  >
                    <div 
                      className="h-1.5 rounded"
                      style={{ backgroundColor: theme.colors.primary, width: '80%' }}
                    />
                    <div 
                      className="h-1.5 rounded"
                      style={{ backgroundColor: theme.colors.textSecondary, width: '60%', opacity: 0.5 }}
                    />
                    <div 
                      className="h-1.5 rounded"
                      style={{ backgroundColor: theme.colors.textSecondary, width: '70%', opacity: 0.5 }}
                    />
                  </div>
                  
                  {/* Main Content Preview */}
                  <div 
                    className="flex-1 p-3 flex flex-col gap-1.5"
                    style={{ backgroundColor: theme.colors.bgPrimary }}
                  >
                    <div 
                      className="h-2 rounded"
                      style={{ backgroundColor: theme.colors.textPrimary, width: '50%', opacity: 0.8 }}
                    />
                    <div 
                      className="h-1 rounded"
                      style={{ backgroundColor: theme.colors.textSecondary, width: '90%', opacity: 0.6 }}
                    />
                    <div 
                      className="h-1 rounded"
                      style={{ backgroundColor: theme.colors.textSecondary, width: '85%', opacity: 0.6 }}
                    />
                    <div className="flex gap-1.5 mt-auto">
                      <div 
                        className="h-4 w-8 rounded"
                        style={{ backgroundColor: theme.colors.primary }}
                      />
                      <div 
                        className="h-4 w-8 rounded"
                        style={{ backgroundColor: theme.colors.accent }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Theme Info */}
                <div 
                  className="px-4 py-3 border-t flex items-center justify-between"
                  style={{ 
                    borderColor: theme.colors.border,
                    backgroundColor: theme.colors.bgSecondary
                  }}
                >
                  <div>
                    <h3 
                      className="text-sm font-medium"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {theme.name}
                    </h3>
                    <p 
                      className="text-xs mt-0.5"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      {theme.isDark ? 'Dark theme' : 'Light theme'}
                    </p>
                  </div>
                  
                  {activeTheme === theme.name && (
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="white"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
