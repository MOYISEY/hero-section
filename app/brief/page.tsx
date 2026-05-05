import { BriefDocument } from "@/components/brief/brief-document"

export const metadata = {
  title: "Пример ТЗ · NeuralBrief",
  description:
    "Готовое техническое задание, сгенерированное NeuralBrief: цели, аудитория, функционал, палитра, структура страниц.",
}

export default function BriefPage() {
  return <BriefDocument />
}
