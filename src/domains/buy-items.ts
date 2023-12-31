import { stringify } from "querystring";
import {
    EDopplersPhases,
    EGameId,
    EMinExteriors,
    EWeapon,
    GetItems,
    IAvailable,
    IBuy,
    IBuyMyHistory,
    ICheckTradeLink,
    IMassInfo,
    IPrices,
    IPricesDopplers,
    TradesStatus,
} from "../types/waxpeer";
import { RequestUtils } from "../utils/request";

export class BuyItemsDomain {
    private requestUtils: RequestUtils;

    constructor(apiKey: string) {
        this.requestUtils = new RequestUtils(apiKey);
    }

    /**
     * Buy item using name and send to specific tradelink - `buy-one-p2p-name`
     *
     * Notes about trades and frequently asked questions.
     * The duration of the trade in different situations:
     * If seller's info is invalid then it can be cancelled immediately and status 6 is set;
     * If seller's details are valid, but no trade is created, then it will auto-cancel after 6 minutes;
     * if created or waiting for mobile confirmation then it will auto-cancel after 11 to 15 min (depends on when created);
     * if trade is waiting for mobile confirmation and connection with the seller was lost then it will auto-cancel after 6 hours.
     * We recommend adding project_id to purchase so that you can track a trade in case of a timeout or break of purchase request using the /check-many-project-id GET method one minute after the request.
     * An array of possible messages with purchase errors and other information, such as status, can be seen by opening the response scheme, where:
     * System busy - trade is cancelled due to tradelink check timeout or heavy load;
     * buy_csgo - CS:GO purchases are deactivated on the market;
     * buy_rust - RUST purchases are deactivated on the market.
     *
     * @param name Market hash name of the item
     * @param price Price, should be greater than item price
     * @param token Token from tradelink
     * @param partner Partner from tradelink
     * @param project_id Your custom id string[50]
     * @param game Game from supported games
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "id": 1,
     *   "msg": "buy_csgo"
     * }
     */
    public buyItemWithName(
        name: string,
        price: number,
        token: string,
        partner: string,
        project_id: string | undefined = undefined,
        game: keyof typeof EGameId = "csgo",
    ): Promise<IBuy> {
        return this.requestUtils.get("buy-one-p2p-name", stringify({ name: encodeURIComponent(name), price, token, partner, project_id, game }));
    }

    /**
     * Buy item using `item_id` and send to specific tradelink - `/buy-one-p2p`
     *
     * WARNING: Always paste item_id as string for RUST items.
     * Notes about trades and frequently asked questions.
     * The duration of the trade in different situations:
     * If seller's info is invalid then it can be cancelled immediately and status 6 is set;
     * If seller's details are valid, but no trade is created, then it will auto-cancel after 6 minutes;
     * if created or waiting for mobile confirmation then it will auto-cancel after 11 to 15 min (depends on when created);
     * if trade is waiting for mobile confirmation and connection with the seller was lost then it will auto-cancel after 6 hours.
     * We recommend adding project_id to purchase so that you can track a trade in case of a timeout or break of purchase request using the /check-many-project-id GET method one minute after the request.
     * An array of possible messages with purchase errors and other information, such as status, can be seen by opening the response scheme, where:
     * System busy - trade is cancelled due to tradelink check timeout or heavy load;
     * buy_csgo - CS:GO purchases are deactivated on the market;
     * buy_rust - RUST purchases are deactivated on the market.
     *
     * @param item_id Item id from fetching items
     * @param price Price of the item 1$=1000
     * @param token Token from tradelink
     * @param partner Partner from tradelink
     * @param project_id Your custom id string[50]
     * @example
     * // example resonse:
     * {
     *   "success": true,
     *   "id": 1,
     *   "msg": "buy_csgo"
     * }
     */
    public buyItemWithId(item_id: string | number, price: number, token: string, partner: string, project_id?: string): Promise<IBuy> {
        return this.requestUtils.get("buy-one-p2p", stringify({ item_id, price, token, partner, project_id }));
    }

    /**
     * Fetch all unique items and their min price and count - `/prices`
     *
     * @param game Game from supported games
     * @param min_price (optional) Min price
     * @param max_price (optional) Max price
     * @param search (optional) Search by part of the name, ex: 'hardened'.
     * @param minified (optional) Will return additional data about items if set to 0
     * @param highest_offer (optional) Will return highest_offer for the items if set to 1
     * @param single (optional) Will select only one item if set to 1
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "items": [
     *     {
     *       "name": "★ Hand Wraps | Cobalt Skulls (Minimal Wear)",
     *       "count": 5,
     *       "min": 937999,
     *       "img": "https://community.akamai.steamstatic.com/economy/image/-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXH5ApeO4YmlhxYQknCRvCo04DfVlxgLQFFibKkJQN3wfLYYgJK7dKyg5KKh8j4NrrFnm5D8fp3i-vT_I_KilihriwvOCyveMX6Ll9pORy_pgD8lrvxgJfpvpWamnZn6XUl5SmJm0DjhhlFbedp1PWYH1jNVaUcSqOKBnuCtYczFntLO18msw",
     *       "steam_price": "990000",
     *       "rarity_color": "#EB4B4B",
     *       "type": "Gloves"
     *     }
     *   ]
     * }
     */
    public getPrices(
        game: keyof typeof EGameId = "csgo",
        min_price: number | undefined = undefined,
        max_price: number | undefined = undefined,
        search: string | undefined = undefined,
        minified: 0 | 1 = 1,
        highest_offer: number = 0,
        single: 0 | 1 = 0,
    ): Promise<IPrices> {
        if (!this.requestUtils.getPricesLimiter.tryRemoveTokens(1)) return Promise.reject(new Error("Too many requests, try again later"));
        return this.requestUtils.get(
            `prices`,
            stringify({
                game,
                min_price,
                max_price,
                search: typeof search === "string" && search?.length ? encodeURIComponent(search) : undefined,
                minified,
                highest_offer,
                single,
            }),
        );
    }

    /**
     * Fetch all dopplers phases by filters - `/prices/dopplers`
     *
     * @param phase (optional) Doppler phase. Will return all if set to 'any'. For multiple phases pass it like this phase=Emerald&phase=Ruby
     * @param exterior (optional) Item exterior. Will return all if not set. For multiple exteriors pass it like this exterior=FN&exterior=MW
     * @param weapon (optional) Weapon type. Will return all if not set. For multiple weapons pass it like this weapon=Bayonet&weapon=Karambit
     * @param minified (optional) Will return additional data about items if set to 0 (steam_price, img, weapon, float, paint_index)
     * @param min_price (optional) Min price
     * @param max_price (optional) Max price
     * @param search (optional) Search by part of the name, ex: 'bayonet'.
     * @param single (optional) Will select only one item if set to 1
     * @example
     * {
     *   "success": true,
     *   "items": [
     *     {
     *       "name": "★ Butterfly Knife | Doppler (Factory New)",
     *       "item_id": "27253164358",
     *       "price": 1380000,
     *       "phase": "Phase 3",
     *       "steam_price": 1453040,
     *       "img": "https://steamcommunity-a.akamaihd.net/economy/image/class/730/5070448210/200fx125f",
     *       "weapon": "Butterfly Knife",
     *       "paint_index": 420,
     *       "float": 0.0460052728652954
     *     }
     *   ],
     *   "msg": "Wrong input"
     * }
     */
    public getPricesDopplers(
        phase: keyof typeof EDopplersPhases = "any",
        exterior: keyof typeof EMinExteriors | undefined = undefined,
        weapon: keyof typeof EWeapon | undefined = undefined,
        minified: 0 | 1 = 1,
        min_price: number | undefined = undefined,
        max_price: number | undefined = undefined,
        search: string | undefined = undefined,
        single: 0 | 1 = 0,
    ): Promise<IPricesDopplers> {
        if (!this.requestUtils.getPricesDopplersLimiter.tryRemoveTokens(1)) return Promise.reject(new Error("Too many requests, try again later"));
        return this.requestUtils.get(`prices/dopplers`, stringify({ phase, exterior, weapon, minified, min_price, max_price, search, single }));
    }

    /**
     * Fetch all listings by names. The maximum names per request is 50
     * For csgo dopplers items 'phase' parameter available in response. Possible values: 'Emerald', 'Ruby', 'Sapphire', 'Black Pearl', 'Phase 1', 'Phase 2', 'Phase 3', 'Phase 4'
     * @param game (optional) Game from supported games
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "data": {
     *     "AK-47 | Redline (Field-Tested)": {
     *       "listings": [
     *         [
     *           {
     *             "price": 12100,
     *             "by": "1247ffd5-f437-4a30-9953-10eda7df6e17",
     *             "item_id": "27165625733",
     *             "name": "AK-47 | Redline (Field-Tested)",
     *             "paint_index": 123,
     *             "steam_price": 14100,
     *             "classid": "3669724953",
     *             "image": "https://steamcommunity-a.akamaihd.net/economy/image/class/730/3669724953"
     *           }
     *         ]
     *       ],
     *       "orders": [
     *         {}
     *       ],
     *       "history": [
     *         {}
     *       ],
     *       "info": {}
     *     },
     *     "★ Butterfly Knife | Gamma Doppler (Factory New)": {
     *       "listings": [
     *         [
     *           {
     *             "price": 2050000,
     *             "by": "1247ffd5-f437-4a30-9953-10eda7df6e17",
     *             "item_id": "27165625734",
     *             "name": "★ Butterfly Knife | Gamma Doppler (Factory New)",
     *             "paint_index": 572,
     *             "steam_price": 1709860,
     *             "classid": "5035516602",
     *             "image": "https://steamcommunity-a.akamaihd.net/economy/image/class/730/5035516602",
     *             "phase": "Phase 4"
     *           }
     *         ]
     *       ],
     *       "orders": [
     *         {}
     *       ],
     *       "history": [
     *         {}
     *       ],
     *       "info": {}
     *     }
     *   }
     * }
     */
    public massInfo(names: string[], game: keyof typeof EGameId = "csgo"): Promise<IMassInfo> {
        return this.requestUtils.post("mass-info", { name: names, sell: 1 }, stringify({ game }));
    }

    /**
     * Search multiple items by name - `/search-items-by-name`
     *
     * @param names Array of item names
     * @param game (optional) Game from supported games
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "items": [
     *     {
     *       "name": "★ Butterfly Knife | Gamma Doppler (Factory New)",
     *       "price": 2050000,
     *       "image": "https://steamcommunity-a.akamaihd.net/economy/image/class/730/5035516602",
     *       "item_id": "27165625734",
     *       "phase": "Phase 4"
     *     }
     *   ]
     * }
     */
    public searchItems(names: string[] | string, game: keyof typeof EGameId = "csgo"): Promise<GetItems> {
        let nameSearch = typeof names === "object" ? names : [names];
        let searchNames = nameSearch.map((i) => `names=${encodeURIComponent(i)}`).join("&");
        return this.requestUtils.get("search-items-by-name", `game=${game}&${searchNames}`);
    }

    /**
     * Check many steam trades - `check-many-project-id
     *
     * Please check success state. Success must be "true" and msg usually null, but if something went wrong, you will get error message here and you need to retry the request.
     *
     * @param ids Ids or id that you passed as project_id when making a purchase
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "msg": "Please try again",
     *   "trades": [
     *     {
     *       "id": 1,
     *       "price": 140,
     *       "name": "Nova | Sand Dune (Field-Tested)",
     *       "status": 4,
     *       "project_id": "My_custom_project_identifier_asgd6ad8sg68gasgas8d",
     *       "custom_id": "224bdce2-as44-5ae6-be3g-1a80500de23s",
     *       "trade_id": "3547735377",
     *       "done": false,
     *       "for_steamid64": "76561198338314XXX",
     *       "reason": "We couldn't validate your trade link, either your inventory is private or you can't trade",
     *       "seller_name": "turboTrade",
     *       "seller_avatar": "https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg",
     *       "seller_steam_joined": 1589314982,
     *       "seller_steam_level": 45,
     *       "send_until": 1566796475,
     *       "last_updated": 1566796111,
     *       "counter": 10
     *     }
     *   ]
     * }
     */
    public customTradeRequest(ids: number | number[] | string | string[]): Promise<TradesStatus> {
        let id = [];
        if (typeof ids !== "object") id = [ids];
        else id = [...ids];
        return this.requestUtils.get("check-many-project-id", id.map((i) => `id=${i}`).join("&"));
    }

    /**
     * Checking the status of many steam trades by project_id identifier - `/check-many-steam`
     *
     * Please check success state. Success must be "true" and msg usually null, but if something went wrong, you will get error message here and you need to retry the request.
     *
     * @param ids Ids or id that you recived when purchasing items
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "msg": "Invalid ID",
     *   "trades": [
     *     {
     *       "id": 1,
     *       "price": 140,
     *       "name": "Nova | Sand Dune (Field-Tested)",
     *       "status": 4,
     *       "project_id": "My_custom_project_identifier_asgd6ad8sg68gasgas8d",
     *       "custom_id": "224bdce2-as44-5ae6-be3g-1a80500de23s",
     *       "trade_id": "3547735377",
     *       "done": false,
     *       "for_steamid64": "76561198338314XXX",
     *       "reason": "We couldn't validate your trade link, either your inventory is private or you can't trade",
     *       "seller_name": "turboTrade",
     *       "seller_avatar": "https://avatars.akamai.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_medium.jpg",
     *       "seller_steam_joined": 1589314982,
     *       "seller_steam_level": 45,
     *       "send_until": 1566796475,
     *       "last_updated": 1566796111,
     *       "counter": 10
     *     }
     *   ]
     * }
     */
    public tradeRequestStatus(ids: number | number[] | string | string[]): Promise<TradesStatus> {
        let id = [];
        if (typeof ids !== "object") id = [ids];
        else id = [...ids];
        return this.requestUtils.get("check-many-steam", id.map((i) => `id=${i}`).join("&"));
    }

    /**
     * Check weather items are available by item_id max 100 items - `/check-availability`
     *
     * @param item_id ItemIds that you want to check weather items are available
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "items": [
     *     {
     *       "item_id": "27165625733",
     *       "selling": true,
     *       "price": 1687470,
     *       "name": "★ Karambit | Fade (Factory New)",
     *       "image": "https://steamcommunity-a.akamaihd.net/economy/image/class/730/310854699/200fx125f"
     *     }
     *   ]
     * }
     */
    public checkItemAvailability(item_id: string | number | string[] | number[]): Promise<{ success: boolean; data: IAvailable[] }> {
        let ids = typeof item_id === "object" ? item_id : [item_id];
        return this.requestUtils.get(`check-availability`, ids.map((i) => `item_id=${i}`).join("&"));
    }

    /**
     * Check provided tradelink - `/check-tradelink`
     * @param tradelink Target tradelink
     * @example
     * // example response:
     * /{
     * /  "success": false,
     * /  "link": "https://steamcommunity.com/tradeoffer/new/?partner=900267897&token=P2YkRJOk",
     * /  "info": "You cannot trade with SteamUserName because they have a trade ban.",
     * /  "msg": "We couldn't validate your trade link, either your inventory is private or you can't trade",
     * /  "token": "P2YkRJOk",
     * /  "steamid32": 900267897,
     * /  "steamid64": 76561198000000000
     * /}
     */
    public validateTradeLink(tradelink: string): Promise<ICheckTradeLink> {
        return this.requestUtils.post(`check-tradelink`, { tradelink });
    }

    /**
     * Get recent purchases - `/history`
     *
     * @param skip skip since by default it returns 50 items
     * @param partner (optional) partner parameter that you passed when buying
     * @param token (optional) token parameter that you passed when buying
     * @example
     * // example response
     * {
     *   "success": true,
     *   "history": [
     *     {
     *       "item_id": "27165625733",
     *       "trade_id": 5114261104,
     *       "token": "ssR242yo",
     *       "partner": 153912146,
     *       "created": "2020-01-18T07:28:12.360Z",
     *       "send_until": "2020-01-18T07:28:12.360Z",
     *       "reason": "Buyer failed to accept",
     *       "id": 4258189,
     *       "image": "https://steamcommunity-a.akamaihd.net/economy/image/class/730/5040342865/200fx125f",
     *       "price": 1200,
     *       "name": "USP-S | Cortex (Field-Tested)",
     *       "status": 6
     *     }
     *   ]
     * }
     */
    public myPurchases(skip = 0, partner: string | undefined = undefined, token: string | undefined = undefined): Promise<IBuyMyHistory> {
        return this.requestUtils.get(`history`, stringify({ skip, partner, token }));
    }
}
