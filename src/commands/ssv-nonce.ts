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
  .argument("<owner>", "the owner address to get the nonce for")
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
      if (!response.data.data.account) {
        console.error("Response is empty, verify that the owner address exists");
        return;
      }

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

  return {
    method: "POST",
    url:
      process.env.SUBGRAPH_API ||
      "https://api.studio.thegraph.com/query/71118/ssv-network-holesky/version/latest",
    headers: {
      "content-type": "application/json",
    },
    data: {
      query: `
          query ownerNonce($owner: String!) {
              account(id: $owner) {
                  nonce
              }
          }`,
      variables: { owner: owner.toLowerCase() },
    },
  };;
};
