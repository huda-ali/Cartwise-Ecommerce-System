import React from 'react';
import { LucideIcon, X, ChevronRight, AlertCircle, CheckCircle2, Info } from 'lucide-react';

/* ==========================================================================
   BUTTONS
   ========================================================================== */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium tracking-tight rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const variantStyles = {
    primary:
      'bg-slate-900 hover:bg-slate-800 text-white shadow-sm hover:shadow active:scale-[0.99] focus:ring-slate-900',
    secondary:
      'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm active:scale-[0.99] focus:ring-indigo-500',
    outline:
      'border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 focus:ring-slate-400',
    ghost:
      'text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:ring-slate-400',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white shadow-sm focus:ring-rose-500',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {!isLoading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
};

/* ==========================================================================
   BADGES & CHIPS
   ========================================================================== */
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'accent';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const styles = {
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    accent: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border whitespace-nowrap ${styles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

/* ==========================================================================
   FORM INPUTS
   ========================================================================== */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: LucideIcon;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full rounded-xl border bg-white text-slate-900 text-sm transition-all focus:outline-none focus:ring-2 disabled:bg-slate-50 disabled:text-slate-400 ${
            Icon ? 'pl-9.5' : 'pl-3.5'
          } pr-3.5 py-2.5 ${
            error
              ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
              : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-100'
          } ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-xs text-rose-600 font-medium">{error}</p>}
      {helperText && !error && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
};

/* ==========================================================================
   MODAL & DIALOG
   ========================================================================== */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  if (!isOpen) return null;

  const widthMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`relative w-full ${widthMap[maxWidth]} bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            {title && <h3 className="text-lg font-bold text-slate-900 font-heading">{title}</h3>}
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

/* ==========================================================================
   DRAWER / OFF-CANVAS
   ========================================================================== */
interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  position?: 'right' | 'left';
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  position = 'right',
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity" onClick={onClose} />
      <div className={`fixed inset-y-0 ${position === 'right' ? 'right-0' : 'left-0'} max-w-full flex`}>
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 font-heading">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

/* ==========================================================================
   SKELETON LOADERS
   ========================================================================== */
export const ProductCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs animate-pulse">
    <div className="w-full aspect-square bg-slate-200 rounded-xl mb-4" />
    <div className="h-3 w-20 bg-slate-200 rounded mb-2" />
    <div className="h-4 w-full bg-slate-200 rounded mb-2" />
    <div className="h-4 w-2/3 bg-slate-200 rounded mb-4" />
    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
      <div className="h-5 w-16 bg-slate-200 rounded" />
      <div className="h-8 w-8 bg-slate-200 rounded-lg" />
    </div>
  </div>
);

/* ==========================================================================
   EMPTY STATE
   ========================================================================== */
interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = AlertCircle,
  title,
  description,
  actionText,
  onAction,
}) => (
  <div className="py-16 px-4 text-center max-w-md mx-auto">
    <div className="w-14 h-14 bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200/60">
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-base font-bold text-slate-900 font-heading">{title}</h3>
    <p className="text-sm text-slate-500 mt-1 mb-6 leading-relaxed">{description}</p>
    {actionText && onAction && (
      <Button variant="primary" onClick={onAction}>
        {actionText}
      </Button>
    )}
  </div>
);

/* ==========================================================================
   BREADCRUMBS
   ========================================================================== */
export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  active?: boolean;
}

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({ items }) => (
  <nav className="flex items-center space-x-2 text-xs text-slate-500 py-3 overflow-x-auto whitespace-nowrap">
    {items.map((item, idx) => {
      const isLast = idx === items.length - 1;
      return (
        <React.Fragment key={idx}>
          {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
          {item.onClick && !isLast ? (
            <button
              onClick={item.onClick}
              className="hover:text-slate-900 font-medium transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ) : (
            <span className={isLast ? 'font-semibold text-slate-900' : ''}>{item.label}</span>
          )}
        </React.Fragment>
      );
    })}
  </nav>
);

/* ==========================================================================
   TOAST CONTAINER
   ========================================================================== */
interface ToastProps {
  toasts: Array<{ id: string; type: 'success' | 'error' | 'info'; message: string }>;
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icon =
          toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-sky-600 shrink-0" />
          );

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start gap-3 bg-white p-3.5 rounded-xl shadow-lg border border-slate-200 text-slate-800 text-sm animate-in slide-in-from-bottom-2 duration-150"
          >
            {icon}
            <div className="flex-1 font-medium leading-snug">{toast.message}</div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
