export const runNetCheck = async (baitPath = '/ads-bait-a9f3d1.js', prebidPath = '/ads-prebid-a9f3d1.js') => {
  let strongSignals = 0;
  let weakSignals = 0;

  // Heuristic 1 — DOM Bait Injection
  const runDOMBait = () => {
    return new Promise((resolve) => {
      const classNames = ['adsbox', 'adsbygoogle', 'ad-container', 'google_ads_frame', 'pub_300x250', 'banner_ad', 'sponsored-link'];
      const elements = classNames.map(className => {
        const el = document.createElement('div');
        el.className = className;
        el.style.position = 'absolute';
        el.style.top = '0';
        el.style.left = '0';
        el.style.width = '10px';
        el.style.height = '10px';
        document.body.appendChild(el);
        return el;
      });

      setTimeout(() => {
        let blocked = false;
        for (const el of elements) {
          if (!document.body.contains(el)) {
            blocked = true;
          } else {
            const style = getComputedStyle(el);
            if (style.display === 'none' || 
                style.visibility === 'hidden' || 
                style.opacity === '0' ||
                el.offsetHeight === 0) {
              blocked = true;
            }
            if (document.body.contains(el)) {
              document.body.removeChild(el);
            }
          }
        }
        resolve(blocked);
      }, 200);
    });
  };

  // Heuristic 2 — Fetch Bait File
  const runFetchBait = async () => {
    try {
      const response = await fetch(`${baitPath}?_=${Date.now()}`, { cache: 'no-store' });
      return !response.ok;
    } catch (err) {
      return true;
    }
  };

  // Heuristic 3 — Script Tag Injection
  const runScriptBait = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `${prebidPath}?_=${Date.now()}`;
      
      let resolved = false;

      script.onload = () => {
        if (!resolved) { resolved = true; resolve(false); }
        if (document.head.contains(script)) {
            document.head.removeChild(script);
        }
      };
      script.onerror = () => {
        if (!resolved) { resolved = true; resolve(true); }
        if (document.head.contains(script)) {
            document.head.removeChild(script);
        }
      };

      document.head.appendChild(script);

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve(true); // timeout = blocked
        }
        if (document.head.contains(script)) {
            document.head.removeChild(script);
        }
      }, 2000);
    });
  };

  // Heuristic 4 — Ad Network Fetch
  const runAdNetworkFetch = async () => {
    const urls = [
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
      'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
      'https://c.amazon-adsystem.com/aax2/apstag.js',
      'https://www.googletagmanager.com/gtag/js'
    ];

    let rejectedCount = 0;
    const fetchPromises = urls.map(url => 
      fetch(url, { mode: 'no-cors', cache: 'no-store' })
        .catch(() => { rejectedCount++; })
    );

    await Promise.all(fetchPromises);
    return rejectedCount >= 2;
  };

  // Heuristic 5 — Image Bait
  const runImageBait = async () => {
    const urls = [
      'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
      'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
      'https://c.amazon-adsystem.com/aax2/apstag.js',
      'https://www.googletagmanager.com/gtag/js'
    ];

    const testImage = (url) => {
      return new Promise((resolve) => {
        const start = performance.now();
        const img = new Image();
        img.onerror = () => {
          const time = performance.now() - start;
          if (time < 50) {
            resolve(true); // blocked quickly
          } else {
            resolve(false);
          }
        };
        img.onload = () => resolve(false);
        img.src = `${url}?_=${Date.now()}`;
      });
    };

    const results = await Promise.all(urls.map(testImage));
    const blockedCount = results.filter(Boolean).length;
    return blockedCount >= 2;
  };

  // Heuristic 6 — Window Variable Check
  const checkWindowVars = () => {
    if (window.isAdBlockActive || 
        window.canRunAds === false || 
        window.__AD_PREBID_BAIT__ === undefined) {
      return true;
    }
    return false;
  };

  // Run heuristics in parallel
  const [
    domBaitBlocked,
    fetchBaitBlocked,
    scriptBaitBlocked,
    adNetworkFetchBlocked,
    imageBaitBlocked
  ] = await Promise.all([
    runDOMBait(),
    runFetchBait(),
    runScriptBait(),
    runAdNetworkFetch(),
    runImageBait(),
  ]);

  if (domBaitBlocked) strongSignals++;
  if (fetchBaitBlocked) strongSignals++;
  if (scriptBaitBlocked) strongSignals++;
  if (adNetworkFetchBlocked) strongSignals++;
  if (imageBaitBlocked) strongSignals++;

  // Always consider failure to fetch local bait file as a strong signal
  if (fetchBaitBlocked) {
    return true; 
  }

  if (checkWindowVars()) weakSignals++;

  // Decision logic
  return (strongSignals >= 2) || (strongSignals === 1 && weakSignals >= 1);
};
