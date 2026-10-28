import React, { useState } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { supabase } from '../../lib/supabase';
import { ConfirmModal } from '../common/ConfirmModal';
import { CustomSelect } from '../common/CustomSelect';

export const CategoriesView = () => {
  const { categories, tags, transactions, currentUser, refreshFinancialData, showToast } = useFinance();
  
  // Navigation Tabs: 'categories' | 'tags'
  const [activeTab, setActiveTab] = useState('categories');
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'expense' | 'income'
  const [searchTerm, setSearchTerm] = useState('');
  const [openCategories, setOpenCategories] = useState({});

  // Modals state
  const [catModalOpen, setCatModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null); // null = new, object = edit
  const [catName, setCatName] = useState('');
  const [catType, setCatType] = useState('expense');
  const [catIcon, setCatIcon] = useState('category');

  // Subcategory modal
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [targetCatIdForSub, setTargetCatIdForSub] = useState(null);
  const [subName, setSubName] = useState('');

  // Tag modal
  const [tagModalOpen, setTagModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [tagName, setTagName] = useState('');
  const [tagColor, setTagColor] = useState('#4338ca');

  const [saving, setSaving] = useState(false);

  // Dedicated ConfirmModal state
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    onConfirm: null,
    isLoading: false,
  });

  const toggleCategory = (id) => {
    setOpenCategories((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // --- CATEGORY CRUD ---
  const openNewCatModal = () => {
    setEditingCategory(null);
    setCatName('');
    setCatType('expense');
    setCatIcon('category');
    setCatModalOpen(true);
  };

  const openEditCatModal = (cat) => {
    setEditingCategory(cat);
    setCatName(cat.name);
    setCatType(cat.type);
    setCatIcon(cat.icon || 'category');
    setCatModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!catName.trim() || !currentUser) return;

    setSaving(true);
    try {
      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: catName.trim(),
            type: catType,
            icon: catIcon,
          })
          .eq('id', editingCategory.id);
        if (error) throw error;
        showToast(`Categoría "${catName.trim()}" actualizada con éxito.`);
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([
            {
              user_id: currentUser.id,
              name: catName.trim(),
              type: catType,
              icon: catIcon,
              color: catType === 'income' ? '#006c4a' : '#4338ca',
            },
          ]);
        if (error) throw error;
        showToast(`Categoría "${catName.trim()}" creada con éxito.`);
      }

      setCatModalOpen(false);
      await refreshFinancialData();
    } catch (err) {
      showToast('Error guardando categoría: ' + err.message, 'error', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = (cat) => {
    setDeleteConfirm({
      isOpen: true,
      title: '¿Eliminar categoría?',
      message: `¿Seguro que deseas eliminar la categoría "${cat.name}"? Los movimientos registrados conservarán su registro pero quedarán desvinculados de esta categoría.`,
      confirmText: 'Sí, eliminar categoría',
      isLoading: false,
      onConfirm: async () => {
        setDeleteConfirm((prev) => ({ ...prev, isLoading: true }));
        try {
          const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', cat.id);
          if (error) throw error;
          await refreshFinancialData();
          showToast(`Categoría "${cat.name}" eliminada.`, 'info');
          setDeleteConfirm({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: null, isLoading: false });
        } catch (err) {
          showToast('Error eliminando categoría: ' + err.message, 'error', 'Error');
          setDeleteConfirm((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // --- SUBCATEGORY CRUD ---
  const openNewSubModal = (categoryId) => {
    setEditingSubcategory(null);
    setTargetCatIdForSub(categoryId);
    setSubName('');
    setSubModalOpen(true);
  };

  const openEditSubModal = (sub) => {
    setEditingSubcategory(sub);
    setTargetCatIdForSub(sub.category_id);
    setSubName(sub.name);
    setSubModalOpen(true);
  };

  const handleSaveSubcategory = async (e) => {
    e.preventDefault();
    if (!subName.trim() || !currentUser || !targetCatIdForSub) return;

    setSaving(true);
    try {
      if (editingSubcategory) {
        const { error } = await supabase
          .from('subcategories')
          .update({ name: subName.trim() })
          .eq('id', editingSubcategory.id);
        if (error) throw error;
        showToast(`Subcategoría "${subName.trim()}" actualizada.`);
      } else {
        const { error } = await supabase
          .from('subcategories')
          .insert([
            {
              user_id: currentUser.id,
              category_id: targetCatIdForSub,
              name: subName.trim(),
            },
          ]);
        if (error) throw error;
        showToast(`Subcategoría "${subName.trim()}" creada.`);
      }

      setSubModalOpen(false);
      await refreshFinancialData();
    } catch (err) {
      showToast('Error guardando subcategoría: ' + err.message, 'error', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSubcategory = (sub) => {
    setDeleteConfirm({
      isOpen: true,
      title: '¿Eliminar subcategoría?',
      message: `¿Deseas eliminar la subcategoría "${sub.name}"? Los movimientos existentes permanecerán asignados a la categoría principal.`,
      confirmText: 'Sí, eliminar subcategoría',
      isLoading: false,
      onConfirm: async () => {
        setDeleteConfirm((prev) => ({ ...prev, isLoading: true }));
        try {
          const { error } = await supabase
            .from('subcategories')
            .delete()
            .eq('id', sub.id);
          if (error) throw error;
          await refreshFinancialData();
          showToast(`Subcategoría "${sub.name}" eliminada.`, 'info');
          setDeleteConfirm({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: null, isLoading: false });
        } catch (err) {
          showToast('Error eliminando subcategoría: ' + err.message, 'error', 'Error');
          setDeleteConfirm((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // --- TAG CRUD ---
  const openNewTagModal = () => {
    setEditingTag(null);
    setTagName('');
    setTagColor('#4338ca');
    setTagModalOpen(true);
  };

  const openEditTagModal = (tag) => {
    setEditingTag(tag);
    setTagName(tag.name);
    setTagColor(tag.color || '#4338ca');
    setTagModalOpen(true);
  };

  const handleSaveTag = async (e) => {
    e.preventDefault();
    if (!tagName.trim() || !currentUser) return;

    setSaving(true);
    try {
      if (editingTag) {
        const { error } = await supabase
          .from('tags')
          .update({
            name: tagName.trim(),
            color: tagColor,
          })
          .eq('id', editingTag.id);
        if (error) throw error;
        showToast(`Etiqueta "${tagName.trim()}" actualizada.`);
      } else {
        const { error } = await supabase
          .from('tags')
          .insert([
            {
              user_id: currentUser.id,
              name: tagName.trim(),
              color: tagColor,
            },
          ]);
        if (error) throw error;
        showToast(`Etiqueta "${tagName.trim()}" creada con éxito.`);
      }

      setTagModalOpen(false);
      await refreshFinancialData();
    } catch (err) {
      showToast('Error guardando etiqueta: ' + err.message, 'error', 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTag = (tag) => {
    setDeleteConfirm({
      isOpen: true,
      title: '¿Eliminar etiqueta?',
      message: `¿Deseas eliminar la etiqueta "${tag.name}"? Los movimientos que la tengan asignada dejarán de mostrarla.`,
      confirmText: 'Sí, eliminar etiqueta',
      isLoading: false,
      onConfirm: async () => {
        setDeleteConfirm((prev) => ({ ...prev, isLoading: true }));
        try {
          const { error } = await supabase
            .from('tags')
            .delete()
            .eq('id', tag.id);
          if (error) throw error;
          await refreshFinancialData();
          showToast(`Etiqueta "${tag.name}" eliminada.`, 'info');
          setDeleteConfirm({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: null, isLoading: false });
        } catch (err) {
          showToast('Error eliminando etiqueta: ' + err.message, 'error', 'Error');
          setDeleteConfirm((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  // Filter Categories
  const filteredCategories = categories.filter((c) => {
    if (categoryFilter !== 'all' && c.type !== categoryFilter) return false;
    if (searchTerm && !c.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Filter Tags
  const filteredTags = tags.filter((t) =>
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header and Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-xs uppercase tracking-wider mb-1">
            <span>Gestión</span>
            <span>•</span>
            <span className="text-primary font-bold">Taxonomía</span>
          </div>
          <h1 className="text-2xl sm:text-headline-lg text-on-surface font-bold tracking-tight">
            Categorías y Etiquetas
          </h1>
          <p className="font-body-md text-xs sm:text-sm text-on-surface-variant mt-0.5">
            Organiza tus movimientos por tipos de gasto y marcas de búsqueda.
          </p>
        </div>

        {/* Tab Switcher: Solo 'Categorías' y 'Etiquetas' */}
        <div className="inline-flex p-1 bg-surface-container rounded-2xl shadow-inner self-stretch sm:self-auto justify-between sm:justify-start">
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'categories'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-lg">category</span>
            <span>Categorías</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-surface-container-high text-on-surface-variant font-bold">
              {categories.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tags')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'tags'
                ? 'bg-surface-container-lowest text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-lg">sell</span>
            <span>Etiquetas</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-surface-container-high text-on-surface-variant font-bold">
              {tags.length}
            </span>
          </button>
        </div>
      </div>

      {/* Explainer Banner (Limpio y sintetizado para mobile) */}
      <div className="rounded-2xl bg-surface-container-low p-3.5 sm:p-4 shadow-sm border border-surface-container">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg">info</span>
          </div>
          <div className="flex-1 text-xs text-on-surface-variant leading-relaxed">
            {activeTab === 'categories' ? (
              <p>
                <strong className="text-on-surface font-semibold">Categorías:</strong> Grupos principales y subcategorías para clasificar tus gastos e ingresos (ej. <em>Alimentación &gt; Supermercado</em>).
              </p>
            ) : (
              <p>
                <strong className="text-on-surface font-semibold">Etiquetas:</strong> Marcas para agrupar movimientos de cualquier tipo (ej. <em>#Vacaciones, #Deducible</em>).
              </p>
            )}
          </div>
        </div>
      </div>

      {/* TAB 1: CATEGORÍAS Y SUBCATEGORÍAS */}
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
                  placeholder="Buscar categoría..."
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
                  Todas ({categories.length})
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
                  Gastos ({categories.filter((c) => c.type === 'expense').length})
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
                  Ingresos ({categories.filter((c) => c.type === 'income').length})
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={openNewCatModal}
              className="flex items-center gap-2 bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-xl font-body-md font-semibold transition-colors shadow-sm self-stretch sm:self-auto justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Nueva Categoría</span>
            </button>
          </div>

          {/* List of Categories */}
          <div className="space-y-3">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat) => {
                const isOpen = !!openCategories[cat.id];
                const subcats = cat.subcategories || [];
                const catTransactions = transactions.filter((t) => t.category === cat.name);
                const spentTotal = catTransactions.reduce((acc, t) => acc + Math.abs(t.amount), 0);

                return (
                  <div
                    key={cat.id}
                    className="rounded-2xl bg-surface-container-lowest shadow-sm border border-surface-container-high/60 overflow-hidden"
                  >
                    <div
                      onClick={() => toggleCategory(cat.id)}
                      className="p-3.5 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-surface-container-low/50 transition-colors select-none"
                    >
                      {/* Left: Icon & Category info */}
                      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          className="text-on-surface-variant hover:text-on-surface transition-transform duration-200 mt-1 sm:mt-0 shrink-0"
                        >
                          <span
                            className={`material-symbols-outlined text-2xl transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          >
                            keyboard_arrow_down
                          </span>
                        </button>

                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-primary">
                          <span className="material-symbols-outlined text-xl sm:text-2xl">{cat.icon || 'category'}</span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-base sm:text-headline-md text-on-surface font-bold truncate">
                              {cat.name}
                            </span>
                            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container-high text-on-surface-variant capitalize shrink-0">
                              {cat.type === 'income' ? 'Ingreso' : 'Gasto'}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-container text-on-surface-variant shrink-0 whitespace-nowrap">
                              {subcats.length} subcat.
                            </span>
                          </div>
                          <p className="font-label-md text-xs text-on-surface-variant mt-0.5 truncate">
                            {catTransactions.length} movimiento(s)
                          </p>
                        </div>
                      </div>

                      {/* Right: Amount & Actions Strip */}
                      <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-surface-container/60 pl-8 sm:pl-0">
                        <div className="flex flex-col md:items-end">
                          <div className="text-sm sm:text-metric-md font-bold text-on-surface tabular-nums">
                            ${spentTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}{' '}
                            <span className="text-xs font-normal text-on-surface-variant">MXN</span>
                          </div>
                          <span className="text-[11px] text-on-surface-variant">Total acumulado</span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => openNewSubModal(cat.id)}
                            className="p-1.5 sm:p-2 rounded-lg text-secondary hover:bg-secondary-fixed/30 transition-colors cursor-pointer"
                            title="Agregar subcategoría"
                          >
                            <span className="material-symbols-outlined text-xl">add_circle</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditCatModal(cat)}
                            className="p-1.5 sm:p-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors cursor-pointer"
                            title="Editar categoría"
                          >
                            <span className="material-symbols-outlined text-xl">edit</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="p-1.5 sm:p-2 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors cursor-pointer"
                            title="Eliminar categoría"
                          >
                            <span className="material-symbols-outlined text-xl">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Subcategories Dropdown Panel */}
                    {isOpen && (
                      <div className="bg-surface-container-low/40 px-4 sm:px-6 py-3.5 pl-6 sm:pl-16 border-t border-surface-container">
                        <div className="flex items-center justify-between mb-2.5">
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                            Subcategorías ({subcats.length})
                          </span>
                          <button
                            type="button"
                            onClick={() => openNewSubModal(cat.id)}
                            className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-sm">add</span>
                            <span>Añadir</span>
                          </button>
                        </div>

                        {subcats.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                            {subcats.map((sub) => (
                              <div
                                key={sub.id}
                                className="p-2.5 sm:p-3 rounded-xl bg-surface-container-lowest border border-surface-container flex items-center justify-between text-body-md shadow-xs group"
                              >
                                <span className="font-medium text-sm text-on-surface truncate mr-2">{sub.name}</span>
                                <div className="flex items-center gap-0.5 shrink-0 opacity-80 group-hover:opacity-100">
                                  <button
                                    type="button"
                                    onClick={() => openEditSubModal(sub)}
                                    className="p-1 text-on-surface-variant hover:text-primary rounded cursor-pointer"
                                    title="Editar subcategoría"
                                  >
                                    <span className="material-symbols-outlined text-base">edit</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubcategory(sub)}
                                    className="p-1 text-on-surface-variant hover:text-error rounded cursor-pointer"
                                    title="Eliminar subcategoría"
                                  >
                                    <span className="material-symbols-outlined text-base">delete</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="py-2.5 text-center text-xs text-on-surface-variant italic">
                            Esta categoría aún no tiene subcategorías. Haz clic en "Añadir" para crear la primera.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-12 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant text-center">
                <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">category</span>
                <p className="font-semibold text-on-surface">No se encontraron categorías</p>
                <p className="text-xs text-on-surface-variant mt-1">Crea tu primera categoría personalizada.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: ETIQUETAS (TAGS) CRUD */}
      {activeTab === 'tags' && (
        <div className="space-y-4">
          {/* Header Action Bar for Tags */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-lowest p-4 rounded-2xl shadow-sm border border-surface-container-high/60">
            <div className="relative flex-1 sm:w-80 w-full">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-lg">
                search
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar etiqueta..."
                className="w-full bg-surface-container-low text-on-surface placeholder:text-on-surface-variant pl-9 pr-4 py-2 rounded-xl text-body-md focus:outline-none focus:bg-surface-container"
              />
            </div>

            <button
              type="button"
              onClick={openNewTagModal}
              className="flex items-center gap-2 bg-primary text-on-primary hover:bg-primary-container px-4 py-2 rounded-xl font-body-md font-semibold transition-colors shadow-sm self-stretch sm:self-auto justify-center cursor-pointer"
            >
              <span className="material-symbols-outlined text-lg">add</span>
              <span>Nueva Etiqueta</span>
            </button>
          </div>

          {/* Tags Grid */}
          {filteredTags.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredTags.map((tag) => (
                <div
                  key={tag.id}
                  className="p-4 rounded-2xl bg-surface-container-lowest border border-surface-container-high/60 shadow-sm flex items-center justify-between group hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <span
                      style={{ backgroundColor: tag.color || '#4338ca' }}
                      className="w-4 h-4 rounded-full flex-shrink-0"
                    ></span>
                    <div>
                      <h4 className="font-semibold text-on-surface leading-tight">#{tag.name}</h4>
                      <span className="text-[11px] text-on-surface-variant">Etiqueta activa</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEditTagModal(tag)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                      title="Editar etiqueta"
                    >
                      <span className="material-symbols-outlined text-base">edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteTag(tag)}
                      className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-error-container/40 transition-colors"
                      title="Eliminar etiqueta"
                    >
                      <span className="material-symbols-outlined text-base">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant text-center">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant mb-2">sell</span>
              <p className="font-semibold text-on-surface">No tienes etiquetas registradas</p>
              <p className="text-xs text-on-surface-variant mt-1">
                Crea etiquetas como #Supermercado, #Vacaciones o #Deducible para clasificar tus gastos.
              </p>
              <button
                type="button"
                onClick={openNewTagModal}
                className="mt-4 px-4 py-2 bg-primary text-on-primary rounded-xl font-semibold text-xs hover:bg-primary-container transition-colors"
              >
                + Crear primera etiqueta
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CATEGORÍA */}
      {catModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-surface-container-high">
            <div className="h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-md font-bold text-on-surface">
                  {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                </h3>
                <button
                  type="button"
                  onClick={() => setCatModalOpen(false)}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    placeholder="ej. Educación, Mascotas, Gimnasio..."
                    required
                    className="w-full h-11 px-3 bg-surface-container-lowest text-on-surface rounded-lg border border-outline-variant focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                    Tipo de Movimiento
                  </label>
                  <CustomSelect
                    value={catType}
                    onChange={(val) => setCatType(val)}
                    options={[
                      { value: 'expense', label: 'Gasto', icon: 'arrow_downward', color: '#ef4444' },
                      { value: 'income', label: 'Ingreso', icon: 'arrow_upward', color: '#10b981' },
                    ]}
                    placeholder="Selecciona tipo"
                  />
                </div>

                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                    Ícono
                  </label>
                  <CustomSelect
                    value={catIcon}
                    onChange={(val) => setCatIcon(val)}
                    options={[
                      { value: 'category', label: 'Categoría General', icon: 'category' },
                      { value: 'restaurant', label: 'Restaurante / Comida', icon: 'restaurant' },
                      { value: 'shopping_cart', label: 'Supermercado', icon: 'shopping_cart' },
                      { value: 'home', label: 'Hogar / Vivienda', icon: 'home' },
                      { value: 'directions_car', label: 'Transporte / Auto', icon: 'directions_car' },
                      { value: 'medical_services', label: 'Salud / Medicina', icon: 'medical_services' },
                      { value: 'school', label: 'Educación', icon: 'school' },
                      { value: 'movie', label: 'Entretenimiento', icon: 'movie' },
                      { value: 'payments', label: 'Salario / Sueldo', icon: 'payments' },
                      { value: 'trending_up', label: 'Inversiones / Finanzas', icon: 'trending_up' },
                      { value: 'fitness_center', label: 'Deportes / Gimnasio', icon: 'fitness_center' },
                      { value: 'pets', label: 'Mascotas', icon: 'pets' },
                    ]}
                    placeholder="Selecciona un ícono"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container">
                  <button
                    type="button"
                    onClick={() => setCatModalOpen(false)}
                    className="px-4 py-2 text-on-surface-variant hover:text-on-surface font-medium"
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold shadow-sm"
                  >
                    {saving ? 'Guardando...' : (editingCategory ? 'Guardar Cambios' : 'Crear Categoría')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SUBCATEGORÍA */}
      {subModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-surface-container-high">
            <div className="h-1.5 bg-gradient-to-r from-secondary to-primary"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-md font-bold text-on-surface">
                  {editingSubcategory ? 'Editar Subcategoría' : 'Nueva Subcategoría'}
                </h3>
                <button
                  type="button"
                  onClick={() => setSubModalOpen(false)}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveSubcategory} className="space-y-4">
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                    Nombre de la Subcategoría
                  </label>
                  <input
                    type="text"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    placeholder="ej. Frutas y verduras, Cenas fuera, Mantenimiento..."
                    required
                    className="w-full h-11 px-3 bg-surface-container-lowest text-on-surface rounded-lg border border-outline-variant focus:border-primary outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container">
                  <button
                    type="button"
                    onClick={() => setSubModalOpen(false)}
                    className="px-4 py-2 text-on-surface-variant hover:text-on-surface font-medium"
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-semibold shadow-sm"
                  >
                    {saving ? 'Guardando...' : (editingSubcategory ? 'Guardar Cambios' : 'Crear Subcategoría')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ETIQUETA (TAG) */}
      {tagModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-surface-container-high">
            <div className="h-1.5 bg-gradient-to-r from-primary to-secondary"></div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-md font-bold text-on-surface">
                  {editingTag ? 'Editar Etiqueta' : 'Nueva Etiqueta (Tag)'}
                </h3>
                <button
                  type="button"
                  onClick={() => setTagModalOpen(false)}
                  className="text-on-surface-variant hover:text-on-surface"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSaveTag} className="space-y-4">
                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                    Nombre (sin el #)
                  </label>
                  <input
                    type="text"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                    placeholder="ej. Deducible, Walmart, Viajes..."
                    required
                    className="w-full h-11 px-3 bg-surface-container-lowest text-on-surface rounded-lg border border-outline-variant focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-label-md font-label-md text-on-surface-variant mb-1">
                    Color identificador
                  </label>
                  <div className="flex items-center gap-3">
                    {[
                      '#4338ca', '#006c4a', '#0284c7', '#7e22ce', '#be123c', '#d97706', '#334155', '#e11d48'
                    ].map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setTagColor(c)}
                        style={{ backgroundColor: c }}
                        className={`w-7 h-7 rounded-full border-2 transition-transform ${
                          tagColor === c ? 'scale-125 border-on-surface' : 'border-transparent hover:scale-110'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-container">
                  <button
                    type="button"
                    onClick={() => setTagModalOpen(false)}
                    className="px-4 py-2 text-on-surface-variant hover:text-on-surface font-medium"
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-semibold shadow-sm"
                  >
                    {saving ? 'Guardando...' : (editingTag ? 'Guardar Cambios' : 'Crear Etiqueta')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar categorías, subcategorías y etiquetas */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, title: '', message: '', confirmText: '', onConfirm: null, isLoading: false })}
        onConfirm={deleteConfirm.onConfirm}
        title={deleteConfirm.title}
        message={deleteConfirm.message}
        confirmText={deleteConfirm.confirmText || 'Sí, eliminar'}
        cancelText="Cancelar"
        isLoading={deleteConfirm.isLoading}
        isDestructive={true}
      />
    </div>
  );
};
