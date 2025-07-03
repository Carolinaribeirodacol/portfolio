import { Parallax } from "@gfazioli/mantine-parallax";
import { Box, Center, Grid, Paper, Text } from "@mantine/core";
import axios from "axios";
import { useEffect, useState } from "react";

type Project = {
  id: number;
  title: string;
  description: string;
};

export function ProjectsParallax() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    axios
      .get(`${apiUrl}/projects`)
      .then((res) => setProjects(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <Grid gutter="sm" align="center">
      {projects.map((project: Project, index: number) => (
        <Grid.Col key={index} span={{ base: 12, sm: 6 }}>
          <Center w="100%" h="auto">
            <Parallax
              perspective={800}
              threshold={20}
              lightIntensity={0.4}
              lightSize={60}
              lightColor="gray"
              backgroundParallax
              backgroundParallaxThreshold={-1.5}
              contentParallax
              contentParallaxDistance={0.6}
              p={24}
            >
              <Box
                w={400}
                h={300}
                style={{
                  position: "absolute",
                  boxShadow: "0 0 16px rgba(0, 0, 0, 0.2)",
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  borderRadius: "16px",
                }}
              />
              <Paper w={400} h={300} bg="dark" radius={16} p={16}>
                <Text fw={700} c="white" ta="center" size="xl">{project.title}</Text>
                <Text c="gray" lineClamp={6} mt="md" size="md">{project.description}</Text>
              </Paper>
            </Parallax>
          </Center>
        </Grid.Col>
      ))}
    </Grid>
  );
}
