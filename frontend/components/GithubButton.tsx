import { Button } from "@mantine/core";
import { IconBrandGithub } from "@tabler/icons-react";

interface SizeType {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function GithubButton({ size = "sm" }: SizeType) {
  return (
    <Button
      component="a"
      href="https://github.com/Carolinaribeirodacol"
      target="_blank"
      size={size}
      rel="noopener noreferrer"
      variant="light"
      color="gray"
      leftSection={<IconBrandGithub size={18} />}
    >
      GitHub
    </Button>
  );
}
