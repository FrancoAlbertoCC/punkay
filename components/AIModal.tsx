import React, { useState, useRef } from 'react';
import { visualizeProductInContext } from '../services/geminiService';
import { Loader2, Upload, Sparkles, X, Camera, AlertCircle } from 'lucide-react';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  productImage: string;
  productTitle: string;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, productImage, productTitle }) => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [promptContext, setPromptContext] = useState<string>('person'); // 'person' or 'room'
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserImage(reader.result as string);
        setGeneratedImage(null); // Reset previous generation
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!userImage) return;

    setIsLoading(true);
    setError(null);

    try {
      let prompt = "";
      if (promptContext === 'person') {
        prompt = `Generate a photorealistic image. Take the person/body part from Image 1, and digitally wear/attach the product from Image 2 onto them naturally. It is a ${productTitle}. Ensure lighting and shadows match. Return only the image.`;
      } else {
        prompt = `Generate a photorealistic image. Place the product object from Image 2 into the room/environment shown in Image 1. It is a ${productTitle}. Ensure perspective, size, and shadows are realistic for the room. Return only the image.`;
      }

      const result = await visualizeProductInContext(productImage, userImage, prompt);
      setGeneratedImage(result);
    } catch (err) {
      setError("Hubo un error generando la imagen. Por favor intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in fade-in zoom-in duration-200 border border-cyan-100">
        
        {/* Left Side: Controls */}
        <div className="w-full md:w-1/3 bg-white p-6 flex flex-col border-r border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black brand-font text-gray-900 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-cyan-500 fill-current" />
              Punkay Vision
            </h2>
            <button onClick={onClose} className="md:hidden p-2 bg-gray-100 rounded-full hover:bg-gray-200">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-6 flex-1">
            
            {/* Context Selector */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">¿Dónde lo quieres ver?</label>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => setPromptContext('person')}
                  className={`p-3 text-sm font-bold rounded-xl border-2 transition-all ${promptContext === 'person' ? 'bg-cyan-50 border-cyan-500 text-cyan-700' : 'bg-white border-gray-100 hover:border-gray-300 text-gray-500'}`}
                >
                  En una persona
                </button>
                <button 
                  onClick={() => setPromptContext('room')}
                  className={`p-3 text-sm font-bold rounded-xl border-2 transition-all ${promptContext === 'room' ? 'bg-cyan-50 border-cyan-500 text-cyan-700' : 'bg-white border-gray-100 hover:border-gray-300 text-gray-500'}`}
                >
                  En un espacio
                </button>
              </div>
            </div>

            {/* Upload Area */}
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-2">Tu foto de referencia</label>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer border-2 border-dashed border-cyan-200 rounded-2xl bg-cyan-50/50 h-40 flex flex-col items-center justify-center text-center p-4 hover:bg-cyan-50 transition-colors group"
              >
                {userImage ? (
                  <img src={userImage} alt="Reference" className="h-full object-contain rounded-lg shadow-sm" />
                ) : (
                  <>
                    <Camera className="w-10 h-10 text-cyan-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-sm text-cyan-700 font-bold">Toca para subir foto</p>
                    <p className="text-xs text-gray-400 mt-1">Selfie, habitación, mesa...</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
              </div>
            </div>

            {/* Helper Info */}
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
              <p className="text-xs text-yellow-800 font-medium">
                <strong>💡 Tip:</strong> Usa una foto con buena luz. La Inteligencia Artificial hará el resto.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!userImage || isLoading}
            className={`mt-6 w-full py-4 px-4 rounded-xl font-black text-white shadow-lg transition-all flex items-center justify-center gap-2
              ${!userImage || isLoading ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-cyan-500/40 hover:scale-[1.02]'}
            `}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                VER RESULTADO
              </>
            )}
          </button>
        </div>

        {/* Right Side: Preview */}
        <div className="w-full md:w-2/3 bg-gray-900 relative min-h-[400px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-brick-wall.png')] opacity-30"></div>
            
            {/* Close button for desktop */}
            <button onClick={onClose} className="absolute top-4 right-4 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 hidden md:block backdrop-blur-md border border-white/20">
              <X className="w-6 h-6" />
            </button>

            {generatedImage ? (
              <div className="relative w-full h-full flex items-center justify-center p-4 z-10">
                 <img src={generatedImage} alt="Generated Result" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl animate-in zoom-in duration-300 border border-white/10" />
                 <div className="absolute bottom-6 right-6 bg-cyan-900/80 text-cyan-100 px-4 py-1.5 text-xs font-bold rounded-full backdrop-blur-md border border-cyan-500/30">
                   ✨ Generado por Punkay AI
                 </div>
              </div>
            ) : (
              <div className="text-center p-8 z-10 relative">
                <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-gray-600">
                  <Sparkles className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-gray-200 font-bold text-xl brand-font">Visualizador IA</h3>
                <p className="text-gray-400 text-sm mt-2 max-w-xs mx-auto">Sube tu foto y presiona el botón mágico para ver cómo queda.</p>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};