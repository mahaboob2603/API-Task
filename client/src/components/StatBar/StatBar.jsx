import { getStatColor, getStatLabel } from '../../utils/helpers';
import './StatBar.css';

export default function StatBar({ name, value, maxValue = 200 }) {
  const pct = Math.min((value / maxValue) * 100, 100);
  const color = getStatColor(value);

  return (
    <div className="stat-bar-row">
      <span className="stat-bar-label">{getStatLabel(name)}</span>
      <div className="stat-bar-track">
        <div
          className="stat-bar-fill"
          style={{ width: `${pct}%`, background: `linear-gradient(to right, ${color}, ${color}dd)` }}
        />
      </div>
      <span className="stat-bar-value">{value}</span>
    </div>
  );
}
