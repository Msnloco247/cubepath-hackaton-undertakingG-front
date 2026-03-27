import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AnalysisData } from '../types/pdfTypes';

const COLORS = {
  AMBER: [217, 119, 6], // #d97706
  TEXT_PRIMARY: [15, 23, 42], // #0f172a
  TEXT_SECONDARY: [71, 85, 105], // #475569
  BORDER: [226, 232, 240], // #e2e8f0
  SUCCESS: [34, 197, 94],
  ERROR: [239, 68, 68],
  BG_RAISED: [248, 250, 252],
};

function drawHexagon(doc: jsPDF, x: number, y: number, size: number) {
  const angle = Math.PI / 3;
  doc.setDrawColor(COLORS.AMBER[0], COLORS.AMBER[1], COLORS.AMBER[2]);
  doc.setLineWidth(0.5);
  
  for (let i = 0; i < 6; i++) {
    const startX = x + size * Math.cos(i * angle);
    const startY = y + size * Math.sin(i * angle);
    const endX = x + size * Math.cos((i + 1) * angle);
    const endY = y + size * Math.sin((i + 1) * angle);
    doc.line(startX, startY, endX, endY);
  }
}

export function generateAnalysisPDF(data: AnalysisData) {
  console.log('Generando PDF con datos:', data);
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let currentY = 20;

    // --- Header & Cover ---
    drawHexagon(doc, 25, 25, 8);
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(COLORS.TEXT_PRIMARY[0], COLORS.TEXT_PRIMARY[1], COLORS.TEXT_PRIMARY[2]);
  doc.text('EmprendeIA', 40, 30);

  currentY = 50;
  doc.setFontSize(18);
  doc.text('Análisis Detallado de Negocio', 20, currentY);
  
  currentY += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.TEXT_SECONDARY[0], COLORS.TEXT_SECONDARY[1], COLORS.TEXT_SECONDARY[2]);
  doc.text(`Generado el: ${data.generatedAt.toLocaleDateString('es-ES')} · ${data.generatedAt.toLocaleTimeString('es-ES')}`, 20, currentY);

  currentY += 15;
  doc.setDrawColor(COLORS.BORDER[0], COLORS.BORDER[1], COLORS.BORDER[2]);
  doc.line(20, currentY, pageWidth - 20, currentY);

  // --- Section: User Intent ---
  currentY += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(COLORS.AMBER[0], COLORS.AMBER[1], COLORS.AMBER[2]);
  doc.text('RESUMEN DEL PROYECTO', 20, currentY);

  currentY += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(COLORS.TEXT_PRIMARY[0], COLORS.TEXT_PRIMARY[1], COLORS.TEXT_PRIMARY[2]);
  
  const metadata = [
    ['Ubicación:', data.inputs.ubicacion],
    ['Producto/Servicio:', data.inputs.producto],
    ['Necesidad:', data.inputs.necesidad],
    ['Público:', data.inputs.publico],
  ];

  autoTable(doc, {
    startY: currentY,
    body: metadata,
    theme: 'plain',
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: 'bold', width: 40 } },
    margin: { left: 20 },
  });
  
  currentY = (doc as any).lastAutoTable.finalY + 15;

  // --- Section 01: FODA ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(COLORS.AMBER[0], COLORS.AMBER[1], COLORS.AMBER[2]);
  doc.text('01. ANÁLISIS FODA Y ZONA', 20, currentY);

  const foda = data.fodaZona.analisis.analisisFODA;
  const fodaData = [
    [
      { content: 'FORTALEZAS', styles: { textColor: COLORS.SUCCESS, fontStyle: 'bold' } },
      { content: 'OPORTUNIDADES', styles: { textColor: [0, 100, 255], fontStyle: 'bold' } }
    ],
    [
      foda.fortalezas.map(f => `• ${f.keyword}: ${f.descripcion}`).join('\n'),
      foda.oportunidades.map(f => `• ${f.keyword}: ${f.descripcion}`).join('\n')
    ],
    [
      { content: 'DEBILIDADES', styles: { textColor: COLORS.AMBER, fontStyle: 'bold' } },
      { content: 'AMENAZAS', styles: { textColor: COLORS.ERROR, fontStyle: 'bold' } }
    ],
    [
      foda.debilidades.map(f => `• ${f.keyword}: ${f.descripcion}`).join('\n'),
      foda.amenazas.map(f => `• ${f.keyword}: ${f.descripcion}`).join('\n')
    ]
  ];

  autoTable(doc, {
    startY: currentY + 5,
    body: fodaData,
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 5, overflow: 'linebreak' },
    margin: { left: 20, right: 20 },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;
  const zona = data.fodaZona.analisis.analisisZona;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTEXTO GEOGRÁFICO', 20, currentY);
  currentY += 6;
  doc.setFont('helvetica', 'normal');
  const zonaDesc = doc.splitTextToSize(zona.descripcion, pageWidth - 40);
  doc.text(zonaDesc, 20, currentY);
  currentY += zonaDesc.length * 5 + 5;

  // --- Section 02: Producto & Estrategia ---
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  } else {
    currentY += 10;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(COLORS.AMBER[0], COLORS.AMBER[1], COLORS.AMBER[2]);
  doc.text('02. PRODUCTO Y ESTRATEGIA', 20, currentY);

  const prod = data.productoEstrategia.analisis.analisisProducto;
  const estrat = data.productoEstrategia.analisis.estrategiasClave;
  
  currentY += 10;
  doc.setFontSize(11);
  doc.setTextColor(COLORS.TEXT_PRIMARY[0], COLORS.TEXT_PRIMARY[1], COLORS.TEXT_PRIMARY[2]);
  doc.text('Propuesta de Valor:', 20, currentY);
  currentY += 6;
  doc.setFont('helvetica', 'italic');
  const propValor = doc.splitTextToSize(`"${prod.propuestaValor}"`, pageWidth - 40);
  doc.text(propValor, 20, currentY);
  currentY += propValor.length * 5 + 10;

  autoTable(doc, {
    startY: currentY,
    head: [['CORTO PLAZO', 'MEDIANO PLAZO', 'LARGO PLAZO']],
    body: [[
      estrat.corto_plazo.map(e => `• ${e}`).join('\n'),
      estrat.mediano_plazo.map(e => `• ${e}`).join('\n'),
      estrat.largo_plazo.map(e => `• ${e}`).join('\n'),
    ]],
    theme: 'striped',
    headStyles: { fillColor: COLORS.AMBER, textColor: [255, 255, 255] },
    styles: { fontSize: 8 },
  });

  // --- Section 03: Pasos & Presupuesto ---
  doc.addPage();
  currentY = 20;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(COLORS.AMBER[0], COLORS.AMBER[1], COLORS.AMBER[2]);
  doc.text('03. PLAN DE EJECUCIÓN Y PRESUPUESTO', 20, currentY);

  currentY += 10;
  doc.setFontSize(12);
  doc.setTextColor(COLORS.TEXT_PRIMARY[0], COLORS.TEXT_PRIMARY[1], COLORS.TEXT_PRIMARY[2]);
  doc.text(`Inversión Estimada: ${data.pasosPresupuesto.analisis.rango_presupuesto_total}`, 20, currentY);

  const pasos = data.pasosPresupuesto.analisis.pasos.map((p, i) => [
    `PASO ${i + 1}\n(${p.fase})`,
    p.paso,
    p.presupuestoEstimado,
    p.descripcionDetallada
  ]);

  autoTable(doc, {
    startY: currentY + 10,
    head: [['FASE', 'ACCIÓN', 'COSTO', 'DETALLE']],
    body: pasos,
    theme: 'grid',
    headStyles: { fillColor: COLORS.TEXT_PRIMARY },
    styles: { fontSize: 7, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 25 },
      3: { cellWidth: 'auto' }
    }
  });

  // --- Footer & Disclaimer ---
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(COLORS.TEXT_SECONDARY[0], COLORS.TEXT_SECONDARY[1], COLORS.TEXT_SECONDARY[2]);
    
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, footerY, { align: 'center' });
    
    if (i === totalPages) {
       // Legal Disclaimer on last page
       const disclaimer = 'Generado con EmprendeIA (Inteligencia Artificial). Este análisis es una orientación inicial.\nPara confirmar resultados y tomar decisiones, se recomienda consultar con su asesor legal o especializado.';
       doc.setFont('helvetica', 'italic');
       const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 40);
       doc.text(splitDisclaimer, pageWidth / 2, footerY - 15, { align: 'center' });
    }
  }

    doc.save(`EmprendeIA-Analisis-${data.inputs.producto.substring(0, 15).replace(/\s+/g, '-')}.pdf`);
    console.log('PDF generado exitosamente');
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    alert('Lo sentimos, hubo un error al generar el PDF. Revisa la consola para más detalles.');
  }
}
