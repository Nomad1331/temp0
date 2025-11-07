import { Home, PlusCircle, BarChart3, Trophy } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", icon: Home, label: "Home" },
    { path: "/log", icon: PlusCircle, label: "Log" },
    { path: "/stats", icon: BarChart3, label: "Stats" },
    { path: "/leaderboard", icon: Trophy, label: "Leaderboard" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-lg border-t-2 border-primary/20 z-50 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
      <div className="max-w-lg mx-auto px-3 py-3">
        <div className="flex justify-around items-center">
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-5 py-2 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-br from-primary to-accent text-white scale-110 shadow-[var(--shadow-teal)]"
                    : "text-muted-foreground hover:text-foreground hover:scale-105"
                }`}
              >
                <Icon className={`w-6 h-6 transition-transform ${isActive ? "animate-pulse" : ""}`} />
                <span className={`text-xs font-bold ${isActive ? "font-black" : ""}`}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
