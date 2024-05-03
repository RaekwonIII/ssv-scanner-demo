import { Command } from "commander";
import {
  spinnerError,
  spinnerInfo,
  spinnerSuccess,
  stopSpinner,
  updateSpinnerText,
} from "../spinner";
import * as figlet from "figlet";
import axios from "axios";

export const cluster = new Command("cluster");

cluster
  .version("0.0.1", "-v, --vers", "output the current version")
  .argument("<owner>", "the address of the cluster owner")
  .requiredOption(
    "-o, --operators <operators>",
    "comma separated list of ids of operators part of the cluster",
    commaSeparatedList
  ) // an required option flag, this will be in options.o
  .action(async (owner, options, command) => {
    console.log(figlet.textSync("SSV Cluster Snapshot"));
    updateSpinnerText(
      `Getting cluster snapshot for owner ${owner} and operators ${options.operators}\n`
    );
    await getClusterSnapshot(owner, options.operators);
    spinnerSuccess();
    // console.debug('Called %s command with options %o', command.name(), options);
  });

async function getClusterSnapshot(owner: string, operators: number[]) {
  try {
    axios(getGraphQLOptions(owner, operators)).then((response) => {
      if (response.status !== 200) throw Error("Request did not return OK");
      if (!response.data.data.cluster) {
        console.error("Response is empty, verify that the cluster exists");
        return;
      }

      let cluster = response.data.data.cluster;
      const { id, lastUpdateBlockNumber, ...clusterSnapshot } = cluster;
      console.log(`Cluster snapshot:\n\n`);
      console.log(JSON.stringify(Object.values(clusterSnapshot)));
      console.log(`\nLast updated at block: ${cluster.lastUpdateBlockNumber}.`);
    });
  } catch (err) {
    spinnerError();
    stopSpinner();
    console.error("ERROR DURING AXIOS REQUEST", err);
  }
}

const getGraphQLOptions = (owner: string, operators: number[]) => {

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
        query clusterSnapshot($clusterId: String!) {
          cluster(id: $clusterId) {
            validatorCount
            networkFeeIndex
            index
            active
            balance
          }
        }`,
      variables: { clusterId: `${owner.toLowerCase()}-${operators.join("-")}` },
    },
  };
};

function commaSeparatedList(value: string, dummyPrevious: any) {
  return value.split(",");
}
