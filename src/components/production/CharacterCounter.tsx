export function CharacterCounter({ value, max = 2200 }: { value: string; max?: number }) {
  const over = value.length > max;
  return <p className={`mt-2 text-right text-xs ${over ? "text-terracotta" : "text-ink/55"}`}>{value.length.toLocaleString("es-ES")} / {max.toLocaleString("es-ES")} caracteres</p>;
}
