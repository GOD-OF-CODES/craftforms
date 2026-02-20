import { ComponentType } from 'react'
import { FieldInputProps } from './types'
import ShortTextField from './ShortTextField'
import LongTextField from './LongTextField'
import EmailField from './EmailField'
import UrlField from './UrlField'
import PhoneField from './PhoneField'
import NumberField from './NumberField'
import MultipleChoiceField from './MultipleChoiceField'
import CheckboxesField from './CheckboxesField'
import DropdownField from './DropdownField'
import YesNoField from './YesNoField'
import RatingField from './RatingField'
import OpinionScaleField from './OpinionScaleField'
import DateField from './DateField'
import LegalField from './LegalField'
import FileUploadField from './FileUploadField'
import RankingField from './RankingField'
import MatrixField from './MatrixField'
import PaymentField from './PaymentField'

export const fieldComponents: Record<string, ComponentType<FieldInputProps>> = {
  short_text: ShortTextField,
  long_text: LongTextField,
  email: EmailField,
  url: UrlField,
  phone: PhoneField,
  number: NumberField,
  multiple_choice: MultipleChoiceField,
  checkboxes: CheckboxesField,
  dropdown: DropdownField,
  yes_no: YesNoField,
  rating: RatingField,
  opinion_scale: OpinionScaleField,
  date: DateField,
  legal: LegalField,
  file_upload: FileUploadField,
  ranking: RankingField,
  matrix: MatrixField,
  payment: PaymentField as ComponentType<FieldInputProps>,
}

export type { FieldConfig, FieldInputProps } from './types'
