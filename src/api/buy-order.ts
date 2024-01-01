import { stringify } from "querystring";
import { RequestUtils } from "../utils/request";
import { EGameId, IBuyOrderHistory, IBuyOrders, ICreateBuyOrder, IEditBuyOrder, IRemoveAllOrders, IRemoveBuyOrder } from "./types";

export class BuyOrderDomain {
    private requestUtils: RequestUtils;

    constructor(apiKey: string) {
        this.requestUtils = new RequestUtils(apiKey);
    }

    /**
     * Buy order trigger history - `/buy-order-history`
     *
     * @param skip (optional) How many orders to skip
     * @param game (optional) Game from supported games (without game param will return for all)
     * @param sort (optional) Sort by date (default: ASC)
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "history": [
     *     {
     *       "id": 0,
     *       "item_name": "string",
     *       "game": "string",
     *       "price": 0,
     *       "created": "2020-03-25T07:10:03.674Z",
     *       "last_updated": "2020-03-25T07:10:03.674Z"
     *     }
     *   ],
     *   "count": 2
     * }
     */
    public buyOrderHistory(skip: number = 0, game?: keyof typeof EGameId, sort: "ASC" | "DESC" = "ASC"): Promise<IBuyOrderHistory> {
        return this.requestUtils.get(`buy-order-history`, stringify({ skip, game, sort }));
    }

    /**
     * Active buy orders. Sorted by price DESC, if a filter by name is specified - `/buy-orders`
     *
     * @param skip (optional) How many orders to skip
     * @param name (optional) Filter by item name
     * @param own (optional) Filter by own orders
     * @param game (optional) Game from supported games (without game param will return for all)
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "offers": [
     *     {
     *       "id": 1,
     *       "name": "MP9 | Hypnotic (Minimal Wear)",
     *       "price": 1,
     *       "amount": 5,
     *       "game": "csgo",
     *       "filled": 2,
     *       "by": "1247ffd5-f437-4a30-9953-10eda7df6e17"
     *     }
     *   ],
     *   "count": 0
     * }
     */
    public buyOrders(skip: number = 0, name?: string, own: "0" | "1" = "0", game?: keyof typeof EGameId): Promise<IBuyOrders> {
        return this.requestUtils.get(`buy-orders`, stringify({ skip, name, own, game }));
    }

    /**
     * Create a buy order to auto purchase items. Currently independent of the p2p status of the user - `/create-buy-order`
     *
     * @param name Item name
     * @param amount Amount of items to buy
     * @param price Max price that you want to buy item for (1000 = 1$)
     * @param game Game from supported games
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "msg": "Placed order",
     *   "filled": 2,
     *   "id": 2007
     * }
     */
    public createBuyOrder(name: string, amount: number, price: number, game: keyof typeof EGameId = "csgo"): Promise<ICreateBuyOrder> {
        return this.requestUtils.post(`create-buy-order`, null, stringify({ name, amount, price, game }));
    }

    /**
     * Edit buy order - `/edit-buy-order`
     *
     * @param id Order id
     * @param amount Amount of items to buy
     * @param price Max price that you want to buy item for (1000 = 1$)
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "msg": "string",
     *   "id": 2007,
     *   "amount": 6,
     *   "price": 2008
     * }
     */
    public editBuyOrder(id: number, amount: number, price: number): Promise<IEditBuyOrder> {
        return this.requestUtils.post(`edit-buy-order`, { id, amount, price });
    }

    /**
     * Remove buy order(s) - `/remove-buy-order`
     *
     * @param ids Either array or one order_id that you want to remove from listing
     * @example
     * // example response:
     * {
     *   "success": true,
     *   "msg": "string",
     *   "removed": 5
     * }
     */
    public removeBuyOrder(ids: number | number[]): Promise<IRemoveBuyOrder> {
        let removeIds: any[] = typeof ids === "object" ? ids : [ids];
        return this.requestUtils.get(`remove-buy-order`, removeIds.map((i) => `id=${i}`).join("&"));
    }

    /**
     * Remove all buy orders by filters - `/remove-all-orders`
     *
     * Remove all orders with filter by game.
     * Note: If response success is false, then some orders may be not removed (due to timeout), removed count will be also available in that case
     *
     * @param game (optional) Game from supported games (without game param will remove all)
     */
    public removeAllOrders(game: keyof typeof EGameId | undefined = undefined): Promise<IRemoveAllOrders> {
        return this.requestUtils.get(`remove-all-orders`, stringify({ game }));
    }
}
