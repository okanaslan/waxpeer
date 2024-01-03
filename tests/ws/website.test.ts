import { config } from "dotenv";
config();

import { expect, test, vi } from "vitest";
import { WebsiteWebsocket } from "../../src/ws/website";

const handlers = {
    log: (message: any) => {
        console.log(message);
    },
};

test("Should emit handshake event", async () => {
    const WS = new WebsiteWebsocket(process.env.WAXPEER_API_KEY as string, []);

    const spy = vi.spyOn(handlers, "log");

    WS.on("handshake", handlers.log);

    await new Promise((r) => setTimeout(r, 1000));

    expect(spy).toHaveBeenCalledTimes(1);
});
