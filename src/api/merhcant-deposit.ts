import { stringify } from "querystring";
import { RequestUtils } from "../utils/request";
import {
    IHistory,
    IMerchantDepositsHistory,
    IMerchantInventory,
    IMerchantInventoryUpate,
    IMerchantListItem,
    IMerchantListItemsSteam,
    IMerchantUser,
} from "./types";

export class MerchantDepositDomain {
    private requestUtils: RequestUtils;

    constructor(apiKey: string) {
        this.requestUtils = new RequestUtils(apiKey);
    }

    /**
     * Get recent purchases by filters - `/history`
     *
     * @param partner (optional) Partner from tradelink
     * @param token (optional) Token from tradelink
     * @param skip (optional) How many items to skip
     * @example
     * // example response:
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
    public getHistory(partner?: string, token?: string, skip?: number): Promise<IHistory> {
        return this.requestUtils.get("history", stringify({ partner, token, skip }));
    }

    /**
     * Check if user is in system - `/merchant/user`
     *
     * @param steam_id Steam ID of the user
     * @param merchant Your merchant name
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "user": {
     *     "steam_id": "string",
     *     "can_sell": true,
     *     "can_p2p": true,
     *     "tradelink": "string"
     *   }
     * }
     */
    public getMerchantUser(steam_id: string, merchant: string): Promise<IMerchantUser> {
        return this.requestUtils.get(`merchant/user`, stringify({ steam_id, merchant }));
    }

    /**
     * Insert a user into a system - `/merchant/user`
     *
     * @param merchant Your merchant name
     * @param tradelink User's tradelink
     * @param steam_id Steam ID of the user
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "user": {
     *     "steam_id": "string",
     *     "can_sell": true,
     *     "can_p2p": true,
     *     "tradelink": "string"
     *   },
     *   "msg": "string"
     * }
     */
    public postMerchantUser(merchant: string, tradelink: string, steam_id: string): Promise<IMerchantUser> {
        return this.requestUtils.post(`merchant/user`, { tradelink, steam_id }, stringify({ merchant }));
    }

    /**
     * Fetch user inventory - `/merchant/inventory`
     *
     * Fetch and process user inventory via our system, call this endpoint before calling {@link MerchantInventory|MerchantInventory()} /merchant/inventory GET
     *
     * @param steam_id Steam ID of the user
     * @param merchant Your merchant name
     * @example
     * // example response:
     * {
     *   "success": false,
     *   "msg": "Inventory is closed",
     *   "count": 0
     * }
     */
    public MerchantInventoryUpdate(steam_id: string, merchant: string): Promise<IMerchantInventoryUpate> {
        return this.requestUtils.post(`merchant/inventory`, null, stringify({ steam_id, merchant }));
    }

    /**
     * Get items that you can list for the user - `/merchant/inventory`
     *
     * Display items for the user to select.
     * Will return fetched items by {@link MerchantInventoryUpdate|MerchantInventoryUpdate()} /merchant/inventory POST
     *
     * @param merchant Your merchant name
     * @param steam_id Steam ID of the user
     * @param game Game app_id from supported games (default 730)
     * @param skip (optional) Skip first N items (default 0)
     */
    public MerchantInventory(steam_id: string, merchant: string, game: number = 730, skip: number = 0): Promise<IMerchantInventory> {
        return this.requestUtils.get(`merchant/inventory`, stringify({ steam_id, merchant, game, skip }));
    }

    /**
     * List steam items from inventory - `/merchant/list-items-steam`
     *
     * Which items need to be deposited
     * If instant set to true, the price will be overwritten during processing
     *
     * @param merchant Your merchant name
     * @param steam_id Steam ID of the user
     * @param items Items to list
     * @param item_id Item ID to list
     * @param price Price to list (1000 = 1$)
     * @param instant (optional) Instant listing (default false)
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "msg": "item_not_in_inventory",
     *   "listed": [
     *     {
     *       "item_id": 141414144,
     *       "price": 1000,
     *       "name": "AWP | Asiimov (Field-tested)"
     *     }
     *   ],
     *   "tx_id": "string"
     * }
     */
    public MerchantListItemsSteam(merchant: string, steam_id: string, items: IMerchantListItem[]): Promise<IMerchantListItemsSteam> {
        return this.requestUtils.post(`merchant/list-items-steam`, { items }, stringify({ merchant, steam_id }));
    }

    /**
     * Returns history of deposits - `/merchant/deposits`
     *
     * @param merchant Your merchant name
     * @param steam_id (optional) Steam ID of the user
     * @param tx_id (optional) Transaction ID
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "data": [
     *     {
     *       "id": "string",
     *       "costum_id": "string",
     *       "trade_id": "string",
     *       "tradelink": "string",
     *       "steamid_seller": "string",
     *       "created": "2022-04-14T13:39:51.362Z",
     *       "send_until": "2022-04-14T13:39:51.362Z",
     *       "last_updated": "string",
     *       "reason": "string",
     *       "user": {
     *         "name": "string",
     *         "steam_id": "string",
     *         "steam_joined": 0
     *       },
     *       "items": [
     *         {
     *           "item_id": "string",
     *           "price": 0,
     *           "give_amount": 0,
     *           "name": "string",
     *           "status": 5
     *         }
     *       ]
     *     }
     *   ]
     * }
     */
    public MerchantDepositsHistory(merchant: string, steam_id?: string, tx_id?: string): Promise<IMerchantDepositsHistory> {
        return this.requestUtils.post(`merchant/deposits`, null, stringify({ merchant, steam_id, tx_id }));
    }
}
