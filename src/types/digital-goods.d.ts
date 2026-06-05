interface DigitalGoodsPrice {
  currency: string;
  value: string;
}

interface DigitalGoodsItemDetails {
  itemId: string;
  title: string;
  description?: string;
  price: DigitalGoodsPrice;
}

interface DigitalGoodsPurchase {
  itemId: string;
  purchaseToken: string;
}

interface DigitalGoodsService {
  getDetails(itemIds: string[]): Promise<DigitalGoodsItemDetails[]>;
  listPurchases(): Promise<DigitalGoodsPurchase[]>;
  consume(purchaseToken: string): Promise<void>;
}

interface Window {
  getDigitalGoodsService?(
    paymentMethod: 'https://play.google.com/billing' | string,
  ): Promise<DigitalGoodsService>;
}
