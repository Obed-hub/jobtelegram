import { useLocation, useNavigate } from 'react-router-dom';
import { Compass, Bookmark, Briefcase, BarChart2, User, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/context/AppContext';
import { isUserAdmin } from '@/config/admin';

const navItems = [
  { path: '/', icon: Compass, label: 'Discover' },
  { path: '/saved', icon: Bookmark, label: 'Saved' },
  { path: '/applications', icon: Briefcase, label: 'Apps' },
  { path: '/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { savedJobs, profile, user } = useApp();

  const items = [...navItems];
  if (profile?.isAdmin || isUserAdmin(user?.uid)) {
    items.push({ path: '/admin', icon: ShieldCheck, label: 'Admin' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {items.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          const savedCount = path === '/saved' ? savedJobs.filter(s => s.status === 'saved').length : 0;

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all',
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className={cn('w-5 h-5', isActive && 'drop-shadow-[0_0_6px_hsl(262,83%,58%)]')} />
                {savedCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full gradient-bg text-[10px] font-bold flex items-center justify-center text-primary-foreground">
                    {savedCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
