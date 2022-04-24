import PromisePool from "@supercharge/promise-pool/dist";
import { AbiSymbol } from "./abis";

import { createServer } from "http";
import { Server } from "socket.io";
const Web3 = require('web3');
const { AbiFactory, factoryAddress, AbiPair } = require('./abis');

interface Pair {
  address: string,
  decimals: number,
  symbol: string,
  token0: string,
  token1: string,
  price: number
}


export class UniswapListenerCli {
  async handle(): Promise<void> {
    const web3 = new Web3(process.env.RPC_URL);

    const factoryContract = new web3.eth.Contract(AbiFactory, factoryAddress);

    const total_pairs = await factoryContract.methods.allPairsLength().call();
    const allPairs:Pair[] = [];

    const httpServer = createServer();
    const io = new Server(httpServer, {cors: {
      origin: '*',
    }});
    httpServer.listen(3000)

    io.emit("Starting to load pairs...");

    await PromisePool
      .withConcurrency(100)
      .for([...Array(Number.parseInt(total_pairs)).keys()])
      .process(async(i: number) => {
        const pairAddress = await factoryContract.methods.allPairs(i).call();
        const pairContract = new web3.eth.Contract(AbiPair, pairAddress);

        const [pairDecimals, pairSymbol, pairToken0, pairToken1, pairReserves] = await Promise.all([
          pairContract.methods.decimals().call(),
          pairContract.methods.symbol().call(),
          pairContract.methods.token0().call(),
          pairContract.methods.token1().call(),
          pairContract.methods.getReserves().call(),
        ]);

        const token0Contract = new web3.eth.Contract(AbiSymbol, pairToken0);
        const token1Contract = new web3.eth.Contract(AbiSymbol, pairToken1);
        
        const [token0Symbol, token1Symbol] = await Promise.all([
          token0Contract.methods.symbol().call(),
          token1Contract.methods.symbol().call(),
        ])

        const price = pairReserves[0] / pairReserves[1];
        allPairs.push({address: pairAddress, decimals: pairDecimals, symbol: `${token0Symbol}/${token1Symbol}:${pairSymbol}`, token0: pairToken0, token1: pairToken1, price: price})
        console.log('New pair added', pairAddress)
        io.emit(`New Pair added. ${token0Symbol}/${token1Symbol}:${pairSymbol} (${pairAddress})`)
      })

   
    console.log('Ready to listen for new prices!')

    const options = {
      address: allPairs.map((p) => p.address),   
      topics: []                              //What topics to subscribe to (maybe look into that as I am not sure which events are relevant)
    };

    const subscription = web3.eth.subscribe('logs', options)
    subscription.on('data', async (event) =>  {
      console.log('NEW EVENT', event)
      const { address } = event;
      const pairContract = new web3.eth.Contract(AbiPair, address);
      const pairReserves = await pairContract.methods.getReserves().call();
      const new_price = pairReserves[0] / pairReserves[1]

      const foundPair = allPairs.find((p) => p.address === address)
      if (new_price !== foundPair.price) {
        // Emit new price and update
        io.emit(`New price for ${new_price}. Old Price was: ${foundPair.price}`);
        foundPair.price = new_price
      };
    });
  }
}
