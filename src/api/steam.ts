import { stringify } from "querystring";

import { RequestUtils } from "../utils/request";
import { EGameId, EMinExteriors, EWeaponBrand, IGetItemsList, IGetSteamItems } from "./types";

export class SteamDomain {
    private requestUtils: RequestUtils;

    constructor(apiKey: string) {
        this.requestUtils = new RequestUtils(apiKey);
    }

    /**
     * Fetches items based on the game you pass as a query - `/get-items-list`
     *
     * Responses are limited to 100 items.
     *
     * @param skip (optional) How many items to skip
     * @param search (optional) Search by item name
     * @param brand (optional) The specified category of game items, ex: rifle for CS:GO and Pants for Rust
     * @param order (optional) Order by ASC or DESC (default DESC)
     * @param order_by (optional) Return order
     * @param exterior (optional) Exterior of the item (for CS:GO game)
     * @param max_price (optional) Max price of the item (1000 = 1$)
     * @param min_price (optional) Min price of the item (1000 = 1$)
     * @param game Game from supported games (default csgo)
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "items": [
     *     {
     *       "name": "★ Butterfly Knife | Gamma Doppler (Factory New)",
     *       "price": 4999,
     *       "float": 0.1452850103378296,
     *       "best_deals": 541,
     *       "discount": 10,
     *       "steam_price": 5540,
     *       "image": "https://steamcommunity-a.akamaihd.net/economy/image/class/730/520026599/200fx125f",
     *       "item_id": "27402864642",
     *       "brand": "pistol",
     *       "type": "Glock-18"
     *     }
     *   ],
     *   "count": 100
     * }
     */
    public getItemsList(
        skip: number = 0,
        search: string | undefined = undefined,
        brand: keyof typeof EWeaponBrand | undefined = undefined,
        order: "ASC" | "DESC" = "DESC",
        order_by: "price" | "name" | "discount" | "best_deals" = "price",
        exterior: keyof typeof EMinExteriors | undefined = undefined,
        max_price: number | undefined = undefined,
        min_price: number | undefined = undefined,
        game: keyof typeof EGameId = "csgo",
    ): Promise<IGetItemsList> {
        return this.requestUtils.get(
            `get-items-list`,
            stringify({
                skip,
                search,
                brand,
                order,
                order_by,
                exterior,
                max_price,
                min_price,
                game,
            }),
        );
    }

    /**
     * Fetches recommended item price and other info - `/get-steam-items`
     *
     * @param game Game app_id from supported games (default 730)
     * @param highest_offer (optional) Highest offer price (Not accurate, because not filtering offers by users balances)
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "items": [
     *     {
     *       "name": "AK-47 | Predator (Minimal Wear)",
     *       "average": 12685,
     *       "game_id": 730,
     *       "type": "Rifle",
     *       "collection": "The Dust Collection",
     *       "ru_name": "AK-47 | Хищник (Немного поношенное)"
     *     }
     *   ]
     * }
     */
    public getSteamItems(game: number = 730, highest_offer: "0" | "1" = "0"): Promise<IGetSteamItems> {
        return this.requestUtils.get(`get-steam-items`, stringify({ game, highest_offer }));
    }
}
