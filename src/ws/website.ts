import io from "socket.io-client";
import EventEmitter from "events";

export enum WebsiteSocketEvents {
    add_item = "add_item",
    remove = "remove",
    update_item = "update_item",
}

export class WebsiteWebsocket extends EventEmitter {
    private apiKey: string;
    public socketOpen = false;
    public events: Array<keyof typeof WebsiteSocketEvents> = [];

    constructor(apiKey: string, events: Array<keyof typeof WebsiteSocketEvents> = []) {
        super();
        this.apiKey = apiKey;
        this.connectWss();
        this.events = events;
    }

    async connectWss() {
        const socket = io("wss://waxpeer.com", {
            transports: ["websocket"],
            path: "/socket.io/",
            autoConnect: true,
            extraHeaders: { authorization: this.apiKey },
        });

        socket.on("connect", () => {
            this.socketOpen = true;
            this.events.map((event) => {
                socket.emit("event", { name: event, value: true });
            });
            console.log("WebsiteWebsocket connected");
        });

        socket.on("disconnect", () => {
            this.socketOpen = false;
            console.log("WebsiteWebsocket disconnected");
        });

        socket.on("handshake", (data: any) => {
            this.emit("handshake", data);
        });

        socket.on("add_item", (data: any) => {
            this.emit("add_item", data);
        });

        socket.on("update_item", (data: any) => {
            this.emit("update_item", data);
        });

        socket.on("updated_item", (data: any) => {
            this.emit("updated_item", data);
        });

        socket.on("remove", (data: any) => {
            this.emit("remove_item", data);
        });

        socket.on("change_user", (data: any) => {
            this.emit("change_user", data);
        });

        socket.on("connect_error", (error: any) => {
            this.socketOpen = false;
            console.error("connect_error", error);
        });
    }
}
