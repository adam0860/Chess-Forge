import { navigate } from '../lib/router';
import { Icon } from '../components/Icon';

export function NotFound() {
  return (
    <div className="center-screen">
      <div className="empty">
        <Icon name="help" size={42} />
        <h2>Page not found</h2>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/', { replace: true })}>
          Go home
        </button>
      </div>
    </div>
  );
}
