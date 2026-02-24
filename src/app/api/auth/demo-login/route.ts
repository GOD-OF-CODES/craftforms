import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIdentifier, rateLimitConfigs } from '@/lib/rateLimit'

const DEMO_EMAIL = 'demo@craftforms.com'
const DEMO_PASSWORD = 'DemoAccount1'
const DEMO_NAME = 'Demo User'

export async function POST(req: Request) {
  try {
    const clientId = getClientIdentifier(req)
    const rateCheck = checkRateLimit(`demo-login:${clientId}`, rateLimitConfigs.auth)
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429 }
      )
    }

    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL },
      include: {
        workspacesOwned: true,
      },
    })

    if (existingUser) {
      return NextResponse.json({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      })
    }

    // Create demo user with sample data
    const hashedPassword = await hash(DEMO_PASSWORD, 12)

    await prisma.$transaction(async (tx) => {
      // Create demo user
      const user = await tx.user.create({
        data: {
          email: DEMO_EMAIL,
          name: DEMO_NAME,
          password: hashedPassword,
          emailVerified: new Date(),
        },
      })

      // Create workspace
      const workspace = await tx.workspace.create({
        data: {
          name: "Demo Workspace",
          slug: `demo-workspace-${Date.now()}`,
          ownerId: user.id,
        },
      })

      await tx.workspaceMember.create({
        data: {
          workspaceId: workspace.id,
          userId: user.id,
          role: 'owner',
        },
      })

      // Create theme
      const theme = await tx.theme.create({
        data: {
          name: 'Ocean Blue',
          workspaceId: workspace.id,
          createdBy: user.id,
          isPublic: false,
          colors: {
            primary: '#3b82f6',
            primaryText: '#ffffff',
            background: '#f0f9ff',
            text: '#1e293b',
            secondaryText: '#64748b',
            error: '#ef4444',
            success: '#22c55e',
          },
          fonts: {
            questionFamily: 'Inter',
            questionSize: '24px',
            questionWeight: '600',
            answerFamily: 'Inter',
            answerSize: '18px',
            answerWeight: '400',
            buttonFamily: 'Inter',
            buttonSize: '16px',
            buttonWeight: '500',
          },
        },
      })

      // =============================================
      // Form 1: Customer Feedback Survey (Published)
      // =============================================
      const form1 = await tx.form.create({
        data: {
          workspaceId: workspace.id,
          title: 'Customer Feedback Survey',
          slug: 'customer-feedback',
          description: 'Help us improve our product by sharing your experience.',
          isPublished: true,
          isAcceptingResponses: true,
          createdBy: user.id,
          themeId: theme.id,
          settings: {
            showProgressBar: true,
            showQuestionNumbers: true,
            allowNavigation: true,
          },
        },
      })

      // Welcome screen
      await tx.formScreen.create({
        data: {
          formId: form1.id,
          type: 'welcome',
          title: 'We value your feedback!',
          description: 'This survey takes about 2 minutes. Your responses help us build a better product.',
          buttonText: 'Start Survey',
        },
      })

      // Thank you screen
      await tx.formScreen.create({
        data: {
          formId: form1.id,
          type: 'thank_you',
          title: 'Thank you for your feedback!',
          description: 'Your insights are incredibly valuable to us. We review every response.',
        },
      })

      const form1Fields = await Promise.all([
        tx.formField.create({
          data: {
            formId: form1.id,
            type: 'short_text',
            title: 'What is your name?',
            description: 'We\'d love to know who we\'re talking to.',
            orderIndex: 0,
            isRequired: true,
            properties: { placeholder: 'John Doe' },
          },
        }),
        tx.formField.create({
          data: {
            formId: form1.id,
            type: 'email',
            title: 'What is your email address?',
            orderIndex: 1,
            isRequired: true,
            properties: { placeholder: 'you@example.com' },
          },
        }),
        tx.formField.create({
          data: {
            formId: form1.id,
            type: 'multiple_choice',
            title: 'How did you hear about us?',
            orderIndex: 2,
            isRequired: false,
            properties: {
              options: ['Google Search', 'Social Media', 'Friend or Colleague', 'Blog Post', 'Other'],
            },
          },
        }),
        tx.formField.create({
          data: {
            formId: form1.id,
            type: 'rating',
            title: 'How would you rate your overall experience?',
            description: '1 = Very Poor, 5 = Excellent',
            orderIndex: 3,
            isRequired: true,
            properties: { ratingMax: 5 },
          },
        }),
        tx.formField.create({
          data: {
            formId: form1.id,
            type: 'opinion_scale',
            title: 'How likely are you to recommend us to a friend?',
            description: 'On a scale of 0-10',
            orderIndex: 4,
            isRequired: true,
            properties: { scaleMin: 0, scaleMax: 10, minLabel: 'Not likely', maxLabel: 'Very likely' },
          },
        }),
        tx.formField.create({
          data: {
            formId: form1.id,
            type: 'long_text',
            title: 'Any additional comments or suggestions?',
            orderIndex: 5,
            isRequired: false,
            properties: { placeholder: 'Share your thoughts...' },
          },
        }),
      ])

      // Generate 18 responses for Form 1
      const names = ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Emma Davis', 'Frank Miller', 'Grace Wilson', 'Henry Moore', 'Ivy Taylor', 'Jack Anderson', 'Karen Thomas', 'Leo Jackson', 'Mia White', 'Noah Harris', 'Olivia Martin', 'Paul Garcia', 'Quinn Lee', 'Ruby Clark']
      const sources = ['Google Search', 'Social Media', 'Friend or Colleague', 'Blog Post', 'Other']
      const comments = [
        'Great product! Love the simplicity.',
        'Could use more integrations with other tools.',
        'The form builder is intuitive and easy to use.',
        'Would love to see more templates available.',
        'Excellent support team, very responsive.',
        'The analytics dashboard is really helpful.',
        '',
        'Love the drag and drop feature!',
        'Clean design, works perfectly on mobile.',
        '',
        'Would be nice to have conditional logic.',
        'Best form builder I have tried so far.',
        'The free plan is very generous.',
        '',
        'Amazing product, keep it up!',
        'Easy to set up, hard to stop using.',
        'Some minor UI bugs on Safari.',
        'Perfect for our small business needs.',
      ]

      for (let i = 0; i < 18; i++) {
        const name = names[i] || `User ${i}`
        const comment = comments[i] || ''
        const isCompleted = i < 15
        const timeTaken = isCompleted ? 60 + Math.floor(Math.random() * 240) : 20 + Math.floor(Math.random() * 30)
        const daysAgo = Math.floor(Math.random() * 14)
        const createdAt = new Date(Date.now() - daysAgo * 86400000 - Math.floor(Math.random() * 86400000))

        const response = await tx.response.create({
          data: {
            formId: form1.id,
            respondentId: `respondent-${i + 1}`,
            isCompleted,
            startedAt: new Date(createdAt.getTime() - timeTaken * 1000),
            completedAt: isCompleted ? createdAt : null,
            timeTaken: isCompleted ? timeTaken : null,
            createdAt,
          },
        })

        const answersToCreate = isCompleted ? form1Fields.length : Math.min(2, form1Fields.length)
        for (let j = 0; j < answersToCreate; j++) {
          const field = form1Fields[j]!
          let value: string | number | boolean | string[]
          switch (field.type) {
            case 'short_text': value = name; break
            case 'email': value = `${name.toLowerCase().replace(' ', '.')}@example.com`; break
            case 'multiple_choice': value = sources[Math.floor(Math.random() * sources.length)] || 'Other'; break
            case 'rating': value = 3 + Math.floor(Math.random() * 3); break
            case 'opinion_scale': value = 6 + Math.floor(Math.random() * 5); break
            case 'long_text': value = comment; break
            default: value = ''
          }

          await tx.responseAnswer.create({
            data: {
              responseId: response.id,
              fieldId: field.id,
              value: { value },
            },
          })
        }
      }

      // =============================================
      // Form 2: Product Feature Request (Published)
      // =============================================
      const form2 = await tx.form.create({
        data: {
          workspaceId: workspace.id,
          title: 'Product Feature Request',
          slug: 'feature-request',
          description: 'Tell us what features you would like to see next.',
          isPublished: true,
          isAcceptingResponses: true,
          createdBy: user.id,
          settings: {
            showProgressBar: true,
            showQuestionNumbers: true,
          },
        },
      })

      const form2Fields = await Promise.all([
        tx.formField.create({
          data: {
            formId: form2.id,
            type: 'short_text',
            title: 'Feature name',
            description: 'Give your feature idea a short title.',
            orderIndex: 0,
            isRequired: true,
            properties: { placeholder: 'e.g., Dark mode support' },
          },
        }),
        tx.formField.create({
          data: {
            formId: form2.id,
            type: 'long_text',
            title: 'Describe the feature',
            description: 'Explain what this feature would do and why it would be useful.',
            orderIndex: 1,
            isRequired: true,
            properties: { placeholder: 'Describe your idea in detail...' },
          },
        }),
        tx.formField.create({
          data: {
            formId: form2.id,
            type: 'checkboxes',
            title: 'Which category does this fall under?',
            orderIndex: 2,
            isRequired: false,
            properties: {
              options: ['User Interface', 'Performance', 'Integrations', 'Analytics', 'Security', 'Other'],
            },
          },
        }),
        tx.formField.create({
          data: {
            formId: form2.id,
            type: 'yes_no',
            title: 'Would you pay extra for this feature?',
            orderIndex: 3,
            isRequired: true,
            properties: {},
          },
        }),
        tx.formField.create({
          data: {
            formId: form2.id,
            type: 'rating',
            title: 'How important is this to you?',
            description: '1 = Nice to have, 5 = Critical',
            orderIndex: 4,
            isRequired: true,
            properties: { ratingMax: 5 },
          },
        }),
      ])

      const featureNames = ['Dark mode', 'Slack integration', 'Advanced branching', 'Custom CSS', 'Webhook retries', 'Team templates', 'Form scheduling', 'Multi-language', 'AI-powered analytics', 'Stripe payments']
      const featureDescs = [
        'Add dark mode to reduce eye strain for users working late hours.',
        'Integrate with Slack to get notifications when new responses arrive.',
        'Allow more complex conditional logic with multiple conditions.',
        'Let users add custom CSS to fully brand their forms.',
        'Automatically retry failed webhooks with exponential backoff.',
        'Share form templates across team members in a workspace.',
        'Schedule forms to open and close at specific dates/times.',
        'Support multiple languages in a single form.',
        'Use AI to summarize response trends and insights.',
        'Accept payments directly within forms via Stripe.',
      ]
      const categories = [['User Interface'], ['Integrations'], ['User Interface', 'Analytics'], ['User Interface'], ['Integrations', 'Performance'], ['User Interface'], ['User Interface', 'Analytics'], ['User Interface'], ['Analytics'], ['Integrations', 'Security']]

      for (let i = 0; i < 10; i++) {
        const isCompleted = i < 9
        const timeTaken = 45 + Math.floor(Math.random() * 180)
        const daysAgo = Math.floor(Math.random() * 10)
        const createdAt = new Date(Date.now() - daysAgo * 86400000 - Math.floor(Math.random() * 86400000))

        const response = await tx.response.create({
          data: {
            formId: form2.id,
            respondentId: `feature-respondent-${i + 1}`,
            isCompleted,
            startedAt: new Date(createdAt.getTime() - timeTaken * 1000),
            completedAt: isCompleted ? createdAt : null,
            timeTaken: isCompleted ? timeTaken : null,
            createdAt,
          },
        })

        const answersToCreate = isCompleted ? form2Fields.length : 2
        for (let j = 0; j < answersToCreate; j++) {
          const field = form2Fields[j]!
          let value: string | number | boolean | string[]
          switch (field.type) {
            case 'short_text': value = featureNames[i] || ''; break
            case 'long_text': value = featureDescs[i] || ''; break
            case 'checkboxes': value = categories[i] || []; break
            case 'yes_no': value = Math.random() > 0.4; break
            case 'rating': value = 3 + Math.floor(Math.random() * 3); break
            default: value = ''
          }
          await tx.responseAnswer.create({
            data: {
              responseId: response.id,
              fieldId: field.id,
              value: { value },
            },
          })
        }
      }

      // =============================================
      // Form 3: Event Registration (Published)
      // =============================================
      const form3 = await tx.form.create({
        data: {
          workspaceId: workspace.id,
          title: 'Tech Meetup Registration',
          slug: 'event-registration',
          description: 'Register for our upcoming tech community meetup.',
          isPublished: true,
          isAcceptingResponses: true,
          createdBy: user.id,
          themeId: theme.id,
          settings: {
            showProgressBar: true,
            showQuestionNumbers: true,
            allowNavigation: true,
          },
        },
      })

      await tx.formScreen.create({
        data: {
          formId: form3.id,
          type: 'welcome',
          title: 'Tech Community Meetup 2026',
          description: 'Join us for an evening of talks, networking, and pizza! Register below to save your spot.',
          buttonText: 'Register Now',
        },
      })

      await tx.formScreen.create({
        data: {
          formId: form3.id,
          type: 'thank_you',
          title: 'You\'re registered!',
          description: 'We\'ll send you a confirmation email with event details soon.',
        },
      })

      const form3Fields = await Promise.all([
        tx.formField.create({
          data: {
            formId: form3.id,
            type: 'short_text',
            title: 'Full name',
            orderIndex: 0,
            isRequired: true,
            properties: { placeholder: 'Jane Smith' },
          },
        }),
        tx.formField.create({
          data: {
            formId: form3.id,
            type: 'email',
            title: 'Email address',
            description: 'We\'ll send your ticket confirmation here.',
            orderIndex: 1,
            isRequired: true,
            properties: { placeholder: 'jane@example.com' },
          },
        }),
        tx.formField.create({
          data: {
            formId: form3.id,
            type: 'number',
            title: 'How many seats would you like to reserve?',
            orderIndex: 2,
            isRequired: true,
            properties: { min: 1, max: 5 },
          },
        }),
        tx.formField.create({
          data: {
            formId: form3.id,
            type: 'dropdown',
            title: 'Dietary restrictions',
            orderIndex: 3,
            isRequired: false,
            properties: {
              options: ['None', 'Vegetarian', 'Vegan', 'Gluten-free', 'Halal', 'Kosher'],
            },
          },
        }),
        tx.formField.create({
          data: {
            formId: form3.id,
            type: 'checkboxes',
            title: 'Which sessions are you interested in?',
            description: 'Select all that apply.',
            orderIndex: 4,
            isRequired: false,
            properties: {
              options: ['AI & Machine Learning', 'Web Development', 'DevOps & Cloud', 'Mobile Development', 'Cybersecurity'],
            },
          },
        }),
        tx.formField.create({
          data: {
            formId: form3.id,
            type: 'long_text',
            title: 'Any questions for the organizers?',
            orderIndex: 5,
            isRequired: false,
            properties: { placeholder: 'Optional...' },
          },
        }),
      ])

      const attendeeNames = ['Sarah Chen', 'Mike O\'Brien', 'Aisha Patel', 'Carlos Reyes', 'Lena Kim', 'James Wright', 'Fatima Hassan', 'Tom Baker', 'Priya Singh', 'Alex Turner', 'Yuki Tanaka', 'Chris Evans', 'Nina Rodriguez', 'Sam Lee', 'Rachel Green', 'Dev Kapoor', 'Lisa Wang', 'Mark Johnson', 'Sofia Martinez', 'Ian Cooper', 'Amara Obi', 'Ben Foster', 'Dana Scott', 'Omar Said', 'Zoe Black']
      const diets = ['None', 'None', 'None', 'Vegetarian', 'Vegan', 'None', 'Halal', 'None', 'Vegetarian', 'None', 'None', 'Gluten-free', 'None', 'Vegan', 'None', 'Vegetarian', 'None', 'None', 'None', 'None', 'None', 'Kosher', 'Vegetarian', 'Halal', 'None']
      const sessions = [
        ['AI & Machine Learning', 'Web Development'],
        ['DevOps & Cloud'],
        ['AI & Machine Learning', 'Cybersecurity'],
        ['Web Development', 'Mobile Development'],
        ['AI & Machine Learning'],
        ['DevOps & Cloud', 'Cybersecurity'],
        ['Web Development'],
        ['Mobile Development', 'DevOps & Cloud'],
        ['AI & Machine Learning', 'Web Development', 'Cybersecurity'],
        ['Web Development'],
        ['AI & Machine Learning'],
        ['DevOps & Cloud', 'Mobile Development'],
        ['Cybersecurity'],
        ['Web Development', 'AI & Machine Learning'],
        ['Mobile Development'],
        ['AI & Machine Learning', 'DevOps & Cloud'],
        ['Web Development', 'Cybersecurity'],
        ['DevOps & Cloud'],
        ['AI & Machine Learning', 'Mobile Development'],
        ['Web Development'],
        ['Cybersecurity', 'DevOps & Cloud'],
        ['Mobile Development'],
        ['AI & Machine Learning'],
        ['Web Development', 'DevOps & Cloud'],
        ['Cybersecurity', 'AI & Machine Learning'],
      ]

      for (let i = 0; i < 25; i++) {
        const isCompleted = i < 22
        const timeTaken = 40 + Math.floor(Math.random() * 120)
        const daysAgo = Math.floor(Math.random() * 7)
        const createdAt = new Date(Date.now() - daysAgo * 86400000 - Math.floor(Math.random() * 86400000))

        const response = await tx.response.create({
          data: {
            formId: form3.id,
            respondentId: `attendee-${i + 1}`,
            isCompleted,
            startedAt: new Date(createdAt.getTime() - timeTaken * 1000),
            completedAt: isCompleted ? createdAt : null,
            timeTaken: isCompleted ? timeTaken : null,
            createdAt,
          },
        })

        const answersToCreate = isCompleted ? form3Fields.length : 2
        for (let j = 0; j < answersToCreate; j++) {
          const field = form3Fields[j]!
          let value: string | number | boolean | string[]
          switch (field.type) {
            case 'short_text': value = attendeeNames[i] || ''; break
            case 'email': value = `${(attendeeNames[i] || 'user').toLowerCase().replace(/[^a-z]/g, '.')}@example.com`; break
            case 'number': value = 1 + Math.floor(Math.random() * 3); break
            case 'dropdown': value = diets[i] || 'None'; break
            case 'checkboxes': value = sessions[i] || []; break
            case 'long_text': value = i % 4 === 0 ? 'Is there parking available nearby?' : ''; break
            default: value = ''
          }
          await tx.responseAnswer.create({
            data: {
              responseId: response.id,
              fieldId: field.id,
              value: { value },
            },
          })
        }
      }

      // =============================================
      // Form 4: Contact Form (Draft, no responses)
      // =============================================
      const form4 = await tx.form.create({
        data: {
          workspaceId: workspace.id,
          title: 'Contact Us',
          slug: 'contact-us',
          description: 'Get in touch with our team.',
          isPublished: false,
          isAcceptingResponses: false,
          createdBy: user.id,
          settings: {
            showProgressBar: false,
            showQuestionNumbers: false,
          },
        },
      })

      await Promise.all([
        tx.formField.create({
          data: {
            formId: form4.id,
            type: 'short_text',
            title: 'Your name',
            orderIndex: 0,
            isRequired: true,
            properties: { placeholder: 'Your full name' },
          },
        }),
        tx.formField.create({
          data: {
            formId: form4.id,
            type: 'email',
            title: 'Your email',
            orderIndex: 1,
            isRequired: true,
            properties: { placeholder: 'you@example.com' },
          },
        }),
        tx.formField.create({
          data: {
            formId: form4.id,
            type: 'long_text',
            title: 'Your message',
            orderIndex: 2,
            isRequired: true,
            properties: { placeholder: 'How can we help?' },
          },
        }),
      ])

      return { user, workspace }
    }, { timeout: 30000 })

    return NextResponse.json({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    })
  } catch (error) {
    console.error('Demo login error:', error)
    return NextResponse.json(
      { error: 'Failed to create demo account' },
      { status: 500 }
    )
  }
}
