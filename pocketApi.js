const endpoints = {
  GetRequestToken: "https://getpocket.com/v3/oauth/request",
  GetAccessToken: "https://getpocket.com/v3/oauth/authorize",
  GetArticles: "https://getpocket.com/v3/get",
};

const headers = {
  "Content-Type": "application/json; charset=UTF-8",
  "X-Accept": "application/json",
};

// https://getpocket.com/developer/docs/authentication
// https://getpocket.com/developer/docs/v3/retrieve

// The request token is also called a code in the pocket authentication APIs
export const getRequestToken = async function (consumerKey, redirectUri) {
  const response = await fetch(endpoints.GetRequestToken, {
    method: "POST",
    headers,
    body: JSON.stringify({
      consumer_key: consumerKey,
      redirect_uri: redirectUri,
    }),
  });
  const responseJson = await response.json();
  return responseJson.code;
};

export const getAccessToken = async function (requestToken, consumerKey) {
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

export const getArticles = async function (accessToken, consumerKey, since = 0) {
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