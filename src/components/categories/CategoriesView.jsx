import React, { useState } from 'react';

export const CategoriesView = () => {
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'tags'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'expense' | 'income'
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState({
    vivienda: true,
    supermercado: true,
    transporte: false,
    ingresos: false,
  });
  const [selectedTag, setSelectedTag] = useState('walmart');

  const toggleCategory = (key) => {
    setOpenCategories((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const categoriesData = [
    {
      id: 'vivienda',
      name: 'Renta y Vivienda',
      subcount: 5,
      type: 'expense',
      desc: 'Costos fijos residenciales y arrendamiento',
      amount: '$12,500.00 MXN',
      pct: '38.3%',
      icon: 'home',
      color: 'bg-primary',
      subcategories: [
        { name: 'Renta del departamento', amount: '$10,500.00 MXN' },
        { name: 'Luz / CFE', amount: '$650.00 MXN' },
        { name: 'Agua potable', amount: '$220.00 MXN' },
        { name: 'Gas natural', amount: '$380.00 MXN' },
        { name: 'Internet fibra óptica', amount: '$750.00 MXN' },
      ],
    },
    {
      id: 'supermercado',
      name: 'Despensa y Supermercado',
      subcount: 5,
      type: 'expense',
      desc: 'Alimentación cotidiana, despensa y suministros del hogar',
      amount: '$8,450.00 MXN',
      pct: '25.9%',
      icon: 'shopping_cart',
      color: 'bg-secondary',
      subcategories: [
        { name: 'Cárnicos y pescados', amount: '$2,840.00 MXN' },
        { name: 'Frutas y verduras', amount: '$1,620.00 MXN' },
        { name: 'Lácteos y huevos', amount: '$1,150.00 MXN' },
        { name: 'Abarrotes y granos', amount: '$1,440.00 MXN' },
        { name: 'Artículos de limpieza', amount: '$1,400.00 MXN' },
      ],
    },
    {
      id: 'transporte',
      name: 'Transporte y Movilidad',
      subcount: 4,
      type: 'expense',
      desc: 'Gasolina, traslados en apps, peajes y mantenimiento automotriz',
      amount: '$3,800.00 MXN',
      pct: '11.6%',
      icon: 'directions_car',
      color: 'bg-outline',
      subcategories: [
        { name: 'Gasolina Magna/Premium', amount: '$2,200.00 MXN' },
        { name: 'Uber & Didi Rides', amount: '$980.00 MXN' },
        { name: 'Casetas y autopistas', amount: '$420.00 MXN' },
        { name: 'Mantenimiento preventivo', amount: '$200.00 MXN' },
      ],
    },
    {
      id: 'ingresos',
      name: 'Ingresos Patrimoniales',
      subcount: 3,
      type: 'income',
      desc: 'Sueldo, bonos corporativos y dividendos pasivos',
      amount: '$48,250.00 MXN',
      pct: '100%',
      icon: 'trending_up',
      color: 'bg-secondary',
      subcategories: [
        { name: 'Nómina quincenal y Sueldo', amount: '+$45,000.00 MXN' },
        { name: 'Rendimientos / Inversiones (CETES)', amount: '+$2,250.00 MXN' },
        { name: 'Ventas ocasionales y otros', amount: '+$1,000.00 MXN' },
      ],
    },
  ];

  const tagsData = [
    {
      id: 'walmart',
      name: '#Walmart',
      badge: 'Comercio',
      badgeColor: 'bg-secondary-fixed text-on-secondary-fixed',
      amount: '$14,250.00',
      count: '18 transacciones',
      color: 'bg-secondary',
      rule: 'Todo cargo con patrón "WALMART" asigna categoría Despensa automáticamente.',
    },
    {
      id: 'oxxo',
      name: '#Oxxo',
      badge: 'Conveniencia',
      badgeColor: 'bg-tertiary-fixed text-on-tertiary-fixed',
      amount: '$3,640.00',
      count: '34 transacciones',
      color: 'bg-tertiary-container',
      rule: 'Todo cargo con patrón "CADENA OXXO" clasifica como Gasto Hormiga.',
    },
    {
      id: 'sat',
      name: '#DeducibleSAT',
      badge: 'Fiscal',
      badgeColor: 'bg-primary-fixed text-on-primary-fixed',
      amount: '$18,400.00',
      count: '12 transacciones',
      color: 'bg-primary',
      rule: 'Asociado a facturación CFDI con retención de impuestos.',
    },
    {
      id: 'uber',
      name: '#Uber',
      badge: 'Movilidad',
      badgeColor: 'bg-surface-container text-on-surface-variant',
      amount: '$4,850.00',
      count: '22 transacciones',
      color: 'bg-outline',
      rule: 'Cargos de Uber B.V. asignados a Transporte.',
    },
    {
      id: 'amazon',
      name: '#Amazon',
      badge: 'E-commerce',
      badgeColor: 'bg-surface-container-highest text-on-surface',
      amount: '$8,120.00',
      count: '9 transacciones',
      color: 'bg-surface-tint',
      rule: 'Compras online en marketplace.',
    },
    {
      id: 'netflix',
      name: '#Netflix',
      badge: 'Suscripción',
      badgeColor: 'bg-error-container text-on-error-container',
      amount: '$299.00',
      count: '1 transacción recurrente',
      color: 'bg-error',
      rule: 'Cobro recurrente los días 22 de cada mes.',
    },
  ];

  const activeTagObj = tagsData.find((t) => t.id === selectedTag) || tagsData[0];

  return (
    <div className="space-y-6 pb-8">
      {/* Header and Switcher */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md uppercase tracking-wider mb-1">
            <span>Configuración Patrimonial</span>
            <span>•</span>
            <span className="text-primary font-bold">Taxonomía Operativa</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Categorías y Etiquetas
          </h1>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-surface-container rounded-2xl shadow-inner self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-body-md font-semibold transition-all ${
              activeTab === 'categories'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-lg">account_tree</span>
            <span>Categorías y Subcategorías</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-surface-container text-on-surface-variant font-medium">
              11
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tags')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-body-md font-semibold transition-all ${
              activeTab === 'tags'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-lg">sell</span>
            <span>Etiquetas y Comercios</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-surface-container-high text-on-surface-variant">
              24
            </span>
          </button>
        </div>
      </div>

      {/* Explainer Pill */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-4 sm:p-5 shadow-sm border border-surface-container">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-xl bg-surface-variant text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">lightbulb</span>
          </div>
          <div className="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-3 text-body-md font-body-md">
            <p className="text-on-surface-variant">
              <strong className="text-on-surface font-bold">¿Cuál es la diferencia?</strong> Las{' '}
              <span className="text-primary font-semibold">Categorías</span> clasifican{' '}
              <em className="not-italic font-bold text-on-surface">"EN QUÉ"</em> gastas (Vivienda, Alimentación,
              Transporte) para calibrar presupuestos; las{' '}
              <span className="text-secondary font-semibold">Etiquetas</span> mapean{' '}
              <em className="not-italic font-bold text-on-surface">"DÓNDE"</em> o el{' '}
              <em className="not-italic font-bold text-on-surface">"CONTEXTO"</em> fiscal y comercial (Walmart, OXXO,
              Vacaciones, SAT deducible).
            </p>
          </div>
        </div>
      </div>

      {/* TAB 1: CATEGORÍAS */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container-high/60">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">
                  search
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar categorías, servicios..."
                  className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant pl-9 pr-4 py-2 rounded-xl text-body-md focus:outline-none focus:bg-surface-container"
                />
              </div>
              <div className="inline-flex bg-surface-container-low p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                    categoryFilter === 'all'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Todos (11)
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('expense')}
                  className={`px-3 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                    categoryFilter === 'expense'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Gastos (8)
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryFilter('income')}
                  className={`px-3 py-1.5 rounded-lg font-label-md text-label-md font-semibold transition-all ${
                    categoryFilter === 'income'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  Ingresos (3)
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert('Crear nueva categoría')}
              className="flex items-center gap-2 bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-xl font-body-md font-semibold transition-colors shadow-sm self-stretch sm:self-auto justify-center"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Nueva Categoría</span>
            </button>
          </div>

          {/* Categories Accordion Tree */}
          <div className="space-y-3">
            {categoriesData
              .filter(
                (c) =>
                  (categoryFilter === 'all' || c.type === categoryFilter) &&
                  c.name.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((cat) => {
                const isOpen = openCategories[cat.id];
                return (
                  <div
                    key={cat.id}
                    className="rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 overflow-hidden"
                  >
                    <div
                      onClick={() => toggleCategory(cat.id)}
                      className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-surface-container-low/50 transition-colors select-none"
                    >
                      <div className="flex items-center gap-4">
                        <button
                          type="button"
                          className="text-on-surface-variant hover:text-on-surface transition-transform duration-200"
                        >
                          <span
                            className={`material-symbols-outlined text-2xl transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          >
                            keyboard_arrow_down
                          </span>
                        </button>
                        <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-primary">
                          <span className="material-symbols-outlined text-2xl">{cat.icon}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-headline-md text-headline-md text-on-surface font-bold">
                              {cat.name}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface-variant">
                              {cat.subcount} subcategorías
                            </span>
                          </div>
                          <p className="font-label-md text-label-md text-on-surface-variant">{cat.desc}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pl-12 md:pl-0">
                        <div className="flex flex-col md:items-end">
                          <div className="font-metric-md text-metric-md font-bold text-on-surface tabular-nums">
                            {cat.amount}
                          </div>
                          <div className="flex items-center gap-2 text-label-md text-on-surface-variant">
                            <span>{cat.pct} del gasto total</span>
                            <div className="w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                              <div className={`h-full ${cat.color}`} style={{ width: cat.pct }}></div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => alert(`Editar ${cat.name}`)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                          >
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Subcategories (Accordion Body) */}
                    {isOpen && (
                      <div className="bg-surface-container-low/40 px-6 py-3 pl-16 border-t border-surface-container">
                        <div className="space-y-1">
                          {cat.subcategories.map((sub, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-surface-container-lowest transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <span className={`w-1.5 h-1.5 rounded-full ${cat.color}`}></span>
                                <span className="font-body-md text-body-md font-medium text-on-surface">
                                  {sub.name}
                                </span>
                              </div>
                              <span className="font-body-md text-body-md tabular-nums font-semibold text-on-surface">
                                {sub.amount}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* TAB 2: ETIQUETAS Y COMERCIOS */}
      {activeTab === 'tags' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Tag Cards (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tagsData.map((tag) => {
                const isSelected = selectedTag === tag.id;
                return (
                  <div
                    key={tag.id}
                    onClick={() => setSelectedTag(tag.id)}
                    className={`p-5 rounded-2xl bg-surface-container-lowest shadow-sm cursor-pointer transition-all hover:shadow-md border border-surface-container-high/60 ${
                      isSelected ? 'ring-2 ring-primary bg-surface-container-low/50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-3.5 h-3.5 rounded-full ${tag.color}`}></span>
                        <span className="font-headline-md text-headline-md font-bold text-on-surface">
                          {tag.name}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tag.badgeColor}`}>
                        {tag.badge}
                      </span>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between">
                      <div>
                        <span className="font-label-md text-label-md text-on-surface-variant block">
                          Volumen Acumulado
                        </span>
                        <span className="font-metric-md text-metric-md font-bold text-on-surface tabular-nums">
                          {tag.amount}
                        </span>
                      </div>
                      <span className="font-label-md text-label-md text-on-surface-variant font-medium">
                        {tag.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Selected Tag Inspector (5 Cols) */}
          <div className="lg:col-span-5 bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-surface-container-high/60 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-surface-container">
              <div className="flex items-center gap-3">
                <span className={`w-4 h-4 rounded-full ${activeTagObj.color}`}></span>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface">
                  {activeTagObj.name}
                </h3>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${activeTagObj.badgeColor}`}>
                {activeTagObj.badge}
              </span>
            </div>

            <div>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase font-semibold">
                Regla de Auto-etiquetado IA
              </span>
              <p className="font-body-md text-body-md text-on-surface mt-1 p-3 rounded-xl bg-surface-container-low border border-surface-container">
                {activeTagObj.rule}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Total Facturado este mes</span>
                <span className="font-bold text-on-surface">{activeTagObj.amount}</span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Frecuencia de compra</span>
                <span className="font-bold text-on-surface">{activeTagObj.count}</span>
              </div>
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant">Deducción de Impuestos</span>
                <span className="font-bold text-secondary">
                  {activeTagObj.badge === 'Fiscal' ? '100% Aplicable' : 'No deducible'}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-surface-container flex gap-3">
              <button
                type="button"
                onClick={() => alert(`Configurar reglas para ${activeTagObj.name}`)}
                className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-body-md transition-colors"
              >
                Editar Regla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
