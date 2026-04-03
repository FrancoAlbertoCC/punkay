# Punkay Web

Esta version ya queda preparada para:

- publicar la tienda en Netlify
- iniciar sesion como administrador con Supabase Auth
- guardar productos y categorias en Supabase
- subir imagenes reales a Supabase Storage

## 1. Instalar dependencias

```bash
npm install
```

## 2. Variables de entorno

Crea o actualiza tu archivo `.env.local` usando `.env.example` como base:

```env
GEMINI_API_KEY=tu_gemini_api_key
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_supabase_publishable_key
```

## 3. Crear la base en Supabase

1. Crea un proyecto en Supabase.
2. Abre el SQL Editor.
3. Ejecuta el archivo [supabase/schema.sql](./supabase/schema.sql).
4. Ve a Auth > Users y crea el usuario administrador.

Ese script crea:

- tabla `categories`
- tabla `products`
- bucket `product-images`
- politicas para lectura publica y edicion solo con usuario autenticado

## 4. Ejecutar localmente

```bash
npm run dev
```

Abre la app y entra al admin haciendo 5 clics rapidos sobre el texto `TIENDAS` del logo.

## 5. Desplegar gratis en Netlify

1. Sube este proyecto a GitHub.
2. En Netlify elige `Add new site` > `Import an existing project`.
3. Conecta tu repositorio.
4. Usa estos valores:

```txt
Build command: npm run build
Publish directory: dist
```

5. En `Site configuration` > `Environment variables` agrega:

- `GEMINI_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

6. Haz deploy.

## 6. Recomendacion de uso

- La tienda publica puede leer productos sin login.
- Solo tu usuario autenticado puede crear, editar o borrar.
- Las imagenes se suben al bucket `product-images` y quedan con URL publica.

## 7. Notas

- Si Supabase no esta configurado, la app entra en modo demo.
- El panel admin real requiere las variables `VITE_SUPABASE_*`.
- El probador IA sigue usando Gemini y necesita `GEMINI_API_KEY`.
