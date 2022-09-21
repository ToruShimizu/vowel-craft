import { Component, createMemo, createSignal, Show } from "solid-js";
import { ERROR_MESSAGE, useHiraganaRepo } from "./repos/hiragana";
import { useConvertToVowel } from "./modules/useConvertToVowel";
import {
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
  Spinner,
  VStack,
  HStack,
} from "@hope-ui/solid";
import { CgDanger } from "solid-icons/cg";
import ConvertHiraganaButton from "./components/buttons/ConvertHiraganaButton";
import TweetButton from "./components/buttons/TweetButton";

const APP_ID = import.meta.env.VITE_APP_ID as string;

const { convertToVowel } = useConvertToVowel();

const App: Component = () => {
  const [text, setText] = createSignal("");
  const [convertedHiragana, setConvertedHiragana] = createSignal("");
  const [isLoading, setIsLoading] = createSignal(false);

  const [errorMessage, setErrorMessage] = createSignal("");
  const hiraganaRepo = useHiraganaRepo();

  const isInValid = createMemo(() => errorMessage() !== "" && text() === "");

  const fetchConvertHiragana = async (value: string) => {
    setErrorMessage("");
    setConvertedHiragana("");

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

      setConvertedHiragana(converted);
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

  const convertedVowel = createMemo(() => convertToVowel(convertedHiragana()));

  const tweet = createMemo(() => `${text()}\n${convertedVowel()}`);
  const isDisabled = createMemo(() => !convertedVowel() || isLoading());

  return (
    <Container maxWidth="md" py={"$16"} px={"$6"}>
      <Center>
        <Heading level="1" size="4xl" my={24}>
          母音変換機
        </Heading>
      </Center>
      <Stack
        spacing={"$4"}
        direction={{ "@initial": "column", "@lg": "row" }}
        mb={"$10"}
        justifyContent="center"
      >
        <Box w={{ "@initial": "$full", "@lg": "400px" }} h={200} mb="$12">
          <Text mb="$2">母音に変換したい文字</Text>
          <Textarea
            value={text()}
            placeholder="母音に変換したい文字"
            invalid={isInValid()}
            size="lg"
            h={"$full"}
            required
            bg={isInValid() ? "$danger6" : "fff"}
            resize={"none"}
            borderRadius={"$2xl"}
            onInput={(event) => {
              setText(event.currentTarget.value);
            }}
            onKeyPress={(event) => {
              if (event.key == "Enter") {
                event.preventDefault();
                fetchConvertHiragana(text());
              }
            }}
          />
          {isInValid() && (
            <Text color={"$danger10"} size={"sm"}>
              {errorMessage()}
            </Text>
          )}
        </Box>

        <VStack
          display={{ "@lg": "none", "@sm": "flex" }}
          my={"$4"}
          spacing={"$4"}
        >
          <ConvertHiraganaButton
            isLoading={isLoading()}
            text={text()}
            onclick={fetchConvertHiragana}
          />
          <TweetButton disabled={isDisabled()} text={tweet()} />
        </VStack>

        <Box w={{ "@initial": "$full", "@lg": "400px" }} h={200}>
          <Text mb="$2">母音に変換後の文字</Text>
          <Show
            when={!isLoading()}
            fallback={() => (
              <Center alignItems="center" display="flex" h="$full">
                <Spinner
                  thickness="4px"
                  speed="0.85s"
                  size="xl"
                  color="$primary6"
                />
              </Center>
            )}
          >
            <Textarea
              value={convertedVowel()}
              variant="unstyled"
              placeholder="おいんい えんあんいあい おい"
              readOnly
              size="lg"
              py={!convertedVowel() ? "$2" : ""}
              px={!convertedVowel() ? "$4" : "$2"}
              h={"$full"}
              resize={"none"}
              bg={!convertedVowel() ? "$neutral3" : "$primary3"}
              onInput={(event) => {
                setText(event.currentTarget.value);
              }}
              borderRadius={"$2xl"}
            />
          </Show>
        </Box>
      </Stack>

      <HStack
        display={{ "@initial": "none", "@lg": "flex" }}
        justifyContent="center"
        spacing={"$4"}
      >
        <ConvertHiraganaButton
          isLoading={isLoading()}
          text={text()}
          onclick={fetchConvertHiragana}
        />
        <TweetButton disabled={isDisabled()} text={tweet()} />
      </HStack>
    </Container>
  );
};

export default App;
