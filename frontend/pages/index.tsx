import { Text, Button, Group, Title, Space, Stack } from "@mantine/core";
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

import { useEffect, useState } from "react";
import axios from "axios";

type Project = {
  id: number;
  title: string;
  description: string;
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    axios
      .get(`${apiUrl}/projects?status=em andamento`)
      .then((res) => setProjects(res.data))
      .catch((err) => console.error(err));
  }, []);

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

        <Group>
          <GithubButton size="md" />

          <LinkedinButton size="md" />
        </Group>

        <Space h="md" />

        <Title order={2}>Visite as páginas, fiz com carinho</Title>
        <Group>
          <Button size="md" component="a" color="purple" href="/projects">
            Ver Projetos
          </Button>

          <Button size="md" variant="outline" color="purple" component="a" href="/about">
            Sobre mim
          </Button>
        </Group>

        <Space h="md" />

        <Title order={2}>Principais Tecnologias</Title>
        <Group>
          <IconBrandLaravel color="red" size={40} />
          <IconBrandVue color="green" size={40} />
          <IconBrandReact color="teal" size={40} />
          <IconBrandMysql color="grey" size={40} />
        </Group>

        <Space h="md" />

        <Title order={2}>Projetos em andamento</Title>
        <ProjectsParallax projects={projects} />
      </Stack>
    </>
  );
}
