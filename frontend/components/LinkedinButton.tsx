import { Button } from "@mantine/core";
import { IconBrandLinkedin } from "@tabler/icons-react";

export function LinkedinButton() {
  return (
    <Button
      component="a"
      href="https://www.linkedin.com/in/carolina-ribeiro-28852910b/"
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
