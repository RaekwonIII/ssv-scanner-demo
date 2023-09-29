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
  .argument("<owner>", "the id of the widget")
  .requiredOption(
    "-o, --operators <operators>",
    "comma separated list of operator ids",
    commaSeparatedList
  ) // an required option flag, this will be in options.o
  .action(async (owner, options, command) => {
    console.log(figlet.textSync("SSV Cluster Snapshot"));
    updateSpinnerText(
      `Getting cluster for owner ${owner} and operators ${options.operators}\n`
    );
    await getClusterSnapshot(owner, options.operators);
    spinnerSuccess();
    // console.debug('Called %s command with options %o', command.name(), options);
  });

async function getClusterSnapshot(owner: string, operators: number[]) {
  try {
    axios(getGraphQLOptions(owner, operators)).then((response) => {
      if (response.status !== 200) throw Error("Request did not return OK");
      if (response.data.data.clusters.length !== 1)
        throw Error("Request returned multiple clusters");
    
      let cluster = response.data.data.clusters.at(0)
      const {id, lastUpdateBlockNumber, ...clusterSnapshot} = cluster;
      console.log(`Cluster snapshot:\n\n`)
      console.log(JSON.stringify(Object.values(clusterSnapshot)));
      console.log(`\nLast updated at block: ${cluster.lastUpdateBlockNumber}.`)
    });
  } catch (err) {
    spinnerError();
    stopSpinner();
    console.error("ERROR DURING AXIOS REQUEST", err);
  }
}

const getGraphQLOptions = (owner: string, operators: number[]) => {
  let clusterId = `${owner.toLowerCase()}-${operators.join("-")}`;
  const headers = {
    "content-type": "application/json",
  };

  const requestBody = {
    query: `
      query clusterSnapshot($clusterId: String!) {
        clusters(where: {id: $clusterId}) {
          id
          validatorCount
          networkFeeIndex
          index
          active
          balance
          lastUpdateBlockNumber
        }
      }`,
    variables: { clusterId: clusterId },
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

function commaSeparatedList(value: string, dummyPrevious: any) {
  return value.split(",");
}
