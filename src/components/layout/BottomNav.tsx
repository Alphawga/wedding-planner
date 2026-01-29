import { NavLink, useLocation } from 'react-router-dom';
import { Home, CheckSquare, Store, Wallet, Users } from 'lucide-react';

const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/tasks', icon: CheckSquare, label: 'To-do' },
    { path: '/budget', icon: Wallet, label: 'Budget' },
    { path: '/vendors', icon: Store, label: 'Vendors' },
    { path: '/party', icon: Users, label: 'Profile' },
];

export function BottomNav() {
    const location = useLocation();

    return (
        <nav className="fixed bottom-0 left-0 right-0 bottom-nav safe-area-bottom z-40">
            <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
                {navItems.map(({ path, icon: Icon, label }) => {
                    const isActive = location.pathname === path;
                    return (
                        <NavLink
                            key={path}
                            to={path}
                            className={`flex flex-col items-center justify-center w-16 h-full transition-all duration-200 ${isActive ? 'text-primary-500' : 'text-warm-400'
                                }`}
                        >
                            <div className={`p-2 rounded-xl transition-all duration-200 ${isActive ? 'bg-primary-50' : ''}`}>
                                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 1.5} />
                            </div>
                            <span className={`text-[10px] mt-0.5 ${isActive ? 'font-semibold' : 'font-medium'}`}>{label}</span>
                        </NavLink>
                    );
                })}
            </div>
        </nav>
    );
}
