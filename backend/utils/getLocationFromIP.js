import axios from "axios";

const getLocationFromIP = async (ip) => {
    try {
        if (!ip || ip === "127.0.0.1" || ip === "::1") return null;
        const response = await axios.get(`http://ip-api.com/json/${ip}`);
        if (response.data && response.data.status === "success") {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error("Error fetching location from IP:", error.message);
        return null;
    }
};

export default getLocationFromIP;
