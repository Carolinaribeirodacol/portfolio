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
} from "@tabler/icons-react";
import { JSX } from "react";

export default function AboutPage() {
  type Technology = {
    name: string;
    icon: JSX.Element;
  };

  type Frontend = {
    name: string;
    icon: JSX.Element;
  };

  const technologies: Technology[] = [
    {
      name: "Laravel",
      icon: <IconBrandLaravel color="red" size={20} />,
    },
    {
      name: "Notion",
      icon: <IconBrandNotion color="white" size={20} />,
    },
    {
      name: "Figma",
      icon: <IconBrandFigma color="green" size={20} />,
    },
    {
      name: "Github",
      icon: <IconBrandFigma color="white" size={20} />,
    },
    {
      name: "MySQL",
      icon: <IconBrandMysql color="grey" size={20} />,
    },
    {
      name: "Docker",
      icon: <IconBrandDocker color="blue" size={20} />,
    },
    {
      name: "RabbitMQ",
      icon: <IconCarrot color="orange" size={20} />,
    },
  ];

  const frontend: Frontend[] = [
    {
      name: "Vue",
      icon: <IconBrandVue color="green" size={20} />,
    },
    {
      name: "React/Next",
      icon: <IconBrandReact color="teal" size={20} />,
    },
    {
      name: "Quasar",
      icon: <IconCircleLetterQ color="purple" size={20} />,
    },
    {
      name: "Mantine",
      icon: <IconLayoutDashboard color="indigo" size={20} />,
    },
    {
      name: "Tailwind CSS",
      icon: <IconBrandTailwind color="teal" size={20} />,
    },
    {
      name: "Vuetify",
      icon: <IconBrandVue color="green" size={20} />,
    },
    {
      name: "Sass",
      icon: <IconBrandSass color="pink" size={20} />,
    },
  ];

  return (
    <>
      <Center mb="lg">
        <Title order={1}>
          Prazer, Carolina
        </Title>
      </Center>

      <Group justify="center" mt="sm">
        <GithubButton />

        <LinkedinButton />
      </Group>

      <Space h="lg" />

      <Card shadow="md" radius="md" p="lg" withBorder mb="lg">
        <Grid gutter="lg" align="center">
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <Image
              radius="md"
              src="/images/profile.jpg"
              alt="Foto de Perfil"
              h={200}
              w="auto"
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 9 }}>
            <Text size="sm" fw={400}>
              Tenho 27 anos e estou sempre buscando aprender algo novo. Gosto de
              jogar, desenhar, ler, assistir animes e sou apaixonada por gatos.
              Também curto música clássica, rock, pop e metal.
              <br />
              <br />
              Sou formada em <b>Análise e Desenvolvimento de Sistemas</b> e
              tenho uma <b>pós-graduação em Jogos Digitais</b>. Atualmente,
              estou desenvolvendo um jogo em pixel art com o meu namorado, que
              reúne minha paixão por arte e programação.
              <br />
              <br />
              Além disso, crio vídeos para o YouTube sobre jogos e desenho, e
              faço lives na Twitch.
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
          <Group gap="xs">
            <Image
              radius="md"
              src="/images/duolingo.svg"
              alt="Logo Duolingo"
              h={20}
              w={20}
              fit="contain"
            />
            <Text size="sm" fw={500}>
              Duolingo
            </Text>
          </Group>

          <Group gap="xs">
            <Image
              radius="md"
              src="/images/especializati.png"
              alt="Logo EspecializaTi"
              h={20}
              w={20}
              fit="contain"
            />
            <Text size="sm" fw={500}>
              EspecializaTi
            </Text>
          </Group>

          <Group gap="xs">
            <Image
              radius="md"
              src="/images/hello-talk.png"
              alt="Logo HelloTalk"
              h={20}
              w={20}
              fit="contain"
            />
            <Text size="sm" fw={500}>
              HelloTalk
            </Text>
          </Group>

          <Group gap="xs">
            <Image
              radius="md"
              src="/images/freecodecamp.jpg"
              alt="Logo FreeCodeCamp"
              h={20}
              w={20}
              fit="contain"
            />
            <Text size="sm" fw={500}>
              FreeCodeCamp
            </Text>
          </Group>

          <Group gap="xs">
            <Image
              radius="md"
              src="/images/rocketset.png"
              alt="Logo Rocketset"
              h={20}
              w={20}
              fit="contain"
            />
            <Text size="sm" fw={500}>
              Rocketset
            </Text>
          </Group>
        </SimpleGrid>
      </Card>

      {/* https://br.pinterest.com/pin/617345061505700615/ */}
    </>
  );
}
