import React, { useState } from "react";
import {
    useQuery,
    useMutation,
    useQueryClient,
} from "@tanstack/react-query";
import bookingsApi, { type BookingStatus } from "../../api/bookings";
import type { Booking } from "../../api/types";
import Button from "../../components/ui/Button"; // Usado para Confirmar/Rechazar

import OwnerLayout from "../../components/layout/OwnerLayout"; // Layout principal

const OwnerBookingsPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [date, setDate] = useState<string>("");
    const [status, setStatus] = useState<BookingStatus | "">("");

    // --- Lógica y Queries (SIN ALTERAR) ---
    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ["owner-bookings", { date: date || null, status }],
        queryFn: () =>
            bookingsApi.getOwnerBookings({
                date: date || undefined,
                status: status || undefined,
            }),
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: BookingStatus }) =>
            bookingsApi.updateBookingStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-bookings"] });
        },
    });

    const handleChangeStatus = (id: string, next: BookingStatus) => {
        updateStatusMutation.mutate({ id, status: next });
    };

    const capitalizeWords = (text: string) =>
        text
            .toLowerCase()
            .split(" ")
            .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ""))
            .join(" ");

    const getHeaderDateLabel = () => {
        if (date) {
            const [year, month, day] = date.split("-").map(Number);
            const d = new Date(year, month - 1, day);
            const base = d.toLocaleDateString("es-PE", {
                weekday: "long",
                day: "numeric",
                month: "long",
            });
            return capitalizeWords(base);
        }

        const today = new Date();
        const base = today.toLocaleDateString("es-PE", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
        return capitalizeWords(base);
    };

    const formatDateHeader = (dateKey: string) => {
        const [year, month, day] = dateKey.split("-").map(Number);
        const d = new Date(year, month - 1, day);
        const base = d.toLocaleDateString("es-PE", {
            weekday: "long",
            day: "numeric",
            month: "long",
        });
        return capitalizeWords(base);
    };

    const groupBookingsByDate = (bookings: Booking[]) => {
        const groups: Record<string, Booking[]> = {};

        bookings.forEach((b) => {
            const d = new Date(b.startTime);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const day = String(d.getDate()).padStart(2, "0");
            const key = `${year}-${month}-${day}`;

            if (!groups[key]) groups[key] = [];
            groups[key].push(b);
        });

        return Object.entries(groups).sort(
            ([a], [b]) => new Date(a).getTime() - new Date(b).getTime()
        );
    };

    const groupedBookings = groupBookingsByDate(bookings);

    // NOTA: Se ha modificado ligeramente getStatusBadge para usar clases del nuevo diseño
    const getStatusBadge = (bookingStatus: string) => {
        const labels: Record<string, string> = {
            PENDING: "Pendiente",
            CONFIRMED: "Confirmada",
            COMPLETED: "Completada",
            CANCELLED: "Cancelada",
        };
        // CLASES CSS DEL NUEVO DISEÑO (Pills)
        const styles: Record<string, string> = {
            PENDING: "status-pill status-pending",
            CONFIRMED: "status-pill status-confirmed",
            COMPLETED: "status-pill status-completed",
            CANCELLED: "status-pill status-cancelled",
        };

        return (
            <span className={styles[bookingStatus] || "status-pill"}>
                {labels[bookingStatus] || bookingStatus}
            </span>
        );
    };

    const headerSubtitle = date
        ? `Agenda para ${getHeaderDateLabel()}`
        : `Mostrando reservas desde ${getHeaderDateLabel()} en adelante`;
    // --- FIN Lógica y Queries ---

    return (
        // NOTA: Se asume que OwnerLayout tiene el header/cerrar sesión, como en el código original.
        <OwnerLayout title="Reservas" subtitle={headerSubtitle}>
            <div className="owner-page container">

                {/*
          =============================================
          1. FILTROS (Rediseño: Separación de Tabs y Select)
          =============================================
        */}
                <section className="filters-section">
                    {/* Tabs/Chips de Filtro de Estado (Nuevo Componente Estructural) */}
                    <div className="tabs">
                        {/* El estado actual ('status') se maneja con los botones, NO con el Select original */}
                        <button
                            className={`tab ${status === "" ? "active" : ""}`}
                            onClick={() => setStatus("")}
                        >
                            Todos
                        </button>
                        <button
                            className={`tab ${status === "PENDING" ? "active" : ""}`}
                            onClick={() => setStatus("PENDING")}
                        >
                            Pendientes
                        </button>
                        <button
                            className={`tab ${status === "CONFIRMED" ? "active" : ""}`}
                            onClick={() => setStatus("CONFIRMED")}
                        >
                            Confirmadas
                        </button>
                        <button
                            className={`tab ${status === "COMPLETED" ? "active" : ""}`}
                            onClick={() => setStatus("COMPLETED")}
                        >
                            Historial
                        </button>
                        {/* El filtro 'CANCELLED' puede ser una pestaña o dejarlo solo en 'Todos' */}
                    </div>

                    {/* Filtro de Fecha (Se mantiene como input de fecha) */}
                    <div className="filter-date">
                        <label className="filter-date__label">Fecha</label>
                        <div className="filter-date__input-group">
                            <input
                                type="date"
                                className="owner-input date-input"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                            {date && (
                                <button
                                    type="button"
                                    className="owner-link clear-date-btn"
                                    onClick={() => setDate("")}
                                >
                                    Limpiar
                                </button>
                            )}
                        </div>
                    </div>

                    {/* NOTA: El componente Select de 'Estado' original se ha eliminado visualmente 
             y su funcionalidad se ha movido a los 'Tabs' de arriba para mejorar la UX móvil. */}
                </section>

                {/*
          =============================================
          2. LISTA DE RESERVAS (Rediseño de Tarjeta)
          =============================================
        */}
                <section className="owner-bookings">
                    {isLoading && (
                        <div className="owner-page__loading">Cargando reservas...</div>
                    )}

                    {!isLoading && groupedBookings.length === 0 && (
                        <div className="owner-page__empty">
                            No hay reservas para el criterio seleccionado.
                        </div>
                    )}

                    {!isLoading &&
                        groupedBookings.map(([dateKey, bookingsOfDay]) => (
                            <div key={dateKey} className="date-group">
                                <h2 className="date-separator">
                                    {formatDateHeader(dateKey)}
                                </h2>

                                <div className="booking-list">
  {bookingsOfDay.map((b) => {
    const startDate = new Date(b.startTime);
    const fullTime = startDate.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const [timeText, ampmRaw] = fullTime.split(" "); // "09:00 a. m."
    const ampm = (ampmRaw ?? "").toUpperCase();      // "A. M."

    return (
      <article
        key={b.id}
        className={`reservation-card ${b.status.toLowerCase()}`}
      >
        {/* COLUMNA IZQUIERDA: HORA */}
        <div className="card-header-redesign">
          <span className="time-main">{timeText}</span>
          <span className="time-ampm">{ampm}</span>
        </div>

        {/* COLUMNA CENTRAL: CLIENTE + SERVICIO + PRECIO + TELÉFONO */}
        <div className="details-redesign">
          <p className="booking-client-name">
            {b.client?.fullName ?? "Cliente sin nombre"}
          </p>

          <div className="booking-service-row">
            <span className="booking-service-name">
              {b.service?.name ?? "Servicio sin nombre"}
            </span>

            {typeof b.service?.price === "number" && (
              <>
                <span className="booking-service-separator">|</span>
                <span className="price-pill">
                  S/. {b.service?.price}
                </span>
              </>
            )}
          </div>

          <div className="booking-phone-row">
            <span className="booking-phone-icon">⚠</span>
            <span className="booking-phone-text">
              Sin teléfono registrado
            </span>
          </div>

          {b.notes && (
            <div className="booking-card__notes notes-redesign">
              💬 {b.notes}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: ACCIONES / ESTADO */}
        <div className="actions-redesign">
          {/* PENDIENTE -> botones como en tu diseño */}
          {b.status === "PENDING" && (
            <>
              <Button
                size="sm"
                variant="outline"
                className="simple-btn-redesign reject-btn-redesign"
                onClick={() => handleChangeStatus(b.id, "CANCELLED")}
              >
                Rechazar
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="outline-btn-redesign"
                onClick={() =>
                  alert("Aquí luego implementamos el modal de reprogramación 😉")
                }
              >
                Reprogramar
              </Button>

              <Button
                size="sm"
                className="confirm-btn-redesign"
                onClick={() => handleChangeStatus(b.id, "CONFIRMED")}
              >
                Confirmar
              </Button>
            </>
          )}

          {/* CONFIRMADA -> completar / reprogramar / cancelar */}
          {b.status === "CONFIRMED" && (
            <>
              <Button
                size="sm"
                className="complete-btn-redesign"
                onClick={() => handleChangeStatus(b.id, "COMPLETED")}
              >
                Completar
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="outline-btn-redesign"
                onClick={() =>
                  alert("Aquí luego implementamos el modal de reprogramación 😉")
                }
              >
                Reprogramar
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="simple-btn-redesign cancel-btn-redesign"
                onClick={() => handleChangeStatus(b.id, "CANCELLED")}
              >
                Cancelar
              </Button>
            </>
          )}

          {/* COMPLETADA / CANCELADA -> solo pill de estado a la derecha */}
          {(b.status === "COMPLETED" || b.status === "CANCELLED") && (
            <div className="status-only-wrapper">
              {getStatusBadge(b.status)}
            </div>
          )}
        </div>
      </article>
    );
  })}
</div>

                            </div>
                        ))}
                </section>
            </div>
        </OwnerLayout>
    );
};

export default OwnerBookingsPage;