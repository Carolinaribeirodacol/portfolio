import { useRouter } from "next/router";
import { useEffect, useState } from "react";
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
  Tooltip,
  useMantineTheme,
  ActionIcon,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";

import {
  IconArrowLeft,
  IconBook,
  IconBrandGithub,
  IconPuzzle,
  IconWorld,
} from "@tabler/icons-react";
import { getProjectById } from "@/lib/laravel";
import { iconMap } from "@/lib/iconMap";
import { DefaultModal } from "@/components/DefaultModal";

type Project = {
  id: number;
  title: string;
  images: [];
  technologies: [
    {
      id: number;
      name: string;
      icon: string;
    }
  ];
  description: string;
  status: string;
  repo_url: string;
  live_url: string;
  reference_url: string;
};

type ImageProps = {
  image_url: string;
  caption: string;
};

export default function ProjectDetails() {
  const router = useRouter();
  const { id } = router.query;
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [opened, { open, close }] = useDisclosure(false);

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<ImageProps | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    getProjectById(Number(id))
      .then(setProject)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Group justify="center" mt="xl">
        <Loader color="purple">Carregando...</Loader>
      </Group>
    );
  }

  if (!project) {
    return (
      <Center mt="xl">
        <Text>Projeto não encontrado.</Text>
      </Center>
    );
  }

  return (
    <Container size="md">
      {mobile ? (
        <Group justify="space-between" align="center" mb="md">
          <ActionIcon
            variant="outline"
            color="white"
            radius="xl"
            aria-label="Settings"
            size="md"
            onClick={() => router.push("/projects")}
          >
            <IconArrowLeft stroke={1.5} />
          </ActionIcon>

          <Title
            order={2}
            size="md"
            textWrap="wrap"
            style={{ flex: 1, textAlign: "center" }}
          >
            {project.title}
          </Title>
        </Group>
      ) : (
        <Center mb="md">
          <Title order={2}>{project.title}</Title>
        </Center>
      )}

      <Card shadow="md" radius="md" p="lg" withBorder>
        <Card.Section>
          <DefaultModal
            opened={opened}
            onClose={close}
            title={selectedImage?.caption}
            size="auto"
          >
            {selectedImage && (
              <Image
                src={selectedImage.image_url}
                alt={selectedImage.caption}
                fallbackSrc="https://placehold.co/600x400?text=Projeto"
              />
            )}
          </DefaultModal>

          <Carousel
            withIndicators
            height={mobile ? 140 : 400}
            emblaOptions={{
              loop: true,
              dragFree: false,
              align: "center",
            }}
          >
            {project.images?.map((image: ImageProps, index: number) => (
              <Carousel.Slide key={index}>
                <Image
                  onClick={() => {
                    setSelectedImage(image);
                    open();
                  }}
                  src={image.image_url}
                  alt={image.caption}
                  fallbackSrc="https://placehold.co/600x400?text=Projeto"
                  fit="cover"
                  mx="auto"
                  style={{ cursor: "pointer" }}
                />
              </Carousel.Slide>
            ))}
          </Carousel>
        </Card.Section>

        <Stack gap="xs" mt="md">
          <Group justify="space-between">
            <Title order={2}>{project.title}</Title>
            <Badge
              color={project.status == "em andamento" ? "blue" : "green"}
              variant="light"
            >
              {project.status}
            </Badge>
          </Group>

          <Text size="md" c="white">
            {project.description}
          </Text>

          <Title order={4}>Tecnologias utilizadas</Title>
          <Group>
            {project.technologies.map(({ name, icon }) => {
              const Icon = iconMap[icon] || IconPuzzle;

              return mobile ? (
                <Group key={name} gap="xs" align="center">
                  <Icon size={24} color="white" stroke={1} />

                  <Text size="sm" c="white">
                    {name}
                  </Text>
                </Group>
              ) : (
                <Tooltip key={name} label={name} color="purple" withArrow>
                  <Icon size={30} color="white" />
                </Tooltip>
              );
            })}
          </Group>

          <Group mt="md" gap="sm">
            {project.repo_url && (
              <Button
                component="a"
                href={project.repo_url}
                target="_blank"
                rel="noopener noreferrer"
                leftSection={<IconBrandGithub size={18} stroke={1} />}
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
                leftSection={<IconWorld size={18} stroke={1} />}
                color="blue"
                variant="light"
              >
                Ver projeto
              </Button>
            )}

            {project.reference_url && (
              <Button
                component="a"
                href={project.reference_url}
                target="_blank"
                rel="noopener noreferrer"
                leftSection={<IconBook size={18} stroke={1} />}
                color="purple"
                variant="light"
              >
                Ver referência
              </Button>
            )}
          </Group>
        </Stack>
      </Card>

      <Space h="xl" />
    </Container>
  );
}
