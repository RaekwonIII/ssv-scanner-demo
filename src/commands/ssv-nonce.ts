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

export const nonce = new Command("nonce");

nonce
  .argument("<owner>", "the id of the widget")
  // .option("-f, --format <format>", "the format of the widget") // an optional flag, this will be in options.f
  .action(async (owner, options) => {
    console.log(figlet.textSync("SSV Owner Nonce"));
    updateSpinnerText(`Getting nonce for address: ${owner}\n`);
    await getOwnerNonce(owner);
    spinnerSuccess();
  });

async function getOwnerNonce(owner: string) {
  try {
    axios(getGraphQLOptions(owner)).then((response) => {
      if (response.status !== 200) throw Error("Request did not return OK");
      if (!response.data.data.account) throw Error("Response is empty");

      let owner = response.data.data.account;
      
      console.log(`Owner nonce:\n\n${owner.nonce}`);
    });
  } catch (err) {
    spinnerError();
    stopSpinner();
    console.error("ERROR DURING AXIOS REQUEST", err);
  }
}

const getGraphQLOptions = (owner: string) => {
  const headers = {
    "content-type": "application/json",
  };

  const requestBody = {
    query: `
        query clusterSnapshot($owner: String!) {
            account(id: $owner) {
                nonce
            }
        }`,
    variables: { owner: owner.toLowerCase() },
  };

  const graphQLOptions = {
    method: "POST",
    url:
      process.env.NEXT_PUBLIC_LENS_API_URL ||
      "https://api.studio.thegraph.com/query/53804/ssv-subgraph/version/latest",
    headers,
    data: requestBody,
  };

  return graphQLOptions;
};
