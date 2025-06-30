import axios from "axios";
import { JSX, useEffect, useState } from "react";
import {
  Card,
  Image,
  Text,
  Grid,
  Button,
  Group,
  Title,
  Space,
} from "@mantine/core";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:8000/api/projects")
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
        {projects.map((project: any) => (
          <Grid.Col span={4} key={project.id}>
            <Card shadow="sm" padding="md" radius="md">
              <Card.Section>
                <Image
                  src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
                  height={160}
                  alt="Norway"
                />
              </Card.Section>

              <Group justify="space-between" mt="md" mb="xs">
                <Text
                  fw={500}
                  variant="gradient"
                  gradient={{ from: "blue", to: "pink", deg: 30 }}
                  ta="center"
                >
                  {project.title}
                </Text>
              </Group>

              <Text size="sm" c="dimmed" truncate="end">
                {project.description}
              </Text>

              <Button color="purple" fullWidth mt="md" radius="md">
                Ver detalhes
              </Button>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </>
  );
}
