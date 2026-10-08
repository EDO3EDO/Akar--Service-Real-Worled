import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import axios, {AxiosError} from "axios";

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

const PAYMOB_API_KEY =
  "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNkl" +
  "rMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRJd05UYzROU3dpYm1GdFpTSTZ" +
  "JbWx1YVhScFlXd2lmUS52UWtQZkNCckV5UTFSTno1c3hGOGVfYUNlRjhCSzBqVlNBR29" +
  "jYUxOa2EtUEhFM3RHcEktVEZ6QVNRNFk1ZVRvTHR4OUY1Z1VyM2daVVlGZVVhSWdqQQ==";
const INTEGRATION_ID_CARD = 5809243;

/**
 * Interface representing Paymob billing data structure.
 */
interface PaymobBillingData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  currency?: string;
  apartment: string;
  floor?: string;
  street?: string;
  building?: string;
  shipping_method?: string;
  postal_code?: string;
  city?: string;
  country?: string;
  state?: string;
}

/**
 * Interface representing the incoming payment request payload.
 */
interface PaymentPayload {
  paymentType?: "subscription" | "service";
  user: {
    uid: string;
    email: string;
    name: string;
    phone?: string;
  };

  planInfo?: {
    planId: "basic" | "premium" | string;
    billingCycle: "monthly" | "yearly";
    amount?: number;
  };

  serviceInfo?: {
    serviceId: string;
    type?: "service" | "offer";
    icon?: string;
  };
}

/**
 * Retrieves authentication token from Paymob API.
 * @return {Promise<string>} The authentication token.
 */
async function getAuthToken(): Promise<string> {
  try {
    const response = await axios.post(
      "https://accept.paymob.com/api/auth/tokens",
      {api_key: PAYMOB_API_KEY}
    );
    return response.data.token;
  } catch (error) {
    const err = error as AxiosError;
    const msg = JSON.stringify(err.response?.data) || err.message;
    throw new Error("Auth failed: " + msg);
  }
}

/**
 * Creates an order in Paymob system.
 * @param {string} token Paymob auth token.
 * @param {number} amountCents Order amount in cents.
 * @param {string} merchantOrderId Merchant unique order ID.
 * @param {string} itemName Item name description.
 * @return {Promise<number>} The Paymob order ID.
 */
async function createPaymobOrder(
  token: string,
  amountCents: number,
  merchantOrderId: string,
  itemName: string
): Promise<number> {
  try {
    const response = await axios.post(
      "https://accept.paymob.com/api/ecommerce/orders",
      {
        auth_token: token,
        delivery_needed: "false",
        amount_cents: Math.round(amountCents),
        currency: "EGP",
        merchant_order_id: merchantOrderId,
        items: [
          {
            name: itemName,
            amount_cents: Math.round(amountCents),
            description: itemName,
            quantity: 1,
          },
        ],
      }
    );
    return response.data.id;
  } catch (error) {
    const err = error as AxiosError;
    const detailMsg = JSON.stringify(err.response?.data) || err.message;
    console.error("Paymob Create Order Error Detail:", detailMsg);
    throw new Error("Order creation failed: " + detailMsg);
  }
}

/**
 * Generates payment key token for Paymob iframe.
 * @param {string} token Paymob auth token.
 * @param {number} orderId Paymob order ID.
 * @param {number} amountCents Amount in cents.
 * @param {PaymobBillingData} billingData Client billing info.
 * @return {Promise<string>} The payment key token.
 */
async function getPaymentKey(
  token: string,
  orderId: number,
  amountCents: number,
  billingData: PaymobBillingData
): Promise<string> {
  try {
    const response = await axios.post(
      "https://accept.paymob.com/api/acceptance/payment_keys",
      {
        auth_token: token,
        amount_cents: Math.round(amountCents),
        expiration: 3600,
        order_id: orderId,
        billing_data: billingData,
        currency: "EGP",
        integration_id: INTEGRATION_ID_CARD,
      }
    );
    return response.data.token;
  } catch (error) {
    const err = error as AxiosError;
    const detailMsg = JSON.stringify(err.response?.data) || err.message;
    console.error("Paymob Payment Key Error Detail:", detailMsg);
    throw new Error("Payment Key generation failed: " + detailMsg);
  }
}

export const generatePaymobPaymentKey = onCall(async (request) => {
  const data = request.data as PaymentPayload;
  const {
    user,
    planInfo,
    serviceInfo,
    paymentType = "subscription",
  } = data || {};

  let finalAmount = 0;
  let itemName = "";
  let serviceTypeName = "";
  let serviceIcon = "";

  const userId = user?.uid || request.auth?.uid || "guest";

  try {
    if (paymentType === "service" && serviceInfo?.serviceId) {
      const colName = serviceInfo.type === "offer" ?
        "recommended_offers" : "services";

      const serviceRef = db.collection(colName).doc(serviceInfo.serviceId);
      const serviceSnap = await serviceRef.get();

      if (!serviceSnap.exists) {
        throw new HttpsError(
          "not-found",
          "الخدمة أو العرض المطلوب غير موجود في قاعدة البيانات."
        );
      }

      const serviceData = serviceSnap.data();
      finalAmount = serviceData?.["price"] || 0;
      serviceTypeName = serviceData?.["name"] ||
        serviceData?.["title"] ||
        serviceInfo.serviceId;
      serviceIcon = serviceInfo.icon ||
        serviceData?.["icon"] ||
        serviceData?.["imageUrl"] ||
        "";
      itemName = `طلب: ${serviceTypeName}`;
    } else {
      const planType = planInfo?.planId || "basic";
      finalAmount = planInfo?.["amount"] || 100;
      itemName = `اشتراك باقة ${planType}`;
    }

    if (finalAmount <= 0) {
      throw new HttpsError("invalid-argument", "مبلغ الدفع غير صالح.");
    }

    const amountCents = Math.round(finalAmount * 100);

    const nameParts = (user?.name || "Client User").trim().split(" ");
    const firstName = nameParts[0] || "Client";
    const lastName = nameParts.slice(1).join(" ") || "User";

    const billingData: PaymobBillingData = {
      first_name: firstName,
      last_name: lastName,
      email: user?.email || "test@example.com",
      phone_number: user?.phone || "+201000000000",
      floor: "NA",
      apartment: "b12",
      street: "NA",
      building: "NA",
      shipping_method: "PKG",
      postal_code: "NA",
      city: "Cairo",
      country: "EG",
      state: "Cairo",
    };

    const uniqueRandom = Math.floor(1000 + Math.random() * 9000);
    const timestamp = Date.now();
    let merchantOrderId = "";

    if (paymentType === "service") {
      merchantOrderId =
        `SERVICE_${userId}_${serviceInfo?.serviceId}_` +
        `${timestamp}_${uniqueRandom}`;
    } else {
      merchantOrderId =
        `SUB_${userId}_${planInfo?.planId || "basic"}_` +
        `${timestamp}_${uniqueRandom}`;
    }

    const authToken = await getAuthToken();
    const paymobOrderId = await createPaymobOrder(
      authToken,
      amountCents,
      merchantOrderId,
      itemName
    );

    const paymentKey = await getPaymentKey(
      authToken,
      paymobOrderId,
      amountCents,
      billingData
    );

    let firestoreOrderId = null;

    if (paymentType === "service") {
      const serial = Math.floor(100000 + Math.random() * 900000);
      const newOrder = {
        clientId: userId,
        workerstatus: "pending",
        icon: serviceIcon,
        workerId: "",
        serviceType: serviceTypeName,
        price: finalAmount,
        status: 1,
        serialNumber: `#${serial}`,
        paymobOrderId: paymobOrderId,
        merchantOrderId: merchantOrderId,
        creatdAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      const orderDocRef = await db.collection("orders").add(newOrder);
      firestoreOrderId = orderDocRef.id;
    }

    return {
      success: true,
      paymentKey,
      orderId: paymobOrderId,
      firestoreOrderId,
      merchantOrderId,
      paymentType,
      amount: finalAmount,
    };
  } catch (error) {
    const err = error as Error;
    console.error("Function Handler Catch:", err.message);
    if (err instanceof HttpsError) {
      throw err;
    }
    throw new HttpsError("internal", err.message);
  }
});
