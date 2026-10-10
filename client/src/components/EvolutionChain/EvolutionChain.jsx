import { Link } from 'react-router-dom';
import { capitalize } from '../../utils/helpers';
import './EvolutionChain.css';

export default function EvolutionChain({ evolutions }) {
  if (!evolutions || evolutions.length <= 1) return null;

  return (
    <div className="evolution-chain">
      <h3 className="evo-title">Evolution Chain</h3>
      <div className="evo-stages">
        {evolutions.map((evo, i) => (
          <div key={evo.name} className="evo-step">
            {i > 0 && (
              <div className="evo-arrow">
                <span className="evo-arrow-icon">→</span>
                {evo.minLevel && <span className="evo-level">Lv.{evo.minLevel}</span>}
                {evo.item && <span className="evo-level">{capitalize(evo.item)}</span>}
                {!evo.minLevel && !evo.item && evo.trigger && (
                  <span className="evo-level">{capitalize(evo.trigger)}</span>
                )}
              </div>
            )}
            <Link to={`/pokemon/${evo.name}`} className="evo-pokemon">
              <img src={evo.sprite} alt={evo.name} className="evo-sprite" />
              <span className="evo-name">{capitalize(evo.name)}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
