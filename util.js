import { exit } from "node:process";
import { readFile, writeFile, access } from "node:fs/promises";

const SECRETS_FILE_NAME = "secrets.json";

export const getSecretsFromFile = async function () {
  // Check if the secrets file exists
  try {
    await access(SECRETS_FILE_NAME);
  } catch {
    console.log(`Could not find ${SECRETS_FILE_NAME}`);
    exit();
  }

  // Read data from secrets file
  const secretFileContents = await readFile(SECRETS_FILE_NAME, {
    encoding: "utf8",
  });
  const secrets = JSON.parse(secretFileContents);

  let { ConsumerKey, AccessToken } = secrets;

  if (!ConsumerKey) {
    console.log(`Consumer key is missing from ${SECRETS_FILE_NAME}`);
    exit();
  }

  return { ConsumerKey, AccessToken };
};

export const updateSecretsFile = async function (AccessToken, ConsumerKey) {
  const updatedSecrets = JSON.stringify({
    AccessToken,
    ConsumerKey,
  });

  await writeFile(SECRETS_FILE_NAME, updatedSecrets);
};
