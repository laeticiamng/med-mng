import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const meta = {
  title: 'Components/Navigation/Accordion',
  component: Accordion,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Accordéons pour afficher du contenu pliable. Support animations et mode clair/sombre.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Single: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-2xl">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is it accessible?</AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern and uses semantic HTML.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Is it styled?</AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that adapt to light and dark modes automatically.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Is it animated?</AccordionTrigger>
        <AccordionContent>
          Yes. It's animated by default using smooth transitions for opening and closing.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accordéon simple - un seul élément ouvert à la fois.',
      },
    },
  },
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-full max-w-2xl">
      <AccordionItem value="item-1">
        <AccordionTrigger>Section 1</AccordionTrigger>
        <AccordionContent>
          <p className="text-sm text-muted-foreground">
            Multiple items can be open at the same time. This is useful for comparing content
            across different sections.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Section 2</AccordionTrigger>
        <AccordionContent>
          <p className="text-sm text-muted-foreground">
            Each section operates independently and can be expanded or collapsed without
            affecting other sections.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Section 3</AccordionTrigger>
        <AccordionContent>
          <p className="text-sm text-muted-foreground">
            Perfect for FAQ sections or detailed documentation where users need to reference
            multiple sections simultaneously.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accordéon multiple - plusieurs éléments peuvent être ouverts simultanément.',
      },
    },
  },
};

export const FAQ: Story = {
  render: () => (
    <div className="w-full max-w-2xl space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Frequently Asked Questions</h2>
        <p className="text-sm text-muted-foreground">Find answers to common questions below.</p>
      </div>
      <Accordion type="single" collapsible>
        <AccordionItem value="q1">
          <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              We accept all major credit cards (Visa, MasterCard, American Express), PayPal,
              and bank transfers for enterprise customers.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="q2">
          <AccordionTrigger>How do I cancel my subscription?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              You can cancel your subscription at any time from your account settings.
              Go to Settings → Billing → Cancel Subscription. Your access will continue
              until the end of your billing period.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="q3">
          <AccordionTrigger>Do you offer refunds?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              Yes, we offer a 30-day money-back guarantee. If you're not satisfied with
              our service, contact support within 30 days of purchase for a full refund.
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="q4">
          <AccordionTrigger>Is my data secure?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              Absolutely. We use industry-standard encryption (AES-256) for data at rest
              and TLS 1.3 for data in transit. All our servers are SOC 2 Type II certified.
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Exemple de FAQ avec contenu détaillé.',
      },
    },
  },
};

export const WithRichContent: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-full max-w-2xl">
      <AccordionItem value="features">
        <AccordionTrigger>Features</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Our platform includes:</p>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Real-time collaboration</li>
              <li>Advanced analytics dashboard</li>
              <li>Custom integrations</li>
              <li>24/7 customer support</li>
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="pricing">
        <AccordionTrigger>Pricing Plans</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 rounded bg-muted/50">
              <span className="font-medium">Free</span>
              <span className="text-sm text-muted-foreground">$0/month</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-muted/50">
              <span className="font-medium">Pro</span>
              <span className="text-sm text-muted-foreground">$29/month</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-muted/50">
              <span className="font-medium">Enterprise</span>
              <span className="text-sm text-muted-foreground">Custom</span>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="support">
        <AccordionTrigger>Support Options</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p><strong>Email Support:</strong> support@example.com</p>
            <p><strong>Live Chat:</strong> Available 9am-5pm EST</p>
            <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            <p><strong>Response Time:</strong> Within 24 hours</p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accordéon avec contenu riche (listes, tableaux, mise en forme).',
      },
    },
  },
};

export const DefaultOpen: Story = {
  render: () => (
    <Accordion type="single" collapsible defaultValue="item-2" className="w-full max-w-2xl">
      <AccordionItem value="item-1">
        <AccordionTrigger>Closed by default</AccordionTrigger>
        <AccordionContent>
          This section starts closed.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Open by default</AccordionTrigger>
        <AccordionContent>
          This section starts open thanks to defaultValue="item-2".
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Also closed</AccordionTrigger>
        <AccordionContent>
          Another closed section.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accordéon avec une section ouverte par défaut.',
      },
    },
  },
};
