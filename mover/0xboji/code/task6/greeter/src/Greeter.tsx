import {
  useSignAndExecuteTransaction,
  useSuiClient,
  useSuiClientQuery,
} from "@mysten/dapp-kit";
import type { SuiObjectData } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Flex, Heading, Text, TextArea, Card, Badge, Link } from "@radix-ui/themes";
import { useNetworkVariable } from "./networkConfig";
import { useState, useEffect } from "react";
import ClipLoader from "react-spinners/ClipLoader";

export function Greeter({ id }: { id: string }) {
  const packageId = useNetworkVariable("packageId");
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction();
  const [newMessage, setNewMessage] = useState("");
  const [waitingForTxn, setWaitingForTxn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [txTime, setTxTime] = useState<number | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const { data, isPending, refetch } = useSuiClientQuery("getObject", {
    id,
    options: {
      showContent: true,
    },
  });

  // Auto-refresh the message every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

  const setMessage = async () => {
    try {
      setError(null);
      setSuccess(false);
      setWaitingForTxn(true);
      setTxTime(null);
      setTxHash(null);
      
      const tx = new Transaction();
      
      tx.moveCall({
        arguments: [tx.object(id), tx.pure.string(newMessage)],
        target: `${packageId}::hello_move::set_message`,
      });

      await signAndExecute(
        {
          transaction: tx,
        },
        {
          onSuccess: async (tx) => {
            try {
              setTxHash(tx.digest);
              const startTime = Date.now();
              await suiClient.waitForTransaction({ digest: tx.digest });
              const endTime = Date.now();
              const timeElapsed = (endTime - startTime) / 1000;
              setTxTime(timeElapsed);
              
              await refetch();
              setNewMessage("");
              setError(null);
              setSuccess(true);
              
              // Hide success message and hash after 7 seconds
              setTimeout(() => {
                setSuccess(false);
                setTxTime(null);
                setTxHash(null);
              }, 7000);
            } catch (e) {
              console.error("Transaction error:", e);
              setError("Failed to update message. Please try again.");
            } finally {
              setWaitingForTxn(false);
            }
          },
          onError: (e) => {
            console.error("Transaction error:", e);
            setError("Failed to send transaction. Please try again.");
            setWaitingForTxn(false);
          }
        },
      );
    } catch (e) {
      console.error("Error:", e);
      setError("An error occurred. Please try again.");
      setWaitingForTxn(false);
    }
  };

  if (isPending) {
    return (
      <Card>
        <Flex align="center" justify="center" p="4">
          <ClipLoader size={30} />
        </Flex>
      </Card>
    );
  }
  
  if (!data?.data) {
    return (
      <Card>
        <Text color="red">Message object not found</Text>
      </Card>
    );
  }

  const message = getGreeterFields(data.data)?.say || "";

  return (
    <Card>
      <Flex direction="column" gap="4" p="4">
        <Flex justify="between" align="center">
          <Heading size="4">Sui Greeter</Heading>
          {isPending && <ClipLoader size={20} />}
        </Flex>

        <Card variant="classic">
          <Flex direction="column" gap="2" p="4">
            <Text size="2" color="gray">Current Message:</Text>
            <Text size="4" weight="bold">{message}</Text>
          </Flex>
        </Card>

        <Flex direction="column" gap="2">
          <TextArea 
            placeholder="Enter new message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ minHeight: '100px' }}
          />
          <Flex justify="between" align="center" gap="2">
            <Button
              size="3"
              onClick={setMessage}
              disabled={waitingForTxn || !newMessage}
              style={{ flexGrow: 1 }}
            >
              {waitingForTxn ? <ClipLoader size={20} /> : "Set Message"}
            </Button>
          </Flex>
          
          <Flex direction="column" gap="2">
            {error && (
              <Badge color="red" size="2">
                {error}
              </Badge>
            )}
            
            {success && (
              <Card variant="surface">
                <Flex direction="column" gap="2" p="2">
                  <Badge color="green" size="2">
                    Message updated successfully!
                  </Badge>
                  {txTime && (
                    <Text size="1" color="gray">
                      Transaction confirmed less than {txTime.toFixed(2)} seconds
                    </Text>
                  )}
                  {txHash && (
                    <Flex align="center" gap="2">
                      <Text size="1" color="gray">
                        Transaction Hash:
                      </Text>
                      <Link
                        href={`https://testnet.suivision.xyz/txblock/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="1"
                      >
                        {txHash.slice(0, 8)}...{txHash.slice(-6)}
                      </Link>
                    </Flex>
                  )}
                </Flex>
              </Card>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Card>
  );
}

function getGreeterFields(data: SuiObjectData) {
  if (data.content?.dataType !== "moveObject") {
    return null;
  }
  return data.content.fields as { say: string; owner: string };
}
