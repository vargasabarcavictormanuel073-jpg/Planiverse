# 🔥 Configurar Firebase en Vercel

## Paso 1: Obtener credenciales de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto
3. Click en el ícono de engranaje ⚙️ > "Configuración del proyecto"
4. Scroll hasta "Tus apps" > "SDK setup and configuration"
5. Copia los valores de `firebaseConfig`

Deberías ver algo como:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

## Paso 2: Configurar en Vercel

### Opción A: Desde el Dashboard (Recomendado)

1. Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en "Settings"
3. Click en "Environment Variables" en el menú lateral
4. Agrega cada variable:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Tu apiKey | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Tu authDomain | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Tu projectId | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Tu storageBucket | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Tu messagingSenderId | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Tu appId | Production, Preview, Development |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | Tu measurementId | Production, Preview, Development |

5. Click "Save" en cada una

### Opción B: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Agregar variables
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# Pega el valor cuando te lo pida
# Selecciona: Production, Preview, Development

# Repite para cada variable
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add NEXT_PUBLIC_FIREBASE_PROJECT_ID
vercel env add NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add NEXT_PUBLIC_FIREBASE_APP_ID
vercel env add NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
```

## Paso 3: Configurar dominio en Firebase

1. En Firebase Console > Authentication
2. Click en "Settings" (pestaña)
3. En "Authorized domains", agrega:
   - `tu-app.vercel.app`
   - `tu-dominio-personalizado.com` (si tienes uno)

## Paso 4: Re-deployar

Después de agregar las variables:

```bash
# Opción 1: Push a GitHub (si tienes auto-deploy)
git push

# Opción 2: Deploy manual
vercel --prod
```

## Paso 5: Verificar

1. Abre tu app en Vercel: `https://tu-app.vercel.app`
2. Abre Chrome DevTools > Console
3. Intenta hacer login
4. No deberías ver errores de Firebase

## Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
→ Verifica que `NEXT_PUBLIC_FIREBASE_API_KEY` esté correcta

### Error: "Firebase: Error (auth/unauthorized-domain)"
→ Agrega tu dominio de Vercel en Firebase Console > Authentication > Authorized domains

### Error: "Firebase is not defined"
→ Verifica que todas las variables empiecen con `NEXT_PUBLIC_`

### Las variables no se actualizan
→ Re-deploya después de agregar variables:
```bash
vercel --prod --force
```

## Seguridad

### ¿Es seguro exponer las API keys?

Sí, las Firebase API keys son seguras en el frontend porque:
1. Firebase usa reglas de seguridad en Firestore/Storage
2. Las API keys solo identifican tu proyecto
3. La autenticación real se hace con tokens

### Protege tu proyecto con reglas de Firestore

En Firebase Console > Firestore Database > Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Solo usuarios autenticados pueden leer/escribir
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // Los usuarios solo pueden editar sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Checklist

- [ ] Obtuve todas las credenciales de Firebase
- [ ] Agregué todas las variables en Vercel
- [ ] Seleccioné Production, Preview y Development para cada variable
- [ ] Agregué mi dominio de Vercel en Firebase Authorized domains
- [ ] Re-deployé la aplicación
- [ ] Verifiqué que el login funcione
- [ ] Configuré reglas de seguridad en Firestore

¡Listo! Tu app ahora está conectada a Firebase en Vercel 🚀
