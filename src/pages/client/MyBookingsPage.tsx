import React from "react";
import { useQuery } from "@tanstack/react-query";
import bookingsApi from "../../api/bookings";
import type { BookingStatus } from "../../api/types";
import ClientLayout from "../../components/layout/ClientLayout";

const statusLabels: Record<BookingStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  CANCELLED: "Cancelada",
  COMPLETED: "Completada",
};

const statusBadgeClass: Record<BookingStatus, string> = {
  PENDING: "status-badge status-badge--pending",
  CONFIRMED: "status-badge status-badge--confirmed",
  COMPLETED: "status-badge status-badge--completed",
  CANCELLED: "status-badge status-badge--cancelled",
};

const MyBookingsPage: React.FC = () => {
  const { data: bookings = [], isLoading, error } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: bookingsApi.getMyBookings,
  });

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // UI helper (no cambia lógica de negocio): parte hora y sufijo AM/PM sin romper "a. m."
  const splitTime = (isoString: string) => {
    const full = formatTime(isoString);
    const idx = full.indexOf(" ");
    if (idx === -1) return { time: full, suffix: "" };
    return {
      time: full.slice(0, idx),
      suffix: full.slice(idx + 1).trim().toUpperCase(),
    };
  };

  return (
    <ClientLayout
      title="Mis Reservas"
      subtitle="Revisa tu historial y el estado de tus citas."
    >
      <div className="client-page">
        {isLoading && (
          <div className="client-center">
            <div className="spinner text-primary" aria-label="Cargando" />
          </div>
        )}

        {!isLoading && error && (
          <div className="alert alert-error">Error al cargar las reservas</div>
        )}

        {!isLoading && !error && (
          <>
            {bookings.length === 0 ? (
              <div className="client-empty card">
                <div className="client-empty__icon">📅</div>
                <p className="client-empty__title">Aún no tienes reservas</p>
                <p className="client-empty__subtitle">
                  Cuando reserves una cita, aparecerá aquí con su estado.
                </p>
              </div>
            ) : (
              <div className="client-bookings-list">
                {bookings.map((booking) => {
                  const start = splitTime(booking.startTime);
                  const end = splitTime(booking.endTime);

                  return (
                    <article
                      key={booking.id}
                      className={`client-booking-card client-booking-card--${booking.status.toLowerCase()}`}
                    >
                      <div className="client-booking-card__inner">
                        <div className="client-booking-time">
                          <span className="client-booking-time__main">
                            {start.time}
                          </span>
                          {start.suffix && (
                            <span className="client-booking-time__suffix">
                              {start.suffix}
                            </span>
                          )}
                        </div>

                        <div className="client-booking-content">
                          <div className="client-booking-top">
                            <p className="client-booking-service">
                              {booking.service?.name || "Servicio"}
                            </p>
                            <span className={statusBadgeClass[booking.status]}>
                              {statusLabels[booking.status]}
                            </span>
                          </div>

                          <div className="client-booking-meta">
                            <span className="client-booking-meta__item">
                              {formatDate(booking.startTime)}
                            </span>
                            <span className="client-booking-meta__dot">•</span>
                            <span className="client-booking-meta__item">
                              {start.time} {start.suffix} – {end.time}{" "}
                              {end.suffix}
                            </span>
                          </div>

                          {booking.notes && (
                            <div className="client-booking-notes">
                              <span className="client-booking-notes__label">
                                Notas:
                              </span>{" "}
                              {booking.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </ClientLayout>
  );
};

export default MyBookingsPage;
