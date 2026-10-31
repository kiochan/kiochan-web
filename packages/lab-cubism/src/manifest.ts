export type ModelSummary = {
  moc: string;
  textures: string[];
  motions: number;
  expressions: number;
};
export function inspectManifest(text: string): ModelSummary {
  const value: unknown = JSON.parse(text);
  if (
    !value ||
    typeof value !== "object" ||
    !("Version" in value) ||
    value.Version !== 3 ||
    !("FileReferences" in value)
  )
    throw new Error("Choose a Cubism .model3.json manifest with Version 3.");
  const refs = value.FileReferences;
  if (
    !refs ||
    typeof refs !== "object" ||
    !("Moc" in refs) ||
    typeof refs.Moc !== "string" ||
    !refs.Moc.endsWith(".moc3")
  )
    throw new Error("The manifest needs a .moc3 reference.");
  const textures = "Textures" in refs ? refs.Textures : [];
  if (
    !Array.isArray(textures) ||
    textures.length > 64 ||
    !textures.every((t) => typeof t === "string" && t.length < 512)
  )
    throw new Error(
      "Texture references must be a list of up to 64 file names.",
    );
  const motions =
    "Motions" in refs && refs.Motions && typeof refs.Motions === "object"
      ? Object.values(refs.Motions).reduce<number>(
          (n, list) => n + (Array.isArray(list) ? list.length : 0),
          0,
        )
      : 0;
  const expressions =
    "Expressions" in refs && Array.isArray(refs.Expressions)
      ? refs.Expressions.length
      : 0;
  return { moc: refs.Moc.slice(0, 512), textures, motions, expressions };
}
