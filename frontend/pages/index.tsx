import {
  Text,
  Button,
  Group,
  Title,
  Space,
  Stack,
} from "@mantine/core";
import {
  IconBrandLaravel,
  IconBrandMysql,
  IconBrandReact,
  IconBrandVue,
} from "@tabler/icons-react";
import { GithubButton } from "@/components/GithubButton";
import { LinkedinButton } from "@/components/LinkedinButton";
import { ProjectsParallax } from "@/components/ProjectsParallax";
import "@gfazioli/mantine-parallax/styles.css";
import "@gfazioli/mantine-parallax/styles.layer.css";
import { Parallax } from "@gfazioli/mantine-parallax";

export default function Home() {
  return (
    <>
      <Stack align="center" mt="xl">
        <Parallax align="center">
          <Title order={1}>Oi! Eu sou a Carolina 👋</Title>
          <Text size="lg" maw={600}>
            Desenvolvedora full stack com foco em Laravel, Vue e React. Gosto de
            criar experiências visuais, apps funcionais e jogos em pixel art.
          </Text>
        </Parallax>

        <Group justify="center" mt="md">
          <GithubButton />

          <LinkedinButton />

          <Button component="a" color="purple" href="/projects">
            Ver Projetos
          </Button>

          <Button variant="outline" color="purple" component="a" href="/about">
            Sobre mim
          </Button>
        </Group>
      </Stack>

      <Space h="xl" />

      <Title order={2} align="center">
        Principais Tecnologias
      </Title>

      <Group justify="center" mt="md">
        <IconBrandLaravel color="red" size={30} />
        <IconBrandVue color="green" size={30} />
        <IconBrandReact color="teal" size={30} />
        <IconBrandMysql color="grey" size={30} />
      </Group>

      <Space h="xl" />

      <Title order={2} align="center">
        Projetos em destaque
      </Title>

      <ProjectsParallax />
    </>
  );
}
