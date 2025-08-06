import { IServiceFilters } from "@/entities/service/model/IServiceFilters"
import { IServiceListFilter } from "@/widgets/ServiceListFilters/models/IServiceListFilter"

const SUBCATEGORIES = [
  { value: '', label: 'Все направления' },
  { value: 'Борьба', label: 'Борьба' },
  { value: 'Футбол', label: 'Футбол' },
  { value: 'Плавание', label: 'Плавание' },
  { value: 'Карате', label: 'Карате' },
  { value: 'Бокс', label: 'Бокс' },
  { value: 'Гимнастика', label: 'Гимнастика' },
  { value: 'Теннис', label: 'Теннис' },
  { value: 'Йога', label: 'Йога' }
]

const RATINGOPTIONS = [
  { value: '', label: 'Любой рейтинг' },
  { value: '4', label: 'От 4.0' },
  { value: '4.5', label: 'От 4.5' },
  { value: '5', label: '5.0' },
]
export const filtersList: IServiceListFilter<keyof IServiceFilters>[] = [
  {
    obj: "name",
    label: "Название",
    type: "text",
    placeholder: "Поиск по названию"
  },
  {
    obj: "address",
    label: "Адрес",
    type: "text",
    placeholder: "Поиск по адресу"
  },
  {
    obj: "subcategory",
    label: "Направление",
    type: "select",
    placeholder: "Поиск по адресу",
    options: SUBCATEGORIES
  },
  {
    obj: "priceRange",
    label: "Цена",
    type: "range",
    placeholder: "Диапазон цен",
    min: 0,
    max: 10000,
    step: 100
  },
  {
    obj: "ageRange",
    label: "Возраст",
    type: "range",
    placeholder: "Возрастной диапазон",
    min: 0,
    max: 100,
    step: 1
  },
  {
    obj: "minRating",
    label: "Рейтинг",
    type: "select",
    placeholder: "Минимальный рейтинг",
    options: RATINGOPTIONS
  },
]

export const PAGES_LIMIT = 12;