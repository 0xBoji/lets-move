import { useCurrentAccount } from "@mysten/dapp-kit";
import { Heading, Flex, Box, Container, Grid } from "@radix-ui/themes";
import { ConnectButton } from "@mysten/dapp-kit";
import { Greeter } from "./Greeter";
import { MessageViewer } from "./MessageViewer";

function App() {
  const currentAccount = useCurrentAccount();
  // This is your shared object ID from the contract deployment
  const greeterId = "0xdc1e522c46a66a04cf80804beddc24c833b68f6fb105098e54b7670977ab93b7";

  return (
    <>
      <Flex
        position="sticky"
        px="4"
        py="2"
        justify="between"
        style={{
          borderBottom: "1px solid var(--gray-a2)",
        }}
      >
        <Box>
          <Heading>Sui Hello Move</Heading>
        </Box>

        <Box>
          <ConnectButton />
        </Box>
      </Flex>
      <Container>
        <Container
          mt="5"
          pt="2"
          px="4"
          style={{ background: "var(--gray-a2)", minHeight: 500 }}
        >
          {currentAccount ? (
            <Grid columns="1" gap="4">
              <Greeter id={greeterId} />
            </Grid>
          ) : (
            <Heading>Please connect your wallet</Heading>
          )}
        </Container>
      </Container>
    </>
  );
}

export default App;