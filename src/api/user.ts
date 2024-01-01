import { stringify } from "querystring";
import { ICheckTradeLink, IMyHistory, ISetMyKeys, IUser } from "./types";
import { RequestUtils } from "../utils/request";

export class UserDomain {
    private requestUtils: RequestUtils;

    constructor(apiKey: string) {
        this.requestUtils = new RequestUtils(apiKey);
    }

    /**
     * Get Profile data - `/user`
     *
     * @example
     * // example response:
     * {
     *  "success": true,
     *  "user": {
     *  "wallet": 1000,
     *  "id": "11d6f117-1ad2-47e1-aca1-bcasdf9e37fa",
     *  "userid": 1,
     *  "id64": "765611983383140000",
     *  "avatar": "https://www.gravatar.com/avatar/31609d41eb6ccb405b1984967693de76?d=identicon&r=pg&s=32",
     *  "name": "WAXPEER",
     *  "sell_fees": 0.95,
     *  "can_p2p": true,
     *  "tradelink": "https://steamcommunity.com/tradeoffer/new/?partner=378049039&token=XWpC4ZTT",
     *  "login": "makc",
     *  "ref": "waxpeer",
     *  "sell_status": true
     *  }
     * }
     */
    public getProfile(): Promise<IUser> {
        return this.requestUtils.get("user");
    }

    /**
     * Fetch trades and transactions by one request, maximum 100 in response.
     *
     * @param skip Skip to get next results (max 1000)
     * @param start Start date
     * @param end End date
     * @param sort (optional) Sort by creation time
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "data": {
     *     "trades": [
     *       {
     *         "date": "2022-10-29T23:58:17.318Z",
     *         "created": "2022-10-29T23:52:17.318Z",
     *         "id": 4258120,
     *         "item_id": "27341302961",
     *         "give_amount": 22,
     *         "image": "https://steamcommunity-a.akamaihd.net/economy/image/class/730/4839650857/200fx125f",
     *         "price": 24,
     *         "game": "csgo",
     *         "name": "Sticker | BIG | Antwerp 2022",
     *         "status": 5,
     *         "average": 30,
     *         "action": "buy"
     *       }
     *     ],
     *     "transactions": [
     *       {
     *         "wallet": "string",
     *         "type": "BTC",
     *         "status": "completed",
     *         "amount": "10256672",
     *         "give_amount": "10256672",
     *         "direction": "in",
     *         "date": "2022-01-22T01:22:43.021Z"
     *       }
     *     ]
     *   }
     * }
     */
    public myHistory(skip: number, start: string, end: string, sort: "ASC" | "DESC" = "DESC"): Promise<IMyHistory> {
        return this.requestUtils.post("my-history", { skip, start, end, sort });
    }

    /**
     * Change your tradelink - `/change-tradelink`
     * @param tradelink Your new tradelink
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
    public changeTradeLink(tradelink: string): Promise<ICheckTradeLink> {
        return this.requestUtils.post("change-tradelink", { tradelink });
    }

    /**
     * Connect steam api and waxpeer api - `/set-my-steamapi`
     *
     * @param steam_api (optional) you can pass a steam api to waxpeer
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "msg": "string"
     * }
     */
    public setMyKeys(steam_api: string): Promise<ISetMyKeys> {
        return this.requestUtils.get("set-my-steamapi", stringify({ steam_api }));
    }
}
