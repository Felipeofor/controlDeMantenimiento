export const getVehicleImage = (marca: string, modelo: string): string => {
  const m = `${marca.toLowerCase()} ${modelo.toLowerCase()}`;
  if (m.includes('corolla')) return '/cars/corolla.png';
  if (m.includes('vento')) return '/cars/vento.png';
  if (m.includes('cronos')) return '/cars/cronos.png';
  if (m.includes('208')) return '/cars/peugeot208.png';
  return ''; // Fallback to placeholder
};
