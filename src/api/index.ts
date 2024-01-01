import { BuyItemsDomain } from "./buy-items";
import { BuyOrderDomain } from "./buy-order";
import { MerchantDepositDomain } from "./merhcant-deposit";
import { SellItemsDomain } from "./sell-items";
import { SteamDomain } from "./steam";
import { UserDomain } from "./user";

export class WaxpeerAPI {
    user: UserDomain;
    steam: SteamDomain;
    buyItems: BuyItemsDomain;
    buyOrders: BuyOrderDomain;
    sellItems: SellItemsDomain;
    merhantDeposit: MerchantDepositDomain;

    constructor(apiKey: string) {
        this.user = new UserDomain(apiKey);
        this.steam = new SteamDomain(apiKey);
        this.buyItems = new BuyItemsDomain(apiKey);
        this.buyOrders = new BuyOrderDomain(apiKey);
        this.sellItems = new SellItemsDomain(apiKey);
        this.merhantDeposit = new MerchantDepositDomain(apiKey);
    }
}
