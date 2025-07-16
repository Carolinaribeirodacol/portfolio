import { useRouter } from "next/router";
import { useState } from "react";
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
import { getProjectById, getProjects } from "@/lib/laravel";
import { iconMap } from "@/lib/iconMap";
import { DefaultModal } from "@/components/DefaultModal";
import { GetStaticPaths, GetStaticProps } from "next";
import { PageLoader } from "@/components/PageLoader";

type Technology = {
  id: number;
  name: string;
  icon: string;
};

type ImageProps = {
  image_url: string;
  caption: string;
};

type Props = {
  project: Project;
};

type Project = {
  id: number;
  title: string;
  images: ImageProps[];
  technologies: Technology[];
  description: string;
  status: string;
  repo_url: string;
  live_url: string;
  reference_url: string;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const projects = await getProjects();
  const paths = projects.map((project: { id: number }) => ({
    params: { id: String(project.id) },
  }));

  return {
    paths,
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    const project = await getProjectById(Number(params?.id));
    return {
      props: { project },
      revalidate: 60,
    };
  } catch {
    return { notFound: true };
  }
};

export default function ProjectDetails({ project }: Props) {
  const router = useRouter();
  const theme = useMantineTheme();
  const mobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const [opened, { open, close }] = useDisclosure(false);

  const [selectedImage, setSelectedImage] = useState<ImageProps | null>(null);

  if (router.isFallback) {
      return <PageLoader message="Carregando..." />;
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
                loading="lazy"
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
