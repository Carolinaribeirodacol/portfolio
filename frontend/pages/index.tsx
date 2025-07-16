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
            Desenvolvedora Full Stack com foco em desenvolvimento web
          </Text>
        </Parallax>

        <Group justify="center">
          <GithubButton size="md" />

          <LinkedinButton size="md" />
        </Group>

        <Space h="md" />

        <Title order={2} ta="center">
          Visite as minhas páginas
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

        <Group gap="lg" wrap="wrap">
          <Stack align="center" gap={4}>
            <IconBrandLaravel color="red" size={40} stroke={1} />
            <Text size="xs" c="white">
              Laravel
            </Text>
          </Stack>

          <Stack align="center" gap={4}>
            <IconBrandVue color="green" size={40} stroke={1} />
            <Text size="xs" c="white">
              Vue
            </Text>
          </Stack>

          <Stack align="center" gap={4}>
            <IconBrandReact color="teal" size={40} stroke={1} />
            <Text size="xs" c="white">
              React
            </Text>
          </Stack>

          <Stack align="center" gap={4}>
            <IconBrandMysql color="grey" size={40} stroke={1} />
            <Text size="xs" c="white">
              MySQL
            </Text>
          </Stack>
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
