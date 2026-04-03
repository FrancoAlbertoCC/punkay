import React, { useState } from 'react';
import { Product } from '../types';
import { Star, Truck, ShieldCheck, Minus, Plus, Sparkles, ChevronLeft } from 'lucide-react';
import { AIModal } from './AIModal';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number, option: string) => void;
}

export const ProductDetail: React.FC<ProductDetailProps> = ({ product, onBack, onAddToCart }) => {
  const [activeImage, setActiveImage] = useState(product.images[0]);
  const [quantity, setQuantity] = useState(1);
  const [selectedOption, setSelectedOption] = useState(product.options?.[0] || '');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  // Safe check if images exist, fallback if empty
  const images = product.images.length > 0 ? product.images : ['https://via.placeholder.com/400'];

  const discount = product.originalPrice > product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCartClick = () => {
    onAddToCart(product, quantity, selectedOption);
  };

  return (
    <div className="animate-in slide-in-from-right duration-300">
      <button 
        onClick={onBack}
        className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver a la tienda
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-8 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
        
        {/* Gallery */}
        <div className="md:col-span-6 flex flex-col gap-4">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-gray-50 relative border border-gray-100">
            <img src={activeImage} alt={product.title} className="w-full h-full object-cover" />
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-full shadow-lg">
                -{discount}% DCTO
              </div>
            )}
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {images.map((img, idx) => (
              <button 
                key={idx} 
                onClick={() => setActiveImage(img)}
                className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${activeImage === img ? 'border-green-500 shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <img src={img} alt={`View ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="md:col-span-6 flex flex-col">
          <div className="text-sm text-green-600 font-bold mb-2 uppercase tracking-wider">{product.category}</div>
          <h1 className="text-3xl font-black brand-font text-gray-900 leading-tight mb-3">
            {product.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center text-yellow-400">
              {[...Array(5)].map((_, i) => (
                 <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}`} />
              ))}
              <span className="text-gray-600 ml-2 text-sm font-medium">{product.rating}</span>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">
            {product.description}
          </p>

          <div className="flex items-baseline gap-3 mb-8">
            <span className="text-4xl font-black text-gray-900">S/. {product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-lg text-gray-400 line-through font-medium">S/. {product.originalPrice}</span>
            )}
          </div>

          {/* AI Visualizer CTA */}
          <div className="mb-8 p-4 bg-cyan-50 rounded-xl border border-cyan-100 flex items-center justify-between gap-4 group hover:border-cyan-300 transition-colors">
            <div>
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                Probador Virtual IA
              </h3>
              <p className="text-xs text-gray-500 mt-1">Sube una foto y mira cómo queda el producto.</p>
            </div>
            <button 
              onClick={() => setIsAIModalOpen(true)}
              className="px-4 py-2 bg-white border border-cyan-200 text-cyan-800 text-sm font-bold rounded-lg shadow-sm hover:bg-cyan-100 transition-all"
            >
              Probar Ahora
            </button>
          </div>

          {/* Options */}
          {product.options && product.options.length > 0 && (
            <div className="mb-6">
              <span className="block text-sm font-bold text-gray-900 mb-3">Selecciona una opción:</span>
              <div className="flex flex-wrap gap-2">
                {product.options.map(opt => (
                  <button 
                    key={opt}
                    onClick={() => setSelectedOption(opt)}
                    className={`px-4 py-2 text-sm rounded-lg border-2 font-medium transition-all ${selectedOption === opt ? 'border-black bg-black text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400 bg-white'}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 mt-auto pt-6 border-t border-gray-100">
             <div className="flex items-center border-2 border-gray-200 rounded-xl bg-white">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-3 text-gray-500 hover:text-black hover:bg-gray-50 rounded-l-xl"><Minus className="w-4 h-4" /></button>
                <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="p-3 text-gray-500 hover:text-black hover:bg-gray-50 rounded-r-xl"><Plus className="w-4 h-4" /></button>
             </div>
             <button 
               onClick={handleAddToCartClick}
               className="flex-1 bg-green-600 text-white font-black text-lg rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-200 uppercase tracking-wide"
             >
               Agregar al Carrito
             </button>
          </div>

           <div className="grid grid-cols-2 gap-4 mt-6">
               <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                 <ShieldCheck className="w-4 h-4 text-green-600" />
                 <span>Garantía de calidad Punkay</span>
               </div>
               <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                 <Truck className="w-4 h-4 text-blue-600" />
                 <span>Envíos a todo el Perú</span>
               </div>
            </div>
        </div>
      </div>

      <AIModal 
        isOpen={isAIModalOpen} 
        onClose={() => setIsAIModalOpen(false)} 
        productImage={activeImage} 
        productTitle={product.title}
      />
    </div>
  );
};