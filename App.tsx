import React, { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Header } from './components/Header';
import { Product, ViewState, CartItem, StoreData } from './types';
import { ProductDetail } from './components/ProductDetail';
import { AdminDashboard } from './components/AdminDashboard';
import { CartModal } from './components/CartModal';
import { PostAddModal } from './components/PostAddModal';
import { DEFAULT_STORE_DATA } from './services/defaultStore';
import { isSupabaseConfigured } from './services/supabaseClient';
import {
  createCategory,
  deleteProduct,
  fetchStoreData,
  getSession,
  onAuthStateChange,
  saveProduct,
  signInAdmin,
  signOutAdmin,
  syncImportedStoreData,
  uploadProductImage,
} from './services/storeService';
import { AlertCircle, ArrowRight, Heart, Loader2, Lock } from 'lucide-react';

const { products: initialProducts, categories: initialCategories } = DEFAULT_STORE_DATA;

const normalizeStoreData = (data: StoreData): StoreData => ({
  products: data.products,
  categories: [...new Set(data.categories.map(category => category.trim()).filter(Boolean))],
});

function App() {
  const [view, setView] = useState<ViewState>('HOME');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPostAddOpen, setIsPostAddOpen] = useState(false);

  const [session, setSession] = useState<Session | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [isStoreLoading, setIsStoreLoading] = useState(true);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState('Todos');

  const filteredProducts =
    activeCategory === 'Todos'
      ? products
      : products.filter(product => product.category === activeCategory);

  useEffect(() => {
    let isMounted = true;

    const initialize = async () => {
      if (!isSupabaseConfigured) {
        if (!isMounted) return;

        setProducts(initialProducts);
        setCategories(initialCategories);
        setStoreError(
          'La tienda esta corriendo en modo demo. Configura Supabase para guardar productos, fotos y accesos admin.',
        );
        setIsStoreLoading(false);
        return;
      }

      try {
        const [nextSession, storeData] = await Promise.all([getSession(), fetchStoreData()]);
        if (!isMounted) return;

        const normalizedStore = normalizeStoreData(storeData);
        setSession(nextSession);
        setProducts(normalizedStore.products);
        setCategories(normalizedStore.categories);
        setStoreError(null);
      } catch (error) {
        console.error(error);
        if (!isMounted) return;

        const message =
          error instanceof Error
            ? error.message
            : 'No se pudo conectar con Supabase. Revisa las tablas, politicas y variables de entorno.';
        setStoreError(message);
      } finally {
        if (isMounted) {
          setIsStoreLoading(false);
        }
      }
    };

    void initialize();

    if (!isSupabaseConfigured) {
      return () => {
        isMounted = false;
      };
    }

    const subscription = onAuthStateChange(nextSession => {
      if (!isMounted) return;
      setSession(nextSession);
      if (nextSession) {
        setAuthError(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!selectedProduct) return;

    const updatedProduct = products.find(product => product.id === selectedProduct.id);
    if (updatedProduct) {
      setSelectedProduct(updatedProduct);
      return;
    }

    setSelectedProduct(null);
    setView('HOME');
  }, [products, selectedProduct]);

  useEffect(() => {
    if (activeCategory === 'Todos') return;
    if (categories.includes(activeCategory)) return;
    setActiveCategory('Todos');
  }, [activeCategory, categories]);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setView('PRODUCT_DETAIL');
    window.scrollTo(0, 0);
  };

  const handleGoHome = () => {
    setView('HOME');
    setSelectedProduct(null);
  };

  const handleGoAdmin = () => {
    setView(session ? 'ADMIN_DASHBOARD' : 'ADMIN_LOGIN');
    setAuthError(null);
  };

  const addToCart = (product: Product, quantity: number, option: string) => {
    const newItem: CartItem = {
      ...product,
      cartId: `${product.id}-${option}-${Date.now()}`,
      quantity,
      selectedOption: option,
    };

    setCartItems(currentItems => [...currentItems, newItem]);
    setIsPostAddOpen(true);
  };

  const removeCartItem = (cartId: string) => {
    setCartItems(currentItems => currentItems.filter(item => item.cartId !== cartId));
  };

  const handleKeepShopping = () => {
    setIsPostAddOpen(false);
    setView('HOME');
    window.scrollTo(0, 0);
  };

  const handleGoToCart = () => {
    setIsPostAddOpen(false);
    setIsCartOpen(true);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isSupabaseConfigured) {
      setAuthError('Configura Supabase antes de habilitar el panel administrador en la web.');
      return;
    }

    try {
      setIsAuthLoading(true);
      setAuthError(null);
      await signInAdmin(adminEmail, adminPassword);
      setAdminPassword('');
      setView('ADMIN_DASHBOARD');
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : 'No pudimos iniciar sesion con Supabase.';
      setAuthError(message);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const upsertLocalProduct = (product: Product) => {
    setProducts(currentProducts => {
      const nextProducts = currentProducts.filter(currentProduct => currentProduct.id !== product.id);
      return [product, ...nextProducts];
    });

    if (product.category.trim()) {
      setCategories(currentCategories =>
        currentCategories.includes(product.category)
          ? currentCategories
          : [...currentCategories, product.category],
      );
    }
  };

  const handleAddProduct = async (product: Product) => {
    if (isSupabaseConfigured) {
      await createCategory(product.category);
      await saveProduct(product);
    }

    upsertLocalProduct(product);
  };

  const handleUpdateProduct = async (product: Product) => {
    if (isSupabaseConfigured) {
      await createCategory(product.category);
      await saveProduct(product);
    }

    upsertLocalProduct(product);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (isSupabaseConfigured) {
      await deleteProduct(productId);
    }

    setProducts(currentProducts => currentProducts.filter(product => product.id !== productId));
  };

  const handleAddCategory = async (categoryName: string) => {
    const cleanCategory = categoryName.trim();
    if (!cleanCategory) return;

    if (isSupabaseConfigured) {
      await createCategory(cleanCategory);
    }

    setCategories(currentCategories =>
      currentCategories.includes(cleanCategory)
        ? currentCategories
        : [...currentCategories, cleanCategory],
    );
  };

  const handleImportData = async (data: StoreData) => {
    const normalizedStore = normalizeStoreData(data);

    if (isSupabaseConfigured) {
      await syncImportedStoreData(normalizedStore);
    }

    setProducts(normalizedStore.products);
    setCategories(normalizedStore.categories);
  };

  const handleLogout = async () => {
    try {
      if (isSupabaseConfigured) {
        await signOutAdmin();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSession(null);
      setView('HOME');
      setAdminPassword('');
      setAuthError(null);
    }
  };

  const adminHelpText = isSupabaseConfigured
    ? 'Inicia sesion con el correo y la clave que creaste en Supabase Auth.'
    : 'Aun falta conectar Supabase. La tienda publica ya funciona, pero el admin persistente todavia no.';

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {view !== 'ADMIN_DASHBOARD' && view !== 'ADMIN_LOGIN' && (
        <Header
          onGoHome={handleGoHome}
          onGoAdmin={handleGoAdmin}
          onOpenCart={() => setIsCartOpen(true)}
          cartCount={cartItems.length}
          isAdminAuthenticated={Boolean(session)}
        />
      )}

      <main className="container mx-auto px-4 py-8">
        {view === 'HOME' && (
          <div className="space-y-8 md:space-y-12">
            {storeError && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-sm">Estado de la integracion</p>
                  <p className="text-sm">{storeError}</p>
                </div>
              </div>
            )}

            <div className="relative rounded-3xl p-8 md:p-16 overflow-hidden flex items-center shadow-2xl bg-[#111]">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-brick-wall.png')] opacity-50"></div>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-3xl border-4 border-white/20"></div>
              <div className="absolute right-10 md:right-32 top-1/2 -translate-y-1/2 w-48 h-48 md:w-72 md:h-72 rounded-full border-4 border-white/80 shadow-[0_0_50px_rgba(255,255,255,0.8)] hidden sm:block"></div>

              <div className="relative z-10 max-w-lg">
                <h2 className="text-5xl md:text-6xl font-black mb-2 leading-tight brand-font text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.8)]">
                  PUNKAY
                </h2>
                <h3 className="text-2xl md:text-3xl font-bold mb-6 text-cyan-400 tracking-widest drop-shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-pulse">
                  DETALLES QUE ENAMORAN
                </h3>
                <p className="text-gray-300 mb-8 text-lg font-medium max-w-sm">
                  Especialistas en regalos, peluches, joyeria y sorpresas para cualquier fecha especial.
                </p>
                <button className="bg-red-600 text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] transition-all transform hover:-translate-y-1 flex items-center gap-2">
                  <Heart className="w-5 h-5 fill-current" /> Ver regalos
                </button>
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
              <button
                onClick={() => setActiveCategory('Todos')}
                className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all border-2 ${
                  activeCategory === 'Todos'
                    ? 'bg-green-600 text-white border-green-600 shadow-md'
                    : 'bg-white text-gray-600 border-gray-100 hover:border-green-400 hover:text-green-600'
                }`}
              >
                Todos
              </button>
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all border-2 ${
                    activeCategory === category
                      ? 'bg-green-600 text-white border-green-600 shadow-md'
                      : 'bg-white text-gray-600 border-gray-100 hover:border-green-400 hover:text-green-600'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {isStoreLoading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3 text-gray-500">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="font-medium">Cargando catalogo...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="group cursor-pointer flex flex-col gap-3"
                  >
                    <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-white border-2 border-transparent group-hover:border-green-400 transition-all duration-300 relative shadow-sm hover:shadow-xl">
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {product.originalPrice > product.price && (
                        <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black shadow-lg">
                          OFERTA
                        </div>
                      )}
                    </div>
                    <div className="px-1">
                      <h3 className="font-bold text-gray-900 leading-tight group-hover:text-green-600 transition-colors brand-font text-lg">
                        {product.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-black text-red-600 text-xl">S/. {product.price}</span>
                        {product.originalPrice > product.price && (
                          <span className="text-sm text-gray-400 line-through font-medium">
                            S/. {product.originalPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="col-span-full py-12 text-center">
                    <p className="text-xl font-bold text-gray-300 brand-font">
                      No se encontraron productos aqui.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {view === 'PRODUCT_DETAIL' && selectedProduct && (
          <ProductDetail
            product={selectedProduct}
            onBack={handleGoHome}
            onAddToCart={addToCart}
          />
        )}

        {view === 'ADMIN_LOGIN' && (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-gray-100">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-3xl font-black brand-font text-gray-900">Acceso Admin</h2>
                <p className="text-gray-500 mt-2">{adminHelpText}</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Correo</label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={event => setAdminEmail(event.target.value)}
                    placeholder="admin@punkay.com"
                    className="w-full p-4 rounded-xl border-2 focus:outline-none transition-all bg-white text-black font-medium border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-50"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Contrasena</label>
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={event => setAdminPassword(event.target.value)}
                    placeholder="Tu clave segura"
                    className={`w-full p-4 rounded-xl border-2 focus:outline-none transition-all bg-white text-black font-medium ${
                      authError
                        ? 'border-red-500 ring-2 ring-red-100'
                        : 'border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-50'
                    }`}
                  />
                </div>

                {authError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm font-medium">
                    {authError}
                  </div>
                )}

                <button
                  className="w-full bg-green-600 text-white font-black py-4 rounded-xl hover:bg-green-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-200 disabled:bg-gray-300 disabled:shadow-none"
                  disabled={isAuthLoading}
                >
                  {isAuthLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Ingresando...
                    </>
                  ) : (
                    <>
                      Entrar al sistema <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              <button
                onClick={handleGoHome}
                className="w-full mt-6 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {view === 'ADMIN_DASHBOARD' && (
          <AdminDashboard
            products={products}
            categories={categories}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddCategory={handleAddCategory}
            onImportData={handleImportData}
            onLogout={handleLogout}
            onUploadImage={isSupabaseConfigured ? uploadProductImage : undefined}
          />
        )}
      </main>

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={removeCartItem}
      />

      <PostAddModal
        isOpen={isPostAddOpen}
        onClose={() => setIsPostAddOpen(false)}
        onKeepShopping={handleKeepShopping}
        onGoToCart={handleGoToCart}
      />
    </div>
  );
}

export default App;
