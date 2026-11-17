# Manual de Usuario — FinTrack
**Versión de la Plataforma:** 1.0 (Producción)  
**Última Actualización:** Noviembre 2026  
**Tecnología:** React + Tailwind CSS + Supabase (Bimonetario MXN / USD)

---

## 1. Introducción y Filosofía de la Aplicación

**FinTrack** es una plataforma moderna e intuitiva de control financiero y gestión patrimonial personal. Ha sido diseñada con tres principios fundamentales:

1. **Privacidad y Control Absoluto:** No necesitas vincular credenciales bancarias sensibles ni otorgar acceso a tus tokens financieros personales. Toda la información pertenece exclusivamente a tu cuenta y está resguardada en una base de datos segura y aislada mediante políticas a nivel de fila (*Row Level Security*).
2. **Claridad Patrimonial Instantánea:** Ofrece una visualización en tiempo real de tu patrimonio neto (*Net Worth*), consolidando múltiples cuentas de bancos, tarjetas de crédito, efectivo e inversiones bajo un esquema bimonetario nativo (Pesos Mexicanos y Dólares Estadounidenses) con tipo de cambio actualizado.
3. **Agilidad en el Registro:** El hábito del registro financiero diario solo se mantiene si la herramienta es rápida, agradable y sin pasos burocráticos innecesarios.

---

## 2. Registro, Inicio de Sesión y Acceso Offline

### 2.1. Creación de Cuenta (Registro)
1. En la pantalla inicial, haz clic en **"¿No tienes cuenta? Regístrate aquí"**.
2. Ingresa tu **Nombre completo**, **Correo electrónico** y una **Contraseña segura** (mínimo 6 caracteres).
3. Haz clic en **"Crear Cuenta"**.
4. FinTrack inicializará automáticamente tu espacio personal con las categorías y monedas predeterminadas.

### 2.2. Inicio de Sesión
1. Ingresa tu correo y contraseña registrados en el formulario de inicio de sesión.
2. Haz clic en **"Iniciar Sesión"**. Tu sesión se mantendrá activa de forma segura en tu navegador.

### 2.3. Funcionamiento Fuera de Línea (*Modo Offline*)
FinTrack incorpora una arquitectura resiliente:
- Si experimentas caídas momentáneas de red o te encuentras de viaje sin cobertura celular, la aplicación mantiene la visualización de tus datos en caché local.
- Puedes navegar entre tus pantallas sin interrupciones ni bloqueos de pantalla.

---

## 3. Módulo 1: Dashboard (Panel Principal)

El Dashboard es tu centro de comando visual para comprender tu situación financiera en menos de 5 segundos.

### 3.1. Indicadores Clave de Desempeño (KPIs)
- **Patrimonio Neto (*Net Worth*):** Suma del balance de todas tus cuentas activas (Cuentas de débito + Efectivo + Inversiones + Ahorros) restando los saldos pendientes de tus tarjetas de crédito.
- **Visualización Bimonetaria:** Debajo del patrimonio principal en Pesos Mexicanos (MXN), se calcula de manera automática su equivalencia en Dólares (USD) utilizando el tipo de cambio oficial sincronizado en tiempo real.
- **Ingresos del Mes:** Total acumulado de entradas del periodo activo (representado en verde con flecha ascendente).
- **Gastos del Mes:** Total acumulado de salidas del periodo activo (representado en rojo con flecha descendente).
- **Tasa de Ahorro / Balance Neto:** Diferencia neta entre ingresos y gastos del mes, calculando el porcentaje del ingreso que has logrado conservar.

### 3.2. Tipo de Cambio en Tiempo Real
En la cabecera superior se muestra permanentemente la cotización del dólar con respecto al peso (ej. `USD/MXN: $18.62`). Al hacer clic sobre el indicador o actualizar la página, el sistema consulta los índices de cambio interbancarios más recientes.

### 3.3. Carrusel de Cuentas Principales
Muestra tarjetas interactivas de cada una de tus cuentas con:
- Nombre y entidad financiera.
- Badge distintivo de tipo de cuenta con micro-gradiente.
- Saldo actual con código de color dinámico.
- Moneda asignada (MXN o USD).

---

## 4. Módulo 2: Cuentas y Tarjetas

Ubicado en la pestaña lateral **"Cuentas"**, este módulo te permite gestionar la totalidad de tus instrumentos financieros.

### 4.1. Tipos de Cuentas Disponibles
- **Débito:** Cuentas corrientes o de nómina destinadas a tu flujo de dinero diario.
- **Crédito:** Tarjetas bancarias o departamentales. Su saldo se registra como pasivo restando al patrimonio general y permitiendo monitorear tu nivel de endeudamiento.
- **Ahorro:** Cuentas para metas específicas o fondos de emergencia.
- **Inversión:** Cuentas de CETES, pagarés bancarios, fondos indexados o plataformas bursátiles.
- **Efectivo:** Dinero físico disponible en billetera o caja chica.

### 4.2. Crear una Nueva Cuenta
1. Haz clic en el botón superior **"+ Nueva Cuenta"**.
2. Completa los campos:
   - **Nombre de la Cuenta:** (Ej. *Nómina Principal*, *Tarjeta Oro*, *Billetera*).
   - **Tipo de Cuenta:** Selecciona Débito, Crédito, Ahorro, Inversión o Efectivo.
   - **Institución / Banco:** (Ej. *BBVA*, *Santander*, *Nu*, *Mercado Pago*, *Efectivo*).
   - **Saldo Inicial:** El monto actual con el que comienzas a registrar la cuenta.
   - **Moneda:** Selecciona `MXN` o `USD`.
   - **Color Personalizado:** Escoge el color distintivo que te facilitará identificarla visualmente en listas y gráficos.
3. Haz clic en **"Guardar Cuenta"**.

### 4.3. Editar o Ajustar Saldo de una Cuenta
- Haz clic en el ícono de **lápiz (Editar)** en la tarjeta de la cuenta.
- Podrás cambiar el nombre, banco, color y saldo actual.
- *Nota:* FinTrack recalculará de inmediato tu patrimonio neto de manera consistente.

---

## 5. Módulo 3: Historial y Registro de Movimientos

La pantalla **"Movimientos"** almacena la bitácora completa de tus ingresos, gastos y transferencias.

### 5.1. Registrar un Nuevo Movimiento
Haz clic en el botón **"Nuevo movimiento"** (disponible tanto en la barra superior como en la vista de movimientos) para abrir el modal de captura:

1. **Selecciona el Tipo:**
   - **Gasto (Rojo):** Dinero que egresa de tu patrimonio para pagar bienes o servicios.
   - **Ingreso (Verde):** Dinero que entra (salario, ventas, rendimientos, regalos).
   - **Transferencia (Morado):** Movimiento interno entre dos de tus cuentas (ej. retirar dinero del cajero de BBVA a Efectivo). **No afecta tu patrimonio neto**, solo redistribuye el saldo entre las dos cuentas seleccionadas.
2. **Monto:** Ingresa la cantidad en dinero.
3. **Concepto:** Descripción breve (Ej. *Supermercado semanal*, *Pago de luz*, *Honorarios proyecto*).
4. **Fecha:** Por defecto se establece en la fecha de hoy, pero puedes seleccionar cualquier fecha pasada o futura en el calendario.
5. **Cuenta Origen:** Selecciona la cuenta o tarjeta de donde sale el dinero.
   - Si es **Transferencia**, se habilitará el selector de **Cuenta Destino**.
6. **Categoría y Subcategoría:** Clasifica el gasto o ingreso para alimentar tus presupuestos y estadísticas.
7. **Detalles Opcionales (+ Subcategoría, nota o etiquetas):**
   - **Notas:** Comentarios adicionales, folios o recordatorios.
   - **Etiquetas (#):** Escribe palabras precedidas de `#` (ej. `#Vacaciones2026`, `#DeducibleSAT`, `#Boda`) para agrupar movimientos de diversas categorías en un proyecto transversal.
8. Haz clic en **"Guardar Movimiento"**. El saldo de tu cuenta se actualizará automáticamente.

### 5.2. Filtrado y Búsqueda de Movimientos
- **Búsqueda por texto:** Escribe en la barra de búsqueda para filtrar al instante por concepto, notas, subcategoría o etiquetas.
- **Filtro por Tipo:** Despliega el selector para ver: *Todos*, *Solo Gastos*, *Solo Ingresos* o *Solo Transferencias*.
- **Filtro por Categoría:** Selecciona una categoría específica para auditar cuánto has gastado en ella.
- **Filtro por Etiqueta:** Aísla todos los movimientos con un tag determinado (ej. ver todos los gastos de un viaje).

### 5.3. Operaciones en Lote y Reversión de Saldo
- **Selección múltiple:** Puedes marcar las casillas a la izquierda de cada movimiento o presionar la casilla maestra de la cabecera para seleccionar la página entera.
- **Eliminación masiva:** Al presionar **"Eliminar seleccionados"**, el sistema solicitará confirmación y **revertirá de forma matemática e inmediata** el impacto de cada movimiento en los saldos de sus cuentas asociadas.

---

## 6. Módulo 4: Categorías, Subcategorías y Etiquetas

Ubicado en **"Categorías"**, este módulo te permite modelar la estructura de gastos e ingresos a la medida exacta de tu estilo de vida.

### 6.1. Organización Jerárquica
- **Categoría Padre:** El contenedor general (ej. *Alimentación*, *Vivienda*, *Transporte*). Tiene un ícono y un color distintivo.
- **Subcategorías (Chips):** Desgloses específicos dentro de la categoría (ej. dentro de *Alimentación*: *Restaurantes*, *Supermercado*, *Cafeterías*).
- **Etiquetas (#):** Marcadores transversales que pueden asociarse a cualquier movimiento sin importar su categoría.

### 6.2. Crear y Editar Categorías
1. Haz clic en **"Nueva Categoría"**.
2. Escribe el nombre, selecciona si corresponde a **Gasto** o **Ingreso**, elige un ícono de la galería y define un color temático.
3. Haz clic en **"Guardar"**.

### 6.3. Administrar Subcategorías (Chips Elegantes)
- Al desplegar el acordeón de una categoría, verás sus subcategorías presentadas como chips con fondo translúcido y borde tonal.
- **Añadir subcategoría:** Haz clic en el ícono de adición azul (`+`) en la cabecera de la categoría o en el botón **"Añadir"** dentro del acordeón.
- **Editar o borrar subcategoría:** Pasa el cursor sobre el chip para ver los íconos de edición rápida y eliminación.

### 6.4. Pestaña de Etiquetas (Tags)
En la pestaña superior **"Etiquetas"**:
- Puedes crear nuevas etiquetas con colores asignados.
- Puedes auditar cuántas veces ha sido utilizada cada etiqueta en tus movimientos.

---

## 7. Módulo 5: Presupuestos Mensuales

La herramienta preventiva para evitar gastos desmedidos y proteger tu capacidad de ahorro.

### 7.1. Configuración de un Presupuesto
1. Ve a la sección **"Presupuestos"**.
2. Haz clic en **"Nuevo Presupuesto"**.
3. Selecciona la categoría de gasto que deseas limitar (ej. *Salidas y Entretenimiento*).
4. Asigna el monto máximo sugerido para el mes (ej. *$4,000 MXN*).
5. Guarda el presupuesto.

### 7.2. Lectura del Semáforo Financiero
Cada presupuesto se representa como una tarjeta visual con una barra de progreso inteligente:
- **Verde (< 70% consumido):** Gasto bajo control y dentro de los parámetros saludables.
- **Amarillo (70% - 95% consumido):** Alerta preventiva; te estás acercando al límite del periodo.
- **Rojo (> 100% consumido):** Sobregiro; has excedido el monto presupuestado para el mes.

---

## 8. Módulo 6: Exportación de Reportes

FinTrack te permite llevarte tu información financiera en cualquier momento sin depender exclusivamente de la aplicación.

### 8.1. Exportación a Microsoft Excel (.xlsx)
1. En la vista de **Movimientos**, haz clic en el botón **"Exportar Excel"**.
2. Si tienes movimientos seleccionados mediante casillas, se exportarán únicamente los seleccionados; si no hay selección, se exportará la lista completa filtrada.
3. El archivo generado incluye:
   - Encabezado corporativo con datos del usuario y periodo analizado.
   - Resumen financiero de Total Ingresos, Total Gastos y Resultado Neto.
   - Tabla estructurada con Formato de Celdas de Excel, columnas ordenadas por Fecha, Cuenta, Categoría, Subcategoría, Concepto, Notas, Etiquetas y Montos debidamente formateados con moneda.

### 8.2. Exportación a PDF
En los módulos correspondientes, puedes generar copias imprimibles o descargables en formato `.pdf` con diseño limpio para declaraciones contables, revisiones personales o auditorías domésticas.

---

## 9. Módulo 7: Preferencias y Personalización

En la sección **"Configuración"** puedes personalizar tu experiencia de usuario:
- **Tema Visual:** Alterna entre el **Modo Oscuro (*Dark Mode*)** —ideal para ambientes de baja luz y ahorro de batería— y el **Modo Claro (*Light Mode*)**.
- **Moneda Base:** Define si tu divisa preferida de despliegue general es MXN o USD.
- **Datos de Perfil:** Consulta el correo de la cuenta autenticada y gestiona tu sesión activa.

---

## 10. Preguntas Frecuentes (FAQ)

### ¿Qué pasa si elimino un movimiento por error?
Al eliminar un movimiento, FinTrack automáticamente revierte el saldo sumando o restando el importe de la cuenta original para mantener la exactitud contable de tu banco.

### ¿Las transferencias entre cuentas cuentan como gasto?
**No.** Una transferencia (por ejemplo, transferir $2,000 de BBVA a Santander) no disminuye ni aumenta tu dinero total; simplemente mueve el balance de una cuenta a otra sin alterar tus métricas de gasto mensual ni tu patrimonio neto.

### ¿Cómo se calculan los saldos de tarjetas de crédito?
Las tarjetas de crédito se comportan como pasivos. Si registras un gasto pagado con tarjeta de crédito, el saldo de la tarjeta incrementa (tu deuda aumenta) y tu patrimonio neto global disminuye en esa proporción. Cuando registras una transferencia de tu débito a la tarjeta de crédito, tu deuda disminuye.

### ¿Se pueden usar decimales y centavos?
Sí. FinTrack trabaja con precisión decimal estándar para registrar pagos y saldos exactos al centavo.

