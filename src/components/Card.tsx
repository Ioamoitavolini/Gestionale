import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  title?: string;
  icon?: string;
  color?: string;
  value?: string | number;
  children?: React.ReactNode;
  onClick?: () => void;
}

export default function Card({
  title,
  icon,
  color = '#4caf50',
  value,
  children,
  onClick,
}: CardProps) {
  return (
    <div
      className={styles.card}
      style={color ? { borderLeftColor: color } : {}}
      onClick={onClick}
    >
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.content}>
        {title && <h3 className={styles.title}>{title}</h3>}
        {value && <p className={styles.value}>{value}</p>}
        {children}
      </div>
    </div>
  );
}
