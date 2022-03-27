
import { exit } from "node:process";
import { readFile, writeFile, access } from "node:fs/promises";

export const getSecretsFromFile = async function (secretsFileName) {
  // Check if the secrets file exists
  try {
    await access(secretsFileName);
  } catch {
    console.log(`Could not find ${secretsFileName}`);
    exit();
  }

  // Read data from secrets file
  const secretFileContents = await readFile(secretsFileName, {
    encoding: "utf8",
  });
  const secrets = JSON.parse(secretFileContents);

  let { ConsumerKey, AccessToken } = secrets;

  if (!ConsumerKey) {
    console.log(`Consumer key is missing from ${secretsFileName}`);
    exit();
  }

  return { ConsumerKey, AccessToken };
};

export const updateSecretsFile = async function(secretsFileName, AccessToken, ConsumerKey) {
  const updatedSecrets = JSON.stringify({
    AccessToken,
    ConsumerKey,
  });

  await writeFile(secretsFileName, updatedSecrets);
}