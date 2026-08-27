import { useEffect, useState } from 'react';
import { DollarSign } from 'lucide-react';

const DISPLAY_TIME = 1650;
const FADE_TIME = 450;

export default function SplashScreen() {
  const [isExiting, setIsExiting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setIsExiting(true), DISPLAY_TIME);
    const hideTimer = window.setTimeout(() => setIsVisible(false), DISPLAY_TIME + FADE_TIME);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`splash-screen${isExiting ? ' splash-screen--exiting' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Dollar Craft"
    >
      <div className="splash-screen__grid" aria-hidden="true" />
      <div className="splash-screen__content">
        <div className="splash-screen__logo-wrap">
          <div className="splash-screen__ring splash-screen__ring--outer" />
          <div className="splash-screen__ring splash-screen__ring--inner" />
          <div className="splash-screen__logo">
            <img
              src="/logo.png"
              alt=""
              onError={(event) => {
                event.currentTarget.style.display = 'none';
                event.currentTarget.nextElementSibling.style.display = 'block';
              }}
            />
            <DollarSign className="splash-screen__fallback" aria-hidden="true" />
          </div>
        </div>
        <div className="splash-screen__loading">
          <span className="splash-screen__spinner" aria-hidden="true" />
          <span>Loading Secure Session...</span>
        </div>
        <div className="splash-screen__progress" aria-hidden="true">
          <span />
        </div>
      </div>
    </div>
  );
}
