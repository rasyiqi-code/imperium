import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getAdminSettings } from '@/lib/adminSettings';

export async function POST(request: Request) {
  try {
    const timestamp = request.headers.get('x-timestamp');
    const signature = request.headers.get('x-signature');
    const partnerId = request.headers.get('x-partner-id');

    if (!timestamp || !signature || !partnerId) {
      console.error('BI SNAP Webhook Error: Missing required headers');
      return NextResponse.json(
        {
          responseCode: '4000000',
          responseMessage: 'Bad Request. Missing required headers',
        },
        { status: 400 }
      );
    }

    const rawBody = await request.text();
    const httpMethod = 'POST';
    const endpointPath = '/api/webhook/bisnap';

    // 1. Dapatkan Public Key Midtrans dari database admin_settings
    const settings = await getAdminSettings();
    const midtransPublicKey = settings?.midtrans_public_key;

    if (!midtransPublicKey) {
      console.error('BI SNAP Webhook Error: MIDTRANS_PUBLIC_KEY is not configured. Webhook rejected.');
      return NextResponse.json(
        {
          responseCode: '4010000',
          responseMessage: 'Unauthorized. Configuration missing.',
        },
        { status: 401 }
      );
    }

    // 2. Susun data to verify
    // Format standard BI SNAP Callback: HTTPMethod:EndpointPath:RawBody:Timestamp
    const dataToVerify = `${httpMethod}:${endpointPath}:${rawBody}:${timestamp}`;

    // 3. Verifikasi Signature menggunakan Public Key Midtrans (SHA256withRSA)
    const verify = crypto.createVerify('SHA256');
    verify.update(dataToVerify);
    
    const isValid = verify.verify(
      midtransPublicKey.replace(/\\n/g, '\n'), // Handle newlines if configured in env
      signature,
      'base64'
    );

    if (!isValid) {
      console.error('BI SNAP Webhook Error: Invalid signature');
      return NextResponse.json(
        {
          responseCode: '4010000',
          responseMessage: 'Unauthorized. Invalid Signature',
        },
        { status: 401 }
      );
    }

    // 4. Parse request body untuk memproses status pembayaran
    const body = JSON.parse(rawBody);
    console.log('BI SNAP Webhook Received:', body);

    // TODO: Implementasikan pemrosesan status transaksi BI SNAP Anda di sini
    // Contoh struktur standard payload BI SNAP untuk VA / Transfer:
    // {
    //   "partnerServiceId": "...",
    //   "customerNo": "...",
    //   "virtualAccountNo": "...",
    //   "virtualAccountName": "...",
    //   "trxId": "...",
    //   "paymentRequestId": "...",
    //   "paymentInfo": {
    //      "amount": { "value": "100000.00", "currency": "IDR" }
    //   },
    //   "status": "SUCCESS" // atau status sesuai spesifikasi
    // }

    // 5. Kembalikan response standard BI SNAP (Response Code 2000000 untuk sukses)
    return NextResponse.json(
      {
        responseCode: '2000000',
        responseMessage: 'Success',
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('BI SNAP Webhook Internal Error:', error);
    return NextResponse.json(
      {
        responseCode: '5000000',
        responseMessage: 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
