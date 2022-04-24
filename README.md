# Uniswap v2 Price Listener

This code simply gets all pairs generated from Uniswap Factory v2 (0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f), gets it's basic information and then listens for events on those pairs.
If any pair emits an event we see if price has changed if so we emit it to a socket.

Together there is a small webpage that connects to the localhost socket we would emit the events to when running the main container.

Information we have gathered for each pair is the following:

- Token Symbol
- Decimals
- Address
- Price (calculated from reserves, ie, ratio between tokens of the pair token0reserves/token1reserves)
- Token0 and Token1 addresses

For simplicity sake, it will check on ehtereum mainnet through a free account with infura.

Finally there is a simple website that uses socket.io that when paired with the backend process running, it broadcasts prices updates for the keypairs.


JSON ABI's copied from etherscan.

Factory ABI: https://etherscan.io/address/0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f#code

Pair ABI: https://etherscan.io/address/0x3139Ffc91B99aa94DA8A2dc13f1fC36F9BDc98eE#code

## How to run the program?

Simply `docker-compose build` and `docker-compose up` will get you the listner working and emiting updated to port 3000. After that, simply open the index.html inside source/public to see the website.


## How to develop

I personally used npm run watch:build to build the project everytime I saved and to run I was using nodemon build/main/cli.js listen
Whith these 2 commands you should be able co


## TODO's

- Make the page nicer!
- Add tests
- Few Dockerfile optimizations