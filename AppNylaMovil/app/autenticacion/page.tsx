/**
 * Página de Autenticación
 * Ruta: /autenticacion
 * 
 * Muestra el wizard completo de autenticación y configuración inicial.
 * Incluye login, registro, datos de usuario, selección de rol y módulos.
 */

import WizardContainer from '@/components/wizard/ContenedorAsistenteConfiguracion';

export default function AutenticacionPage() {
  return <WizardContainer />;
}
