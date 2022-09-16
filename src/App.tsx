import { Component, createSignal } from "solid-js";
import { ERROR_MESSAGE, useHiraganaRepo } from "./repos/hiragana";
import { useConvertToVowel } from "./modules/useConvertToVowel";
import {
  Button,
  Heading,
  Stack,
  Container,
  Center,
  Textarea,
  Text,
  Box,
  notificationService,
  Notification,
  NotificationTitle,
  Icon,
} from "@hope-ui/solid";
import { CgDanger } from "solid-icons/cg";

const APP_ID = import.meta.env.VITE_APP_ID as string;

const { convertToVowel } = useConvertToVowel();

const App: Component = () => {
  const [value, setValue] = createSignal("");
  const [convertedValue, setConvertedValue] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);

  const [errorMessage, setErrorMessage] = createSignal("");
  const hiraganaRepo = useHiraganaRepo();

  const convertHiragana = async (value: string) => {
    setErrorMessage("");
    setConvertedValue("");

    try {
      if (!value) {
        setErrorMessage("文字を入力してください。");
        return;
      }

      setIsLoading(true);

      const converted = await hiraganaRepo.fetch({
        app_id: APP_ID,
        sentence: value,
        output_type: "hiragana",
      });

      const convertedVowel = convertToVowel(converted);

      setConvertedValue(convertedVowel);
    } catch (e: unknown) {
      notificationService.show({
        render: () => (
          <Notification bg={"$danger4"}>
            <Icon boxSize="1.5em" color={"$danger11"} as={CgDanger} mr={2} />
            <NotificationTitle color={"$danger11"}>
              {ERROR_MESSAGE}
            </NotificationTitle>
          </Notification>
        ),
        duration: 2_000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="md" p={24}>
      <Center>
        <Heading level="1" size="4xl" my={24}>
          母音変換機
        </Heading>
      </Center>

      <Stack
        spacing={16}
        direction={{ "@initial": "column", "@md": "row" }}
        mb={36}
        justifyContent="center"
      >
        <Box w={{ "@initial": "full", "@md": "400px" }}>
          <Text mb="$2">母音に変換したい文字</Text>
          <Textarea
            value={value()}
            placeholder="母音に変換したい文字"
            onInput={(event) => {
              setValue(event.currentTarget.value);
            }}
            invalid={errorMessage() !== "" && value() === ""}
            size="lg"
            h={200}
            required
            bg={errorMessage() !== "" && value() === "" ? "$danger6" : "fff"}
            resize={"none"}
          />
          {errorMessage() !== "" && value() === "" && (
            <Text color={"$danger10"} size={"sm"}>
              {errorMessage()}
            </Text>
          )}
        </Box>

        <Box w={{ "@initial": "full", "@md": "400px" }}>
          <Text mb="$2">母音に変換後の文字</Text>
          <Textarea
            value={convertedValue()}
            variant="unstyled"
            placeholder="おいいんいえんあんいあいおい"
            readOnly
            size="lg"
            h={200}
            py={8}
            px={16}
            resize={"none"}
            bg={convertedValue()! == "" ? "$neutral3" : "$danger3"}
            onInput={(event) => {
              setValue(event.currentTarget.value);
            }}
          />
        </Box>
      </Stack>

      <Center>
        <Button
          loading={isLoading()}
          onclick={() => convertHiragana(value())}
          w={{ "@initial": "100%", "@md": "320px" }}
        >
          母音に変換する
        </Button>
      </Center>
    </Container>
  );
};

export default App;
