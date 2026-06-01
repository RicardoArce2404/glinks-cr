import Swal from 'sweetalert2';

// Configuración global
const swalConfig = {
  confirmButtonColor: '#3b82f6',
  cancelButtonColor: '#ef4444',
  background: '#ffffff',
  zIndex: 99999,
  target: document.body,
  backdrop: true,
  allowOutsideClick: true,
  allowEscapeKey: true,
};

// Toast notification (para usar dentro del modal - no bloquea)
export const showToast = (message: string, icon: 'success' | 'error' | 'warning' | 'info' = 'success') => {
  return Swal.fire({
    ...swalConfig,
    toast: true,
    position: 'top-end',
    icon,
    title: message,
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
  });
};

// Mensaje de éxito (para usar después de cerrar el modal)
export const showSuccess = (message: string, title: string = '¡Éxito!') => {
  return Swal.fire({
    ...swalConfig,
    icon: 'success',
    title,
    text: message,
    confirmButtonText: 'Aceptar',
    timer: 3000,
    timerProgressBar: true,
  });
};

// Mensaje de error (para usar después de cerrar el modal)
export const showError = (message: string, title: string = '¡Error!') => {
  return Swal.fire({
    ...swalConfig,
    icon: 'error',
    title,
    text: message,
    confirmButtonText: 'Entendido',
  });
};

// Mensaje de advertencia
export const showWarning = (message: string, title: string = '¡Atención!') => {
  return Swal.fire({
    ...swalConfig,
    icon: 'warning',
    title,
    text: message,
    confirmButtonText: 'Aceptar',
  });
};

// Mensaje de información
export const showInfo = (message: string, title: string = 'Información') => {
  return Swal.fire({
    ...swalConfig,
    icon: 'info',
    title,
    text: message,
    confirmButtonText: 'Aceptar',
  });
};

// Confirmación para eliminar
export const showConfirmDelete = async (
  itemName: string,
  itemType: string = 'registro'
): Promise<boolean> => {
  const result = await Swal.fire({
    ...swalConfig,
    icon: 'warning',
    title: '¿Estás seguro?',
    html: `Vas a eliminar el ${itemType} <strong>${itemName}</strong>.<br />Esta acción no se puede deshacer.`,
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
  });
  return result.isConfirmed;
};

// No se puede eliminar
export const showCannotDelete = (
  itemName: string,
  reason: string
) => {
  return Swal.fire({
    ...swalConfig,
    icon: 'error',
    title: 'No se puede eliminar',
    html: `No se puede eliminar <strong>${itemName}</strong>.<br />${reason}`,
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#3b82f6',
  });
};

// Cargando
export const showLoading = (message: string = 'Procesando...') => {
  return Swal.fire({
    ...swalConfig,
    title: message,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => {
      Swal.showLoading();
    },
  });
};

// Cerrar loading
export const closeLoading = () => {
  Swal.close();
};