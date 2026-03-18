/**
 * Home - Página principal de la aplicación
 * 
 * Esta es la página de inicio (ruta "/") que muestra el wizard de onboarding.
 * El WizardContainer maneja todo el flujo de autenticación, registro y configuración
 * del perfil del usuario. Una vez completado el wizard, el usuario es redirigido
 * al dashboard.
 */

import WizardContainer from '@/components/wizard/WizardContainer';

export default function Home() {
  return <WizardContainer />;
}
