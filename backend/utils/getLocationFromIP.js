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
            // In local dev, we might not get a valid public IP. We fallback to returning Unknown Location, 
            // or we can test with a default public IP if we wish, but matching specs exactly:
            return "Unknown Location";
        }

        // 2. Use a free geolocation API
        const response = await axios.get(`http://ip-api.com/json/${ip}`);

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
