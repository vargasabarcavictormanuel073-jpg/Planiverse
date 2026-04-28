/**
 * Página de Configuración Inicial
 * Ruta: /autenticacion/configuracion
 * 
 * Wizard de configuración para usuarios que ya tienen cuenta.
 * Permite completar datos personales, seleccionar rol y módulos.
 */

import WizardContainer from '@/components/wizard/ContenedorAsistenteConfiguracion';

export default function ConfiguracionPage() {
  return <WizardContainer initialStep={3} />;
}
