import {
  Card,
  Image,
  Text,
  Grid,
  Group,
  Title,
  Space,
  Badge,
  AspectRatio,
  Stack,
  Center,
} from "@mantine/core";
import DefaultNoData from "@/components/DefaultNoData";
import { getProjects } from "@/lib/laravel";
import { GetStaticProps } from "next";
import { PageLoader } from "@/components/PageLoader";
import { useRouter } from "next/router";

type Project = {
  id: number;
  image: string;
  image_url: string;
  title: string;
  status: string;
  description: string;
};

type ProjectProps = {
  projects: Project[];
}

export const getStaticProps: GetStaticProps<ProjectProps> = async () => {
  try {
    const projects = await getProjects();
    return {
      props: {
        projects,
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    return {
      props: {
        projects: [],
      },
      revalidate: 60,
    };
  }
}

export default function ProjectsPage({projects}: ProjectProps) {
  const router = useRouter();

  if (router.isFallback) {
    return <PageLoader message="Carregando projetos..." />;
  }

  if (!projects) {
    return (
      <Center mt="xl">
        <Text>Nenhum projeto a ser exibido.</Text>
      </Center>
    );
  }

  return (
    <>
      <Title order={1} ta="center">
        Projetos
      </Title>

      <Space h="lg" />

      <Grid>
        {projects.length === 0 && (
          <DefaultNoData text="Sem projetos disponíveis." />
        )}

        {projects.map((project: Project) => (
          <Grid.Col span={{ base: 12, sm: 6 }} key={project.id}>
            <Card
              shadow="sm"
              padding="md"
              radius="md"
              withBorder
              component="a"
              href={`/projects/${project.id}` || "#"}
              style={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Card.Section>
                <AspectRatio ratio={16 / 9}>
                  <Image
                    src={project.image_url}
                    fallbackSrc="https://placehold.co/600x400?text=Placeholder"
                    fit="cover"
                    alt={project.title}
                  />
                </AspectRatio>
              </Card.Section>

              <Stack
                justify="space-between"
                gap="xs"
                mt="md"
                style={{ flex: 1 }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Text fw={600} size="md" truncate="end">
                    {project.title}
                  </Text>

                  <Badge color={project.status == "em andamento" ? "blue" : "green"} variant="light">
                    {project.status}
                  </Badge>
                </Group>

                <Text size="sm" c="dimmed" lineClamp={3}>
                  {project.description}
                </Text>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </>
  );
}
