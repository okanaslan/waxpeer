import axios from "axios";
const RateLimiter = require("limiter").RateLimiter;

export class RequestUtils {
    private apiKey: string;
    private readonly baseUrl = "https://api.waxpeer.com/v1";

    // Ignoring this limit might cause 429 error code or IP ban.
    getPricesLimiter = new RateLimiter({ tokensPerInterval: 60, interval: 60 * 1000 });
    getPricesDopplersLimiter = new RateLimiter({ tokensPerInterval: 60, interval: 60 * 1000 });

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    public async post(path: string, body: any, token?: string): Promise<any> {
        let url = `${this.baseUrl}/${path}?api=${this.apiKey}`;
        if (token) url += `&${token}`;
        try {
            return (
                await axios.post(url, body, {
                    headers: { "Accept-Encoding": "gzip,deflate,compress" },
                    cancelToken: this.newAxiosCancelationSource(60000),
                    timeout: 60000,
                })
            ).data;
        } catch (e) {
            throw e;
        }
    }

    public async get(path: string, token?: string): Promise<any> {
        let url = `${this.baseUrl}/${path}?api=${this.apiKey}`;
        if (token) url += `&${token}`;
        try {
            return (
                await axios.get(url, {
                    headers: { "Accept-Encoding": "gzip,deflate,compress" },
                    cancelToken: this.newAxiosCancelationSource(60000),
                    timeout: 60000,
                })
            ).data;
        } catch (e) {
            throw e;
        }
    }

    private newAxiosCancelationSource(timeout: number = 1) {
        const tokenSource = axios.CancelToken.source();
        setTimeout(() => {
            tokenSource.cancel();
        }, timeout);
        return tokenSource.token;
    }
}
