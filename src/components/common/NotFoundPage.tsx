import { useNavigate } from 'react-router-dom';
import { Button } from 'primereact/button';

export const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: '1rem' }}>
      <i className="pi pi-ban" style={{ fontSize: '4rem', color: 'var(--text-muted)' }} />
      <h2 style={{ color: 'var(--text-primary)', margin: 0 }}>Pagina no encontrada</h2>
      <p style={{ color: 'var(--text-muted)', margin: 0 }}>La ruta solicitada no existe en el sistema.</p>
      <Button label="Ir al Dashboard" icon="pi pi-home" onClick={() => navigate('/dashboard')} />
    </div>
  );
};
