import { z } from "zod";

export const separatorSchema = z.object({
  label: z.string(),
  value: z.string(),
});
export type Separator = z.infer<typeof separatorSchema>;
export const separators: Separator[] = [
  { label: "None", value: "" },
  { label: "Newlines", value: "\n" },
  { label: "2 Newlines", value: "\n\n" },
  { label: "HR", value: "\n\n---\n\n" },
  { label: "Comma", value: ", " },
  { label: "Semicolon", value: "; " },
  { label: "Tab", value: "\t" },
];

export const sepConditionSchema = z.enum(["never", "always", "trim", "smart"]);
export type SepCondition = z.infer<typeof sepConditionSchema>;
export const sepConditions: SepCondition[] = sepConditionSchema.options;

export const sepStrategySchema = z.object({
  condition: sepConditionSchema,
  separator: separatorSchema,
});
export type SepStrategy = z.infer<typeof sepStrategySchema>;

export const contentsHandleOptionsSchema = z.enum(["markdown", "html", "text"]);
export type ContentsHandleOption = z.infer<typeof contentsHandleOptionsSchema>;
export const contentsHandleOptions: ContentsHandleOption[] =
  contentsHandleOptionsSchema.options;

export const autoCopyOptionsSchema = z.enum(["none", "text", "html"]);
export type AutoCopyOption = z.infer<typeof autoCopyOptionsSchema>;
export const autoCopyOptions: AutoCopyOption[] = autoCopyOptionsSchema.options;

export const configSchema = z.object({
  beforeSep: sepStrategySchema,
  afterSep: sepStrategySchema,
  contentsHandleOption: contentsHandleOptionsSchema,
  autoCopyOnFocus: autoCopyOptionsSchema,
  autoStartRecordingOnFocus: z.boolean(),
});
export type Config = z.infer<typeof configSchema>;

export const defaultConfig: Config = {
  beforeSep: { condition: "trim", separator: separators[2] /* 2 Newlines */ },
  afterSep: { condition: "never", separator: separators[0] /* None */ },
  contentsHandleOption: "markdown",
  autoCopyOnFocus: "none",
  autoStartRecordingOnFocus: true,
};
