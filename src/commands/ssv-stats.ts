import { Command } from "commander";
import {
  spinnerError,
  spinnerInfo,
  spinnerSuccess,
  stopSpinner,
  updateSpinnerText,
} from "../spinner";
import figlet from "figlet";
import axios from "axios";
import { Octokit } from "octokit";

export const stats = new Command("stats");
// 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
// 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
stats
  .argument("<token>", "GitHub api token")
  // .option("-f, --format <format>", "the format of the widget") // an optional flag, this will be in options.f
  .action(async (token, options) => {
    console.log(figlet.textSync("SSV Stats"));
    // console.debug(`using GH token ${token}`);
    updateSpinnerText("Fetching developer activity stats for SSV")
    spinnerInfo(`Getting registerValidator requests per address\n`);
    const validatorCount = await getRegisterValidator();
    
    spinnerInfo(`Getting stats for ssv-keys repo\n`);
    const keysStats = await getSSVKeysStats(token);
    
    spinnerInfo(`Getting stats for ssv-scanner repo\n`);
    const scannerStats = await getSSVScannerStats(token);

    spinnerInfo(`Getting stats for ssv-dkg repo\n`);
    const dkgStats = await getSSVDKGStats(token);

    spinnerSuccess();

    console.log(
      `A total of ${validatorCount?.accountsWithValidators.length} addresses has created at least one validator on SSV`
    );
    console.log(
      `And the average number of validators created per address is: ${validatorCount?.averageValidatorsPerAccount}`
    );
    console.log(
      `Total clones of ssv-keys repo: ${keysStats?.count}, by ${keysStats?.uniques} unique users`
    );
    console.log(
      `Total clones of ssv-scanner repo: ${scannerStats?.count}, by ${scannerStats?.uniques} unique users`
    );
    console.log(
      `Total clones of ssv-dkg repo: ${dkgStats?.count}, by ${dkgStats?.uniques} unique users`
    );
  });

async function getRegisterValidator() {
  try {
    const response = await axios(getGraphQLOptions());

    // console.log(response)
    if (response.status !== 200) throw Error("Request did not return OK");
    if (!response.data.data.accounts) throw Error("Response is empty");

    let accounts = response.data.data.accounts;
    // console.debug(`Found  total of ${accounts.length} addresses`);

    let accountsWithValidators = accounts.filter(
      (account: {
        validators: {
          id: string;
        }[];
      }) => {
        return account.validators.length > 0;
      }
    );

    let totalValidatorsCreated = 0;
    accounts.forEach(
      (account: {
        validators: {
          id: string;
        }[];
      }) => {
        totalValidatorsCreated += account.validators.length;
      }
    );
    let averageValidatorsPerAccount =
      totalValidatorsCreated / accountsWithValidators.length;
    return {
      accountsWithValidators: accountsWithValidators,
      totalValidatorsCreated: totalValidatorsCreated,
      averageValidatorsPerAccount: averageValidatorsPerAccount,
    };
  } catch (err) {
    spinnerError();
    stopSpinner();
    console.error("ERROR DURING AXIOS REQUEST", err);
  }
}

const getGraphQLOptions = () => {
  const headers = {
    "content-type": "application/json",
  };

  const requestBody = {
    query: `
        query clusterSnapshot {
            accounts {
                id
                nonce
                validators{
                    id
                }
            }
        }`,
  };

  const graphQLOptions = {
    method: "POST",
    url:
      process.env.NEXT_PUBLIC_LENS_API_URL ||
      "https://api.studio.thegraph.com/query/53804/ssv-subgraph/v0.0.9",
    headers,
    data: requestBody,
  };

  return graphQLOptions;
};

async function getRepoStats(token: string, owner: string, repo: string) {
  // Octokit.js
  // https://github.com/octokit/core.js#readme
  const octokit = new Octokit({
    auth: token,
  });

  let response = await octokit.request(
    "GET /repos/{owner}/{repo}/traffic/clones",
    {
      owner: owner,
      repo: repo,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    }
  );
  if (response.status !== 200) throw Error("Request did not return OK");
  if (!response.data) throw Error("Response is empty");

  const { clones, ...parsedResponse } = response.data;
  // console.log(parsedResponse)
  return parsedResponse;
}

function getSSVKeysStats(token: string) {
  try {
    const response = getRepoStats(token, "bloxapp", "ssv-keys");
    // console.log(response);
    return response;
  } catch (err) {
    spinnerError();
    stopSpinner();
    console.error("ERROR DURING AXIOS REQUEST", err);
  }
}

function getSSVScannerStats(token: string) {
  try {
    const response = getRepoStats(token, "bloxapp", "ssv-scanner");
    return response;
  } catch (err) {
    spinnerError();
    stopSpinner();
    console.error("ERROR DURING AXIOS REQUEST", err);
  }
}

async function getSSVDKGStats(token: string) {
  try {
    const response = getRepoStats(token, "bloxapp", "ssv-dkg");
    return response;
  } catch (err) {
    spinnerError();
    stopSpinner();
    console.error("ERROR DURING AXIOS REQUEST", err);
  }
}
