import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  status: 'PENDIENTE' | 'EN_PROCESO' | 'COMPLETADO' | 'CANCELADO';
}

export const StatusBadge: React.FC<BadgeProps> = ({ status }) => {
  const styles = {
    PENDIENTE: "text-gray-500 bg-gray-100",
    EN_PROCESO: "text-blue-600 bg-blue-50",
    COMPLETADO: "text-green-600 bg-green-50",
    CANCELADO: "text-red-500 bg-red-50",
  };

  const dots = {
    PENDIENTE: "bg-gray-400",
    EN_PROCESO: "bg-blue-600 animate-pulse",
    COMPLETADO: "bg-green-600",
    CANCELADO: "bg-red-500",
  };

  return (
    <span className={clsx(
      "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-2",
      styles[status]
    )}>
      <div className={clsx("w-1.5 h-1.5 rounded-full", dots[status])}></div>
      {status.replace('_', ' ').toLowerCase()}
    </span>
  );
};
