import { Center, Text } from "@mantine/core";

type Content = {
  text?: string;
};

export default function DefaultNoData({ text = "Nada para exibir." }: Content) {
  return (
    <Center w="100%" h="60vh">
      <Text size="lg" c="dimmed">
        {text}
      </Text>
    </Center>
  );
}
