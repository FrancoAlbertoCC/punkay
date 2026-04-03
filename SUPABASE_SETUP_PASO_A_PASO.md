# Supabase Paso A Paso Para Punkay

Esta guia esta pensada para que hagas lo minimo posible.

## Objetivo

Al terminar vas a tener:

- login de administrador real
- productos guardados en internet
- fotos subidas a un servidor
- la tienda lista para publicar en Netlify

## Lo unico que vas a necesitar hacer tu

1. Crear una cuenta gratis en Supabase.
2. Crear un proyecto.
3. Copiar 2 datos a `.env.local`.
4. Crear tu usuario administrador.

Todo lo demas ya te lo deje preparado en este proyecto.

## Parte 1. Crear cuenta y proyecto

1. Entra a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Clic en `Start your project`
3. Regístrate con Google o correo
4. Ya dentro del panel, clic en `New project`
5. Elige tu organización personal
6. Pon estos datos:

```txt
Project name: punkay
Database Password: una clave fuerte y guardala
Region: la mas cercana a ti
```

7. Clic en `Create new project`
8. Espera a que termine de crear el proyecto

## Parte 2. Sacar los 2 datos que necesito

Con el proyecto abierto:

1. Ve a `Project Settings`
2. Ve a `Data API` o `API` dependiendo de como te salga el panel
3. Copia estos dos valores:

```txt
Project URL
publishable key
```

4. Pégalos en [`.env.local`](C:/Users/USER/Desktop/CODEX/APLICATIVOS/PUNKAY/.env.local)

Debe quedar asi:

```env
GEMINI_API_KEY=PLACEHOLDER_API_KEY
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=tu_publishable_key
```

## Parte 3. Crear tablas y bucket

1. En el panel de Supabase, abre `SQL Editor`
2. Clic en `New query`
3. Abre este archivo local:

[schema.sql](C:/Users/USER/Desktop/CODEX/APLICATIVOS/PUNKAY/supabase/schema.sql)

4. Copia todo el contenido
5. Pégalo en el editor SQL de Supabase
6. Clic en `Run`

Eso crea:

- tabla de categorías
- tabla de productos
- bucket de imágenes
- permisos para que el público vea y el admin edite

## Parte 4. Crear tu usuario administrador

1. En Supabase abre `Authentication`
2. Entra a `Users`
3. Clic en `Add user`
4. Completa:

```txt
Email: tu correo
Password: la clave con la que entraras al panel admin
```

5. Guarda el usuario

Ese correo y esa clave son los que usarás luego dentro de la tienda.

## Parte 5. Probar localmente

En esta carpeta ejecuta:

```powershell
npm.cmd run dev
```

Luego:

1. abre la tienda
2. haz 5 clics rápidos sobre `TIENDAS` en el logo
3. entra con tu correo y contraseña de Supabase
4. crea un producto
5. sube una imagen
6. guarda
7. recarga la página

Si todo salió bien, el producto seguirá ahí.

## Parte 6. Publicar gratis en Netlify

1. Sube esta carpeta a GitHub
2. Entra a [https://app.netlify.com/](https://app.netlify.com/)
3. Clic en `Add new site`
4. Clic en `Import an existing project`
5. Conecta GitHub
6. Elige el repositorio
7. Configura:

```txt
Build command: npm run build
Publish directory: dist
```

8. En `Environment variables` agrega:

```txt
GEMINI_API_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

9. Haz deploy

## Si te pierdes en un paso

Lo más importante es que me pases solo esto:

```txt
1. confirmación de que ya creaste el proyecto
2. VITE_SUPABASE_URL
3. VITE_SUPABASE_PUBLISHABLE_KEY
4. el correo que usarás como admin
```

Con eso te sigo guiando casi sin que tengas que pensar.
