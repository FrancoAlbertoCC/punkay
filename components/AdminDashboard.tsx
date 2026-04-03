import React, { useState } from 'react';
import { Product, StoreData } from '../types';
import {
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  Save,
  X,
  Image as ImageIcon,
  FileText,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from 'lucide-react';

interface AdminDashboardProps {
  products: Product[];
  categories: string[];
  onAddProduct: (product: Product) => Promise<void> | void;
  onUpdateProduct: (product: Product) => Promise<void> | void;
  onDeleteProduct: (id: string) => Promise<void> | void;
  onAddCategory: (category: string) => Promise<void> | void;
  onImportData: (data: StoreData) => Promise<void> | void;
  onLogout: () => Promise<void> | void;
  onUploadImage?: (file: File) => Promise<string>;
}

const EMPTY_PRODUCT: Product = {
  id: '',
  title: '',
  price: 0,
  originalPrice: 0,
  rating: 5,
  soldCount: 0,
  description: '',
  images: [],
  category: '',
  options: [],
};

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('No se pudo leer la imagen.'));
    reader.readAsDataURL(file);
  });

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddCategory,
  onImportData,
  onLogout,
  onUploadImage,
}) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [showPasteImport, setShowPasteImport] = useState(false);
  const [pasteContent, setPasteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleEditClick = (product: Product) => {
    setActionError(null);
    setEditingProduct({ ...product });
  };

  const handleCreateClick = () => {
    setActionError(null);
    setEditingProduct({
      ...EMPTY_PRODUCT,
      id: crypto.randomUUID(),
      category: categories[0] || 'General',
    });
  };

  const handleSaveProduct = async () => {
    if (!editingProduct || isSaving) return;

    if (!editingProduct.title.trim() || editingProduct.price <= 0) {
      window.alert('Completa el titulo y un precio valido.');
      return;
    }

    try {
      setIsSaving(true);
      setActionError(null);

      const exists = products.some(product => product.id === editingProduct.id);
      const normalizedProduct: Product = {
        ...editingProduct,
        title: editingProduct.title.trim(),
        category: editingProduct.category.trim(),
        description: editingProduct.description.trim(),
        options: editingProduct.options.map(option => option.trim()).filter(Boolean),
      };

      if (exists) {
        await onUpdateProduct(normalizedProduct);
      } else {
        await onAddProduct(normalizedProduct);
      }

      setEditingProduct(null);
    } catch (error) {
      console.error(error);
      setActionError('No pudimos guardar el producto. Revisa tu configuracion de Supabase.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddImageFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editingProduct || isUploadingImage) return;

    try {
      setIsUploadingImage(true);
      setActionError(null);
      const imageSource = onUploadImage ? await onUploadImage(file) : await readFileAsDataUrl(file);

      setEditingProduct(current =>
        current
          ? {
              ...current,
              images: [...current.images, imageSource],
            }
          : current,
      );
    } catch (error) {
      console.error(error);
      setActionError('No se pudo subir la imagen. Verifica el bucket product-images en Supabase.');
    } finally {
      setIsUploadingImage(false);
      event.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const url = window.prompt('Ingresa la URL de la imagen:');
    if (!url) return;

    setEditingProduct(current =>
      current
        ? {
            ...current,
            images: [...current.images, url],
          }
        : current,
    );
  };

  const handleRemoveImage = (index: number) => {
    setEditingProduct(current => {
      if (!current) return current;

      const images = [...current.images];
      images.splice(index, 1);
      return { ...current, images };
    });
  };

  const handleExport = () => {
    try {
      const dataStr = JSON.stringify({ products, categories }, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const downloadAnchorNode = document.createElement('a');

      downloadAnchorNode.setAttribute('href', url);
      downloadAnchorNode.setAttribute(
        'download',
        `punkay_backup_${new Date().toISOString().slice(0, 10)}.json`,
      );
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      window.alert('Error al exportar. Es posible que el archivo sea demasiado grande.');
    }
  };

  const cleanJsonInput = (value: string) =>
    value.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'").trim();

  const processImportContent = async (content: string) => {
    try {
      const cleanedContent = cleanJsonInput(content);
      if (!cleanedContent) {
        throw new Error('El contenido esta vacio.');
      }

      let json: Partial<StoreData>;
      try {
        json = JSON.parse(cleanedContent);
      } catch {
        throw new Error('Sintaxis JSON invalida. Revisa llaves, corchetes y comas.');
      }

      const nextProducts = Array.isArray(json.products) ? json.products : products;
      const nextCategories = Array.isArray(json.categories) ? json.categories : categories;

      if (!Array.isArray(json.products) && !Array.isArray(json.categories)) {
        throw new Error("El JSON debe incluir al menos 'products' o 'categories'.");
      }

      const confirmMessage =
        `Resumen de importacion:\n` +
        `- ${nextProducts.length} productos\n` +
        `- ${nextCategories.length} categorias\n\n` +
        `Se sincronizaran con la tienda. Deseas continuar?`;

      if (!window.confirm(confirmMessage)) {
        return;
      }

      setIsSaving(true);
      setActionError(null);
      await onImportData({
        products: nextProducts,
        categories: nextCategories,
      });

      setShowPasteImport(false);
      setPasteContent('');
      window.alert('Datos importados correctamente.');
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'No se pudo importar el archivo.';
      window.alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      await processImportContent(content);
    } finally {
      event.target.value = '';
    }
  };

  const handleCreateCategory = async () => {
    const categoryName = newCategory.trim();
    if (!categoryName || isSaving) return;

    try {
      setIsSaving(true);
      setActionError(null);
      await onAddCategory(categoryName);
      setNewCategory('');
    } catch (error) {
      console.error(error);
      setActionError('No pudimos guardar la categoria.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (isSaving) return;

    const shouldDelete = window.confirm('Deseas eliminar este producto?');
    if (!shouldDelete) return;

    try {
      setIsSaving(true);
      setActionError(null);
      await onDeleteProduct(productId);
    } catch (error) {
      console.error(error);
      setActionError('No pudimos eliminar el producto.');
    } finally {
      setIsSaving(false);
    }
  };

  if (editingProduct) {
    const isEditingExisting = products.some(product => product.id === editingProduct.id);

    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black brand-font">
            {isEditingExisting ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={() => setEditingProduct(null)}
            className="p-2 hover:bg-gray-100 rounded-full text-black"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {actionError && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
            {actionError}
          </div>
        )}

        <div className="space-y-4 text-black">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Titulo</label>
              <input
                value={editingProduct.title}
                onChange={event =>
                  setEditingProduct({ ...editingProduct, title: event.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="Nombre del producto"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Categoria</label>
              <select
                value={editingProduct.category}
                onChange={event =>
                  setEditingProduct({ ...editingProduct, category: event.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                {categories.length > 0 ? (
                  categories.map(category => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))
                ) : (
                  <option value="General">General</option>
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <label className="block text-sm font-bold text-green-700 mb-1">Precio de venta</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editingProduct.price}
                onChange={event =>
                  setEditingProduct({
                    ...editingProduct,
                    price: Number(event.target.value || 0),
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none font-bold"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-500 mb-1">Precio normal</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={editingProduct.originalPrice}
                onChange={event =>
                  setEditingProduct({
                    ...editingProduct,
                    originalPrice: Number(event.target.value || 0),
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1">Descripcion</label>
            <textarea
              value={editingProduct.description}
              onChange={event =>
                setEditingProduct({ ...editingProduct, description: event.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-lg h-24 bg-white text-black focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              placeholder="Detalles del producto..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1">Variantes</label>
              <input
                type="text"
                value={editingProduct.options.join(', ')}
                onChange={event =>
                  setEditingProduct({
                    ...editingProduct,
                    options: event.target.value.split(',').map(option => option.trim()),
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                placeholder="Ej: Rojo grande, Azul pequeno"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1">Ventas visibles</label>
              <input
                type="number"
                min="0"
                step="1"
                value={editingProduct.soldCount}
                onChange={event =>
                  setEditingProduct({
                    ...editingProduct,
                    soldCount: Number(event.target.value || 0),
                  })
                }
                className="w-full p-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-2">Imagenes del producto</label>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mb-2">
              {editingProduct.images.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="relative aspect-square border border-gray-200 rounded overflow-hidden group bg-white"
                >
                  <img src={image} className="w-full h-full object-cover" alt="preview" />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute inset-0 bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="absolute top-0 left-0 bg-black text-white text-[10px] px-1">
                    {index + 1}
                  </div>
                </div>
              ))}

              <label className="aspect-square border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 text-black bg-white hover:border-green-500 transition-colors">
                {isUploadingImage ? (
                  <>
                    <Loader2 className="w-5 h-5 mb-1 animate-spin" />
                    <span className="text-[10px]">Subiendo</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-[10px]">Subir</span>
                  </>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAddImageFile}
                  disabled={isUploadingImage}
                />
              </label>
              <button
                onClick={handleAddImageUrl}
                className="aspect-square border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 text-black bg-white hover:border-green-500 transition-colors"
              >
                <ImageIcon className="w-5 h-5 mb-1" />
                <span className="text-[10px]">URL</span>
              </button>
            </div>
          </div>

          <button
            onClick={handleSaveProduct}
            disabled={isSaving || isUploadingImage}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-all disabled:bg-gray-300 disabled:shadow-none"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Guardar producto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300 bg-white">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4 gap-4">
        <div>
          <h1 className="text-2xl font-black text-black brand-font">Panel de Control Punkay</h1>
          <p className="text-gray-500">Gestiona tu tienda, productos e imagenes.</p>
        </div>
        <button
          onClick={() => void onLogout()}
          className="text-red-600 font-bold border-b-2 border-red-600 hover:text-red-800"
        >
          Cerrar sesion
        </button>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-medium">
          {actionError}
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={handleCreateClick}
            className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-700 shadow-md"
          >
            <Plus className="w-4 h-4" /> Nuevo producto
          </button>
        </div>
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={handleExport}
            className="bg-white text-black border border-gray-300 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50"
          >
            <Download className="w-4 h-4" /> Exportar JSON
          </button>

          <label className="bg-white text-black border border-gray-300 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50 cursor-pointer">
            <Upload className="w-4 h-4" /> Importar archivo
            <input type="file" className="hidden" accept=".json" onChange={handleFileImport} />
          </label>

          <button
            onClick={() => setShowPasteImport(true)}
            className="bg-white text-black border border-gray-300 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50"
          >
            <FileText className="w-4 h-4" /> Importar texto
          </button>
        </div>
      </div>

      {showPasteImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 border border-gray-200 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-black">Pegar codigo JSON</h3>
              <button
                onClick={() => setShowPasteImport(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 flex gap-2 items-start">
              <AlertTriangle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700">
                Copia el JSON completo. Si incluye imagenes en base64, el contenido puede ser largo.
              </p>
            </div>

            <textarea
              value={pasteContent}
              onChange={event => setPasteContent(event.target.value)}
              className="flex-1 w-full p-4 border border-gray-300 rounded-lg bg-gray-50 font-mono text-xs focus:ring-2 focus:ring-green-500 outline-none resize-none min-h-[300px]"
              placeholder='{ "products": [...], "categories": [...] }'
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowPasteImport(false)}
                className="px-4 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => void processImportContent(pasteContent)}
                className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:bg-gray-300"
                disabled={!pasteContent || isSaving}
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                Importar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="font-bold mb-4 text-black">Categorias</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.map(category => (
            <span
              key={category}
              className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
            >
              {category}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newCategory}
            onChange={event => setNewCategory(event.target.value)}
            placeholder="Nueva categoria..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white text-black focus:ring-2 focus:ring-green-500 outline-none"
          />
          <button
            onClick={() => void handleCreateCategory()}
            className="bg-black text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 disabled:bg-gray-300"
            disabled={!newCategory.trim() || isSaving}
          >
            Agregar
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-bold text-gray-500 text-sm">Producto</th>
              <th className="p-4 font-bold text-gray-500 text-sm">Categoria</th>
              <th className="p-4 font-bold text-gray-500 text-sm">Precio</th>
              <th className="p-4 font-bold text-gray-500 text-sm text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 bg-white">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-gray-100 overflow-hidden border border-gray-100">
                    {product.images[0] && (
                      <img src={product.images[0]} className="w-full h-full object-cover" alt={product.title} />
                    )}
                  </div>
                  <span className="font-bold text-black line-clamp-1 max-w-[220px]">{product.title}</span>
                </td>
                <td className="p-4 text-sm text-gray-600 font-medium">{product.category}</td>
                <td className="p-4 font-bold text-green-700">S/. {product.price}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded border border-transparent hover:border-blue-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => void handleDeleteProduct(product.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500">
                  No hay productos todavia. Agrega el primero desde este panel.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
