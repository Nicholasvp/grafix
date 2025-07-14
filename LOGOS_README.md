# Como substituir as logos do Grafix

## Arquivos criados

Foram criados logos temporários que você deve substituir pelos seus arquivos reais:

### 1. Logo Horizontal (`/public/logo-horizontal.svg`)
- Usado no navbar/dashboard
- Dimensões recomendadas: 120x40px
- Formato: SVG, PNG ou JPG

### 2. Logo Vertical (`/public/logo-vertical.svg`)
- Usado na página de login
- Dimensões recomendadas: 80x80px ou 100x100px
- Formato: SVG, PNG ou JPG

### 3. Favicon (`/public/favicon.svg`)
- Usado como ícone do site na aba do navegador
- Dimensões: 32x32px
- Formato: SVG recomendado (ou ICO)

## Para substituir:

1. **Salve suas logos** na pasta `public/` com os nomes:
   - `logo-horizontal.svg` (ou .png/.jpg)
   - `logo-vertical.svg` (ou .png/.jpg)
   - `favicon.svg` (ou .ico)

2. **Se usar formatos diferentes** (PNG/JPG ao invés de SVG), edite o componente `Logo.tsx` e altere as extensões dos arquivos.

3. **Ajustar dimensões**: Se suas logos têm proporções diferentes, ajuste as props `width` e `height` nos componentes:
   - Navbar: `src/app/components/Navbar.tsx`
   - Login: `src/app/login/page.tsx`
   - Componente Logo: `src/app/components/Logo.tsx`

## Localização dos arquivos editados:

- ✅ `src/app/components/Logo.tsx` - Componente das logos
- ✅ `src/app/components/Navbar.tsx` - Logo horizontal no header
- ✅ `src/app/login/page.tsx` - Logo vertical na página de login
- ✅ `src/app/layout.tsx` - Configuração do favicon
- ✅ `public/logo-horizontal.svg` - Logo horizontal (substitua)
- ✅ `public/logo-vertical.svg` - Logo vertical (substitua)
- ✅ `public/favicon.svg` - Favicon (substitua)
