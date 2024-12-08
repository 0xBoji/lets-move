import { useCurrentAccount } from "@mysten/dapp-kit";
import { Heading } from "@radix-ui/themes";
import { Header } from "./components/Layout/Header";
import { Container } from "./components/Layout/Container";
import { Greeter } from "./components/Greeter";
import { GREETER_ID } from "./config/constants";

function App() {
  const currentAccount = useCurrentAccount();

  return (
    <>
      <Header />
      <Container>
        {currentAccount ? (
          <Greeter id={GREETER_ID} />
        ) : (
          <Heading>Please connect your wallet</Heading>
        )}
      </Container>
    </>
  );
}

export default App;
