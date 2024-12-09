import { useSuiClientQuery } from "@mysten/dapp-kit";
import { Card, Text, Flex } from "@radix-ui/themes";
import ClipLoader from "react-spinners/ClipLoader";

export function MessageViewer({ id }: { id: string }) {
  const { data, isPending, error } = useSuiClientQuery("getObject", {
    id,
    options: {
      showContent: true,
    },
  });

  if (isPending) {
    return (
      <Card>
        <Flex align="center" justify="center" p="4">
          <ClipLoader size={30} />
        </Flex>
      </Card>
    );
  }

  if (error || !data?.data) {
    return (
      <Card>
        <Text color="red">Failed to load message</Text>
      </Card>
    );
  }

  const message = getMessageField(data.data);

  return (
    <Card>
      <Flex direction="column" gap="2" p="4">
        <Text size="2" color="gray">Current Message:</Text>
        <Text size="4" weight="bold">{message}</Text>
      </Flex>
    </Card>
  );
}

function getMessageField(data: any) {
  if (data.content?.dataType !== "moveObject") {
    return null;
  }
  return data.content.fields.say as string;
}