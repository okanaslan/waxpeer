import { BuyItemsDomain } from "./domains/buy-items";
import { BuyOrderDomain } from "./domains/buy-order";
import { MerchantDepositDomain } from "./domains/merhcant-deposit";
import { SellItemsDomain } from "./domains/sell-items";
import { SteamDomain } from "./domains/steam";
import { UserDomain } from "./domains/user";

export class Waxpeer {
    buyItems: BuyItemsDomain;
    buyOrders: BuyOrderDomain;
    merhantDeposit: MerchantDepositDomain;
    sellItems: SellItemsDomain;
    steam: SteamDomain;
    user: UserDomain;

    constructor(apiKey: string) {
        this.buyItems = new BuyItemsDomain(apiKey);
        this.buyOrders = new BuyOrderDomain(apiKey);
        this.merhantDeposit = new MerchantDepositDomain(apiKey);
        this.sellItems = new SellItemsDomain(apiKey);
        this.steam = new SteamDomain(apiKey);
        this.user = new UserDomain(apiKey);
    }
}
