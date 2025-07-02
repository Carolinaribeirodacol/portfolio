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
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";

import { IconBrandGithub, IconWorld } from "@tabler/icons-react";

export default function ProjectDetails() {
  const router = useRouter();
  const { id } = router.query;
  const [project, setProject] = useState<object|null>(null);
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
      <Text align="center" mt="xl" color="red">
        Projeto não encontrado.
      </Text>
    );
  }

  return (
    <Container size="md">
      <Title order={2} align="center" mb="md">
        {project.title}
      </Title>

      <Card shadow="md" radius="md" p="lg" withBorder>
        <Card.Section>
          <Carousel
            height={400}
            emblaOptions={{
              loop: true,
              dragFree: false,
              align: "center"
            }}
          >
            {project.images?.map((image: any, index: number) => (
              <Carousel.Slide key={index}>
                <Image
                  src={`http://localhost:8000/storage/${image.image_path}`}
                  alt={image.caption}
                  fallbackSrc="https://placehold.co/600x400?text=Projeto"
                  fit="cover"
                  mx="auto"
                />
              </Carousel.Slide>
            ))}
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
