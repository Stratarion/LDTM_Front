import { helloBlock } from "../constants"

export const HelloBlock = () => {
  return (
    <section className="mb-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">{helloBlock.title}</h1>
      <p className="text-gray-600 text-lg">{helloBlock.secondTitle}</p>
    </section>
  )
}