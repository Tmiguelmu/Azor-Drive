import { useRef, useState, useCallback } from 'react';
import { Button } from 'primereact/button';

export interface UploadedFile {
  id: string;
  nombre: string;
  tipo: 'imagen' | 'pdf' | 'otro';
  base64: string;
  tamanio: number;
}

interface FileUploaderProps {
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  accept?: string;
  label?: string;
}

const getFileTipo = (file: File): 'imagen' | 'pdf' | 'otro' => {
  if (file.type.startsWith('image/')) return 'imagen';
  if (file.type === 'application/pdf') return 'pdf';
  return 'otro';
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const FILE_ICONS: Record<'imagen' | 'pdf' | 'otro', string> = {
  imagen: 'pi pi-image',
  pdf: 'pi pi-file-pdf',
  otro: 'pi pi-file',
};

const FILE_COLORS: Record<'imagen' | 'pdf' | 'otro', string> = {
  imagen: 'var(--color-info)',
  pdf: 'var(--color-danger)',
  otro: 'var(--color-primary-500)',
};

/**
 * Componente reutilizable de carga de archivos con drag & drop.
 * Almacena los archivos como base64 en el estado (es mockup).
 * Principio SRP: solo maneja la logica de subida de archivos.
 */
export const FileUploader = ({
  files,
  onChange,
  maxFiles = 10,
  accept = 'image/*,application/pdf',
  label = 'Arrastra archivos aqui o haz clic para seleccionar',
}: FileUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFiles = useCallback(
    async (rawFiles: File[]) => {
      const remaining = maxFiles - files.length;
      const toProcess = rawFiles.slice(0, remaining);

      const newFiles: UploadedFile[] = await Promise.all(
        toProcess.map(
          (file) =>
            new Promise<UploadedFile>((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                resolve({
                  id: `${Date.now()}-${Math.random().toString(36).substring(2)}`,
                  nombre: file.name,
                  tipo: getFileTipo(file),
                  base64: e.target?.result as string,
                  tamanio: file.size,
                });
              };
              reader.readAsDataURL(file);
            })
        )
      );

      onChange([...files, ...newFiles]);
    },
    [files, maxFiles, onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = Array.from(e.dataTransfer.files);
      processFiles(dropped);
    },
    [processFiles]
  );

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const removeFile = (id: string) => {
    onChange(files.filter((f) => f.id !== id));
  };

  return (
    <div>
      {/* Zona drag & drop */}
      {files.length < maxFiles && (
        <div
          className={`file-drop-zone ${isDragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={accept}
            style={{ display: 'none' }}
            onChange={handleInput}
          />
          <div className="file-drop-zone-icon">
            <i className="pi pi-cloud-upload" />
          </div>
          <div className="file-drop-zone-text">{label}</div>
          <div className="file-drop-zone-sub">
            Imagenes (JPG, PNG, WEBP) y PDF &bull; Max {maxFiles} archivos
          </div>
        </div>
      )}

      {/* Preview grid */}
      {files.length > 0 && (
        <div className="file-preview-grid">
          {files.map((file) => (
            <div key={file.id} className="file-preview-item">
              {file.tipo === 'imagen' ? (
                <img src={file.base64} alt={file.nombre} className="file-preview-thumb" />
              ) : (
                <div className="file-preview-icon-area">
                  <i
                    className={FILE_ICONS[file.tipo]}
                    style={{ color: FILE_COLORS[file.tipo] }}
                  />
                </div>
              )}
              <div className="file-preview-info">
                <div className="file-preview-name" title={file.nombre}>
                  {file.nombre}
                </div>
                <div className="file-preview-type">
                  <span style={{
                    display: 'inline-block',
                    background: `${FILE_COLORS[file.tipo]}22`,
                    color: FILE_COLORS[file.tipo],
                    padding: '0 0.35rem',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    marginRight: '0.3rem',
                  }}>
                    {file.tipo}
                  </span>
                  {formatBytes(file.tamanio)}
                </div>
              </div>
              <button
                className="file-preview-remove"
                onClick={(e) => { e.stopPropagation(); removeFile(file.id); }}
                title="Eliminar archivo"
                type="button"
              >
                <i className="pi pi-times" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Resumen */}
      {files.length > 0 && (
        <div style={{
          marginTop: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          color: 'var(--text-muted)',
        }}>
          <span>
            <i className="pi pi-paperclip" style={{ marginRight: '0.35rem' }} />
            {files.length} archivo{files.length !== 1 ? 's' : ''} adjunto{files.length !== 1 ? 's' : ''}
          </span>
          {files.length >= maxFiles && (
            <span style={{ color: 'var(--color-warning)', fontWeight: 600 }}>
              Limite alcanzado ({maxFiles})
            </span>
          )}
          <Button
            label="Limpiar todo"
            icon="pi pi-trash"
            className="p-button-text p-button-sm p-button-danger"
            onClick={() => onChange([])}
          />
        </div>
      )}
    </div>
  );
};
