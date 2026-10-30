import React, { useState } from 'react';
import { generateMonthlyReportPDF, generateComparisonReportPDF } from '../../services/pdfReportService';

export const PdfExportModal = ({
  isOpen,
  onClose,
  user,
  currentPeriod,
  kpis,
  categories,
  transactions,
  exchangeRate,
  showToast,
}) => {
  const [selectedReport, setSelectedReport] = useState('monthly'); // 'monthly' | 'comparison'
  const [isGenerating, setIsGenerating] = useState(false);

  // Verify if user has movements in previous month to compare against
  const prevMonthKey = kpis?.prevMonthKey || '';
  const hasPrevMonthData = Boolean(
    prevMonthKey &&
    transactions.some((t) => t.date && t.date.startsWith(prevMonthKey))
  );

  if (!isOpen) return null;

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      // Small tick for visual feedback
      await new Promise((r) => setTimeout(r, 250));

      if (selectedReport === 'monthly') {
        const res = generateMonthlyReportPDF({
          user,
          currentPeriod,
          kpis,
          categories,
          transactions,
          exchangeRate,
        });
        showToast(`Reporte generado con éxito: ${res.filename}`, 'success', 'Descarga Completa');
      } else {
        if (!hasPrevMonthData) {
          showToast('Aún no tienes movimientos registrados en el mes anterior para realizar una comparación.', 'info', 'Sin mes previo');
          return;
        }

        const res = generateComparisonReportPDF({
          user,
          currentPeriod,
          kpis,
          categories,
          transactions,
          exchangeRate,
        });
        showToast(`Comparativo generado con éxito: ${res.filename}`, 'success', 'Descarga Completa');
      }

      onClose();
    } catch (err) {
      console.error('Error generando PDF:', err);
      showToast('Ocurrió un error al generar el PDF: ' + err.message, 'error', 'Error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl border border-surface-container-high/60 overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-surface-container flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-xl">picture_as_pdf</span>
            </div>
            <div>
              <h2 className="font-headline-sm text-base sm:text-lg font-bold text-on-surface">
                Generar Reporte Financiero (PDF)
              </h2>
              <p className="text-xs text-on-surface-variant">
                Descarga un reporte ejecutivo listo para imprimir o compartir.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Modal Body: Selection Options */}
        <div className="p-6 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Selecciona el tipo de análisis que necesitas:
          </p>

          <div className="space-y-3">
            {/* Opción 1: Resumen de mi Mes */}
            <div
              onClick={() => setSelectedReport('monthly')}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                selectedReport === 'monthly'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-surface-container hover:border-surface-container-highest bg-surface-container-low/50'
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="radio"
                  name="reportType"
                  checked={selectedReport === 'monthly'}
                  onChange={() => setSelectedReport('monthly')}
                  className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-on-surface">
                    1. Resumen de mi Mes (Cierre Mensual)
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-secondary-fixed/50 text-secondary">
                    Recomendado
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Ideal para entender el cierre de tu mes: ¿cuánto dinero entró?, ¿en qué se fue?, tu tasa de ahorro lograda y los 5 gastos más fuertes.
                </p>
              </div>
            </div>

            {/* Opción 2: Comparativo Mes vs Mes Anterior */}
            <div
              onClick={() => {
                if (hasPrevMonthData) {
                  setSelectedReport('comparison');
                }
              }}
              className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                !hasPrevMonthData
                  ? 'opacity-60 bg-surface-container-low/30 border-surface-container cursor-not-allowed'
                  : selectedReport === 'comparison'
                  ? 'border-primary bg-primary/5 ring-1 ring-primary cursor-pointer'
                  : 'border-surface-container hover:border-surface-container-highest bg-surface-container-low/50 cursor-pointer'
              }`}
            >
              <div className="mt-0.5">
                <input
                  type="radio"
                  name="reportType"
                  disabled={!hasPrevMonthData}
                  checked={selectedReport === 'comparison'}
                  onChange={() => {
                    if (hasPrevMonthData) setSelectedReport('comparison');
                  }}
                  className={`w-4 h-4 text-primary focus:ring-primary ${
                    hasPrevMonthData ? 'cursor-pointer' : 'cursor-not-allowed'
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-on-surface">
                    2. Frente a Frente: Este Mes vs. Mes Pasado
                  </span>
                  {!hasPrevMonthData && (
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant">
                      Disponible el próximo mes
                    </span>
                  )}
                </div>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  {hasPrevMonthData
                    ? 'Ideal para comparar tu progreso: semáforo de ahorro (¿gastaste más o menos?), comparativa directa de ingresos y en qué categorías variaron tus compras.'
                    : 'Esta opción se activará automáticamente cuando acumules historial en tu siguiente mes para poder comparar tus hábitos.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-surface-container-low/50 border-t border-surface-container flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl border border-outline-variant/60 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs shadow-sm transition-all cursor-pointer"
          >
            {isGenerating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></span>
                <span>Generando Documento...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-base">download</span>
                <span>Descargar PDF</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
