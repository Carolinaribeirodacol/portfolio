import {
  Card,
  Code,
  Grid,
  Group,
  Image,
  SimpleGrid,
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
  IconBrandGithub,
  IconBrandNotion,
  IconBrandFigma,
} from "@tabler/icons-react";

export default function AboutPage() {
  return (
    <>
      <Title order={1} align="center" mb="lg">
        Prazer, Carolina
      </Title>

      <Card shadow="md" radius="md" p="lg" withBorder mb="lg">
        <Grid gutter="lg" align="center">
          <Grid.Col span={{ base: 12, sm: 4 }}>
            <Image radius="md" src="/images/profile.jpg" alt="Foto de Perfil" />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 8 }}>
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
            <Group gap="xs">
              <IconBrandLaravel color="red" size={20} />
              <Text size="sm" fw={500}>
                Laravel
              </Text>
            </Group>

            <Group gap="xs">
              <IconBrandNotion color="white" size={20} />
              <Text size="sm" fw={500}>
                Notion
              </Text>
            </Group>

            <Group gap="xs">
              <IconBrandFigma color="green" size={20} />
              <Text size="sm" fw={500}>
                Figma
              </Text>
            </Group>

            <Group gap="xs">
              <IconBrandGithub color="white" size={20} />
              <Text size="sm" fw={500}>
                Github
              </Text>
            </Group>

            <Group gap="xs">
              <IconBrandMysql color="gray" size={20} />
              <Text size="sm" fw={500}>
                MySQL
              </Text>
            </Group>

            <Group gap="xs">
              <IconBrandDocker color="blue" size={20} />
              <Text size="sm" fw={500}>
                Docker
              </Text>
            </Group>

            <Group gap="xs">
              <IconCarrot color="orange" size={20} />
              <Text size="sm" fw={500}>
                RabbitMQ
              </Text>
            </Group>
          </Stack>
        </Card>

        {/* Frameworks / UI / CSS */}
        <Card shadow="sm" padding="lg" radius="md" withBorder>
          <Title order={4}>Frontend</Title>

          <Stack gap="xs" mt="sm">
            <Group gap="xs">
              <IconBrandVue color="green" size={20} />
              <Text size="sm" fw={500}>
                Vue
              </Text>
            </Group>

            <Group gap="xs">
              <IconBrandReact color="teal" size={20} />
              <Text size="sm" fw={500}>
                React / Next
              </Text>
            </Group>

            <Group gap="xs">
              <IconCircleLetterQ color="purple" size={20} />
              <Text size="sm" fw={500}>
                Quasar
              </Text>
            </Group>

            <Group gap="xs">
              <IconLayoutDashboard color="indigo" size={20} />
              <Text size="sm" fw={500}>
                Mantine
              </Text>
            </Group>

            <Group gap="xs">
              <IconBrandTailwind color="teal" size={20} />

              <Text size="sm" fw={500}>
                Tailwind CSS
              </Text>
            </Group>

            <Group gap="xs">
              <IconBrandVue color="green" size={20} />

              <Text size="sm" fw={500}>
                Vuetify
              </Text>
            </Group>

            <Group gap="xs">
              <IconBrandSass color="pink" size={20} />

              <Text size="sm" fw={500}>
                Sass
              </Text>
            </Group>
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
