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
// 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7
stats
  .argument("<token>", "GitHub api token")
  // .option("-f, --format <format>", "the format of the widget") // an optional flag, this will be in options.f
  .action(async (token, options) => {
    console.log(figlet.textSync("SSV Stats"));
    let t = process.env.GH_API_TOKEN || "asd"
    console.log(t)
    // console.debug(`using GH token ${token}`);
    updateSpinnerText("Fetching developer activity stats for SSV");
    spinnerInfo(`Getting registerValidator requests per address\n`);
    const validatorCount = await getRegisterValidator();

    spinnerInfo(`Getting stats for ssv-keys repo\n`);
    const keysStats = await getSSVKeysStats(t);

    spinnerInfo(`Getting stats for ssv-scanner repo\n`);
    const scannerStats = await getSSVScannerStats(t);

    spinnerInfo(`Getting stats for ssv-dkg repo\n`);
    const dkgStats = await getSSVDKGStats(t);

    spinnerSuccess();

    console.log(
      `A total of ${validatorCount?.accountsWithValidators} addresses has created at least one validator on SSV`
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
    let validatorsAdded: { owner: string }[] = [];
    let skip = 0;
    while (true) {
      const response = await axios(getGraphQLOptions(skip));
      // console.log(`Got ${response.status} response.`);
      if (response.status !== 200) throw Error("Request did not return OK");
      if (response.data.data.validatorAddeds.length == 0) break;
      
      validatorsAdded = [...validatorsAdded, ...response.data.data.validatorAddeds];
      console.log(`Obtained ${validatorsAdded.length} items.`);
      skip += 1000;
    }

    let uniqueOwners = new Set(
      validatorsAdded.map((event: { owner: any }) => event.owner)
    );

    return {
      accountsWithValidators: uniqueOwners.size,
      totalValidatorsCreated: validatorsAdded.length,
      averageValidatorsPerAccount: validatorsAdded.length / uniqueOwners.size,
    };
  } catch (err) {
    spinnerError();
    stopSpinner();
    console.error("ERROR DURING AXIOS REQUEST", err);
  }
}

const getGraphQLOptions = (skip: number) => {
  const headers = {
    "content-type": "application/json",
  };
// where: {blockTimestamp_lte: "1696032000"} // 29/09/2023
  const requestBody = {
    query: `
      query getValidatorAddedEvents($skip: Int!) {
        validatorAddeds(skip: $skip, first: 1000, orderBy: blockNumber) {
          owner
        }
      }`,
    variables: { skip: skip },
  };

  const graphQLOptions = {
    method: "POST",
    url:
      process.env.SUBGRAPH_ENDPOINT ||
      "https://api.thegraph.com/subgraphs/name/raekwoniii/ssv-goerli",
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
