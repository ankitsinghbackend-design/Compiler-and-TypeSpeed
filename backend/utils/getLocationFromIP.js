import axios from "axios";

const getLocationFromIP = async (req) => {
    try {
        // 1. Read IP from Express request
        const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

        if (!rawIp) {
            return "Unknown Location";
        }

        // Clean the IP address (handling localhost and comma-separated lists)
        let ip = rawIp.split(',')[0].trim();

        if (ip === "::1" || ip === "127.0.0.1") {
            // For local development, make a request without an IP to get the server's public IP's location
            ip = "";
        }

        // 2. Use a free geolocation API
        const url = ip ? `http://ip-api.com/json/${ip}` : `http://ip-api.com/json/`;
        const response = await axios.get(url);

        if (response.data && response.data.status === "success") {
            // 3. Return the specified object
            return {
                city: response.data.city,
                country: response.data.country,
                region: response.data.regionName,
                ip: ip
            };
        }

        return "Unknown Location";
    } catch (error) {
        console.error("Error fetching location from IP:", error.message);
        // If the API fails return: "Unknown Location"
        return "Unknown Location";
    }
};

export default getLocationFromIP;
