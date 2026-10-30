import ExcelJS from 'exceljs';

/**
 * Helper to download file blob
 */
const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const formatDate = (isoDate) => {
  if (!isoDate) return '';
  try {
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  } catch {
    return isoDate;
  }
};

/**
 * Generates an executive, styled Microsoft Excel (.xlsx) workbook for FinTrack
 */
export const exportMovementsToExcel = async (movements = [], options = {}) => {
  if (!movements || movements.length === 0) {
    throw new Error('No hay movimientos para exportar.');
  }

  const {
    userName = 'Usuario FinTrack',
    periodLabel = 'Historial Consolidado',
    customFilename = null,
  } = options;

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];

  // Initialize Workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'FinTrack Personal Finance';
  workbook.lastModifiedBy = userName;
  workbook.created = now;
  workbook.modified = now;

  // ----------------------------------------------------
  // SHEET 1: MOVIMIENTOS
  // ----------------------------------------------------
  const ws = workbook.addWorksheet('Movimientos', {
    views: [{ showGridLines: true }],
  });

  // Top Title Banner
  ws.mergeCells('A1:M1');
  const titleCell = ws.getCell('A1');
  titleCell.value = 'FINTRACK  •  REPORTE EJECUTIVO DE MOVIMIENTOS';
  titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E1B4B' }, // Dark Indigo
  };
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(1).height = 36;

  // Subtitle / Metadata Row
  ws.mergeCells('A2:M2');
  const metaCell = ws.getCell('A2');
  metaCell.value = `Titular: ${userName}   |   Periodo: ${periodLabel}   |   Fecha de Emisión: ${now.toLocaleDateString('es-MX')}   |   Registros: ${movements.length}`;
  metaCell.font = { name: 'Segoe UI', size: 9.5, italic: true, color: { argb: 'FF475569' } };
  metaCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' }, // Light Slate
  };
  metaCell.alignment = { vertical: 'middle', horizontal: 'center' };
  ws.getRow(2).height = 22;

  // Blank spacing row
  ws.getRow(3).height = 10;

  // Define Columns
  ws.columns = [
    { key: 'folio', width: 14 },
    { key: 'fecha', width: 14 },
    { key: 'tipo', width: 16 },
    { key: 'concepto', width: 38 },
    { key: 'ingreso', width: 17 },
    { key: 'gasto', width: 17 },
    { key: 'neto', width: 17 },
    { key: 'moneda', width: 10 },
    { key: 'cuenta', width: 20 },
    { key: 'categoria', width: 22 },
    { key: 'subcategoria', width: 22 },
    { key: 'etiquetas', width: 24 },
    { key: 'notas', width: 35 },
  ];

  // Column Headers (Row 4)
  const headerLabels = [
    'FOLIO',
    'FECHA',
    'TIPO',
    'CONCEPTO',
    'INGRESO (+)',
    'GASTO (-)',
    'MONTO NETO',
    'MONEDA',
    'CUENTA',
    'CATEGORÍA',
    'SUBCATEGORÍA',
    'ETIQUETAS',
    'NOTAS',
  ];

  const headerRow = ws.getRow(4);
  headerRow.values = headerLabels;
  headerRow.height = 28;

  headerRow.eachCell((cell) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF312E81' }, // Deep Primary Indigo
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF1E1B4B' } },
      bottom: { style: 'medium', color: { argb: 'FF1E1B4B' } },
      left: { style: 'thin', color: { argb: 'FF4338CA' } },
      right: { style: 'thin', color: { argb: 'FF4338CA' } },
    };
  });

  // Calculate Totals
  let totalIncome = 0;
  let totalExpenses = 0;

  const typeLabels = {
    expense: 'Gasto',
    income: 'Ingreso',
    transfer: 'Transferencia',
  };

  // Populate Data Rows starting at Row 5
  movements.forEach((m, idx) => {
    const rawAmt = Number(m.amount) || 0;
    const absAmt = Math.abs(rawAmt);
    const isIncome = m.type === 'income';
    const isExpense = m.type === 'expense';

    if (isIncome) totalIncome += absAmt;
    else if (isExpense) totalExpenses += absAmt;

    const folio = m.id ? String(m.id).slice(0, 8).toUpperCase() : `TX-${String(idx + 1).padStart(4, '0')}`;
    const tagsString = Array.isArray(m.tags)
      ? m.tags.map((t) => (typeof t === 'string' ? t : t.name)).filter(Boolean).map((t) => `#${t}`).join(', ')
      : '';

    const row = ws.addRow([
      folio,
      formatDate(m.date),
      typeLabels[m.type] || m.type || 'Movimiento',
      m.concept || 'Sin descripción',
      isIncome ? absAmt : null,
      isExpense ? absAmt : null,
      isExpense ? -absAmt : (isIncome ? absAmt : rawAmt),
      m.currency || 'MXN',
      m.account || 'Cuenta General',
      m.category || (m.type === 'transfer' ? 'Transferencia' : 'General'),
      m.subcategory || 'Principal',
      tagsString || '-',
      m.notes || '',
    ]);

    row.height = 22;

    // Alternating zebra fill
    const isEven = idx % 2 === 0;
    const defaultBg = isEven ? 'FFFFFFFF' : 'FFF8FAFC'; // White or Slate 50

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      cell.font = { name: 'Segoe UI', size: 9.5 };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: defaultBg },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'left' };

      // Centered columns: Folio, Fecha, Tipo, Moneda
      if ([1, 2, 3, 8].includes(colNumber)) {
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      }

      // Currency columns: Ingreso (5), Gasto (6), Neto (7)
      if (colNumber === 5) { // Ingreso
        cell.numFmt = '"$"#,##0.00;("$"#,##0.00);"-"';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        if (cell.value) {
          cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FF047857' } }; // Emerald Green
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFECFDF5' }, // Emerald 50
          };
        }
      }

      if (colNumber === 6) { // Gasto
        cell.numFmt = '"$"#,##0.00;("$"#,##0.00);"-"';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        if (cell.value) {
          cell.font = { name: 'Segoe UI', size: 9.5, bold: true, color: { argb: 'FFB91C1C' } }; // Rose/Red
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF2F2' }, // Red 50
          };
        }
      }

      if (colNumber === 7) { // Monto Neto
        cell.numFmt = '"$"#,##0.00;("$"#,##0.00);"-"';
        cell.alignment = { vertical: 'middle', horizontal: 'right' };
        if (cell.value !== null && cell.value !== undefined) {
          const val = Number(cell.value);
          cell.font = {
            name: 'Segoe UI',
            size: 9.5,
            bold: true,
            color: { argb: val >= 0 ? 'FF047857' : 'FFB91C1C' },
          };
        }
      }
    });
  });

  // Total Summary Footer Row
  const totalRowNumber = ws.rowCount + 1;
  const netResult = totalIncome - totalExpenses;

  const totalRow = ws.addRow([
    'TOTALES CONSOLIDADOS',
    '',
    '',
    `${movements.length} transacciones`,
    totalIncome,
    totalExpenses,
    netResult,
    'MXN',
    '',
    '',
    '',
    '',
    '',
  ]);

  totalRow.height = 26;

  totalRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF0F172A' } };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' }, // Slate 200
    };
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF475569' } },
      bottom: { style: 'double', color: { argb: 'FF0F172A' } }, // Classic accounting double line
    };

    if ([5, 6, 7].includes(colNumber)) {
      cell.numFmt = '"$"#,##0.00;("$"#,##0.00);"-"';
      cell.alignment = { vertical: 'middle', horizontal: 'right' };
    }
  });

  // ----------------------------------------------------
  // SHEET 2: RESUMEN EJECUTIVO (DASHBOARD)
  // ----------------------------------------------------
  const wsSummary = workbook.addWorksheet('Resumen Ejecutivo', {
    views: [{ showGridLines: true }],
  });

  wsSummary.columns = [
    { width: 30 },
    { width: 35 },
    { width: 15 },
  ];

  // Header Banner
  wsSummary.mergeCells('A1:B1');
  const sumTitle = wsSummary.getCell('A1');
  sumTitle.value = 'FINTRACK  •  RESUMEN EJECUTIVO DEL PERIODO';
  sumTitle.font = { name: 'Segoe UI', size: 13, bold: true, color: { argb: 'FFFFFFFF' } };
  sumTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E1B4B' },
  };
  sumTitle.alignment = { vertical: 'middle', horizontal: 'center' };
  wsSummary.getRow(1).height = 34;

  const kpiItems = [
    ['Titular', userName],
    ['Periodo Analizado', periodLabel],
    ['Fecha de Emisión', now.toLocaleString('es-MX')],
    ['Total de Movimientos Registrados', movements.length],
    ['----------------------------------------', '----------------------------------------'],
    ['Total Ingresos (+)', totalIncome],
    ['Total Gastos (-)', totalExpenses],
    ['Balance Neto Resultante', netResult],
    ['Tasa de Ahorro', totalIncome > 0 ? `${((netResult / totalIncome) * 100).toFixed(1)}%` : '0.0%'],
  ];

  kpiItems.forEach(([label, value], i) => {
    const r = wsSummary.addRow([label, value]);
    r.height = 24;
    const isCurrency = typeof value === 'number' && i >= 5 && i <= 7;

    r.getCell(1).font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF334155' } };
    r.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };
    r.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };

    r.getCell(2).font = { name: 'Segoe UI', size: 10, bold: isCurrency };
    r.getCell(2).alignment = { vertical: 'middle', horizontal: isCurrency ? 'right' : 'left' };

    if (isCurrency) {
      r.getCell(2).numFmt = '"$"#,##0.00;("$"#,##0.00);"-"';
      if (label.includes('Ingresos')) {
        r.getCell(2).font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FF047857' } };
      } else if (label.includes('Gastos')) {
        r.getCell(2).font = { name: 'Segoe UI', size: 10.5, bold: true, color: { argb: 'FFB91C1C' } };
      } else {
        r.getCell(2).font = {
          name: 'Segoe UI',
          size: 11,
          bold: true,
          color: { argb: netResult >= 0 ? 'FF047857' : 'FFB91C1C' },
        };
      }
    }
  });

  // Generate buffer and trigger browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const filename = customFilename || `FinTrack_Reporte_${dateStr}.xlsx`;
  downloadBlob(blob, filename);

  return {
    count: movements.length,
    filename,
    totalIncome,
    totalExpenses,
    netResult,
  };
};

/**
 * Standard CSV fallback alias
 */
export const exportMovementsToCSV = exportMovementsToExcel;

/**
 * Exports complete account and transaction data as structured JSON backup
 */
export const exportFullBackupJSON = ({
  user = null,
  accounts = [],
  transactions = [],
  categories = [],
  tags = [],
}) => {
  const dateStr = new Date().toISOString().split('T')[0];
  const backupData = {
    app: 'FinTrack Personal Finance',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    user: {
      email: user?.email || '',
      name: user?.name || '',
    },
    data: {
      summary: {
        accountsCount: accounts.length,
        transactionsCount: transactions.length,
        categoriesCount: categories.length,
        tagsCount: tags.length,
      },
      accounts,
      transactions,
      categories,
      tags,
    },
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const filename = `FinTrack_Respaldo_Completo_${dateStr}.json`;

  downloadBlob(blob, filename);
  return { filename, backupData };
};
