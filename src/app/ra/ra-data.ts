import { atom } from "jotai";
import z from "zod";
import { queryOptions } from "@tanstack/react-query";

export const raApiConfigSchema = z.object({
  url: z.url("API URL 需要是合法 URL"),
  token: z.string(),
});

export type RaApiConfig = z.infer<typeof raApiConfigSchema>;

const raApiConfigAtom = atom<z.infer<typeof raApiConfigSchema>>({
  url: "",
  token: "",
});

export const raVoiceConfigAdvancedSchema = z.object({
  pitch: z.string(),
  rate: z.string(),
  format: z.string(),
  volume: z.string(),
});

const raVoiceNameSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("single"),
    name: z.string(),
  }),
  z.object({
    type: z.literal("all"),
    nameList: z.array(z.string()),
  }),
  z.object({
    type: z.literal("all-zh"),
    nameList: z.array(z.string()),
  }),
]);
export type RaVoiceName = z.infer<typeof raVoiceNameSchema>;

export const raVoiceConfigSchema = z.object({
  voiceName: raVoiceNameSchema,
  advanced: raVoiceConfigAdvancedSchema,
});
export type RaVoiceConfig = z.infer<typeof raVoiceConfigSchema>;

const raVoiceConfigAtom = atom<RaVoiceConfig>({
  voiceName: {
    type: "single",
    name: "zh-CN-XiaoxiaoNeural",
  },
  advanced: {
    pitch: "",
    rate: "",
    format: "audio-24khz-48kbitrate-mono-mp3",
    volume: "",
  },
});

export const raVoiceNameAtom = atom(
  (get) => get(raVoiceConfigAtom).voiceName,
  (get, set, voiceName: RaVoiceName) => {
    set(raVoiceConfigAtom, (prev) => ({ ...prev, voiceName }));
  }
);

const validRaVoiceConfigAtom = atom((get) => {
  const config = get(raVoiceConfigAtom);
  const result = raVoiceConfigSchema.safeParse(config);
  if (!result.success) {
    return null;
  }
  return result.data;
});

const raStateSchema = z
  .object({
    api: raApiConfigSchema,
    voice: raVoiceConfigSchema,
  })
  .brand("RaState");

export type RaState = z.infer<typeof raStateSchema>;



export {
  raVoiceConfigAtom,
  validRaVoiceConfigAtom,
  raApiConfigAtom,
  raStateSchema,
};

async function fetchVoices() {
  const res = await fetch(
    "https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=6A5AA1D4EAFF4E9FB37E23D68491D6F4"
  );
  return ((await res.json()) as { ShortName: string }[]).map(
    (v) => v["ShortName"]
  );
}

const voiceListQueryOptions = queryOptions({
  queryKey: ["ra-voice-list"],
  queryFn: fetchVoices,
});

export { voiceListQueryOptions };
