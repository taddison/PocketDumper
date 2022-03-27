import { updateSecretsFile } from "./util.js";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const endpoints = {
  GetRequestToken: "https://getpocket.com/v3/oauth/request",
  GetAccessToken: "https://getpocket.com/v3/oauth/authorize",
  GetArticles: "https://getpocket.com/v3/get",
};

const headers = {
  "Content-Type": "application/json; charset=UTF-8",
  "X-Accept": "application/json",
};

const redirect_uri = "http://localhost:3000";

// https://getpocket.com/developer/docs/authentication
// https://getpocket.com/developer/docs/v3/retrieve

// The request token is also called a code in the pocket authentication APIs
const getRequestToken = async function (consumerKey) {
  const response = await fetch(endpoints.GetRequestToken, {
    method: "POST",
    headers,
    body: JSON.stringify({
      consumer_key: consumerKey,
      redirect_uri,
    }),
  });
  const responseJson = await response.json();
  return responseJson.code;
};

const getAccessToken = async function (requestToken, consumerKey) {
  const response = await fetch(endpoints.GetAccessToken, {
    method: "POST",
    headers,
    body: JSON.stringify({
      consumer_key: consumerKey,
      code: requestToken,
    }),
  });
  const responseJson = await response.json();
  return responseJson.access_token;
};

export const getArticles = async function (
  accessToken,
  consumerKey,
  since = 0
) {
  const response = await fetch(endpoints.GetArticles, {
    method: "POST",
    headers,
    body: JSON.stringify({
      consumer_key: consumerKey,
      access_token: accessToken,
      detailType: "simple",
      sort: "newest",
      since,
      // TODO: Pagination
      count: 1,
    }),
  });
  const responseJson = await response.json();
  const { list: articleList, since: newSince } = responseJson;

  return { articleList, newSince };
};

export const ensureAccessTokenIsValid = async function (
  existingAccessToken,
  ConsumerKey
) {
  // TODO: If there is an access token, check it is still valid

  // If there is no access token, get one and store it in the secrets file
  if (!existingAccessToken) {
    const requestToken = await getRequestToken(ConsumerKey);

    console.log(
      `Please visit https://getpocket.com/auth/authorize?request_token=${requestToken}&redirect_uri=${redirect_uri}`
    );
    const rl = readline.createInterface({ input, output });
    await rl.question(
      "Press enter once you have authorized the application\r\n"
    );
    rl.close();

    const newAccessToken = await getAccessToken(requestToken, ConsumerKey);
    
    await updateSecretsFile(newAccessToken, ConsumerKey);
    return newAccessToken;
  }

  return existingAccessToken;
};
