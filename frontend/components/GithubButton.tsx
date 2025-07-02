import { Button } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";

export function GithubButton() {
  return (
    <Button
      component="a"
      href="https://github.com/Carolinaribeirodacol"
      target="_blank"
      rel="noopener noreferrer"
      variant="light"
      color="gray"
      leftSection={<IconBrandGithub size={18} />}
    >
      GitHub
    </Button>
  );
}
