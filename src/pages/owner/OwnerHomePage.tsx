import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import statsApi from "../../api/stats";
import Select from "../../components/ui/Select";
import OwnerLayout from "../../components/layout/OwnerLayout";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine, PieChart, Pie, Cell, Legend
} from "recharts";

const OwnerHomePage: React.FC = () => {
  // --- LÓGICA INTACTA ---
  const [rangeType, setRangeType] = useState("this_month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const { from, to } = useMemo(() => {
    const now = new Date();
    let fromDate = new Date();
    let toDate = new Date();

    if (rangeType === "today") {
      fromDate = now;
      toDate = now;
    } else if (rangeType === "last_7_days") {
      fromDate.setDate(now.getDate() - 6);
      toDate = now;
    } else if (rangeType === "this_month") {
      fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
      toDate = now;
    } else if (rangeType === "last_month") {
      fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      toDate = new Date(now.getFullYear(), now.getMonth(), 0);
    } else if (rangeType === "custom") {
      return { from: customFrom, to: customTo };
    }

    return {
      from: fromDate.toISOString().split("T")[0],
      to: toDate.toISOString().split("T")[0],
    };
  }, [rangeType, customFrom, customTo]);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["owner-stats", { from, to }],
    queryFn: () => statsApi.getStats(from, to),
    enabled: !!from && !!to,
  });

  const formatCurrency = (amount: number) => `S/. ${amount.toFixed(2)}`;

  // Calculate average revenue for the selected period
  const avgRevenue = useMemo(() => {
    const rows = stats?.revenueByDay ?? [];
    if (!rows.length) return 0;
    const sum = rows.reduce((acc, r) => acc + (Number(r.revenue) || 0), 0);
    return sum / rows.length;
  }, [stats?.revenueByDay]);

  // --- FIN LÓGICA ---

  return (
    <OwnerLayout>
      <div className="owner-home">

        {/* HEADER con título y filtro centrado debajo */}
        <div className="owner-home__header">
          <h1 className="owner-home__title">Panel de Control</h1>
          <p className="owner-home__subtitle">Resumen de rendimiento y agenda.</p>

          {/* Filtro centrado */}
          <div className="owner-home__filter">
            <Select
              name="range"
              label=""
              value={rangeType}
              onChange={(e) => setRangeType(e.target.value)}
              options={[
                { value: "today", label: "Hoy" },
                { value: "last_7_days", label: "Últimos 7 días" },
                { value: "this_month", label: "Este mes" },
                { value: "last_month", label: "Mes pasado" },
                { value: "custom", label: "Personalizado" },
              ]}
            />

            {rangeType === "custom" && (
              <div className="owner-home__custom-dates">
                <input
                  type="date"
                  className="owner-home__date-input"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                />
                <span className="owner-home__date-separator">-</span>
                <input
                  type="date"
                  className="owner-home__date-input"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="owner-home__loading">
            <span className="owner-home__loading-text">Cargando métricas...</span>
          </div>
        ) : !stats ? (
          <div className="owner-home__empty">
            No hay datos para mostrar.
          </div>
        ) : (
          <>

            {/* Métricas de Hoy - Compactas */}
            <div className="bg-gradient-to-br from-[rgba(217,164,65,0.18)] to-[rgba(217,164,65,0.06)] border border-[rgba(217,164,65,0.22)] rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#D9A441] opacity-10 blur-3xl rounded-full translate-x-10 -translate-y-10 pointer-events-none"></div>
              <h3 className="text-[#D9A441] font-semibold mb-4 uppercase text-xs tracking-wider">Resumen de Hoy</h3>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-3xl font-extrabold text-slate-900">{formatCurrency(stats.today.revenue)}</p>
                  <p className="text-sm text-slate-600">Ingresos generados hoy</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-extrabold text-slate-900">
                    {stats.today.completed}
                    <span className="text-sm font-normal text-slate-600">/ {stats.today.bookings}</span>
                  </p>
                  <p className="text-xs text-slate-600">Citas completadas</p>
                </div>
              </div>
            </div>
            {/* Resumen general - Cards estilo imagen */}
            <section className="owner-home__section">
              <div className="owner-home__section-header">
                <h2 className="owner-home__section-title">Resumen general</h2>
                <p className="owner-home__section-desc">Métricas clave del periodo seleccionado.</p>
              </div>

              <div className="summary-cards">
                <div className="summary-card">
                  <div className="summary-card__header">
                    <span className="summary-card__label">INGRESOS</span>
                    <span className="summary-card__icon">💰</span>
                  </div>
                  <div className="summary-card__value">{formatCurrency(stats.summary.revenue)}</div>
                </div>

                <div className="summary-card">
                  <div className="summary-card__header">
                    <span className="summary-card__label">RESERVAS TOTALES</span>
                    <span className="summary-card__icon">📅</span>
                  </div>
                  <div className="summary-card__value">{stats.summary.totalBookings}</div>
                </div>

                <div className="summary-card">
                  <div className="summary-card__header">
                    <span className="summary-card__label">COMPLETADAS</span>
                    <span className="summary-card__icon">✅</span>
                  </div>
                  <div className="summary-card__value">{stats.summary.completedBookings}</div>
                </div>

                <div className="summary-card">
                  <div className="summary-card__header">
                    <span className="summary-card__label">PENDIENTES</span>
                    <span className="summary-card__icon">⏳</span>
                  </div>
                  <div className="summary-card__value">{stats.summary.pendingBookings}</div>
                </div>
              </div>
            </section>

            {/* DASHBOARD GRID PRINCIPAL */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

              {/* COLUMNA IZQUIERDA: Resumen diario (Agenda) */}
              <div className="xl:col-span-1 space-y-6">

                {/* Lista de Próximas Citas */}
                <div className="admin-card h-full flex flex-col">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="admin-card__title">Agenda Restante</h3>
                    <span className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded-md">{new Date().toLocaleDateString('es-PE')}</span>
                  </div>

                  {stats.today.nextBookings.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-8 opacity-60">
                      <div className="text-4xl mb-2">☕</div>
                      <p>Todo listo por hoy</p>
                    </div>
                  ) : (
                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar" style={{ maxHeight: '400px' }}>
                      {stats.today.nextBookings.map((b) => (
                        <div
                          key={b.id}
                          className="group flex items-center gap-4 p-3 rounded-xl border border-[var(--color-border-subtle)] hover:border-[var(--color-primary)] bg-[var(--color-bg)] hover:bg-[var(--color-surface-hover)] transition-all"
                        >
                          {/* Hora */}
                          <div className="flex flex-col items-center justify-center min-w-[3.5rem] h-[3.5rem] bg-[var(--color-surface-soft)] rounded-lg border border-[var(--color-border)] group-hover:border-[var(--color-primary)] group-hover:text-[var(--color-primary)] transition-colors">
                            <span className="text-sm font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                              {new Date(b.startTime).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                            </span>
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-[var(--color-text)] truncate">{b.client?.fullName || "Cliente"}</div>
                            <div className="text-xs text-[var(--color-muted)] truncate">{b.service?.name}</div>
                          </div>

                          {/* Estado (Punto de color) */}
                          <div className={`w-2.5 h-2.5 rounded-full ${b.status === 'PENDING' ? 'bg-amber-400 shadow-sm' :
                            b.status === 'CONFIRMED' ? 'bg-[var(--color-primary)] shadow-sm' : 'bg-gray-400'
                            }`} />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* COLUMNA DERECHA: Gráficas */}
              <div className="xl:col-span-2 space-y-6">

                {/* Gráfico de Ingresos - Ahora usa AREA para verse más lleno */}
                <div className="admin-card">
                  <div className="flex items-start justify-between gap-3 mb-6">
                    <div>
                      <h3 className="admin-card__title">Evolución de Ingresos</h3>
                      <p className="admin-card__subtitle">Comportamiento financiero en el periodo.</p>
                    </div>

                    <span
                      className="
                        text-xs font-semibold px-2.5 py-1 rounded-full
                        border border-[rgba(168, 132, 14, 1)]
                        bg-[var(--color-primary-soft)]
                        text-[var(--color-primary-dark)]
                        whitespace-nowrap
                      "
                      title="Promedio del periodo seleccionado"
                    >
                      Promedio: {formatCurrency(avgRevenue)}
                    </span>
                  </div>

                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={stats.revenueByDay} margin={{ top: 14, right: 12, left: 0, bottom: 4 }}>
                        <defs>
                          {/* Degradado del área */}
                          <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.22} />
                            <stop offset="70%" stopColor="var(--color-primary)" stopOpacity={0.08} />
                            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                          </linearGradient>

                          {/* Sombra sutil para la línea */}
                          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="rgba(0, 76, 255, 0.18)" />
                          </filter>
                        </defs>

                        <CartesianGrid
                          strokeDasharray="2 8"
                          vertical={false}
                          stroke="#E5E5EA"
                          strokeOpacity={0.45}
                        />

                        <XAxis
                          dataKey="date"
                          tickFormatter={(val) => {
                            const d = new Date(val);
                            return `${d.getDate()}/${d.getMonth() + 1}`;
                          }}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#6B7280" }}
                        />

                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: "#6B7280" }}
                          tickMargin={10}
                          width={40}
                          tickFormatter={(v: number) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : `${v}`)}
                        />

                        <ReferenceLine
                          y={avgRevenue}
                          stroke="rgba(212,175,55,0.45)"
                          strokeDasharray="6 6"
                          strokeWidth={1}
                          label={{
                            value: `Prom. ${formatCurrency(avgRevenue)}`,
                            position: "insideTopRight",
                            fill: "var(--color-muted)",
                            fontSize: 12,
                          }}
                        />

                        <Tooltip
                          cursor={{ fill: 'rgba(158, 7, 7, 0.93)' }}
                          contentStyle={{ backgroundColor: "#f4f4f8ff", borderColor: "#D9A441", borderRadius: "8px" }}
                        />

                        <Area
                          dataKey="revenue"
                          stroke="var(--color-primary)"
                          strokeWidth={2}
                          fill="url(#colorRevenue)"
                          fillOpacity={1}
                          filter="url(#softShadow)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Gráfico de Servicios - Circular (Donut) */}
                <div className="admin-card">
                  <div className="mb-6">
                    <h3 className="admin-card__title">Servicios Top</h3>
                    <p className="admin-card__subtitle">Preferencias de tus clientes.</p>
                  </div>

                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          cursor={false}
                          contentStyle={{
                            backgroundColor: "rgba(255,255,255,0.96)",
                            border: "1px solid var(--color-border-subtle)",
                            borderRadius: 12,
                            color: "var(--color-text)",
                            boxShadow: "0 14px 40px rgba(15,23,42,0.10)",
                            backdropFilter: "blur(10px)",
                            WebkitBackdropFilter: "blur(10px)",
                            padding: "10px 12px",
                          }}
                          itemStyle={{ color: "var(--color-primary)", fontWeight: 700 }}
                          formatter={(value: number, _name: string, props: any) => [
                            `${value} reservas`,
                            props?.payload?.serviceName ?? "Servicio",
                          ]}
                        />

                        <Legend
                          verticalAlign="bottom"
                          align="center"
                          iconType="circle"
                          wrapperStyle={{
                            fontSize: 12,
                            color: "var(--color-muted)",
                            paddingTop: 6,
                          }}
                        />

                        <Pie
                          data={stats.bookingsByService as any[]}
                          dataKey="count"
                          nameKey="serviceName"
                          cx="50%"
                          cy="45%"
                          innerRadius={62}
                          outerRadius={88}
                          paddingAngle={2}
                          cornerRadius={10}
                          stroke="rgba(255,255,255,0.65)"
                          strokeWidth={2}
                        >
                          {/* Paleta (variaciones del dorado) */}
                          {stats.bookingsByService?.map((_: any, idx: number) => {
                            const fills = [
                              "rgba(212,175,55,0.95)",
                              "rgba(212,175,55,0.75)",
                              "rgba(212,175,55,0.55)",
                              "rgba(212,175,55,0.40)",
                              "rgba(212,175,55,0.28)",
                              "rgba(212,175,55,0.20)",
                            ];
                            return <Cell key={`cell-${idx}`} fill={fills[idx % fills.length]} />;
                          })}
                        </Pie>

                        {/* Texto central (total) */}
                        <text x="50%" y="43%" textAnchor="middle" dominantBaseline="middle" fill="var(--color-muted)" style={{ fontSize: 12, fontWeight: 600 }}>
                          Total
                        </text>
                        <text x="50%" y="52%" textAnchor="middle" dominantBaseline="middle" fill="var(--color-text)" style={{ fontSize: 18, fontWeight: 800 }}>
                          {stats.bookingsByService?.reduce((acc: number, r: any) => acc + (Number(r.count) || 0), 0) ?? 0}
                        </text>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </OwnerLayout>
  );
};

export default OwnerHomePage;