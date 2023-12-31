import { stringify } from "querystring";
import { RequestUtils } from "../utils/request";
import {
    EGameId,
    FetchInventory,
    GetMySteamInv,
    ICheckWssUser,
    IEditItemsReq,
    IListedItem,
    IReadyTransferTrade,
    IRemoveAll,
    IResponseEdit,
    ListItems,
    ListedItem,
} from "../types/waxpeer";

export class SellItemsDomain {
    private requestUtils: RequestUtils;

    constructor(apiKey: string) {
        this.requestUtils = new RequestUtils(apiKey);
    }

    /**
     * Get items that you can list for sale - `/get-my-inventory`
     *
     * @param skip (optional) Skip items
     * @param game (optional) Game from supported games
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "items": [
     *     {
     *       "item_id": "24758826121",
     *       "type": "Butterfly Knife",
     *       "icon_url": "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPD1PrbQqW9e-NV9j_v-5YT0m1HmlB81NDG3OtOcdlM5MF3Srla4wO-8h5PuucyawHo37HZxsXePnEe20xseaLBnhPSACQLJc-o5FQc",
     *       "name": "★ Butterfly Knife | Gamma Doppler (Factory New)",
     *       "steam_price": {
     *         "average": 2767941,
     *         "rarity_color": "string",
     *         "rarity": "string",
     *         "current": 2633000,
     *         "name": "★ Butterfly Knife | Gamma Doppler Phase 2 (Factory New)",
     *         "lowest_price": 2125555,
     *         "img": "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPD1PrbQqW9e-NV9j_v-5YT0m1HllB81NDG3S9rEMFFrf1iC_QXqw7u9h5PqupTKyiNh6ClxtCvczUPmgUtPPbE-1qDISFicAqVXXP7V9p_o84A"
     *       }
     *     }
     *   ],
     *   "count": 5,
     * }
     */
    public getMyInventory(skip: number = 0, game: keyof typeof EGameId = "csgo"): Promise<GetMySteamInv> {
        return this.requestUtils.get("get-my-inventory", stringify({ skip, game }));
    }

    /**
     * Fetch trades that need to be sent - `/ready-to-transfer-p2p`
     *
     * Connecting to the trade websocket is required to sell items (included in the extension and official app).
     * If your connection is unstable (such as public Wi-Fi or mobile data), your trade websocket connection can be interrupted and the creation of a trade event may be missed.
     * In order not to miss the sending of a trade you should be making this request at least every minute.
     * Please check send_until timestamp before creating trade in Steam (we do not recommend creating a trade if one minute or less is left).
     * Trade websocket documentation is published here (https://docs.waxpeer.com/?method=websocket).
     *
     * @param steam_api Steam API key
     * @example
     * // example response
     * {
     *   "id": 1,
     *   "costum_id": "string",
     *   "trade_id": "3547735377",
     *   "tradelink": "https://steamcommunity.com/tradeoffer/new/?partner=14221897&token=i2yUssgF",
     *   "trade_message": "string",
     *   "done": false,
     *   "stage": 1,
     *   "creator": "seller",
     *   "send_until": "2022-10-30T15:18:46.566Z",
     *   "last_updated": "2022-10-30T15:13:08.139Z",
     *   "for_steamid64": "76561198338314XXX",
     *   "user": {
     *     "id": "182dbd1c-2es6-470s-z1q2-627xa6207211",
     *     "avatar": "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/16/1622081f90ef78b0ca1372cae7663a2592939e00_medium.jpg"
     *   },
     *   "seller": {
     *     "id": "282dbd1c-2es6-470s-z1q2-627xa6207212",
     *     "avatar": "https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/16/1622081f90ef78b0ca1372cae7663a2592939e00_medium.jpg"
     *   },
     *   "items": [
     *     {
     *       "id": 4258189,
     *       "item_id": "27165625733",
     *       "give_amount": 25926,
     *       "merchant": "string",
     *       "image": "https://steamcommunity-a.akamaihd.net/economy/image/class/730/5041964706/200fx125f",
     *       "price": 27581,
     *       "game": "csgo",
     *       "name": "AWP | Neo-Noir (Minimal Wear)",
     *       "status": 0
     *     }
     *   ]
     * }
     */
    public readyToTransferP2P(steam_api: string): Promise<IReadyTransferTrade> {
        return this.requestUtils.get(`ready-to-transfer-p2p`, stringify({ steam_api }));
    }

    /**
     * Force p2p status check. Recommended for usage with poor network connections - `/check-wss-user`
     *
     * If the network connection is poor, we recommend to request once per hour so that items remain or come back on sale.
     * Note: This method will enable items for sale if you're connected to the trade websocket and even if you set your sales status to offline.
     * @param steamid Your Steam64ID. Can be found in /user endpoint
     * @example
     * // example response
     * {
     *   "success": true,
     *   "step": 3,
     *   "msg": "You can sell now"
     * }
     */
    public checkWssUser(steamid: string): Promise<ICheckWssUser> {
        return this.requestUtils.get(`check-wss-user`, stringify({ steamid }));
    }

    /**
     * Edit price for listed items - `/edit-items`
     *
     * Array of items
     * Rate limit of list/edit actions for each item_id is 2 requests per 120 seconds
     * Note: For Rust items item_id must be a string type, since id is greater than the maximum for number type
     * Set the price to 0 to remove the item from sale
     * @param items Array of items with item_id and price keys
     * @param game (optional) Game from supported games
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "updated": [
     *     {
     *       "item_id": "141414144",
     *       "price": "1000"
     *     }
     *   ],
     *   "failed": [
     *     {
     *       "item_id": 141414145,
     *       "price": 1000,
     *       "msg": "You can update price after 40 seconds",
     *       "msBeforeNext": 39636
     *     }
     *   ],
     *   "removed": 0
     * }
     */
    public editItems(items: IEditItemsReq[], game: keyof typeof EGameId = "csgo"): Promise<IResponseEdit> {
        return this.requestUtils.post(
            `edit-items`,
            {
                items,
            },
            stringify({ game }),
        );
    }

    /**
     * Fetches your steam inventory make sure your steamid is connected on waxpeer - `/fetch-my-inventory`.
     * Call this endpoint before calling {@link getMyInventory|getMyInventory()} (`/get-my-inventory`)
     *
     * @param game Game from supported games
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "total_inventory_count": 120
     * }
     */
    public fetchInventory(game: keyof typeof EGameId = "csgo"): Promise<FetchInventory> {
        return this.requestUtils.get("fetch-my-inventory", stringify({ game }));
    }

    /**
     * List steam items from inventory - `/list-items-steam`
     *
     * @param items Items object  https://api.waxpeer.com/docs/#/Steam/post_list_items_steam
     * @param game (optional) Game from supported games
     * @example
     * // example value:
     * {
     *   "success": true,
     *   "msg": "no items",
     *   "listed": [
     *     {
     *       "item_id": 141414144,
     *       "price": 1000,
     *       "name": "AWP | Asiimov (Field-tested)"
     *     }
     *   ],
     *   "failed": [
     *     {
     *       "item_id": 141414145,
     *       "price": 1000,
     *       "msg": "You can list your item after 40 seconds",
     *       "msBeforeNext": 39636
     *     }
     *   ]
     * }
     */
    public listItemsSteam(items: ListedItem[], game: keyof typeof EGameId = "csgo"): Promise<ListItems> {
        return this.requestUtils.post(
            "list-items-steam",
            {
                items,
            },
            stringify({ game }),
        );
    }

    /**
     * Get listed steam items - `/list-items-steam`
     *
     * @param game (optional) Game from supported games
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "items": [
     *     {
     *       "item_id": "16037911576",
     *       "price": 2367941,
     *       "date": "2020-01-11T07:18:50.749Z",
     *       "position": 1,
     *       "name": "★ Butterfly Knife | Gamma Doppler (Factory New)",
     *       "market_name": "Gamma Doppler Phase 2",
     *       "steam_price": {
     *         "average": 2767941,
     *         "rarity_color": "string",
     *         "rarity": "string",
     *         "current": 2633000,
     *         "name": "★ Butterfly Knife | Gamma Doppler Phase 2 (Factory New)",
     *         "lowest_price": 2125555,
     *         "img": "-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DEVlxkKgpovbSsLQJf0ebcZThQ6tCvq4GGqPD1PrbQqW9e-NV9j_v-5YT0m1HllB81NDG3S9rEMFFrf1iC_QXqw7u9h5PqupTKyiNh6ClxtCvczUPmgUtPPbE-1qDISFicAqVXXP7V9p_o84A"
     *       }
     *     }
     *   ]
     * }
     */
    public myListedItems(game: keyof typeof EGameId = "csgo"): Promise<{ success: boolean; items: IListedItem[] }> {
        return this.requestUtils.get("list-items-steam", stringify({ game }));
    }

    /**
     * Remove specified items - `/remove-items`
     *
     * @param ids Either array or one item_id that you want to remove from listing
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "count": 1
     * }
     */
    public removeItems(ids: number | number[] | string | string[]): Promise<{ success: boolean; count: number; removed: number[] }> {
        let removeId: any[] = typeof ids === "object" ? ids : [ids];
        return this.requestUtils.get(`remove-items`, removeId.map((i) => `id=${i}`).join("&"));
    }

    /**
     * Removes all listed items - `/remove-all`
     *
     * @param game (optional) Game from supported games (If not passed - will remove for all games)
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "msg": "string",
     *   "count": 0
     * }
     */
    public removeAll(game: keyof typeof EGameId | undefined = undefined): Promise<IRemoveAll> {
        return this.requestUtils.get(`remove-all`, stringify({ game }));
    }
}
