import { TYPE_COLORS, TYPE_TEXT_DARK } from '../../utils/helpers';
import './TypeBadge.css';

export default function TypeBadge({ type, size = 'md', onClick }) {
  const bg = TYPE_COLORS[type] || '#888';
  const isDark = TYPE_TEXT_DARK.includes(type);

  return (
    <span
      className={`type-badge type-badge--${size} ${onClick ? 'type-badge--clickable' : ''}`}
      style={{ background: bg, color: isDark ? '#333' : '#fff' }}
      onClick={onClick}
    >
      {type}
    </span>
  );
}
