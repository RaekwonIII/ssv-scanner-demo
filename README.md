# ssv-scanner-demo

 A simple demonstrative command line tool to obtain SSV cluster snapshot and nonce through a Subgraph API.

 The Subgraph has been separately developed and can be found [at this repository](https://github.com/RaekwonIII/ssv-subgraph). This project has been built to showcase how to use the Subgraph, it should be used to take inspiration from the queries used and post processing of the response.


**⚠️ DO NOT USE THIS CODE OR THE TOOL ITSELF IN PRODUCTION**

## Install

To install dependencies:

```bash
bun install
```
## Quickstart

To show the command help, run:

```bash
bun index.ts -h
```

## Cluster snapshot

To obtain a cluster snapshot, run:

```bash
bun index.ts cluster <OWNER_ADDRESS> -o <OPERATOR_IDS>
```

Where `OPERATOR_IDS` is a comma-separated list of integers

### Output example

```sh
⇒  bun index.ts cluster 0xaa184b86b4cdb747f4a3bf6e6fcd5e27c1d92c5c -o 9,13,19,24

  ____ ______     __   ____ _           _              ____                        _           _   
 / ___/ ___\ \   / /  / ___| |_   _ ___| |_ ___ _ __  / ___| _ __   __ _ _ __  ___| |__   ___ | |_ 
 \___ \___ \\ \ / /  | |   | | | | / __| __/ _ \ '__| \___ \| '_ \ / _` | '_ \/ __| '_ \ / _ \| __|
  ___) |__) |\ V /   | |___| | |_| \__ \ ||  __/ |     ___) | | | | (_| | |_) \__ \ | | | (_) | |_ 
 |____/____/  \_/     \____|_|\__,_|___/\__\___|_|    |____/|_| |_|\__,_| .__/|___/_| |_|\___/ \__|
                                                                        |_|                        
✔ Getting cluster snapshot for owner 0xaa184b86b4cdb747f4a3bf6e6fcd5e27c1d92c5c and operators 9,13,19,24

Cluster snapshot:


["1","0","73678709504",true,"4693105883840000000"]

Last updated at block: 9723183.
```

The line with `["1","0","73678709504",true,"4693105883840000000"]` is the cluster snapshot, containing the exact data needed to submit a transaction to the SSVNetwork contract

## Owner nonce

```sh
bun index.ts nonce <OWNER_ADDRESS>
```

### Output example

```sh
⇒  bun index.ts nonce 0xaa184b86b4cdb747f4a3bf6e6fcd5e27c1d92c5c

  ____ ______     __   ___                             _   _                      
 / ___/ ___\ \   / /  / _ \__      ___ __   ___ _ __  | \ | | ___  _ __   ___ ___ 
 \___ \___ \\ \ / /  | | | \ \ /\ / / '_ \ / _ \ '__| |  \| |/ _ \| '_ \ / __/ _ \
  ___) |__) |\ V /   | |_| |\ V  V /| | | |  __/ |    | |\  | (_) | | | | (_|  __/
 |____/____/  \_/     \___/  \_/\_/ |_| |_|\___|_|    |_| \_|\___/|_| |_|\___\___|
                                                                                  
✔ Getting nonce for address: 0xaa184b86b4cdb747f4a3bf6e6fcd5e27c1d92c5c

Owner nonce:

4
```

In this case, the owner nonce is `4`.

## Notes

This project was created using `bun init` in bun v1.0.2. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
