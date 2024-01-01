import WebSocket from "ws";
import { EventEmitter } from "events";

export class TradeWebsocket extends EventEmitter {
    private readonly apiKey: string;
    private readonly steamid: string;
    private readonly tradelink: string;

    private ws: WebSocket | undefined;
    private tries = 0;
    private timeoutInterval: NodeJS.Timeout | undefined;

    public socketOpen = false;

    constructor(apiKey: string, steamid: string, tradelink: string) {
        super();
        this.apiKey = apiKey;
        this.steamid = steamid;
        this.tradelink = tradelink;
        this.connectWss();
    }

    async connectWss() {
        if (this.ws) this.ws.close();
        let t = (this.tries + 1) * 1e3;
        this.ws = new WebSocket("wss://wssex.waxpeer.com");

        this.ws.on("error", (e) => {
            console.error("TradeWebsocket error", e);
            this.ws?.close();
        });

        this.ws.on("close", () => {
            this.tries += 1;
            this.socketOpen = false;
            console.info(`TradeWebsocket closed`, this.steamid);
            if (this.steamid && this.apiKey) {
                setTimeout(() => {
                    return this.connectWss();
                }, t);
            }
        });

        this.ws.on("open", () => {
            this.socketOpen = true;
            console.info(`TradeWebsocket opened`, this.steamid);
            if (this.steamid) {
                clearInterval(this.timeoutInterval);
                this.ws?.send(
                    JSON.stringify({
                        name: "auth",
                        steamid: this.steamid,
                        apiKey: this.apiKey,
                        tradeurl: this.tradelink,
                        source: "npm_waxpeer",
                        version: "1.3.0",
                    }),
                );
                this.timeoutInterval = setInterval(() => {
                    if (this.ws) this.ws.send(JSON.stringify({ name: "ping" }));
                }, 25000);
            } else {
                this.ws?.close();
            }
        });

        this.ws.on("message", (data) => {
            try {
                let message = JSON.parse(data.toString());
                if (message.name === "pong") return;
                if (message.name === "send-trade") {
                    this.emit("send-trade", message.data);
                }
                if (message.name === "cancelTrade") {
                    this.emit("cancelTrade", message.data);
                }
                if (message.name === "accept_withdraw") {
                    this.emit("accept_withdraw", message.data);
                }
            } catch {}
        });
    }
}
