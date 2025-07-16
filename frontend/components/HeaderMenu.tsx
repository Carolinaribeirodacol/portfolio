import {
  Burger,
  Drawer,
  Group,
  Stack,
  Text,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "./HeaderSearch.module.css";
import Link from "next/link";
import { IconHome } from "@tabler/icons-react";

const links = [
  { link: "/about", label: "Sobre" },
  { link: "/projects", label: "Projetos" },
];

export function HeaderMenu() {
  const [opened, { toggle, close }] = useDisclosure(false);

  const items = links.map((link) => (
    <Link key={link.label} href={link.link} className={classes.link} onClick={close}>
      {link.label}
    </Link>
  ));

  return (
    <header className={classes.header}>
      <div className={classes.inner}>
        <Group>
          <Burger opened={opened} onClick={toggle} size="sm" hiddenFrom="sm" />
          <Link href="/">
            <Group gap={6}>
              <IconHome size={28} />
              <Text>Início</Text>
            </Group>
          </Link>
        </Group>

        <Group>
          <Group ml={50} gap={5} className={classes.links} visibleFrom="sm">
            {items}
          </Group>

          {/* <Autocomplete
            className={classes.search}
            placeholder="Search"
            leftSection={<IconSearch size={16} />}
            data={["Linkedin", "Github", "Contato"]}
            visibleFrom="xs"
          /> */}
        </Group>

        <Drawer size="xs" opened={opened} onClose={close} title="Menu">
          {/* <Autocomplete
            className={classes.search}
            placeholder="Search"
            leftSection={<IconSearch size={16} />}
            data={["Linkedin", "Github", "Contato"]}
          /> */}

          <Stack align="center" mt="md">
            {items}
          </Stack>
        </Drawer>
      </div>
    </header>
  );
}
