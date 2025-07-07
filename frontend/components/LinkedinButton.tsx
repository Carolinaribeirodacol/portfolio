import { Button } from "@mantine/core";
import { IconBrandLinkedin } from "@tabler/icons-react";

interface SizeType {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function LinkedinButton({ size = "sm" }: SizeType) {
  return (
    <Button
      component="a"
      href="https://www.linkedin.com/in/carolina-ribeiro-28852910b/"
      size={size}
      target="_blank"
      rel="noopener noreferrer"
      variant="light"
      color="blue"
      leftSection={<IconBrandLinkedin size={18} />}
    >
      LinkedIn
    </Button>
  );
}
