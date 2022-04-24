import { program } from 'commander'
import { UniswapListenerCli } from './cli/UniswapListenerCli'

import container from './container'

program.version('0.0.1')

require('dotenv').config();

const handle = async(commandName, ...params) => {
  const command = container.get(commandName)
  await command.handle(...params)
}

program
  .command('listen')
  .description('Loads Uniswap v2 pairs and starts to listen for events')
  .action(async () => {
    await handle(UniswapListenerCli.name)
  })


program.parse(process.argv)
