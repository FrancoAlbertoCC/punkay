import React from 'react';
import { ShoppingBag, ArrowRight, CheckCircle } from 'lucide-react';

interface PostAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeepShopping: () => void;
  onGoToCart: () => void;
}

export const PostAddModal: React.FC<PostAddModalProps> = ({ isOpen, onClose, onKeepShopping, onGoToCart }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border border-green-100 relative">
        
        <div className="text-center mb-6">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-black brand-font text-gray-900">¡Excelente elección!</h2>
          <p className="text-gray-500">El producto se agregó a tu carrito.</p>
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={onGoToCart}
            className="w-full py-4 bg-black text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg"
          >
            Ir a Pagar / Ver Carrito <ArrowRight className="w-5 h-5" />
          </button>
          
          <button 
            onClick={onKeepShopping}
            className="w-full py-4 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:border-green-500 hover:text-green-600 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" /> Seguir Comprando
          </button>
        </div>

      </div>
    </div>
  );
};