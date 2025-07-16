import { GithubButton } from "@/components/GithubButton";
import { LinkedinButton } from "@/components/LinkedinButton";
import {
  Card,
  Center,
  Grid,
  Group,
  Image,
  SimpleGrid,
  Space,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import {
  IconBrandVue,
  IconBrandLaravel,
  IconBrandReact,
  IconBrandDocker,
  IconBrandMysql,
  IconCarrot,
  IconBrandTailwind,
  IconLayoutDashboard,
  IconCircleLetterQ,
  IconBrandSass,
  IconBrandNotion,
  IconBrandFigma,
  IconBrandGithub,
} from "@tabler/icons-react";
import { JSX, useMemo } from "react";
import NextImage from "next/image";

export default function AboutPage() {
  type Technology = {
    name: string;
    icon: JSX.Element;
  };

  type Frontend = {
    name: string;
    icon: JSX.Element;
  };

  const technologies: Technology[] = useMemo(
    () => [
      {
        name: "Laravel",
        icon: <IconBrandLaravel color="red" size={20} stroke={1} />,
      },
      {
        name: "Notion",
        icon: <IconBrandNotion color="white" size={20} stroke={1} />,
      },
      {
        name: "Figma",
        icon: <IconBrandFigma color="green" size={20} stroke={1} />,
      },
      {
        name: "Github",
        icon: <IconBrandGithub color="white" size={20} stroke={1} />,
      },
      {
        name: "MySQL",
        icon: <IconBrandMysql color="grey" size={20} stroke={1} />,
      },
      {
        name: "Docker",
        icon: <IconBrandDocker color="blue" size={20} stroke={1} />,
      },
      {
        name: "RabbitMQ",
        icon: <IconCarrot color="orange" size={20} stroke={1} />,
      },
    ],
    []
  );

  const frontend: Frontend[] = useMemo(
    () => [
      {
        name: "Vue",
        icon: <IconBrandVue color="green" size={20} stroke={1} />,
      },
      {
        name: "React/Next",
        icon: <IconBrandReact color="teal" size={20} stroke={1} />,
      },
      {
        name: "Quasar",
        icon: <IconCircleLetterQ color="purple" size={20} stroke={1} />,
      },
      {
        name: "Mantine",
        icon: <IconLayoutDashboard color="indigo" size={20} stroke={1} />,
      },
      {
        name: "Tailwind CSS",
        icon: <IconBrandTailwind color="teal" size={20} stroke={1} />,
      },
      {
        name: "Vuetify",
        icon: <IconBrandVue color="green" size={20} stroke={1} />,
      },
      {
        name: "Sass",
        icon: <IconBrandSass color="pink" size={20} stroke={1} />,
      },
    ],
    []
  );

  return (
    <>
      <Center mb="lg">
        <Title order={1}>Prazer, Carolina</Title>
      </Center>

      <Group justify="center" mt="sm">
        <GithubButton />

        <LinkedinButton />
      </Group>

      <Space h="lg" />

      <Card shadow="md" radius="md" p="lg" withBorder mb="lg">
        <Grid gutter="lg" align="center">
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <NextImage
              src="/images/profile.jpg"
              alt="Foto de Perfil"
              width={300}
              height={200}
              style={{ borderRadius: "8px" }}
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 9 }}>
            <Text size="sm" fw={400}>
              Tenho 27 anos e estou sempre buscando aprender algo novo. Sou
              formada em <b>Análise e Desenvolvimento de Sistemas</b> e tenho
              uma <b>pós-graduação em Jogos Digitais</b>.
              <br />
              <br />
              Possuo experiência com desenvolvimento de <b>aplicações web</b> em
              Vue e Laravel. Mas já realizei projetos em React, Nuxt, Next,
              Quasar, Tailwind, Vuetify, entre outros.
              <br />
              <br />
              Gosto de jogar, desenhar, ler, assistir animes e sou apaixonada
              por gatos. Além disso, crio vídeos para o YouTube sobre jogos e
              desenho, e faço lives na Twitch.
            </Text>
          </Grid.Col>
        </Grid>
      </Card>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb="lg">
        {/* Linguagens */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4}>Linguagens</Title>

          <Stack gap="xs" mt="sm">
            <Group gap="xs">
              <Image
                radius="md"
                src="/images/brasil.png"
                alt="Logo Brasil"
                h={20}
                w="auto"
              />

              <Text size="sm" fw={500}>
                Português
              </Text>
            </Group>

            <Group gap="xs">
              <Image
                radius="md"
                src="/images/estados-unidos.png"
                alt="Logo Estados unidos"
                h={20}
                w="auto"
              />

              <Text size="sm" fw={500}>
                Inglês
              </Text>
            </Group>
          </Stack>
        </Card>

        {/* Formação Acadêmica */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4}>Formação Acadêmica</Title>

          <Text size="xs" mt="sm">
            Superior Tecnólogo - Fatec Ribeirão Preto
          </Text>

          <Text>Análise e Desenvolvimento de Sistemas</Text>
        </Card>
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mb="lg">
        {/* Tecnologias */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4}>Tecnologias</Title>

          <Stack gap="xs" mt="sm">
            {technologies.map((technology: Technology, index: number) => (
              <Group key={index} gap="xs">
                {technology.icon}
                <Text size="sm" fw={500}>
                  {technology.name}
                </Text>
              </Group>
            ))}
          </Stack>
        </Card>

        {/* Frameworks / UI / CSS */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4}>Frontend</Title>

          <Stack gap="xs" mt="sm">
            {frontend.map((front: Frontend, index: number) => (
              <Group key={index} gap="xs">
                {front.icon}
                <Text size="sm" fw={500}>
                  {front.name}
                </Text>
              </Group>
            ))}
          </Stack>
        </Card>
      </SimpleGrid>

      <Card shadow="md" radius="md" p="lg" withBorder mb="lg">
        <Title order={4}>Plataformas de estudo</Title>

        <SimpleGrid cols={{ base: 1, sm: 3, md: 5 }} spacing="xs" mt="sm">
          {[
            "duolingo.svg",
            "especializati.png",
            "hello-talk.png",
            "freecodecamp.jpg",
            "rocketset.png",
          ].map((img, index) => (
            <Group key={index} gap="xs">
              <NextImage
                src={`/images/${img}`}
                alt={`Logo ${img}`}
                width={20}
                height={20}
                style={{ objectFit: "contain" }}
              />
              <Text size="sm" fw={500}>
                {img.split(".")[0]}
              </Text>
            </Group>
          ))}
        </SimpleGrid>
      </Card>

      {/* https://br.pinterest.com/pin/617345061505700615/ */}
    </>
  );
}
