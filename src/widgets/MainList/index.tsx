'use client'

import { ItemComponent } from "./components/ItemComponent";
import { IMainList } from "./models/IMainList";

export const MainList = ({
  content,
  startLink,
}: IMainList) => {
  return (
    <div className="space-y-4">
      {content.map(item => (
        <ItemComponent key={item.id} item={item} startLink={startLink} />
      ))}
    </div>
  )
}