import { updateUserData } from "./util.js";
// @ts-ignore // no definitions yet - see https://github.com/DefinitelyTyped/DefinitelyTyped/pull/59287
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
  since = 0,
  count = 99999
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
      count,
      // TODO: Pagination
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
  // Check if the token is valid - if so return it, otherwise get a new one
  if (existingAccessToken) {
    try {
      // Is there a better way to check our token is valid?
      const beginningOfTime = 0;
      const articleCount = 1;
      await getArticles(
        existingAccessToken,
        ConsumerKey,
        beginningOfTime,
        articleCount
      );
      return existingAccessToken;
    } catch {
      // TODO: Check if this is an authentication error or something else
      console.log("Access token is invalid, requesting a new token...");
    }
  }

  // Either no token or the existing token was invalid
  const requestToken = await getRequestToken(ConsumerKey);

  console.log(
    `Please visit https://getpocket.com/auth/authorize?request_token=${requestToken}&redirect_uri=${redirect_uri}`
  );
  const rl = readline.createInterface({ input, output });
  await rl.question("Press enter once you have authorized the application\r\n");
  rl.close();

  const newAccessToken = await getAccessToken(requestToken, ConsumerKey);

  await updateUserData({ AccessToken: newAccessToken });
  return newAccessToken;
};
