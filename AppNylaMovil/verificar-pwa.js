#!/usr/bin/env node

/**
 * Script de verificación PWA para Planiverse
 * Verifica que todos los archivos necesarios estén presentes
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verificando configuración PWA de Planiverse...\n');

const checks = [
  {
    name: 'Manifest PWA',
    path: 'public/manifest.json',
    required: true,
  },
  {
    name: 'Service Worker',
    path: 'public/sw.js',
    required: true,
  },
  {
    name: 'Icono 192x192',
    path: 'public/icon-192x192.png',
    required: true,
  },
  {
    name: 'Icono 512x512',
    path: 'public/icon-512x512.png',
    required: true,
  },
  {
    name: 'Layout con PWA',
    path: 'app/layout.tsx',
    required: true,
    contains: 'manifest.json',
  },
  {
    name: 'Estilos móvil',
    path: 'app/globals.css',
    required: true,
    contains: 'OPTIMIZACIONES PARA MÓVIL',
  },
  {
    name: 'Firebase offline',
    path: 'lib/firebase/config.ts',
    required: true,
    contains: 'enableIndexedDbPersistence',
  },
  {
    name: 'Next.js config PWA',
    path: 'next.config.ts',
    required: true,
    contains: 'manifest.json',
  },
];

let passed = 0;
let failed = 0;
let warnings = 0;

checks.forEach((check) => {
  const filePath = path.join(process.cwd(), check.path);
  let exists = fs.existsSync(filePath);
  
  // Verificar fallback si existe
  if (!exists && check.fallback) {
    const fallbackPath = path.join(process.cwd(), check.fallback);
    exists = fs.existsSync(fallbackPath);
  }

  if (!exists) {
    if (check.required) {
      console.log(`❌ ${check.name}: NO ENCONTRADO`);
      console.log(`   Archivo: ${check.path}`);
      failed++;
    } else {
      console.log(`⚠️  ${check.name}: Opcional, no encontrado`);
      warnings++;
    }
    return;
  }

  if (check.contains) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(check.contains)) {
      console.log(`✅ ${check.name}: OK`);
      passed++;
    } else {
      console.log(`⚠️  ${check.name}: Archivo existe pero falta contenido`);
      console.log(`   Buscar: "${check.contains}"`);
      warnings++;
    }
  } else {
    console.log(`✅ ${check.name}: OK`);
    passed++;
  }
});

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Resultados:`);
console.log(`   ✅ Pasados: ${passed}`);
console.log(`   ❌ Fallidos: ${failed}`);
console.log(`   ⚠️  Advertencias: ${warnings}`);

if (failed === 0 && warnings === 0) {
  console.log('\n🎉 ¡Perfecto! Tu PWA está lista.');
  console.log('   Ejecuta: npm run dev');
  console.log('   Luego abre: http://localhost:3000');
} else if (failed === 0) {
  console.log('\n✅ Configuración básica completa.');
  console.log('   ⚠️  Hay algunas advertencias menores.');
  console.log('   La PWA debería funcionar.');
} else {
  console.log('\n❌ Faltan archivos críticos.');
  console.log('   Revisa los errores arriba.');
  console.log('   Consulta: PWA_SETUP.md');
}

console.log('\n' + '='.repeat(50) + '\n');

process.exit(failed > 0 ? 1 : 0);
