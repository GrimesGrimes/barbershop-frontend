import React, { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import bookingsApi from "../../api/bookings";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import OwnerLayout from "../../components/layout/OwnerLayout";

const OwnerDisabledSlotsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);

  // Form states
  const [reason, setReason] = useState("");
  const [isFullDay, setIsFullDay] = useState(false);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("18:00");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // UI state: menú de opciones (⋯) por item
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Fetch existing blocks
  const { data: blocks = [], isLoading } = useQuery({
    queryKey: ["owner-blocks", selectedDate],
    queryFn: () => bookingsApi.getOwnerBlocks(selectedDate),
  });

  // Create block mutation
  const createBlockMutation = useMutation({
    mutationFn: bookingsApi.createOwnerBlock,
    onSuccess: () => {
      setSuccess("Bloqueo creado exitosamente");
      setReason("");
      setError("");
      setIsFullDay(false);
      queryClient.invalidateQueries({ queryKey: ["owner-blocks", selectedDate] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Error al crear bloqueo");
      setSuccess("");
    },
  });

  // Delete block mutation
  const deleteBlockMutation = useMutation({
    mutationFn: bookingsApi.deleteOwnerBlock,
    onSuccess: () => {
      setOpenMenuId(null);
      queryClient.invalidateQueries({ queryKey: ["owner-blocks", selectedDate] });
    },
    onError: (err: any) => {
      setError(err.response?.data?.message || "Error al eliminar bloqueo");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validación mínima (UI) sin tocar backend
    if (!isFullDay && startTime >= endTime) {
      setError("La hora de inicio debe ser menor que la hora de fin.");
      return;
    }

    createBlockMutation.mutate({
      date: selectedDate,
      fullDay: isFullDay,
      startTime: isFullDay ? undefined : startTime,
      endTime: isFullDay ? undefined : endTime,
      reason: reason || undefined,
    });
  };

  const formatTime = (isoDate: string) =>
    new Date(isoDate).toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const readableDate = useMemo(() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dt = new Date(y, m - 1, d);
    const base = dt.toLocaleDateString("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    return base.charAt(0).toUpperCase() + base.slice(1);
  }, [selectedDate]);

  const totalBlocks = blocks?.length ?? 0;

  const applyPreset = (preset: "LUNCH" | "BREAK" | "MAINTENANCE") => {
    setSuccess("");
    setError("");

    if (preset === "LUNCH") {
      setIsFullDay(false);
      setStartTime("13:00");
      setEndTime("14:00");
      setReason("Almuerzo");
    }
    if (preset === "BREAK") {
      setIsFullDay(false);
      setStartTime("16:00");
      setEndTime("16:30");
      setReason("Pausa");
    }
    if (preset === "MAINTENANCE") {
      setIsFullDay(true);
      setReason("Mantenimiento / Feriado");
    }
  };

  const isBlockFullDay = (block: any) => {
    const dayStart = new Date(selectedDate + "T00:00:00.000-05:00").getTime();
    const dayEnd = new Date(selectedDate + "T23:59:59.999-05:00").getTime();
    const blockStart = new Date(block.startTime).getTime();
    const blockEnd = new Date(block.endTime).getTime();
    return blockStart <= dayStart && blockEnd >= dayEnd;
  };

  const toggleMenu = (id: string) => {
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  return (
    <OwnerLayout
      title="Disponibilidad"
      subtitle={`Bloqueos para ${readableDate}`}
    >
      <div className="owner-page container owner-blocks-page">
        {/* Menú/acciones rápidas alineadas al estilo de tu interfaz */}
        <div className="admin-card owner-blocks-topbar">
          <div>
            <h3 className="admin-card__title">Gestión rápida</h3>
            <p className="admin-card__subtitle">
              Crea bloqueos comunes en 1 clic o configura un rango específico.
            </p>
          </div>

          <div className="owner-blocks-presets">
            <button
              type="button"
              className="owner-preset-btn"
              onClick={() => applyPreset("LUNCH")}
            >
              Almuerzo (13:00–14:00)
            </button>
            <button
              type="button"
              className="owner-preset-btn"
              onClick={() => applyPreset("BREAK")}
            >
              Pausa (16:00–16:30)
            </button>
            <button
              type="button"
              className="owner-preset-btn"
              onClick={() => applyPreset("MAINTENANCE")}
            >
              Día completo
            </button>
          </div>
        </div>

        <div className="owner-blocks-grid">
          {/* Formulario */}
          <section className="admin-card">
            <div className="admin-card__header">
              <div>
                <h3 className="admin-card__title">Agregar bloqueo</h3>
                <p className="admin-card__subtitle">
                  Inhabilita un día completo o un rango horario.
                </p>
              </div>

              <span className="owner-badge">
                {isFullDay ? "Día completo" : "Rango horario"}
              </span>
            </div>

            {error && <div className="owner-alert owner-alert--error">{error}</div>}
            {success && (
              <div className="owner-alert owner-alert--success">{success}</div>
            )}

            <form onSubmit={handleSubmit} className="owner-form">
              <div className="owner-field">
                <label className="owner-label">Fecha</label>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  required
                />
              </div>

              <div className="owner-switch">
                <input
                  type="checkbox"
                  id="fullDay"
                  checked={isFullDay}
                  onChange={(e) => setIsFullDay(e.target.checked)}
                />
                <label htmlFor="fullDay">Bloquear día completo</label>
              </div>

              {!isFullDay && (
                <div className="owner-two-cols">
                  <div className="owner-field">
                    <label className="owner-label">Hora inicio</label>
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>

                  <div className="owner-field">
                    <label className="owner-label">Hora fin</label>
                    <Input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="owner-field">
                <label className="owner-label">Motivo (opcional)</label>
                <Input
                  type="text"
                  placeholder="Ej: Feriado, Almuerzo, Trámite"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                isLoading={createBlockMutation.isPending}
                className="w-full"
              >
                Guardar bloqueo
              </Button>
            </form>
          </section>

          {/* Lista */}
          <section className="admin-card">
            <div className="admin-card__header">
              <div>
                <h3 className="admin-card__title">Bloqueos</h3>
                <p className="admin-card__subtitle">
                  {totalBlocks} registro(s) para {readableDate}.
                </p>
              </div>

              <span className="owner-badge owner-badge--soft">
                {isLoading ? "Cargando..." : "Actualizado"}
              </span>
            </div>

            {isLoading ? (
              <div className="owner-skeleton">Cargando bloqueos...</div>
            ) : totalBlocks === 0 ? (
              <div className="owner-empty">
                No hay bloqueos registrados para este día.
              </div>
            ) : (
              <div className="owner-blocks-list">
                {blocks.map((block: any) => {
                  const full = isBlockFullDay(block);

                  return (
                    <article key={block.id} className="owner-block-item">
                      <div className="owner-block-main">
                        <div className="owner-block-title">
                          <span className={`owner-pill ${full ? "pill-full" : "pill-range"}`}>
                            {full ? "Día completo" : "Rango"}
                          </span>

                          <strong className="owner-block-time">
                            {full
                              ? "Inhabilitado todo el día"
                              : `${formatTime(block.startTime)} – ${formatTime(block.endTime)}`}
                          </strong>
                        </div>

                        {block.reason && (
                          <div className="owner-block-reason">{block.reason}</div>
                        )}
                      </div>

                      {/* Menú de opciones (⋯) */}
                      <div className="owner-block-actions">
                        <button
                          type="button"
                          className="owner-icon-btn"
                          aria-label="Opciones"
                          aria-expanded={openMenuId === block.id}
                          onClick={() => toggleMenu(block.id)}
                        >
                          ⋯
                        </button>

                        {openMenuId === block.id && (
                          <div className="owner-menu">
                            <button
                              type="button"
                              className="owner-menu-item owner-menu-item--danger"
                              onClick={() => {
                                const ok = confirm("¿Eliminar este bloqueo?");
                                if (!ok) return;
                                deleteBlockMutation.mutate(block.id);
                              }}
                              disabled={deleteBlockMutation.isPending}
                            >
                              Eliminar
                            </button>
                          </div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </OwnerLayout>
  );
};

export default OwnerDisabledSlotsPage;
