const { CognitoIdentityServiceProvider } = require("aws-sdk");
const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider();
const USER_POOL_ID = "us-east-2_oC8WlOkGI";
const stripe = require("stripe")("sk_test_51JFeuQSHtfNo49k1lAdj6j0HIaVvyEBCbS0UBa4Y7D2wy2DTVXnqAXnyvbLYEm3DzPS2AajXbyhSomf9HPkYfMDF00yU81AhxL");

const getUserEmail = async (event) => {
  const params = {
    UserPoolId: USER_POOL_ID,
    Username: event.identity.claims.username
  };
  const user = await cognitoIdentityServiceProvider.adminGetUser(params).promise();
  const { Value: email } = user.UserAttributes.find((attr) => {
    if (attr.Name === "email") {
      return attr.Value;
    }
  });
  return email;
};

/*
 * Get the total price of the order
 * Charge the customer
 */
exports.handler = async (event) => {
  try {
    const { id, cart, total, name, address, token } = event.arguments.input; //added name
    const { username } = event.identity.claims;
    const email = await getUserEmail(event);

    await stripe.charges.create({
      amount: total * 100,
      currency: "INR",
      source: token,
      description: `Order ${new Date()} by ${username} with ${email} email`
    });
    return { id, cart, total, address, name, username, email }; //added name
  } catch (err) {
    throw new Error(err);
  }
};
