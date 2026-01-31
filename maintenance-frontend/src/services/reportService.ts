import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface VehicleReportData {
  patente: string;
  marca: string;
  modelo: string;
  anio: number;
  kilometrajeActual: number;
}

interface MaintenanceReportData {
  fecha: string;
  tipo: string;
  descripcion: string;
  estado: string;
  costo: number;
}

export const generateVehicleReport = (vehicle: VehicleReportData, maintenances: MaintenanceReportData[]) => {
  const doc = new jsPDF() as any;

  // Header - Kavak Branding
  doc.setFillColor(0, 0, 0);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('KAVAK', 20, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('CERTIFICADO DE HISTORIAL TÉCNICO', 20, 30);
  doc.text(new Date().toLocaleDateString(), 170, 30);

  // Vehicle Info
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(`${vehicle.marca} ${vehicle.modelo}`, 20, 55);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Patente: ${vehicle.patente.toUpperCase()}`, 20, 65);
  doc.text(`Año: ${vehicle.anio}`, 70, 65);
  doc.text(`Kilometraje: ${vehicle.kilometrajeActual.toLocaleString()} km`, 120, 65);

  // Table
  const tableData = maintenances.map(m => [
    new Date(m.fecha).toLocaleDateString(),
    m.tipo,
    m.descripcion,
    m.estado,
    `$${m.costo.toLocaleString()}`
  ]);

  doc.autoTable({
    startY: 75,
    head: [['Fecha', 'Servicio', 'Diagnóstico', 'Estado', 'Costo']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 4 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 35 },
      2: { cellWidth: 'auto' },
      3: { cellWidth: 25 },
      4: { cellWidth: 25, halign: 'right' }
    }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      'Este documento es un registro oficial del Sistema de Mantenimiento Kavak.',
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`Historial_${vehicle.patente}_${vehicle.marca}_${vehicle.modelo}.pdf`);
};
