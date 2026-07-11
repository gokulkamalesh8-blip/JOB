import React from 'react';

export default function Badge({ children, variant = 'primary', className = '', ...props }) {
  const variantMap = {
    primary: 'blue',
    danger: 'red',
    success: 'green',
    warning: 'yellow',
    info: 'cyan',
    secondary: 'cyan',
    blue: 'blue',
    red: 'red',
    green: 'green',
    yellow: 'yellow',
    cyan: 'cyan'
  };

  const colorClass = variantMap[variant] || 'blue';

  return (
    <span className={`badge badge-${colorClass} ${className}`} {...props}>
      {children}
    </span>
  );
}
