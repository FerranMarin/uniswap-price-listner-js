import container from 'simple-di'

import {UniswapListenerCli} from "./cli/UniswapListenerCli"

container.register(UniswapListenerCli.name, () => new UniswapListenerCli())

export default container
