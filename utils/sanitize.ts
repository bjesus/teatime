import sanitize from "sanitize-filename";

export default function (s: string) {
  return sanitize(s);
}
