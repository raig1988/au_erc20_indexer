import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { Alchemy, Network, Utils } from 'alchemy-sdk';
import { useEffect, useState } from 'react';

//rainbow connect
import { ConnectButton } from '@rainbow-me/rainbowkit';
// wagmi with rainbow
import { useAccount } from 'wagmi'

const config = {
  apiKey: import.meta.env.VITE_ALCHEMY_MAINNET_API,
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(config);

function App() {
  // rainbow and wagmi
  const { address } = useAccount();

  const [userAddress, setUserAddress] = useState('');
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function getTokenBalance(searchAddress) {
    try {    
      setLoading(true);
  
      const data = await alchemy.core.getTokenBalances(searchAddress);

      setResults(data);
  
      const tokenDataPromises = [];
  
      for (let i = 0; i < data.tokenBalances.length; i++) {
        const tokenData = alchemy.core.getTokenMetadata(
          data.tokenBalances[i].contractAddress
        );
        tokenDataPromises.push(tokenData);
      }
      setTokenDataObjects(await Promise.all(tokenDataPromises));
      setError('');
      setHasQueried(true);
      setLoading(false);

    } catch(e) {
      setError(e.toString());
    }
  }

  useEffect(() => {
    if(address != undefined) {
      getTokenBalance(address);
    }
  }, [address])

  return (
    <>
      <Flex justifyContent="end" padding={"50px 100px"}>
        <ConnectButton />
      </Flex>
      <Box w="100vw">
        <Center>
          <Flex
            alignItems={'center'}
            justifyContent="center"
            flexDirection={'column'}
          >
            <Heading mb={0} fontSize={36}>
              ERC-20 Token Indexer
            </Heading>
            <Text>
              Plug in an address and this website will return all of its ERC-20
              token balances!
            </Text>
          </Flex>
        </Center>
        <Flex
          w="100%"
          flexDirection="column"
          alignItems="center"
          justifyContent={'center'}
        >
          <Heading mt={42}>
            Get all the ERC-20 token balances of this address:
          </Heading>
          <Input
            onChange={(e) => setUserAddress(e.target.value)}
            color="black"
            w="600px"
            textAlign="center"
            p={4}
            bgColor="white"
            fontSize={24}
          />
          <Button fontSize={20} onClick={() => getTokenBalance(userAddress)} mt={36} bgColor="white">
            Check ERC-20 Token Balances
          </Button>

          <Heading my={36}>ERC-20 token balances:</Heading>
          {
            loading && !error ?
            <p>Loading...</p> 
            : error ? (
              <>
                <p>Error inputing your data, you need to set a valid ethereum address or ENS or have balance of ERC20's in that account</p>
                <p>{error}</p>
              </>
            )
            : hasQueried ? (
            <SimpleGrid w={'90vw'} columns={4} spacing={24}>
              {results.tokenBalances.map((e, i) => {
                return (
                  <Flex
                    flexDir={'column'}
                    color="black"
                    bg="white"
                    w={'20vw'}
                    key={e.id}
                    border={'black solid'}
                    borderRadius={'10%'}
                    alignItems={'center'}
                    justifyContent={'center'}
                    padding={'5px 5px'}
                  >
                    <Box>
                      <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                    </Box>
                    <Box>
                      <b>Balance:</b>&nbsp;
                      {parseInt(Utils.formatUnits(
                        e.tokenBalance,
                        tokenDataObjects[i].decimals
                      )).toFixed(2)}
                    </Box>
                    <Image src={tokenDataObjects[i].logo} width={'50%'} />
                  </Flex>
                );
              })}
            </SimpleGrid>
          ) : (
            'Please make a query! This may take a few seconds...'
          )
          }
          {/* {hasQueried ? (
            <SimpleGrid w={'90vw'} columns={4} spacing={24}>
              {results.tokenBalances.map((e, i) => {
                return (
                  <Flex
                    flexDir={'column'}
                    color="white"
                    bg="blue"
                    w={'20vw'}
                    key={e.id}
                  >
                    <Box>
                      <b>Symbol:</b> ${tokenDataObjects[i].symbol}&nbsp;
                    </Box>
                    <Box>
                      <b>Balance:</b>&nbsp;
                      {Utils.formatUnits(
                        e.tokenBalance,
                        tokenDataObjects[i].decimals
                      )}
                    </Box>
                    <Image src={tokenDataObjects[i].logo} />
                  </Flex>
                );
              })}
            </SimpleGrid>
          ) : (
            'Please make a query! This may take a few seconds...'
          )} */}
        </Flex>
      </Box>
    </>
  );
}

export default App;
