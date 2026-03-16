import { useState, useEffect } from 'react';
import { runNetCheck } from '../utils/netCheck.js';

export const useNetCheck = ({
  baitPath = '/ads-bait-a9f3d1.js',
  prebidPath = '/ads-prebid-a9f3d1.js',
  logEndpoint = null,
  location = 'app'
} = {}) => {
  const [detected, setDetected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState('');

  const executeDetection = async () => {
    setLoading(true);
    try {
      const isBlocked = await runNetCheck(baitPath, prebidPath);
      
      const suppressedUntil = parseInt(localStorage.getItem('netcheck_suppress') || '0', 10);
      const isSuppressed = Date.now() < suppressedUntil;

      if (isBlocked && !isSuppressed) {
        setDetected(true);
      } else {
        setDetected(false);
      }
    } catch (err) {
      console.error(err);
      setDetails(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Slight delay to allow adblockers to parse the DOM first
    const timer = setTimeout(() => {
        executeDetection();
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const retry = async () => {
    setLoading(true);
    // Reloading the page is often the most reliable way to clear adblocker state
    // after a user has paused it.
    window.location.reload();
  };

  const suppressTemporarily = (minutes) => {
    const until = Date.now() + minutes * 60 * 1000;
    localStorage.setItem('netcheck_suppress', until.toString());
    setDetected(false);
  };

  return { detected, loading, details, retry, suppressTemporarily };
};
