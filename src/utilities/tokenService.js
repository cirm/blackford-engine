const twilio = require('twilio');

const AccessToken = twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;

function TokenGenerator(identity, deviceId) {
  const appName = 'Blackford';

  // Create a unique ID for the client on their current device
  const endpointId = `${appName}:${identity}:${deviceId}`;

  // Create a "grant" which enables a client to use IPM as a given user,
  // on a given device
  const chatGrant = new ChatGrant({
    serviceSid: process.env.TWILIO_IPM_SERVICE_SID,
    endpointId,
  });


  // Create an access token which we will sign and return to the client,
  // containing the grant we just created
  const token = new AccessToken(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
    process.env.TWILIO_API_SECRET,
  );

  token.addGrant(chatGrant);
  token.identity = identity;

  return token;
}

module.exports = { generate: TokenGenerator };
