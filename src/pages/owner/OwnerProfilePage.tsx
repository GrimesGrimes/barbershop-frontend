import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import usersApi, { type UpdateBarbershopRequest, type UpdateProfileRequest } from '../../api/users';
import type { Gender, NotificationChannel } from '../../api/types';
import OwnerLayout from '../../components/layout/OwnerLayout';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

type TabKey = 'data' | 'business' | 'prefs' | 'security';

const OwnerProfilePage: React.FC = () => {
  const queryClient = useQueryClient();

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<TabKey>('data');

  const actionsRef = useRef<HTMLDetailsElement | null>(null);
  const closeActions = () => {
    if (actionsRef.current) actionsRef.current.open = false;
  };

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['owner-profile'],
    queryFn: usersApi.getMe,
  });

  // Get barbershop data from the user's profile
  const barbershop = profile?.barbershop;
  const barbershopLoading = profileLoading; // Use the same loading state as profile

  const [profileData, setProfileData] = useState<UpdateProfileRequest>({
    fullName: '',
    phone: '',
    gender: 'MALE' as Gender,
    notificationChannel: 'WHATSAPP' as NotificationChannel,
    marketingOptIn: false,
  });

  const [barbershopData, setBarbershopData] = useState<UpdateBarbershopRequest>({
    name: '',
    address: '',
    description: '',
    openTime: '09:00',
    closeTime: '18:00',
    slotMinutes: 30,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
  });

  useEffect(() => {
    if (!profile) return;
    setProfileData({
      fullName: profile.fullName || '',
      phone: profile.phone || '',
      gender: (profile.gender as Gender) || ('MALE' as Gender),
      notificationChannel: (profile.notificationChannel as NotificationChannel) || ('WHATSAPP' as NotificationChannel),
      marketingOptIn: !!profile.marketingOptIn,
    });
  }, [profile]);

  useEffect(() => {
    if (!barbershop) return;
    setBarbershopData({
      name: barbershop.name || '',
      address: barbershop.address || '',
      description: barbershop.description || '',
      openTime: barbershop.openTime || '09:00',
      closeTime: barbershop.closeTime || '18:00',
      slotMinutes: barbershop.slotMinutes || 30,
    });
  }, [barbershop]);

  const isLoading = profileLoading || barbershopLoading;

  const initials = useMemo(() => {
    const name = (profile?.fullName || 'A').trim();
    const parts = name.split(/\s+/).filter(Boolean);
    const a = parts[0]?.[0] ?? 'A';
    const b = parts[1]?.[0] ?? '';
    return (a + b).toUpperCase();
  }, [profile?.fullName]);

  const updateProfileMutation = useMutation({
    mutationFn: usersApi.updateMe,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-profile'] });
      setSuccess('Perfil actualizado correctamente');
      setError('');
    },
    onError: (err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar perfil';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || errorMessage);
      } else {
        setError(errorMessage);
      }
      setSuccess('');
    },
  });

  const updateBarbershopMutation = useMutation({
    mutationFn: usersApi.updateBarbershop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-barbershop'] });
      setSuccess('Negocio actualizado correctamente');
      setError('');
    },
    onError: (err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar negocio';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || errorMessage);
      } else {
        setError(errorMessage);
      }
      setSuccess('');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: usersApi.changePassword,
    onSuccess: () => {
      setSuccess('Contraseña actualizada correctamente');
      setError('');
      setPasswordData({ currentPassword: '', newPassword: '' });
    },
    onError: (err: unknown) => {
      const errorMessage = err instanceof Error ? err.message : 'Error al cambiar contraseña';
      if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || errorMessage);
      } else {
        setError(errorMessage);
      }
      setSuccess('');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // FIX: spread correcto (tu archivo actual tiene un objeto inválido) :contentReference[oaicite:5]{index=5}
    const dataToSend: UpdateProfileRequest = { ...profileData };

    if (!dataToSend.phone || dataToSend.phone.trim() === '') dataToSend.phone = null;
    if ((dataToSend as any).birthDate === '') (dataToSend as any).birthDate = null;

    updateProfileMutation.mutate(dataToSend);
  };

  const handleBarbershopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBarbershopMutation.mutate(barbershopData);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changePasswordMutation.mutate(passwordData);
  };

  const goToTab = (tab: TabKey) => {
    setActiveTab(tab);
    closeActions();
  };

  return (
    <OwnerLayout>
      <div className="owner-profile-page mx-auto flex flex-col gap-6">
        <div className="owner-home__header">
          <h1 className="owner-home__title">Perfil</h1>
          <p className="owner-home__subtitle">Gestiona tus datos, negocio, preferencias y seguridad.</p>
        </div>

        {error && <div className="owner-alert owner-alert--error">{error}</div>}
        {success && <div className="owner-alert owner-alert--success">{success}</div>}

        <section className="owner-profile-hero p-6 rounded-2xl relative">
          <div className="owner-profile-hero__row">
            <div className="owner-profile-hero__left">
              <div className="owner-profile-hero__avatar" aria-hidden="true">{initials}</div>

              <div className="owner-profile-hero__text">
                <div className="owner-profile-hero__name-row">
                  <h2 className="owner-profile-hero__name">{profile?.fullName || '—'}</h2>
                </div>

                <div className="owner-profile-hero__meta">
                  <span>{profile?.email || '—'}</span>
                  {profile?.phone ? (
                    <>
                      <span className="owner-profile-hero__dot">•</span>
                      <span>{profile.phone}</span>
                    </>
                  ) : null}
                </div>

                <div className="owner-profile-hero__badges">
                  <span className="owner-badge owner-badge--primary">PROPIETARIO</span>
                  <span className={`owner-badge ${profile?.emailVerified ? 'owner-badge--success' : 'owner-badge--error'}`}>
                    {profile?.emailVerified ? 'EMAIL VERIFICADO' : 'EMAIL SIN VERIFICAR'}
                  </span>
                </div>
              </div>
            </div>

            <div className="owner-profile-actions">
              <details ref={actionsRef}>
                <summary className="owner-icon-btn flex items-center justify-center border-0 list-none" aria-label="Opciones">⋯</summary>
                <div className="owner-menu right-0" role="menu">
                  <button type="button" className="owner-menu-item" onClick={() => goToTab('data')}>Editar datos</button>
                  <button type="button" className="owner-menu-item" onClick={() => goToTab('business')}>Editar negocio</button>
                  <button type="button" className="owner-menu-item" onClick={() => goToTab('prefs')}>Preferencias</button>
                  <button type="button" className="owner-menu-item" onClick={() => goToTab('security')}>Seguridad</button>
                </div>
              </details>
            </div>
          </div>
        </section>

        <nav className="tabs" aria-label="Secciones del perfil">
          <button type="button" className={`tab ${activeTab === 'data' ? 'active' : ''}`} onClick={() => setActiveTab('data')}>
            Datos
          </button>
          <button type="button" className={`tab ${activeTab === 'business' ? 'active' : ''}`} onClick={() => setActiveTab('business')}>
            Negocio
          </button>
          <button type="button" className={`tab ${activeTab === 'prefs' ? 'active' : ''}`} onClick={() => setActiveTab('prefs')}>
            Preferencias
          </button>
          <button type="button" className={`tab ${activeTab === 'security' ? 'active' : ''}`} onClick={() => setActiveTab('security')}>
            Seguridad
          </button>
        </nav>

        {isLoading ? (
          <div className="owner-home__loading">
            <span className="owner-home__loading-text">Cargando perfil...</span>
          </div>
        ) : (
          <>
            {activeTab === 'data' && (
              <section className="admin-card">
                <div className="mb-6">
                  <div>
                    <h3 className="admin-card__title">Datos personales</h3>
                    <p className="admin-card__subtitle">Actualiza tu información principal.</p>
                  </div>
                </div>

                <form className="owner-form" onSubmit={handleProfileSubmit}>
                  <Input
                    name="fullName"
                    label="Nombre completo"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    required
                  />

                  <Input
                    name="email"
                    label="Correo electrónico"
                    value={profile?.email || ''}
                    disabled
                    helperText="Tu correo principal. No se puede modificar."
                  />

                  <Input
                    name="phone"
                    label="Teléfono (opcional)"
                    value={profileData.phone || ''}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="Ej: 999888777"
                  />

                  <Select
                    name="gender"
                    label="Género"
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value as Gender })}
                    options={[
                      { value: 'MALE', label: 'Masculino' },
                      { value: 'FEMALE', label: 'Femenino' },
                      { value: 'OTHER', label: 'Otro' },
                      { value: 'PREFER_NOT_TO_SAY', label: 'Prefiero no decirlo' },
                    ]}
                  />

                  <div className="mt-2">
                    <Button type="submit" variant="primary" isLoading={updateProfileMutation.isPending}>
                      Guardar cambios
                    </Button>
                  </div>
                </form>
              </section>
            )}

            {activeTab === 'business' && (
              <section className="admin-card">
                <div className="mb-6">
                  <div>
                    <h3 className="admin-card__title">Negocio</h3>
                    <p className="admin-card__subtitle">Configura datos visibles para tus clientes.</p>
                  </div>
                </div>

                <form className="owner-form" onSubmit={handleBarbershopSubmit}>
                  <Input
                    name="name"
                    label="Nombre del negocio"
                    value={barbershopData.name}
                    onChange={(e) => setBarbershopData({ ...barbershopData, name: e.target.value })}
                    required
                  />

                  <Input
                    name="address"
                    label="Dirección"
                    value={barbershopData.address}
                    onChange={(e) => setBarbershopData({ ...barbershopData, address: e.target.value })}
                  />

                  <div className="owner-field">
                    <div className="owner-label">Descripción</div>
                    <textarea
                      className="form-textarea owner-textarea"
                      value={barbershopData.description || ''}
                      onChange={(e) => setBarbershopData({ ...barbershopData, description: e.target.value })}
                      placeholder="Breve descripción del negocio"
                    />
                  </div>

                  <div className="owner-two-cols">
                    <Input
                      name="openTime"
                      label="Hora apertura"
                      type="time"
                      value={barbershopData.openTime}
                      onChange={(e) => setBarbershopData({ ...barbershopData, openTime: e.target.value })}
                      required
                    />
                    <Input
                      name="closeTime"
                      label="Hora cierre"
                      type="time"
                      value={barbershopData.closeTime}
                      onChange={(e) => setBarbershopData({ ...barbershopData, closeTime: e.target.value })}
                      required
                    />
                  </div>

                  <Input
                    name="slotMinutes"
                    label="Duración de turno (minutos)"
                    type="number"
                    value={barbershopData.slotMinutes}
                    onChange={(e) => setBarbershopData({ ...barbershopData, slotMinutes: Number(e.target.value) })}
                    required
                    min={5}
                    step={5}
                  />

                  <div className="mt-2">
                    <Button type="submit" variant="primary" isLoading={updateBarbershopMutation.isPending}>
                      Guardar cambios
                    </Button>
                  </div>
                </form>
              </section>
            )}

            {activeTab === 'prefs' && (
              <section className="admin-card">
                <div className="mb-6">
                  <div>
                    <h3 className="admin-card__title">Preferencias</h3>
                    <p className="admin-card__subtitle">Canales y comunicaciones.</p>
                  </div>
                </div>

                <form className="owner-form" onSubmit={handleProfileSubmit}>
                  <Select
                    name="notificationChannel"
                    label="Canal de notificación"
                    value={profileData.notificationChannel}
                    onChange={(e) => setProfileData({ ...profileData, notificationChannel: e.target.value as NotificationChannel })}
                    options={[
                      { value: 'WHATSAPP', label: 'WhatsApp' },
                      { value: 'SMS', label: 'SMS' },
                      { value: 'EMAIL', label: 'Email' },
                    ]}
                  />

                  <label className="owner-switch">
                    <input
                      type="checkbox"
                      checked={!!profileData.marketingOptIn}
                      onChange={(e) => setProfileData({ ...profileData, marketingOptIn: e.target.checked })}
                    />
                    Acepto recibir comunicaciones promocionales
                  </label>

                  <div className="mt-2">
                    <Button type="submit" variant="primary" isLoading={updateProfileMutation.isPending}>
                      Guardar cambios
                    </Button>
                  </div>
                </form>
              </section>
            )}

            {activeTab === 'security' && (
              <section className="admin-card">
                <div className="mb-6">
                  <div>
                    <h3 className="admin-card__title">Seguridad</h3>
                    <p className="admin-card__subtitle">Actualiza tu contraseña.</p>
                  </div>
                </div>

                <form className="owner-form" onSubmit={handlePasswordSubmit}>
                  <Input
                    name="currentPassword"
                    label="Contraseña actual"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                  />
                  <Input
                    name="newPassword"
                    label="Nueva contraseña"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    required
                  />

                  <div className="mt-2">
                    <Button type="submit" variant="primary" isLoading={changePasswordMutation.isPending}>
                      Actualizar contraseña
                    </Button>
                  </div>
                </form>
              </section>
            )}
          </>
        )}
      </div>
    </OwnerLayout>
  );
};

export default OwnerProfilePage;
