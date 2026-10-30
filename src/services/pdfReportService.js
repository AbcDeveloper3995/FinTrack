import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Format currency in MXN
const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return `$${num.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
};

// Friendly Date
const formatFriendlyDate = (date) => {
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Common Header for FinTrack Reports
 */
const drawHeader = (doc, title, subtitle, userName) => {
  // Top Banner Indigo
  doc.setFillColor(30, 27, 75); // #1E1B4B
  doc.rect(0, 0, 210, 32, 'F');

  // Accent Line Emerald
  doc.setFillColor(5, 150, 105); // #059669
  doc.rect(0, 32, 210, 2, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('FINTRACK', 14, 15);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // Slate 300
  doc.text('Finanzas Personales Inteligentes', 43, 15);

  // Subtitle / Report Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(title, 14, 25);

  // User & Date (Right aligned)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(226, 232, 240);
  const nowStr = formatFriendlyDate(new Date());
  doc.text(`Titular: ${userName || 'Usuario'}`, 196, 15, { align: 'right' });
  doc.text(`Fecha de emisión: ${nowStr}`, 196, 21, { align: 'right' });
  doc.text(subtitle, 196, 27, { align: 'right' });

  // Reset Colors
  doc.setTextColor(15, 23, 42);
};

/**
 * Common Footer for FinTrack Reports
 */
const drawFooter = (doc, pageNumber, totalPages) => {
  const pageHeight = doc.internal.pageSize.height || 297;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, pageHeight - 12, 196, pageHeight - 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('FinTrack', 14, pageHeight - 7);
  doc.text(`Página ${pageNumber} de ${totalPages}`, 196, pageHeight - 7, { align: 'right' });
};

/**
 * ------------------------------------------------------------------
 * REPORTE 1: Resumen de mi Mes (Cierre Mensual)
 * ------------------------------------------------------------------
 */
export const generateMonthlyReportPDF = ({
  user,
  currentPeriod,
  kpis,
  categories = [],
  transactions = [],
  exchangeRate = 17.85,
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const userName = (user?.name && user.name.trim()) ? user.name.trim() : (user?.email || 'Titular');
  drawHeader(
    doc,
    'Resumen de mi Mes • Diagnóstico Financiero',
    `Periodo: ${currentPeriod || 'Mes en Curso'}`,
    userName
  );

  let currentY = 42;

  // 1. Mensaje de bienvenida / Introducción en lenguaje humano
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(30, 27, 75);
  doc.text(`Hola, ${userName}`, 14, currentY);

  currentY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(71, 85, 105);
  const introText = 'Este reporte resume de forma sencilla qué pasó con tu dinero durante este mes: cuánto ingresó, cuánto gastaste y cómo va tu ritmo de ahorro para que tomes decisiones con tranquilidad.';
  doc.text(doc.splitTextToSize(introText, 182), 14, currentY);

  currentY += 12;

  // 2. Tarjetas KPI Principales (3 bloques con diseño visual)
  const monthlyIncome = kpis?.monthlyIncome || 0;
  const monthlyExpenses = kpis?.monthlyExpenses || 0;
  const netBalance = kpis?.netBalance || (monthlyIncome - monthlyExpenses);
  const savingsRate = kpis?.savingsRate || 0;

  const cardWidth = 58;
  const cardHeight = 24;
  const cardGap = 4;
  const startX = 14;

  // Tarjeta 1: Total que Ingresó
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(startX, currentY, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL QUE INGRESÓ', startX + 5, currentY + 7);
  doc.setFontSize(12);
  doc.setTextColor(5, 150, 105); // Verde
  doc.text(`+${formatCurrency(monthlyIncome)}`, startX + 5, currentY + 16);

  // Tarjeta 2: Total que Gastaste
  const card2X = startX + cardWidth + cardGap;
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(card2X, currentY, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('TOTAL QUE GASTASTE', card2X + 5, currentY + 7);
  doc.setFontSize(12);
  doc.setTextColor(220, 38, 38); // Rojo
  doc.text(`-${formatCurrency(monthlyExpenses)}`, card2X + 5, currentY + 16);

  // Tarjeta 3: Tu Dinero Disponible / Ahorro
  const card3X = card2X + cardWidth + cardGap;
  doc.setFillColor(netBalance >= 0 ? 236 : 254, netBalance >= 0 ? 253 : 242, netBalance >= 0 ? 245 : 242); // Verde suave o Rojo suave
  doc.setDrawColor(netBalance >= 0 ? 167 : 254, netBalance >= 0 ? 243 : 202, netBalance >= 0 ? 208 : 202);
  doc.roundedRect(card3X, currentY, cardWidth, cardHeight, 3, 3, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(netBalance >= 0 ? 4 : 185, netBalance >= 0 ? 120 : 28, netBalance >= 0 ? 87 : 28);
  doc.text(netBalance >= 0 ? 'LO QUE TE SOBRÓ (AHORRO)' : 'DÉFICIT DEL MES', card3X + 5, currentY + 7);
  doc.setFontSize(12);
  doc.text(`${netBalance >= 0 ? '+' : ''}${formatCurrency(netBalance)}`, card3X + 5, currentY + 16);

  currentY += cardHeight + 8;

  // 3. Mini Píldora de Diagnóstico de Tasa de Ahorro (con altura dinámica sin desbordes)
  const advice = savingsRate >= 20
    ? '¡Excelente trabajo! Cumpliste la regla recomendada del ahorro (más del 20%).'
    : savingsRate > 0
    ? 'Vas por buen camino. Mantén tus gastos fijos controlados para superar el 20%.'
    : 'Atención: Gastaste más de lo que ingresaste. Revisa las compras mayores abajo.';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const adviceLines = doc.splitTextToSize(advice, 105);
  const pillHeight = Math.max(14, 6 + adviceLines.length * 4);

  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, currentY, 182, pillHeight, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 27, 75);
  doc.text(`Tasa de Ahorro Lograda: ${savingsRate.toFixed(1)}%`, 18, currentY + (pillHeight / 2) + 1);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text(adviceLines, 85, currentY + 5);

  currentY += pillHeight + 8;

  // 4. Sección: ¿En qué se fue tu dinero? (Gastos por Categoría)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 27, 75);
  doc.text('1. ¿En qué se fue tu dinero? (Desglose por Categoría)', 14, currentY);

  currentY += 4;

  // Calcular desglose de categorías del mes actual
  const currentMonthKey = kpis?.currentMonthKey || new Date().toISOString().slice(0, 7);
  const currentMonthExpenses = transactions.filter(
    (t) => t.type === 'expense' && t.date && t.date.startsWith(currentMonthKey)
  );

  const catMap = {};
  currentMonthExpenses.forEach((t) => {
    const catName = t.category || 'General';
    const mult = t.currency === 'USD' ? exchangeRate : 1;
    const val = Math.abs(t.amount) * mult;
    if (!catMap[catName]) {
      catMap[catName] = { name: catName, total: 0, count: 0 };
    }
    catMap[catName].total += val;
    catMap[catName].count += 1;
  });

  const catRows = Object.values(catMap)
    .sort((a, b) => b.total - a.total)
    .map((c) => {
      const pct = monthlyExpenses > 0 ? (c.total / monthlyExpenses) * 100 : 0;
      return [
        c.name,
        `${c.count} compras`,
        formatCurrency(c.total),
        `${pct.toFixed(1)}% del total`,
      ];
    });

  if (catRows.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Categoría', 'Movimientos', 'Total Gastado', '% del Total']],
      body: catRows,
      theme: 'grid',
      headStyles: {
        fillColor: [49, 46, 129], // Indigo 900
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        cellPadding: 2.5,
      },
      bodyStyles: {
        fontSize: 8.5,
        cellPadding: 2,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: [30, 27, 75] },
        2: { halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] },
        3: { halign: 'right' },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });
    currentY = doc.lastAutoTable.finalY + 10;
  } else {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(148, 163, 184);
    doc.text('No hay gastos registrados en este periodo.', 14, currentY + 6);
    currentY += 14;
  }

  // 5. Sección: Los 5 Gastos más Grandes del Mes
  if (currentY > 230) {
    doc.addPage();
    drawHeader(doc, 'Resumen de mi Mes • Diagnóstico Financiero (Cont.)', `Periodo: ${currentPeriod}`, userName);
    currentY = 40;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 27, 75);
  doc.text('2. Tus 5 Gastos Más Fuertes del Mes (Fugas de Dinero)', 14, currentY);

  currentY += 4;

  const topExpenses = [...currentMonthExpenses]
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
    .slice(0, 5)
    .map((t, idx) => {
      const mult = t.currency === 'USD' ? exchangeRate : 1;
      const amt = Math.abs(t.amount) * mult;
      return [
        `#${idx + 1}`,
        t.concept || 'Sin descripción',
        t.category || 'General',
        t.account || 'Cuenta General',
        t.date || '-',
        formatCurrency(amt),
      ];
    });

  if (topExpenses.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['#', 'Concepto', 'Categoría', 'Cuenta Utilizada', 'Fecha', 'Monto']],
      body: topExpenses,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105], // Slate 600
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        cellPadding: 2.5,
      },
      bodyStyles: {
        fontSize: 8.5,
        cellPadding: 2,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { halign: 'center', fontStyle: 'bold' },
        1: { fontStyle: 'bold', textColor: [30, 27, 75] },
        5: { halign: 'right', fontStyle: 'bold', textColor: [220, 38, 38] },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
    });
  }

  // Footers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(doc, i, pageCount);
  }

  const filename = `FinTrack_Resumen_Mes_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  return { success: true, filename };
};

/**
 * ------------------------------------------------------------------
 * REPORTE 2: Comparativo Mes vs. Mes Pasado (Frente a Frente)
 * ------------------------------------------------------------------
 */
export const generateComparisonReportPDF = ({
  user,
  currentPeriod,
  kpis,
  categories = [],
  transactions = [],
  exchangeRate = 17.85,
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const userName = (user?.name && user.name.trim()) ? user.name.trim() : (user?.email || 'Titular');
  drawHeader(
    doc,
    'Frente a Frente: Este Mes vs. Mes Pasado',
    'Análisis de Tendencias y Hábitos',
    userName
  );

  let currentY = 42;

  // 1. Diagnóstico Automático en Lenguaje Cotidiano
  const monthlyExpenses = kpis?.monthlyExpenses || 0;
  const prevMonthExpenses = kpis?.prevMonthExpenses || 0;
  const monthlyIncome = kpis?.monthlyIncome || 0;
  const prevMonthIncome = kpis?.prevMonthIncome || 0;
  const expenseDifference = kpis?.expenseDifference || (monthlyExpenses - prevMonthExpenses);
  const expenseChangePct = kpis?.expenseChangePct || 0;

  const isSavingMore = expenseDifference <= 0;
  const bannerBg = isSavingMore ? [236, 253, 245] : [254, 242, 242]; // Emerald 50 o Red 50
  const bannerBorder = isSavingMore ? [167, 243, 208] : [254, 202, 202];
  const bannerTextTitle = isSavingMore ? [4, 120, 87] : [185, 28, 28];

  doc.setFillColor(...bannerBg);
  doc.setDrawColor(...bannerBorder);
  doc.roundedRect(14, currentY, 182, 24, 3, 3, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...bannerTextTitle);
  const headline = isSavingMore
    ? `¡Buenas noticias! Gastaste ${formatCurrency(Math.abs(expenseDifference))} menos que el mes pasado.`
    : `Alerta de gasto: Has gastado ${formatCurrency(Math.abs(expenseDifference))} más que el mes pasado (+${Math.abs(expenseChangePct)}%).`;
  doc.text(headline, 20, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  const subtitleMsg = isSavingMore
    ? 'Tus hábitos de consumo mejoraron notablemente frente al periodo anterior. Mantén esta inercia positiva.'
    : 'Identifica abajo qué categorías subieron para que puedas ajustar tu presupuesto antes del próximo corte.';
  doc.text(subtitleMsg, 20, currentY + 16);

  currentY += 32;

  // 2. Tabla Comparativa General Frente a Frente
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 27, 75);
  doc.text('1. Comparativa Global Frente a Frente', 14, currentY);

  currentY += 4;

  const netBalance = monthlyIncome - monthlyExpenses;
  const prevNetBalance = prevMonthIncome - prevMonthExpenses;
  const balanceDiff = netBalance - prevNetBalance;

  const summaryComparisonData = [
    [
      'Dinero que Ingresó',
      formatCurrency(prevMonthIncome),
      formatCurrency(monthlyIncome),
      `${monthlyIncome >= prevMonthIncome ? '+' : ''}${formatCurrency(monthlyIncome - prevMonthIncome)}`,
      monthlyIncome >= prevMonthIncome ? 'Aumentó (+)' : 'Disminuyó (-)',
    ],
    [
      'Dinero que Gastaste',
      formatCurrency(prevMonthExpenses),
      formatCurrency(monthlyExpenses),
      `${expenseDifference >= 0 ? '+' : ''}${formatCurrency(expenseDifference)}`,
      expenseDifference <= 0 ? 'Favorable (Ahorro)' : 'Alerta: Subió gasto',
    ],
    [
      'Tu Ahorro Neto (Sobrante)',
      formatCurrency(prevNetBalance),
      formatCurrency(netBalance),
      `${balanceDiff >= 0 ? '+' : ''}${formatCurrency(balanceDiff)}`,
      balanceDiff >= 0 ? 'Creció tu ahorro' : 'Ahorraste menos',
    ],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [['Métrica Financiera', 'Mes Pasado', 'Mes Actual', 'Diferencia ($)', 'Evaluación']],
    body: summaryComparisonData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 27, 75],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 8.5,
      cellPadding: 2.5,
      textColor: [51, 65, 85],
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold', textColor: [30, 27, 75] },
      1: { cellWidth: 32, halign: 'right' },
      2: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
      3: { cellWidth: 33, halign: 'right', fontStyle: 'bold' },
      4: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didParseCell: (data) => {
      // Color-code evaluation and difference columns
      if (data.section === 'body' && data.column.index === 4) {
        const text = String(data.cell.raw);
        if (text.includes('Favorable') || text.includes('Aumentó') || text.includes('Creció')) {
          data.cell.styles.textColor = [5, 150, 105]; // Green #059669
        } else {
          data.cell.styles.textColor = [220, 38, 38]; // Red #DC2626
        }
      }
    },
  });

  currentY = doc.lastAutoTable.finalY + 12;

  // 3. ¿En qué categorías cambió tu gasto? (Detalle Comparativo por Categoría)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 27, 75);
  doc.text('2. ¿Dónde cambió tu gasto? (Variación por Categoría)', 14, currentY);

  currentY += 4;

  const currentMonthKey = kpis?.currentMonthKey || new Date().toISOString().slice(0, 7);
  const prevMonthKey = kpis?.prevMonthKey || '';

  const catComparison = categories
    .filter((c) => c.type === 'expense')
    .map((c) => {
      // Current month
      const currentSpent = transactions
        .filter((t) => (t.categoryId === c.id || t.category === c.name) && t.type === 'expense' && t.date?.startsWith(currentMonthKey))
        .reduce((sum, t) => sum + Math.abs(t.amount) * (t.currency === 'USD' ? exchangeRate : 1), 0);

      // Previous month
      const prevSpent = transactions
        .filter((t) => (t.categoryId === c.id || t.category === c.name) && t.type === 'expense' && t.date?.startsWith(prevMonthKey))
        .reduce((sum, t) => sum + Math.abs(t.amount) * (t.currency === 'USD' ? exchangeRate : 1), 0);

      const diff = currentSpent - prevSpent;
      const pct = prevSpent > 0 ? (diff / prevSpent) * 100 : (currentSpent > 0 ? 100 : 0);

      return {
        name: c.name,
        prevSpent,
        currentSpent,
        diff,
        pct,
      };
    })
    .filter((c) => c.currentSpent > 0 || c.prevSpent > 0)
    .sort((a, b) => b.currentSpent - a.currentSpent);

  const catComparisonRows = catComparison.map((c) => {
    let statusText = 'Igual';
    if (c.diff > 0) statusText = `+${c.pct.toFixed(0)}% (Subió)`;
    else if (c.diff < 0) statusText = `${c.pct.toFixed(0)}% (Bajó)`;

    return [
      c.name,
      formatCurrency(c.prevSpent),
      formatCurrency(c.currentSpent),
      `${c.diff >= 0 ? '+' : ''}${formatCurrency(c.diff)}`,
      statusText,
    ];
  });

  if (catComparisonRows.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Categoría', 'Gasto Mes Pasado', 'Gasto Este Mes', 'Variación ($)', 'Tendencia']],
      body: catComparisonRows,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        cellPadding: 2.5,
      },
      bodyStyles: {
        fontSize: 8.5,
        cellPadding: 2,
        textColor: [51, 65, 85],
      },
      columnStyles: {
        0: { cellWidth: 50, fontStyle: 'bold', textColor: [30, 27, 75] },
        1: { cellWidth: 32, halign: 'right' },
        2: { cellWidth: 32, halign: 'right', fontStyle: 'bold' },
        3: { cellWidth: 33, halign: 'right', fontStyle: 'bold' },
        4: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const text = String(data.cell.raw);
          if (text.includes('Bajó')) {
            data.cell.styles.textColor = [5, 150, 105]; // Green #059669 (Menor gasto es positivo)
          } else if (text.includes('Subió')) {
            data.cell.styles.textColor = [220, 38, 38]; // Red #DC2626 (Mayor gasto)
          }
        }
      },
    });
  }

  // Footers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    drawFooter(doc, i, pageCount);
  }

  const filename = `FinTrack_Comparativo_Meses_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  return { success: true, filename };
};
