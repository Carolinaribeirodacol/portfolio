import {
  Text,
  Button,
  Group,
  Title,
  Space,
  Stack,
  Tooltip,
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

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/router";

type Project = {
  id: number;
  title: string;
  description: string;
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const router = useRouter();

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

        <Group justify="center">
          <GithubButton size="md" />

          <LinkedinButton size="md" />
        </Group>

        <Space h="md" />

        <Title order={2} ta="center">
          Visite as páginas, fiz com carinho
        </Title>

        <Group justify="center">
          <Button
            size="md"
            color="purple"
            onClick={() => router.push("/projects")}
          >
            Projetos
          </Button>

          <Button
            size="md"
            variant="outline"
            color="purple"
            onClick={() => router.push("/about")}
          >
            Sobre mim
          </Button>
        </Group>

        <Space h="md" />

        <Title order={2} ta="center">
          Principais Tecnologias
        </Title>
        <Group>
          <Tooltip color="purple" key="laravel" label="Laravel" withArrow>
            <IconBrandLaravel color="red" size={40} />
          </Tooltip>

          <Tooltip color="purple" key="vue" label="Vue" withArrow>
            <IconBrandVue color="green" size={40} />
          </Tooltip>

          <Tooltip color="purple" key="react" label="React" withArrow>
            <IconBrandReact color="teal" size={40} />
          </Tooltip>

          <Tooltip color="purple" key="mysql" label="Mysql" withArrow>
            <IconBrandMysql color="grey" size={40} />
          </Tooltip>
        </Group>

        <Space h="md" />

        <Title order={2} ta="center">
          Projetos em andamento
        </Title>
        <ProjectsParallax projects={projects} />
      </Stack>
    </>
  );
}
