import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  Text,
  Title,
  Badge,
  Stack,
  Group,
  Button,
  Container,
  Space,
  Loader,
  Image,
  Center,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";

import { IconBrandGithub, IconWorld } from "@tabler/icons-react";

type Project = {
  id: number;
  title: string;
  images: [];
  description: string;
  status: string;
  repo_url: string;
  live_url: string;
};

export default function ProjectDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    axios
      .get(`http://localhost:8000/api/projects/${id}`)
      .then((res) => setProject(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Group justify="center" mt="xl">
        <Loader color="purple" />
      </Group>
    );
  }

  if (!project) {
    return (
      <Center mt="xl">
        <Text color="red">Projeto não encontrado.</Text>
      </Center>
    );
  }

  return (
    <Container size="md">
      <Center mb="md">
        <Title order={2}>
          {project.title}
        </Title>
      </Center>

      <Card shadow="md" radius="md" p="lg" withBorder>
        <Card.Section>
          <Carousel
            height={400}
            emblaOptions={{
              loop: true,
              dragFree: false,
              align: "center",
            }}
          >
            {project.images?.map(
              (
                image: { image_path: string; caption: string },
                index: number
              ) => (
                <Carousel.Slide key={index}>
                  <Image
                    src={`http://localhost:8000/storage/${image.image_path}`}
                    alt={image.caption}
                    fallbackSrc="https://placehold.co/600x400?text=Projeto"
                    fit="cover"
                    mx="auto"
                  />
                </Carousel.Slide>
              )
            )}
          </Carousel>
        </Card.Section>

        <Stack gap="xs" mt="md">
          <Group justify="space-between">
            <Title order={4}>{project.title}</Title>
            <Badge color="blue" variant="light">
              {project.status}
            </Badge>
          </Group>

          <Text size="sm" color="dimmed">
            {project.description}
          </Text>

          <Group mt="md" gap="sm">
            {project.repo_url && (
              <Button
                component="a"
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                leftSection={<IconBrandGithub size={18} />}
                color="white"
                variant="light"
              >
                Repositório
              </Button>
            )}

            {project.live_url && (
              <Button
                component="a"
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                leftSection={<IconWorld size={18} />}
                color="blue"
                variant="light"
              >
                Acessar projeto
              </Button>
            )}
          </Group>
        </Stack>
      </Card>

      <Space h="xl" />
    </Container>
  );
}
