import axios from "axios";
import { useEffect, useState } from "react";
import {
  Card,
  Image,
  Text,
  Grid,
  Button,
  Group,
  Title,
  Space,
  Badge,
  AspectRatio,
  Stack,
} from "@mantine/core";
import DefaultNoData from "@/components/DefaultNoData";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {    
    axios
      .get(`${process.env.NEXT_PUBLIC_API_URL}/projects`)
      .then((res) => setProjects(res.data))
      .catch((err) => console.error(err));
  }, []);

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

        {projects.map(
          (project: {
            id: number;
            image: string;
            image_url: string;
            title: string;
            status: string;
            description: string;
          }) => (
            <Grid.Col span={{ base: 12, sm: 6 }} key={project.id}>
              <Card
                shadow="sm"
                padding="md"
                radius="md"
                withBorder
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

                    <Badge color="blue" variant="light">
                      {project.status}
                    </Badge>
                  </Group>

                  <Text size="sm" c="dimmed" lineClamp={3}>
                    {project.description}
                  </Text>

                  <Button
                    component="a"
                    href={`/projects/${project.id}` || "#"}
                    color="purple"
                    mt="auto"
                    radius="md"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    Ver detalhes
                  </Button>
                </Stack>
              </Card>
            </Grid.Col>
          )
        )}
      </Grid>
    </>
  );
}
