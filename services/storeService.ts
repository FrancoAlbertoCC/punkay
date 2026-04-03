import type { Session } from '@supabase/supabase-js';
import { Product, StoreData } from '../types';
import { supabase } from './supabaseClient';

type ProductRow = {
  id: string;
  title: string;
  price: number;
  original_price: number;
  rating: number;
  sold_count: number;
  description: string;
  images: string[] | null;
  category: string;
  options: string[] | null;
};

type CategoryRow = {
  name: string;
};

const PRODUCT_SELECT = `
  id,
  title,
  price,
  original_price,
  rating,
  sold_count,
  description,
  images,
  category,
  options
`;

const ensureSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase no esta configurado. Revisa las variables VITE_SUPABASE_*.');
  }

  return supabase;
};

const normalizeArray = (value: string[] | null | undefined) =>
  Array.isArray(value) ? value.filter(Boolean) : [];

const mapProductRow = (row: ProductRow): Product => ({
  id: row.id,
  title: row.title,
  price: Number(row.price ?? 0),
  originalPrice: Number(row.original_price ?? 0),
  rating: Number(row.rating ?? 5),
  soldCount: Number(row.sold_count ?? 0),
  description: row.description ?? '',
  images: normalizeArray(row.images),
  category: row.category ?? '',
  options: normalizeArray(row.options),
});

const mapProductToRow = (product: Product): ProductRow => ({
  id: product.id,
  title: product.title.trim(),
  price: Number(product.price ?? 0),
  original_price: Number(product.originalPrice ?? product.price ?? 0),
  rating: Number(product.rating ?? 5),
  sold_count: Number(product.soldCount ?? 0),
  description: product.description.trim(),
  images: normalizeArray(product.images),
  category: product.category.trim(),
  options: normalizeArray(product.options),
});

const sanitizeCategories = (categories: string[]) =>
  [...new Set(categories.map(category => category.trim()).filter(Boolean))];

export const getSession = async (): Promise<Session | null> => {
  const client = ensureSupabase();
  const {
    data: { session },
    error,
  } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
};

export const onAuthStateChange = (callback: (session: Session | null) => void) => {
  const client = ensureSupabase();
  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });

  return subscription;
};

export const signInAdmin = async (email: string, password: string) => {
  const client = ensureSupabase();
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw error;
  }

  return data.session;
};

export const signOutAdmin = async () => {
  const client = ensureSupabase();
  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }
};

export const fetchStoreData = async (): Promise<StoreData> => {
  const client = ensureSupabase();

  const [{ data: products, error: productsError }, { data: categories, error: categoriesError }] =
    await Promise.all([
      client.from('products').select(PRODUCT_SELECT).order('created_at', { ascending: false }),
      client.from('categories').select('name').order('name', { ascending: true }),
    ]);

  if (productsError) {
    throw productsError;
  }

  if (categoriesError) {
    throw categoriesError;
  }

  return {
    products: (products ?? []).map(mapProductRow),
    categories: (categories ?? []).map((row: CategoryRow) => row.name),
  };
};

export const saveProduct = async (product: Product) => {
  const client = ensureSupabase();
  const row = mapProductToRow(product);

  const { error } = await client.from('products').upsert(row);

  if (error) {
    throw error;
  }
};

export const deleteProduct = async (productId: string) => {
  const client = ensureSupabase();
  const { error } = await client.from('products').delete().eq('id', productId);

  if (error) {
    throw error;
  }
};

export const createCategory = async (categoryName: string) => {
  const client = ensureSupabase();
  const cleanName = categoryName.trim();

  if (!cleanName) {
    return;
  }

  const { error } = await client.from('categories').upsert({ name: cleanName }, { onConflict: 'name' });

  if (error) {
    throw error;
  }
};

export const syncImportedStoreData = async (data: StoreData) => {
  const client = ensureSupabase();
  const categories = sanitizeCategories(data.categories);
  const products = data.products.map(mapProductToRow);

  if (categories.length > 0) {
    const { error: categoriesError } = await client
      .from('categories')
      .upsert(categories.map(name => ({ name })), { onConflict: 'name' });

    if (categoriesError) {
      throw categoriesError;
    }
  }

  if (products.length > 0) {
    const { error: productsError } = await client.from('products').upsert(products);

    if (productsError) {
      throw productsError;
    }
  }
};

export const uploadProductImage = async (file: File) => {
  const client = ensureSupabase();
  const extension = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
  const filePath = `products/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error } = await client.storage.from('product-images').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || 'image/jpeg',
  });

  if (error) {
    throw error;
  }

  const { data } = client.storage.from('product-images').getPublicUrl(filePath);
  return data.publicUrl;
};
