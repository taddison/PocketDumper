import { exit } from "node:process";
import { readFile, writeFile, access } from "node:fs/promises";

const USER_DATA_FILE_NAME = "userdata.json";

export const getUserData = async function () {
  // Check if the user data file exists
  try {
    await access(USER_DATA_FILE_NAME);
  } catch {
    console.log(`Could not find ${USER_DATA_FILE_NAME}`);
    exit();
  }

  // Read data from user data file
  const userDataContents = await readFile(USER_DATA_FILE_NAME, {
    encoding: "utf8",
  });
  const userData = JSON.parse(userDataContents);

  let { ConsumerKey, AccessToken, Since } = userData;

  if (!ConsumerKey) {
    console.log(`Consumer key is missing from ${USER_DATA_FILE_NAME}`);
    exit();
  }

  return { ConsumerKey, AccessToken };
};

export const updateUserData = async function (updatedData) {
  const existingData = await getUserData();
  
  const newData = { ...existingData, ...updatedData };
  const updatedUserData = JSON.stringify(newData);

  await writeFile(USER_DATA_FILE_NAME, updatedUserData);
};
