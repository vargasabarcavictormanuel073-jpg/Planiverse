#!/usr/bin/env node

/**
 * Script de verificación pre-deployment
 * Verifica que todo esté listo para Vercel y Play Store
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando configuración para deployment...\n');

let errors = [];
let warnings = [];
let success = [];

// Verificar archivos esenciales
const requiredFiles = [
  'package.json',
  'next.config.ts',
  'vercel.json',
  'public/manifest.json',
  'public/sw.js',
  'public/icon-192x192.png',
  'public/icon-512x512.png',
];

console.log('📁 Verificando archivos esenciales...');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    success.push(`✅ ${file}`);
  } else {
    errors.push(`❌ Falta: ${file}`);
  }
});

// Verificar screenshots para PWA
console.log('\n📸 Verificando screenshots para PWA...');
const pwaScreenshots = [
  'public/screenshot-mobile.png',
  'public/screenshot-desktop.png',
];

pwaScreenshots.forEach(file => {
  if (fs.existsSync(file)) {
    success.push(`✅ ${file}`);
  } else {
    warnings.push(`⚠️  Recomendado: ${file}`);
  }
});

// Verificar screenshots para Play Store
console.log('\n📱 Verificando recursos para Play Store...');
const playStoreFiles = [
  'public/feature-graphic.png',
  'public/.well-known/assetlinks.json',
];

playStoreFiles.forEach(file => {
  if (fs.existsSync(file)) {
    success.push(`✅ ${file}`);
  } else {
    warnings.push(`⚠️  Necesario para Play Store: ${file}`);
  }
});

// Verificar manifest.json
console.log('\n📋 Verificando manifest.json...');
try {
  const manifest = JSON.parse(fs.readFileSync('public/manifest.json', 'utf8'));
  
  if (manifest.name) success.push('✅ Manifest: name');
  else errors.push('❌ Manifest: falta name');
  
  if (manifest.short_name) success.push('✅ Manifest: short_name');
  else warnings.push('⚠️  Manifest: falta short_name');
  
  if (manifest.start_url) success.push('✅ Manifest: start_url');
  else errors.push('❌ Manifest: falta start_url');
  
  if (manifest.display) success.push('✅ Manifest: display');
  else errors.push('❌ Manifest: falta display');
  
  if (manifest.icons && manifest.icons.length >= 2) {
    success.push('✅ Manifest: icons (mínimo 2)');
  } else {
    errors.push('❌ Manifest: necesita al menos 2 iconos');
  }
  
  if (manifest.theme_color) success.push('✅ Manifest: theme_color');
  else warnings.push('⚠️  Manifest: falta theme_color');
  
  if (manifest.background_color) success.push('✅ Manifest: background_color');
  else warnings.push('⚠️  Manifest: falta background_color');
  
} catch (error) {
  errors.push('❌ Error leyendo manifest.json: ' + error.message);
}

// Verificar .env.example
console.log('\n🔐 Verificando configuración de entorno...');
if (fs.existsSync('.env.example')) {
  success.push('✅ .env.example existe');
} else {
  warnings.push('⚠️  Crea .env.example para documentar variables');
}

if (fs.existsSync('.env.local')) {
  success.push('✅ .env.local existe (no subir a Git)');
} else {
  warnings.push('⚠️  Crea .env.local con tus variables de Firebase');
}

// Verificar .gitignore
console.log('\n🚫 Verificando .gitignore...');
if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  if (gitignore.includes('.env.local') || gitignore.includes('.env*')) {
    success.push('✅ .gitignore incluye archivos .env');
  } else {
    errors.push('❌ .gitignore debe incluir .env.local o .env*');
  }
  if (gitignore.includes('node_modules')) {
    success.push('✅ .gitignore incluye node_modules');
  } else {
    errors.push('❌ .gitignore debe incluir node_modules');
  }
} else {
  errors.push('❌ Falta archivo .gitignore');
}

// Verificar package.json scripts
console.log('\n📦 Verificando scripts de package.json...');
try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  const requiredScripts = ['dev', 'build', 'start'];
  requiredScripts.forEach(script => {
    if (pkg.scripts && pkg.scripts[script]) {
      success.push(`✅ Script: ${script}`);
    } else {
      errors.push(`❌ Falta script: ${script}`);
    }
  });
} catch (error) {
  errors.push('❌ Error leyendo package.json: ' + error.message);
}

// Resumen
console.log('\n' + '='.repeat(60));
console.log('📊 RESUMEN DE VERIFICACIÓN');
console.log('='.repeat(60));

if (success.length > 0) {
  console.log('\n✅ Exitosos (' + success.length + '):');
  // Solo mostrar primeros 5 para no saturar
  success.slice(0, 5).forEach(msg => console.log('  ' + msg));
  if (success.length > 5) {
    console.log(`  ... y ${success.length - 5} más`);
  }
}

if (warnings.length > 0) {
  console.log('\n⚠️  Advertencias (' + warnings.length + '):');
  warnings.forEach(msg => console.log('  ' + msg));
}

if (errors.length > 0) {
  console.log('\n❌ Errores (' + errors.length + '):');
  errors.forEach(msg => console.log('  ' + msg));
}

console.log('\n' + '='.repeat(60));

// Checklist de acciones
console.log('\n📋 CHECKLIST DE ACCIONES:\n');

console.log('Para Vercel:');
if (errors.length === 0) {
  console.log('  ✅ Listo para deployment en Vercel');
  console.log('  → Ejecuta: git push');
  console.log('  → O visita: https://vercel.com');
} else {
  console.log('  ❌ Corrige los errores antes de deployar');
}

console.log('\nPara Play Store:');
if (warnings.some(w => w.includes('screenshot'))) {
  console.log('  ⚠️  Crea screenshots (ver CREAR_SCREENSHOTS.md)');
}
if (warnings.some(w => w.includes('feature-graphic'))) {
  console.log('  ⚠️  Crea feature graphic 1024x500px');
}
if (warnings.some(w => w.includes('assetlinks'))) {
  console.log('  ⚠️  Configura assetlinks.json con tu SHA256');
}

console.log('\n📚 Documentación:');
console.log('  → GUIA_DEPLOYMENT.md - Guía completa');
console.log('  → PASOS_RAPIDOS.md - Pasos rápidos');
console.log('  → CREAR_SCREENSHOTS.md - Cómo crear screenshots');

console.log('\n' + '='.repeat(60));

// Exit code
if (errors.length > 0) {
  console.log('\n❌ Verificación fallida. Corrige los errores.\n');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('\n⚠️  Verificación con advertencias. Revisa antes de deployar.\n');
  process.exit(0);
} else {
  console.log('\n✅ ¡Todo listo para deployment!\n');
  process.exit(0);
}
