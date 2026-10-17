import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-surface-border bg-surface-card shadow-2xl">
        <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button type="button" onClick={onClose} className="btn-ghost p-2" aria-label="Cerrar modal">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="border-t border-surface-border px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
