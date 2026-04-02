const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

/**
 * Verify payment with Flutterwave and upgrade user to premium.
 * 
 * Expectations:
 * - data.transaction_id: The ID returned from Flutterwave UI
 * - context.auth: Authenticated user calling the function
 */
exports.verifyPayment = functions.https.onCall(async (data, context) => {
  // 1. Check authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be logged in to verify payment.'
    );
  }

  const transactionId = data.transaction_id;
  const uid = context.auth.uid;

  if (!transactionId) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Transaction ID is required.'
    );
  }

  try {
    // 2. Secret Key (Should ideally be in config/secrets)
    // For now using the provided key directly or via env
    const SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY || 'FLWSECK-423831d117048c3d002a5a4b95c496ae-19d4836888bvt-X';

    // 3. Verify with Flutterwave
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${SECRET_KEY}`
        }
      }
    );

    const result = response.data;

    // 4. Validate transaction
    if (
      result.status === 'success' && 
      result.data.status === 'successful' &&
      result.data.amount >= 2.99 // Basic price check
    ) {
      // 5. Update user profile to premium in Firestore
      await admin.firestore()
        .collection('users')
        .doc(uid)
        .update({
          'profile.isPremium': true,
          'profile.premiumStatus': 'active',
          'profile.paymentRef': transactionId,
          'profile.updatedAt': admin.firestore.FieldValue.serverTimestamp()
        });

      return {
        success: true,
        message: 'Payment verified and access granted!'
      };
    } else {
       console.error('[Verify] Validation failed:', result);
       throw new Error('Payment validation failed on the server.');
    }
  } catch (err) {
    console.error('[Verify] Error verifying payment:', err.message);
    throw new functions.https.HttpsError(
      'internal',
      'Error during payment verification: ' + err.message
    );
  }
});
