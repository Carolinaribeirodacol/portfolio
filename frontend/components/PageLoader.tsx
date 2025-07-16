import { Loader, Center, Stack, Text } from "@mantine/core";

export function PageLoader({ message = "Carregando..." }) {
  return (
    <Center h="100vh">
      <Stack align="center" gap="xs">
        <Loader color="purple" size="lg" />
        <Text c="dimmed">{message}</Text>
      </Stack>
    </Center>
  );
}
