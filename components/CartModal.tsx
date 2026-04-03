import React from 'react';
import { CartItem } from '../types';
import { X, Trash2, ShieldCheck, Heart } from 'lucide-react';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (cartId: string) => void;
}

export const CartModal: React.FC<CartModalProps> = ({ isOpen, onClose, cartItems, onRemoveItem }) => {
  if (!isOpen) return null;

  const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const whatsappNumber = "51975933860"; 

  // Función para generar código único legible para la empresa
  // Ej: ID "1", Opción "Plata" -> COD: PK-001-PLA
  const generateSKU = (item: CartItem) => {
    const idPart = item.id.padStart(3, '0'); // Rellena con ceros: 1 -> 001
    const optionPart = item.selectedOption 
      ? item.selectedOption.substring(0, 3).toUpperCase() 
      : 'UNI'; // UNI = Único
    return `PK-${idPart}-${optionPart}`;
  };

  const handleCheckout = () => {
    const orderId = Math.floor(1000 + Math.random() * 9000); 

    // Emojis Seguros (Unicode Escaped) para evitar  por problemas de encoding
    const PARROT = '\uD83E\uDD9C';  // 🦜
    const SPARKLES = '\u2728';      // ✨
    const GIFT = '\uD83C\uDF81';    // 🎁
    const TAG = '\uD83C\uDFF7';     // 🏷️ (Etiqueta)
    const MONEY = '\uD83D\uDCB0';   // 💰
    const MONEY_WING = '\uD83D\uDCB8'; // 💸
    const HANDS = '\uD83D\uDE4C';   // 🙌

    // Construir lista de productos con formato ORGÁNICO
    const productList = cartItems.map(item => {
      const sku = generateSKU(item);
      const optionText = item.selectedOption ? `(${item.selectedOption})` : '';
      
      // Formato amigable:
      // 🎁 *2x Nombre* (Opción)
      //    └ 🏷️ Ref: CODIGO
      return `${GIFT} *${item.quantity}x ${item.title}* ${optionText}\n   └ ${TAG} Ref: ${sku}\n   ${MONEY} S/. ${(item.price * item.quantity).toFixed(2)}`;
    }).join('\n\n');

    // Mensaje final con emojis seguros
    const text = `¡Hola Punkay! ${PARROT}${SPARKLES}
Me enamoré de estos detalles y quiero hacer mi pedido #${orderId}:

${productList}

-----------------------------------
${MONEY_WING} *TOTAL APROX: S/. ${total.toFixed(2)}*
-----------------------------------

Quedo atent@ para que me pasen el Yape/Plin y coordinar el envío. ¡Gracias! ${HANDS}`;

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Contenedor Grande (max-w-4xl) */}
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh] md:h-auto md:max-h-[90vh] border border-gray-200">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10 shrink-0">
          <h2 className="text-2xl font-black brand-font text-black flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500 fill-current" />
            Tu Carrito de Compras
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-black">
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* Content: Table Layout */}
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center p-4">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <Heart className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-xl font-bold text-gray-900 mb-2">Tu carrito está vacío</p>
              <p className="text-gray-500 mb-6">Parece que aún no has encontrado el regalo perfecto.</p>
              <button onClick={onClose} className="px-6 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-colors shadow-lg">
                Volver a la tienda
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Desktop Table Headers */}
              <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-100 p-4 border-b border-gray-200 text-sm font-bold text-gray-600 uppercase tracking-wide">
                <div className="col-span-6">Producto</div>
                <div className="col-span-2 text-center">Precio Unit.</div>
                <div className="col-span-2 text-center">Cantidad</div>
                <div className="col-span-2 text-right pr-4">Total</div>
              </div>

              {/* Items */}
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.cartId} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors group">
                    
                    {/* Producto Info */}
                    <div className="col-span-1 md:col-span-6 flex gap-4 items-center">
                       <button onClick={() => onRemoveItem(item.cartId)} className="md:hidden text-gray-300 hover:text-red-500"><Trash2 className="w-5 h-5"/></button>
                       <div className="w-20 h-20 rounded-xl bg-gray-50 border border-gray-100 shrink-0 overflow-hidden">
                          <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                       </div>
                       <div>
                         <div className="mb-1">
                           <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-gray-200">
                             Ref: {generateSKU(item)}
                           </span>
                         </div>
                         <h3 className="font-bold text-gray-900 text-base leading-tight">{item.title}</h3>
                         {item.selectedOption && (
                           <span className="inline-block mt-1 bg-green-50 px-2 py-0.5 rounded text-xs text-green-700 font-bold">
                             {item.selectedOption}
                           </span>
                         )}
                       </div>
                    </div>

                    {/* Precio Unitario */}
                    <div className="hidden md:block col-span-2 text-center font-medium text-gray-500">
                      S/. {item.price.toFixed(2)}
                    </div>

                    {/* Cantidad */}
                    <div className="col-span-1 md:col-span-2 flex justify-center">
                       <span className="px-4 py-1 bg-gray-100 rounded-lg text-sm font-bold text-gray-800">
                         {item.quantity} ud{item.quantity > 1 ? 's' : ''}
                       </span>
                    </div>

                    {/* Total & Remove (Desktop) */}
                    <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end gap-4">
                      <span className="font-black text-green-700 text-lg">
                        S/. {(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button 
                        onClick={() => onRemoveItem(item.cartId)}
                        className="hidden md:block p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 bg-white border-t border-gray-100 shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto w-full">
               
               {/* Left: Note */}
               <div className="hidden md:flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-xl border border-blue-100 max-w-sm">
                  <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  <p className="text-xs text-blue-800">
                    Paga con <strong>Yape, Plin o Efectivo</strong> al coordinar.
                  </p>
               </div>

               {/* Right: Total & Action */}
               <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
                 <div className="text-center md:text-right">
                   <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Total a Pagar</p>
                   <p className="text-4xl font-black text-gray-900 tracking-tight">S/. {total.toFixed(2)}</p>
                 </div>

                 <button 
                  onClick={handleCheckout}
                  className="w-full md:w-auto px-8 py-4 bg-[#25D366] hover:bg-[#1db854] text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl hover:scale-[1.02] ring-4 ring-green-50"
                 >
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Coordinar por WhatsApp
                 </button>
               </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};