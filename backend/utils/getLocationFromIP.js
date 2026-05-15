import axios from "axios";

function stripIpv4Mapped(ip) {
  if (!ip) return "";
  return ip.replace(/^::ffff:/i, "").trim();
}

function isPrivateOrLoopback(ip) {
  if (!ip || ip === "::1") return true;
  const v = stripIpv4Mapped(ip);
  if (v === "127.0.0.1" || v === "0.0.0.0") return true;
  if (/^10\./.test(v)) return true;
  if (/^192\.168\./.test(v)) return true;
  if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(v)) return true;
  if (/^169\.254\./.test(v)) return true;
  if (/^fe80:/i.test(ip)) return true;
  if (/^fc00:/i.test(ip)) return true;
  return false;
}

/**
 * Prefer the left-most public IP in X-Forwarded-For, then Express req.ip (requires trust proxy),
 * then X-Real-IP, then socket address.
 */
function pickClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    const parts = forwarded.split(",").map((p) => stripIpv4Mapped(p));
    for (const ip of parts) {
      if (ip && !isPrivateOrLoopback(ip)) return ip;
    }
    for (const ip of parts) {
      const v = stripIpv4Mapped(ip);
      if (v && v !== "127.0.0.1" && v !== "::1") return v;
    }
  }

  const realIp = req.headers["x-real-ip"];
  if (typeof realIp === "string" && realIp.trim()) {
    const ip = stripIpv4Mapped(realIp);
    if (ip) return ip;
  }

  if (typeof req.ip === "string" && req.ip && req.ip !== "::1") {
    const ip = stripIpv4Mapped(req.ip);
    if (ip) return ip;
  }

  const remote = req.socket?.remoteAddress;
  if (remote) return stripIpv4Mapped(remote);

  return "";
}

const getLocationFromIP = async (req) => {
  try {
    let ip = pickClientIp(req);

    if (!ip || isPrivateOrLoopback(ip)) {
      // Local / dev / same-machine proxy: resolve public egress IP of this server (better than "Unknown")
      ip = "";
    }

    const url = ip ? `http://ip-api.com/json/${encodeURIComponent(ip)}` : `http://ip-api.com/json/`;
    const response = await axios.get(url, { timeout: 8000 });

    if (response.data && response.data.status === "success") {
      return {
        city: response.data.city,
        country: response.data.country,
        region: response.data.regionName,
        ip: ip || response.data.query,
      };
    }

    return "Unknown Location";
  } catch (error) {
    console.error("Error fetching location from IP:", error.message);
    return "Unknown Location";
  }
};

export default getLocationFromIP;
