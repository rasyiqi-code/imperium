export type PaymentType =
  | 'qris'
  | 'gopay'
  | 'shopeepay'
  | 'bca'
  | 'bni'
  | 'bri'
  | 'mandiri'
  | 'permata'
  | 'cimb'
  | 'alfamart'
  | 'indomaret'
  | 'akulaku'
  | 'kredivo';

export const VALID_TYPES: PaymentType[] = [
  'qris', 'gopay', 'shopeepay',
  'bca', 'bni', 'bri', 'mandiri', 'permata', 'cimb',
  'alfamart', 'indomaret',
  'akulaku', 'kredivo',
];

export interface ChargePayload {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details: {
    first_name: string;
    email: string;
  };
  item_details: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  custom_field1: string;
  payment_type?: string;
  qris?: { acquirer: string };
  gopay?: { enable_callback: boolean; callback_url: string };
  shopeepay?: { callback_url: string };
  echannel?: { bill_info1: string; bill_info2: string };
  bank_transfer?: { bank: string };
  cstore?: { store: string; message: string };
  kredivo?: { seller_details: { address: { city: string } } };
  [key: string]: unknown;
}

export interface MidtransAction {
  name: string;
  url: string;
}

export interface MidtransVaNumber {
  bank: string;
  va_number: string;
}

export interface MidtransChargeResponse {
  status_code?: string;
  status_message?: string;
  order_id: string;
  transaction_status: string;
  expiry_time: string;
  gross_amount: string;
  actions?: MidtransAction[];
  bill_key?: string;
  biller_code?: string;
  permata_va_number?: string;
  va_numbers?: MidtransVaNumber[];
  store?: string;
  payment_code?: string;
  redirect_url?: string;
}

/**
 * Menyusun payload untuk memanggil endpoint /charge dari Midtrans Core API.
 */
export function buildChargePayload(
  orderId: string,
  amount: number,
  paymentType: PaymentType,
  customerName: string,
  customerEmail: string,
  paketNama: string,
  callbackBaseUrl: string,
): ChargePayload {
  const base: ChargePayload = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: customerName,
      email: customerEmail,
    },
    item_details: [
      {
        id: orderId,
        name: paketNama,
        price: amount,
        quantity: 1,
      },
    ],
    custom_field1: '',
  };

  switch (paymentType) {
    case 'qris':
      return { ...base, payment_type: 'qris', qris: { acquirer: 'gopay' } };
    case 'gopay':
      return {
        ...base,
        payment_type: 'gopay',
        gopay: { enable_callback: true, callback_url: callbackBaseUrl },
      };
    case 'shopeepay':
      return {
        ...base,
        payment_type: 'shopeepay',
        shopeepay: { callback_url: callbackBaseUrl },
      };
    case 'mandiri':
      return {
        ...base,
        payment_type: 'echannel',
        echannel: { bill_info1: 'Payment', bill_info2: 'Imperium VIP' },
      };
    case 'permata':
      return { ...base, payment_type: 'permata' };
    case 'cimb':
      return {
        ...base,
        payment_type: 'bank_transfer',
        bank_transfer: { bank: 'cimb' },
      };
    case 'bca':
    case 'bni':
    case 'bri':
      return {
        ...base,
        payment_type: 'bank_transfer',
        bank_transfer: { bank: paymentType },
      };
    case 'alfamart':
      return {
        ...base,
        payment_type: 'cstore',
        cstore: { store: 'alfamart', message: 'Imperium VIP Payment' },
      };
    case 'indomaret':
      return {
        ...base,
        payment_type: 'cstore',
        cstore: { store: 'indomaret', message: 'Imperium VIP Payment' },
      };
    case 'akulaku':
      return { ...base, payment_type: 'akulaku' };
    case 'kredivo':
      return {
        ...base,
        payment_type: 'kredivo',
        seller_details: { address: { city: 'Jakarta' } },
      };
    default:
      return base;
  }
}

/**
 * Mem-parse respons mentah dari Midtrans Charge menjadi bentuk terstruktur yang mudah dipahami klien.
 */
export function parseChargeResponse(result: MidtransChargeResponse, paymentType: PaymentType) {
  const base = {
    orderId: result.order_id,
    transactionStatus: result.transaction_status,
    expiryTime: result.expiry_time,
    grossAmount: result.gross_amount,
  };

  if (paymentType === 'qris') {
    const qrAction = result.actions?.find((a: MidtransAction) => a.name === 'generate-qr-code');
    return { ...base, type: 'qris' as const, qrUrl: qrAction?.url || '' };
  }

  if (paymentType === 'gopay') {
    const qrAction = result.actions?.find((a: MidtransAction) => a.name === 'generate-qr-code');
    const dlAction = result.actions?.find((a: MidtransAction) => a.name === 'deeplink-redirect');
    return {
      ...base,
      type: 'qris' as const,
      qrUrl: qrAction?.url || '',
      deeplinkUrl: dlAction?.url || '',
    };
  }

  if (paymentType === 'shopeepay') {
    const dlAction = result.actions?.find((a: MidtransAction) => a.name === 'deeplink-redirect');
    return {
      ...base,
      type: 'redirect' as const,
      redirectUrl: dlAction?.url || '',
      redirectLabel: 'Buka ShopeePay',
    };
  }

  if (paymentType === 'mandiri') {
    return {
      ...base,
      type: 'va' as const,
      bank: 'mandiri',
      vaNumber: result.bill_key || '',
      billerCode: result.biller_code || '',
    };
  }

  if (paymentType === 'permata') {
    return {
      ...base,
      type: 'va' as const,
      bank: 'permata',
      vaNumber: result.permata_va_number || '',
    };
  }

  if (['bca', 'bni', 'bri', 'cimb'].includes(paymentType)) {
    const va = result.va_numbers?.[0];
    return {
      ...base,
      type: 'va' as const,
      bank: va?.bank || paymentType,
      vaNumber: va?.va_number || '',
    };
  }

  if (paymentType === 'alfamart' || paymentType === 'indomaret') {
    return {
      ...base,
      type: 'cstore' as const,
      store: result.store || paymentType,
      paymentCode: result.payment_code || '',
    };
  }

  if (paymentType === 'akulaku' || paymentType === 'kredivo') {
    return {
      ...base,
      type: 'redirect' as const,
      redirectUrl: result.redirect_url || '',
      redirectLabel: paymentType === 'akulaku' ? 'Buka Akulaku' : 'Buka Kredivo',
    };
  }

  return { ...base, type: 'unknown' as const };
}
