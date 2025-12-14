// NewBookingPage.tsx
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import bookingsApi from "../../api/bookings";
import { useAuth } from "../../context/AuthContext";
import ClientLayout from "../../components/layout/ClientLayout";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";

type Slot = { startTime: string; endTime: string };

const toLocalISODate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const NewBookingPage: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();

  const today = toLocalISODate(new Date());

  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const isEmailVerified = user?.emailVerified || false;

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: bookingsApi.getServices,
  });

  const {
    data: slots = [],
    isLoading: loadingSlots,
    refetch: refetchSlots,
  } = useQuery<Slot[]>({
    queryKey: ["available-slots", selectedDate],
    queryFn: () => bookingsApi.getAvailableSlots(selectedDate),
    enabled: !!selectedDate,
  });

  const createBookingMutation = useMutation({
    mutationFn: bookingsApi.createBooking,
    onSuccess: () => {
      setSuccessMessage("¡Reserva creada exitosamente!");
      setSelectedSlot(null);
      setNotes("");
      setError("");
      refetchSlots();
      queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
    },
    onError: (err: unknown) => {
      let errorMessage = err instanceof Error ? err.message : "Error al crear reserva";
      let errorCode: string | undefined;

      if (typeof err === "object" && err !== null && "response" in err) {
        const axiosError = err as { response?: { data?: { message?: string; code?: string } } };
        errorMessage = axiosError.response?.data?.message || errorMessage;
        errorCode = axiosError.response?.data?.code;
      }

      setSuccessMessage("");
      setError(errorCode === "EMAIL_NOT_VERIFIED" ? "EMAIL_NOT_VERIFIED" : errorMessage);
    },
  });

  useEffect(() => {
    if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }, [services, selectedServiceId]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    setSelectedSlot(null);
    setSuccessMessage("");
    setError("");
  };

  const handleSlotClick = (slotTime: string) => {
    setSelectedSlot(slotTime);
    setSuccessMessage("");
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !selectedServiceId || !isEmailVerified) return;

    createBookingMutation.mutate({
      serviceId: selectedServiceId,
      startTime: selectedSlot,
      notes: notes || undefined,
    });
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <ClientLayout title="Reservar" subtitle="Selecciona fecha, servicio y un horario disponible.">
      <div className="client-page">
        <div className="card client-booking-create">
          {/* Bloqueo por verificación */}
          {!isEmailVerified && (
            <div className="alert alert-warning client-booking-create__banner">
              <div className="client-booking-create__banner-title">
                Verificación de correo requerida
              </div>
              <div className="client-booking-create__banner-text">
                Para reservar, primero verifica tu correo: <strong>{user?.email}</strong>
              </div>

              <Link
                to="/verify-email"
                state={{ from: location.pathname }}
                className="client-booking-create__banner-link"
              >
                Verificar correo ahora
              </Link>
            </div>
          )}

          {/* Mensajes */}
          {error && error !== "EMAIL_NOT_VERIFIED" && (
            <div className="alert alert-error">{error}</div>
          )}

          {error === "EMAIL_NOT_VERIFIED" && (
            <div className="alert alert-warning">
              <strong>Verificación requerida.</strong> Debes verificar tu correo para poder reservar.
              <div style={{ marginTop: 8 }}>
                <Link to="/verify-email" state={{ from: location.pathname }} className="client-booking-create__inline-link">
                  Ir a verificación
                </Link>
              </div>
            </div>
          )}

          {successMessage && <div className="alert alert-success">{successMessage}</div>}

          <form onSubmit={handleSubmit} className="client-booking-create__form">
            <Input
              label="Fecha"
              type="date"
              name="date"
              value={selectedDate}
              onChange={handleDateChange}
              min={today}
              required
            />

            <Select
              label="Servicio"
              name="service"
              value={selectedServiceId}
              onChange={(e) => setSelectedServiceId(e.target.value)}
              options={services.map((s) => ({
                value: s.id,
                label: `${s.name} - S/ ${s.price}`,
              }))}
            />

            <div className="client-booking-create__slots">
              <div className="client-booking-create__slots-label">Horarios disponibles</div>

              {loadingSlots ? (
                <div className="client-center">
                  <div className="spinner" aria-label="Cargando horarios" />
                </div>
              ) : slots.length === 0 ? (
                <div className="client-booking-create__slots-empty">
                  <div>No hay horarios disponibles para esta fecha.</div>
                  <div className="client-booking-create__slots-empty-sub">
                    Prueba seleccionando otro día.
                  </div>
                </div>
              ) : (
                <div className="slot-grid">
                  {slots.map((slot) => {
                    const start = formatTime(slot.startTime);
                    const end = formatTime(slot.endTime);
                    const label = `${start} - ${end}`;
                    const active = selectedSlot === slot.startTime;

                    return (
                      <button
                        key={slot.startTime}
                        type="button"
                        onClick={() => handleSlotClick(slot.startTime)}
                        className={`slot-btn ${active ? "slot-btn--active" : ""}`}
                        aria-pressed={active}
                        disabled={!isEmailVerified}
                        title={!isEmailVerified ? "Verifica tu correo para reservar" : "Seleccionar horario"}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="client-booking-create__notes">
              <label className="client-booking-create__notes-label">Notas (opcional)</label>
              <textarea
                name="notes"
                rows={2}
                placeholder="Ej: Quiero el corte más corto de lo usual"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="client-booking-create__notes-textarea"
              />
            </div>

            <Button
              type="submit"
              isLoading={createBookingMutation.isPending}
              disabled={!selectedSlot || !selectedServiceId || !isEmailVerified}
              className="w-full"
            >
              {isEmailVerified ? "Reservar cita" : "Verifica tu correo para reservar"}
            </Button>
          </form>
        </div>
      </div>
    </ClientLayout>
  );
};

export default NewBookingPage;
