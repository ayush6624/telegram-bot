
import fetch from "node-fetch";
import { sentenceCase } from "sentence-case";
import escape from "markdown-escape";
const { IP_INFO_TOKEN } = process.env;

/**
 * Any character with code between 1 and 126 inclusively can be escaped
 * https://core.telegram.org/bots/api#markdownv2-style
 * @param {string} text - The text to be escaped.
 * @returns A function that takes a string and returns a string.
 */
const escapeCharacters = (text: string): string => {
    return escape(String(text), ["slashes"]) // Ignore slashes
};

const getVisitorMessage = async ({ ip }: { ip: string }): Promise<string> => {
    let text = "New visitor 🎉\n";
    const ipInfo = await fetch(`https://ipinfo.io/${ip}/json?token=${IP_INFO_TOKEN}`).then(res => res.json()) as Record<string, string>;

    const words = {
        "ip": "IP",
        "city": "City",
        "region": "Region",
        "country": "Country",
        "timezone": "Timezone",
        "postal": "Zip code",
        "org": "ISP",
        "loc": "Google maps"
    }

    Object.entries(ipInfo).map(([key, value]) => {
        text += `\n${words[key] ?? sentenceCase(key)}: ${key === "loc" ? value = `[link](https://www.google.com/maps/place/${value.split(",")[0]},${value.split(",")[1]})` : escapeCharacters(value)}`;
    });

    return text;
}

export { getVisitorMessage }