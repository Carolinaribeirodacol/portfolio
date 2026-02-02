import { Projects } from "@/types/projects";
import { Parallax } from "@gfazioli/mantine-parallax";
import { Box, Center, Grid, Image, Paper, Text } from "@mantine/core";
import { useRouter } from "next/router";

type ProjectsParallaxProps = {
  projects: Projects[];
};

export function ProjectsParallax({ projects }: ProjectsParallaxProps) {
  const router = useRouter();

  return (
    <Grid gutter="sm" align="center">
      {projects.map((project, index: number) => (
        <Grid.Col
          key={index}
          span={{ base: 12, sm: projects.length > 1 ? 6 : 12 }}
        >
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
              onClick={() => router.push(`/projects/${project.id}`)}
              style={{ cursor: "pointer" }}
            >
              <Box
                w="100%"
                h={300}
                style={{
                  position: "absolute",
                  boxShadow: "0 0 16px rgba(0, 0, 0, 0.2)",
                  backgroundColor: "rgba(0, 0, 0, 0.1)",
                  borderRadius: "16px",
                }}
              />
              <Paper w="100%" h={300} bg="dark" radius={16} p={36}>
                <Image
                    w="100%"
                    h={100}
                    src={project.image_url}
                    fallbackSrc="https://placehold.co/600x400?text=Placeholder"
                    fit="cover"
                    alt={project.title}
                />

                <Text fw={700} c="white" ta="center" size="xl">
                  {project.title}
                </Text>
                <Text c="gray" lineClamp={6} mt="md" size="md">
                  {project.description}
                </Text>
              </Paper>
            </Parallax>
          </Center>
        </Grid.Col>
      ))}
    </Grid>
  );
}
