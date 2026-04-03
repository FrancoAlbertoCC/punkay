import React, { useRef, useState } from 'react';
import { LayoutDashboard, Search, ShoppingCart } from 'lucide-react';

interface HeaderProps {
  onGoHome: () => void;
  onGoAdmin: () => void;
  onOpenCart: () => void;
  cartCount: number;
  isAdminAuthenticated: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  onGoAdmin,
  onOpenCart,
  cartCount,
  isAdminAuthenticated,
}) => {
  const [secretCount, setSecretCount] = useState(0);
  const timeoutRef = useRef<number | null>(null);

  const handleSecretClick = (event: React.MouseEvent) => {
    event.stopPropagation();

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    const nextCount = secretCount + 1;
    setSecretCount(nextCount);

    if (nextCount >= 5) {
      onGoAdmin();
      setSecretCount(0);
      return;
    }

    timeoutRef.current = window.setTimeout(() => {
      setSecretCount(0);
    }, 1000);
  };

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col items-start cursor-pointer group" onClick={onGoHome}>
            <span
              onClick={handleSecretClick}
              className="text-[10px] font-bold text-yellow-500 tracking-widest leading-none ml-10 mb-[-2px] select-none cursor-default"
            >
              TIENDAS
            </span>

            <div className="flex items-center">
              <div className="w-8 h-8 mr-1 relative">
                <div className="absolute inset-0 bg-red-600 rounded-full rounded-tr-none"></div>
                <div className="absolute top-1 right-0 w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full flex items-center justify-center">
                  <div className="w-1 h-1 bg-black rounded-full"></div>
                </div>
              </div>
              <h1 className="text-3xl font-black brand-font tracking-tight flex items-baseline">
                <span className="text-red-600">pun</span>
                <span className="text-green-600">kay</span>
              </h1>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-auto hidden md:block">
            <div className="relative group">
              <input
                type="text"
                placeholder="Buscar productos..."
                className="w-full py-2.5 pl-4 pr-10 border-2 border-gray-100 rounded-full focus:outline-none focus:border-green-500 transition-all bg-white text-black placeholder-gray-400"
              />
              <button className="absolute right-1 top-1 bottom-1 bg-green-500 text-white p-1.5 rounded-full hover:bg-green-600 transition-colors">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdminAuthenticated && (
              <button
                onClick={onGoAdmin}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Panel
              </button>
            )}

            <button
              onClick={onOpenCart}
              className="relative cursor-pointer hover:scale-110 transition-transform"
            >
              <ShoppingCart className="w-6 h-6 text-gray-800" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
