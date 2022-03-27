import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from 'node:process';
import { writeFile } from 'node:fs/promises';
import * as secrets from "./secrets.json" assert { type: "json" };

// TODO: Attempt to read secrets.json and fail with a better error message if it doesn't exist

let { default: { ConsumerKey, AccessToken }} = secrets;

const constants = {
  RedirectUri: "http://localhost:3000"
}

const endpoints = {
  GetRequestToken: "https://getpocket.com/v3/oauth/request",
  GetAccessToken: "https://getpocket.com/v3/oauth/authorize",
  GetArticles: "https://getpocket.com/v3/get"
}

const headers = {
  "Content-Type": "application/json; charset=UTF-8",
  "X-Accept": "application/json"
};

// https://getpocket.com/developer/docs/authentication
// https://getpocket.com/developer/docs/v3/retrieve

// The request token is also called a code in the pocket authentication APIs
const getRequestToken = async function(consumerKey, redirectUri) {
  const response = await fetch(
    endpoints.GetRequestToken,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        consumer_key: consumerKey,
        redirect_uri: redirectUri
      })
    }
  );
  const responseJson = await response.json();
  return responseJson.code;
};

const getAccessToken = async function(requestToken, consumerKey) {
  const response = await fetch(
    endpoints.GetAccessToken,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        consumer_key: consumerKey,
        code: requestToken
      })
    }
  );
  const responseJson = await response.json();
  return responseJson.access_token;
};

const getArticles = async function(accessToken, consumerKey, since = 0) {
  const response = await fetch(
    endpoints.GetArticles,
    {
      method: "POST",
      headers,
      body: JSON.stringify({
        consumer_key: consumerKey,
        access_token: accessToken,
        detailType: "simple",
        sort: "newest",
        since,
        // TODO: Pagination
        count: 1
      })
    }
  );
  const responseJson = await response.json();
  const { list: articleList, since: newSince } = responseJson;
  
  return { articleList, newSince };
};

// TODO: Check access token is still valid
if(!AccessToken) {
  const requestToken = await getRequestToken(ConsumerKey, constants.RedirectUri);
  
  console.log(`Please visit https://getpocket.com/auth/authorize?request_token=${requestToken}&redirect_uri=${constants.RedirectUri}`);
  const rl = readline.createInterface( {input, output });
  await rl.question('Press enter once you have authorized the application\r\n');
  rl.close();
  
  const accessToken = await getAccessToken(requestToken, ConsumerKey);
  AccessToken = accessToken;

  const updatedSecrets = JSON.stringify({
    AccessToken,
    ConsumerKey
  });

  await writeFile("secrets.json", updatedSecrets);
}

const { articleList, newSince } = await getArticles(AccessToken, ConsumerKey);
console.log({articles: Object.keys(articleList).length, newSince});

// TODO: Write to file