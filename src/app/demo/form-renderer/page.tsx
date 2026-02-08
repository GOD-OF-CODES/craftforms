'use client'

import { FormRenderer } from '@/components/form-renderer'
import { FieldConfig } from '@/components/form-renderer/FieldRenderer'

// Demo form fields for testing the form renderer
const demoFields: FieldConfig[] = [
  {
    id: 'field-1',
    type: 'short_text',
    title: "What's your name?",
    description: 'Please enter your full name',
    isRequired: true,
    properties: {
      placeholder: 'John Doe',
      minLength: 2,
      maxLength: 100
    }
  },
  {
    id: 'field-2',
    type: 'email',
    title: "What's your email address?",
    description: "We'll use this to send you updates",
    isRequired: true,
    properties: {
      placeholder: 'john@example.com'
    }
  },
  {
    id: 'field-3',
    type: 'multiple_choice',
    title: 'How did you hear about us?',
    description: 'Select the option that best applies',
    isRequired: true,
    properties: {
      options: ['Social Media', 'Search Engine', 'Friend/Colleague', 'Advertisement', 'Other']
    }
  },
  {
    id: 'field-4',
    type: 'rating',
    title: 'How would you rate your experience?',
    description: 'Rate from 1 to 5 stars',
    isRequired: false,
    properties: {
      ratingMax: 5
    }
  },
  {
    id: 'field-5',
    type: 'opinion_scale',
    title: 'How likely are you to recommend us?',
    description: '0 = Not likely at all, 10 = Extremely likely',
    isRequired: true,
    properties: {
      scaleMin: 0,
      scaleMax: 10,
      scaleMinLabel: 'Not likely',
      scaleMaxLabel: 'Very likely'
    }
  },
  {
    id: 'field-6',
    type: 'long_text',
    title: 'Any additional comments?',
    description: 'Feel free to share your thoughts',
    isRequired: false,
    properties: {
      placeholder: 'Your feedback helps us improve...'
    }
  }
]

export default function FormRendererDemo() {
  const handleSubmit = async (answers: Record<string, any>) => {
    console.log('Form submitted with answers:', answers)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('Form submitted successfully!\n\nAnswers:\n' + JSON.stringify(answers, null, 2))
  }

  return (
    <FormRenderer
      fields={demoFields}
      onSubmit={handleSubmit}
      showProgressBar={true}
      showQuestionNumbers={true}
      allowNavigation={true}
      welcomeScreen={{
        enabled: true,
        title: 'Welcome to Our Survey',
        description: 'Thank you for taking the time to share your feedback. This survey takes about 2 minutes to complete.',
        buttonText: "Let's Start"
      }}
      thankYouScreen={{
        enabled: true,
        title: 'Thank you for your feedback!',
        description: 'Your responses have been recorded. We appreciate your time and will use your feedback to improve our services.'
      }}
    />
  )
}
